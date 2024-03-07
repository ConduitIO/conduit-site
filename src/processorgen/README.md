# ProcessorGen

This is a simple tool to generate the documentation for builtin processors. It
uses the template defined in `mdx.tmpl` and the processor definitions in
`specs/*.json` to generate the documentation.

## Quickstart

To regenerate the documentation copy the specs from
[conduitio/conduit](https://github.com/ConduitIO/conduit/tree/main/pkg/plugin/processor/builtin/internal/exampleutil/specs)
to folder `specs` and run `make generate`.

## Usage

To generate the documentation manually, run the following command:

```sh
go run main.go
```

This will generate the documentation in folder `docs`. You can adjust the input
folder using an argument and the output folder using the flag `-output`:

```sh
go run main.go -output=/path/to/output /path/to/input
```