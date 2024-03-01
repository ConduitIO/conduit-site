# ProcessorGen

This is a simple tool to generate the documentation for builtin processors. It
uses the template defined in `mdx.tmpl` and the processor definitions in
`processors.json` to generate the documentation.

## Quickstart

To regenerate the documentation after updating `processors.json` you can use
`make generate`.

## Usage

To generate the documentation manually, run the following command:

```sh
go run main.go processors.json
```

This will generate the documentation in folder `processors`. You can adjust the
output folder using the flag `-output`:

```sh
go run main.go -output=/path/to/output processors.json
```