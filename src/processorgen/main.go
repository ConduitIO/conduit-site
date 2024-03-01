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
	log.SetPrefix("processorgen: ")

	// parse the command arguments
	args := parseFlags()

	var err error
	args.input, err = filepath.Abs(args.input)
	if err != nil {
		log.Fatalf("error: failed to get absolute path of input: %v", err)
	}

	args.output, err = filepath.Abs(args.output)
	if err != nil {
		log.Fatalf("error: failed to get absolute path of output: %v", err)
	}

	log.Printf("📂 opening input file %v ...", args.input)
	input, err := os.Open(args.input)
	if err != nil {
		log.Fatalf("error: failed to open input file: %v", err)
	}
	defer input.Close()

	log.Printf("🕵️decoding input file as JSON ...")
	var v []any
	err = json.NewDecoder(input).Decode(&v)
	if err != nil {
		log.Fatalf("error: failed to parse input file as JSON: %v", err)
	}

	log.Printf("🕵️parsing mdx template ...")
	t, err := template.New("").Funcs(funcMap).Option("missingkey=zero").Parse(tmpl)
	if err != nil {
		log.Fatalf("error: failed to parse mdx template: %v", err)
	}

	log.Printf("📂 opening output folder %v ...", args.output)
	if fileInfo, err := os.Stat(args.output); os.IsNotExist(err) {
		log.Printf("output folder does not exist, creating %v ...", args.output)
		err = os.MkdirAll(args.output, os.ModePerm)
		if err != nil {
			log.Fatalf("error: failed to create output folder: %v", err)
		}
	} else if err != nil {
		log.Fatalf("error: failed to open output folder: %v", err)
	} else if !fileInfo.IsDir() {
		log.Fatalf("error: output path is not a directory: %v", args.output)
	}

	for i, proc := range v {
		procName := proc.(map[string]any)["specification"].(map[string]any)["name"].(string)
		log.Printf("⌛  generating %s.mdx ...", procName)

		// inject index into the processor
		proc.(map[string]any)["index"] = i

		path := filepath.Join(args.output, procName+".mdx")

		output, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)
		if err != nil {
			log.Fatalf("error: failed to open %s: %v", path, err)
		}

		err = t.Execute(output, proc)
		if err != nil {
			log.Fatalf("error: failed to write %s: %v", path, err)
		}

		_ = output.Close()
	}

	log.Printf("✅  done")
}

var funcMap = template.FuncMap{
	"formatParameterValue": formatParameterValue,
}

// formatParameterValue formats the value of a parameter in an example.
func formatParameterValue(value string) string {
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

type Args struct {
	output string
	input  string
}

func parseFlags() Args {
	flags := flag.NewFlagSet(os.Args[0], flag.ExitOnError)
	var (
		output = flags.String("output", "processors", "name of the output file")
	)

	logAndExit := func(msg string) {
		log.Printf("error: %v", msg)
		fmt.Println()
		flags.Usage()
		os.Exit(1)
	}

	// flags is set up to exit on error, we can safely ignore the error
	_ = flags.Parse(os.Args[1:])

	if len(flags.Args()) == 0 {
		logAndExit("input path argument missing")
	}

	var args Args
	args.output = *output
	args.input = flags.Args()[0]

	if args.output == "" {
		logAndExit("output path argument cannot be empty")
	}

	return args
}

// example processors.json:
// [
//  {
//    "specification": {
//      "name": "example",
//      "summary": "Example processor.",
//      "description": "Description using markdown.",
//      "version": "v0.1.0",
//      "author": "Meroxa, Inc.",
//      "parameters": {
//        "foo": {
//          "default": "",
//          "description": "Foo description using markdown.",
//          "type": "string",
//          "validations": []
//        },
//      }
//    },
//    "examples": [
//      {
//        "summary": "Short example name",
//        "description": "Long description explaining what's going on in this example.",
//        "config": {
//          "foo": "bar",
//        },
//        "have": {
//          "position": null,
//          "operation": "create",
//          "metadata": {
//            "existing-key": "existing-value"
//          },
//          "key": null,
//          "payload": {
//            "before": null,
//            "after": "world"
//          }
//        },
//        "want": {
//          "position": null,
//          "operation": "create",
//          "metadata": {
//            "existing-key": "existing-value",
//            "processed": "true"
//          },
//          "key": null,
//          "payload": {
//            "before": null,
//            "after": "hello, world"
//          }
//        }
//      }
//    ]
//  }
// ]
