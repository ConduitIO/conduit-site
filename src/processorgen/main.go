package main

import (
	_ "embed"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"text/template"
)

//go:embed mdx.tmpl
var tmpl1 string

func main() {
	log.SetFlags(0)
	log.SetPrefix("paramgen: ")

	// parse the command arguments
	args := parseFlags()

	input, err := os.Open(args.input)
	if err != nil {
		log.Fatalf("error: failed to open input file: %v", err)
	}
	defer input.Close()

	var v []any
	err = json.NewDecoder(input).Decode(&v)
	if err != nil {
		log.Fatalf("error: failed to parse input file as JSON: %v", err)
	}

	output, err := os.OpenFile(args.output, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("error: failed to open %s: %v", args.output, err)
	}

	funcMap := template.FuncMap{
		"replace": replace,
	}

	t := template.Must(template.New("").Funcs(funcMap).Parse(tmpl1))
	err = t.Execute(output, v)
	if err != nil {
		log.Fatalf("error: failed to write output: %v", err)
	}
}

func replace(input, from, to string) string {
	return strings.Replace(input, from, to, -1)
}

type Args struct {
	output string
	input  string
}

func parseFlags() Args {
	flags := flag.NewFlagSet(os.Args[0], flag.ExitOnError)
	var (
		output = flags.String("output", "processors.mdx", "name of the output file")
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
//        "description": "Modifying metadata and payload.",
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
