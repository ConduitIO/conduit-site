package main

import (
	_ "embed"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

//go:embed mdx.tmpl
var tmpl string

func main() {
	log.SetFlags(0)

	// parse the command arguments
	args := parseFlags()

	log.Printf("🕵️parsing mdx template")
	t, err := template.New("").Funcs(funcMap).Option("missingkey=zero").Parse(tmpl)
	if err != nil {
		log.Fatalf("error: failed to parse mdx template: %v", err)
	}

	log.Printf("📂 opening input folder %v", args.input)
	inputFiles, err := os.ReadDir(args.input)
	if err != nil {
		log.Fatalf("error: failed to open input folder: %v", err)
	}

	if fileInfo, err := os.Stat(args.output); os.IsNotExist(err) {
		log.Printf("📂 output folder does not exist, creating %v", args.output)
		err = os.MkdirAll(args.output, os.ModePerm)
		if err != nil {
			log.Fatalf("error: failed to create output folder: %v", err)
		}
	} else if err != nil {
		log.Fatalf("error: failed to open output folder: %v", err)
	} else if !fileInfo.IsDir() {
		log.Fatalf("error: output path is not a directory: %v", args.output)
	} else {
		log.Printf("📂 output folder %v already exists, contents may be overwritten", args.output)
	}

	log.Printf("🏃 walking over files in input folder %v", args.input)
	index := 0
	for _, dirEntry := range inputFiles {
		if dirEntry.IsDir() {
			// skip directories
			continue
		}

		log.Printf("🔄 %v ...", dirEntry.Name())
		log.SetPrefix("  ") // indent
		exportProcessorDoc(
			index,
			filepath.Join(args.input, dirEntry.Name()),
			args.output,
			t,
		)
		log.SetPrefix("") // reset indent
		index++
	}

	log.Printf("✅  done")
}

func exportProcessorDoc(index int, inputPath, outputPath string, t *template.Template) {
	log.Printf("🕵️  decoding contents as JSON")

	input, err := os.Open(inputPath)
	if err != nil {
		log.Fatalf("error: failed to open %s: %v", inputPath, err)
	}
	defer input.Close()

	var proc map[string]any
	err = json.NewDecoder(input).Decode(&proc)
	if err != nil {
		log.Fatalf("error: failed to parse input file as JSON: %v", err)
	}

	procName := proc["specification"].(map[string]any)["name"].(string)
	log.Printf("📄 generating %s.mdx", procName)

	// inject index into the processor
	proc["index"] = index

	path := filepath.Join(outputPath, procName+".mdx")

	output, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("error: failed to open %s: %v", path, err)
	}
	defer output.Close()

	err = t.Execute(output, proc)
	if err != nil {
		log.Fatalf("error: failed to write %s: %v", path, err)
	}
}

var funcMap = template.FuncMap{
	"formatParameterValueTable":      formatParameterValueTable,
	"formatParameterValueYAML":       formatParameterValueYAML,
	"formatParameterDescriptionYAML": formatParameterDescriptionYAML,
	"formatRecord":                   formatRecord,
}

// formatParameterValue formats the value of a configuration parameter.
func formatParameterValueTable(value string) string {
	switch {
	case value == "":
		return `<Chip label="null" />`
	case strings.Contains(value, "\n"):
		// specifically used in the javascript processor
		return fmt.Sprintf("\n```js\n%s\n```\n", value)
	default:
		return fmt.Sprintf("`%s`", value)
	}
}

func formatParameterDescriptionYAML(description string) string {
	const (
		indentLen  = 10
		prefix     = "# "
		lineLen    = 80
		tmpNewLine = "〠"
	)

	// remove markdown new lines
	description = strings.ReplaceAll(description, "\n\n", tmpNewLine)
	description = strings.ReplaceAll(description, "\n", " ")
	description = strings.ReplaceAll(description, tmpNewLine, "\n")

	formattedDescription := formatMultiline(description, strings.Repeat(" ", indentLen)+prefix, lineLen)
	// remove first indent and last new line
	formattedDescription = formattedDescription[indentLen : len(formattedDescription)-1]
	return formattedDescription
}

func formatMultiline(
	input string,
	prefix string,
	maxLineLen int,
) string {
	textLen := maxLineLen - len(prefix)

	// split the input into lines of length textLen
	lines := strings.Split(input, "\n")
	var formattedLines []string
	for _, line := range lines {
		if len(line) <= textLen {
			formattedLines = append(formattedLines, line)
			continue
		}

		// split the line into multiple lines, don't break words
		words := strings.Fields(line)
		var formattedLine string
		for _, word := range words {
			if len(formattedLine)+len(word) > textLen {
				formattedLines = append(formattedLines, formattedLine[1:])
				formattedLine = ""
			}
			formattedLine += " " + word
		}
		if formattedLine != "" {
			formattedLines = append(formattedLines, formattedLine[1:])
		}
	}

	// combine lines including indent and prefix
	var formatted string
	for _, line := range formattedLines {
		formatted += prefix + line + "\n"
	}

	return formatted
}

func formatParameterValueYAML(value string) string {
	switch {
	case value == "":
		return `""`
	case strings.Contains(value, "\n"):
		// specifically used in the javascript processor
		formattedValue := formatMultiline(value, "            ", 10000)
		return fmt.Sprintf("|\n%s", formattedValue)
	default:
		return fmt.Sprintf(`"%s"`, value)
	}
}

// formatRecord formats a record as an escaped string.
func formatRecord(recordMap map[string]any) string {
	if len(recordMap) == 0 {
		return ""
	}

	// store the record in a struct so we control the order of the fields in JSON
	r := record{
		Position:  recordMap["position"],
		Operation: recordMap["operation"],
		Metadata:  recordMap["metadata"],
		Key:       recordMap["key"],
		Payload: struct {
			Before any `json:"before"`
			After  any `json:"after"`
		}{
			Before: recordMap["payload"].(map[string]any)["before"],
			After:  recordMap["payload"].(map[string]any)["after"],
		},
	}

	b, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return fmt.Sprintf("failed to marshal record: %v", err)
	}
	return strings.Trim(fmt.Sprintf("%#v", string(b)), "\"")
}

type record struct {
	Position  any `json:"position"`
	Operation any `json:"operation"`
	Metadata  any `json:"metadata"`
	Key       any `json:"key"`
	Payload   struct {
		Before any `json:"before"`
		After  any `json:"after"`
	} `json:"payload"`
}

type Args struct {
	output string
	input  string
}

func parseFlags() Args {
	flags := flag.NewFlagSet(os.Args[0], flag.ExitOnError)
	var (
		output = flags.String("output", "docs", "path to the output folder")
	)

	logAndExit := func(msg string) {
		log.Printf("error: %v", msg)
		fmt.Println()
		flags.Usage()
		os.Exit(1)
	}

	// flags is set up to exit on error, we can safely ignore the error
	_ = flags.Parse(os.Args[1:])

	args := Args{
		output: *output,
		input:  "specs",
	}

	if args.output == "" {
		logAndExit("output path argument cannot be empty")
	}
	if len(flags.Args()) > 0 {
		args.input = flags.Args()[0]
	}

	return args
}
