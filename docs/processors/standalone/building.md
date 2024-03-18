---
title: 'Build your own'
sidebar_position: 0
---

You can build your own Conduit Standalone Processors using the [Processor SDK](https://github.com/ConduitIO/conduit-processor-sdk).
We currently only provide a Go SDK for processors. However, if you'd like to use another language for writing processor,
feel free to [open an issue](https://github.com/ConduitIO/conduit/issues/new?assignees=&labels=feature%2Ctriage&projects=&template=1-feature-request.yml&title=Processor+SDK+%3A+%3Clanguage%3E)
and request a specific language, or you can check the WASM page if you want to build your own.

The [Processor SDK](https://github.com/ConduitIO/conduit-processor-sdk) exposes two ways of building processors, one for
the very simple processors, the other is a bit more complicated, but gives you more control over the processor.

## Using `sdk.NewProcesorFunc`

If the processor is very simple and can be reduced to a single function (e.g.
no configuration needed), then we can use `sdk.NewProcessorFunc()` to create a processor as below:

```go
//go:build wasm

package main

import (
   sdk "github.com/conduitio/conduit-processor-sdk"
)

func main() {
   sdk.Run(&sdk.NewProcessorFunc(
      sdk.Specification{Name: "simple-processor"}),
      func(ctx context.Context, rec opencdc.Record) (opencdc.Record, error) {
         // do something with the record
         return rec
      },
   )
}
```

However, if your processor needs configurations, or is more complicated than only one function, then you should use
the full processor approach.

## Using `sdk.Processor`

To build the full-blown processor, the SDK contains an interface called [sdk.Processor](https://pkg.go.dev/github.com/conduitio/conduit-processor-sdk#Processor)
that contains some methods to be implemented. These methods are:

### Specifications

Specifications are metadata about the processor, like name, version, summary, description, and a list of parameters
expected in the configuration. You can use specifications to explain what your processor does and how, and add
parameters that would be input values to the processor, we also have builtin validations supported by conduit that
you can use to validate your processor parameters.

Also, a conduit tool that is super helpful is `Paramgen`, it generates the code to return the `parameters` map from a
certain Go struct, meaning you would only need to create a struct for the processor's parameters with specific tags for
validations, and generate the `Parameters` map using one command. Check [ParamGen documentation](https://github.com/ConduitIO/conduit-commons/tree/main/paramgen)
for more details.

#### Example without PramGen
```go
package example

import (
	"context"

	"github.com/conduitio/conduit-commons/config"
	commons "github.com/conduitio/conduit-commons/config"
	"github.com/conduitio/conduit-commons/opencdc"
	sdk "github.com/conduitio/conduit-processor-sdk"
)

func (p *AddFieldProcessor) Specification(context.Context) (sdk.Specification, error) {
	return sdk.Specification{
		Name:    "myAddFieldProcessor",
		Summary: "Add a field to the record.",
		Description: `This processor lets you configure a static field that will
be added to the record into field .Payload.After. If the payload is not
structured data, this processor will panic.`,
		Version: "v1.0.0",
		Author:  "John Doe",
		Parameters: map[string]config.Parameter{
			"field": {
				Type: config.ParameterTypeString,
				Validations: []commons.Validation{
					commons.ValidationRequired{},
				},
			},
			"name":  {
				Type: config.ParameterTypeString,
				Description: "The value of the field to add",
				Validations: []commons.Validation{
					commons.ValidationRequired{},
				},
			},
		},
	}, nil
}
```

#### Example with PramGen
1. Add a struct that contains the needed parameters:

```go
//go:generate paramgen -output=addField_paramgen.go addFieldConfig

type addFieldConfig struct {
// Field is the target field that will be set.
Field string `json:"field" validate:"required"`
// Name is the value of the field to add.
Name string `json:"value" validate:"required"`
}
```

2. Generate the parameters by running `paramgen -output=addField_paramgen.go addFieldConfig`, this will generate a file
called `addField_paramgen.go` that contains the generated parameters map, which in turn can be used under `specifications`
to make them simpler and shorter, ex:

```go
//go:generate paramgen -output=addField_paramgen.go addFieldConfig
type addFieldConfig struct {
	// Field is the target field that will be set.
	Field string `json:"field" validate:"required"`
	// Name is the value of the field to add.
	Name string `json:"value" validate:"required"`
}
func (p *AddFieldProcessor) Specification(context.Context) (sdk.Specification, error) {
	return sdk.Specification{
		Name:    "myAddFieldProcessor",
		Summary: "Add a field to the record.",
		Description: `This processor lets you configure a static field that will
be added to the record into field .Payload.After. If the payload is not
structured data, this processor will panic.`,
		Version: "v1.0.0",
		Author:  "John Doe",
		Parameters: addFieldConfig{}.Parameters(),
	}, nil
}
```


### Configure

Configure is the first function to be called in a processor. It provides the processor with the configuration that needs
to be validated and stored to be used in other methods.
This method should not open connections or any other resources. It should solely focus on parsing and validating the 
configuration itself.

To add custom validations, simply validate the parameters manually under this method, and return an error of the `config`
map is not valid. On the other hand, using the utility function below would apply the builtin validations to the configuration.

The [Processor SDK](https://github.com/ConduitIO/conduit-processor-sdk) provides some useful utility functions to help implementing this method:
* `sdk.ParseConfig`: used to sanitize the configuration, apply defaults, validate it using builtin validations, and copy
the values into the target object. 
* `sdk.NewReferenceResolver`: creates a new reference resolver from the input string. The input string is a reference
to a field in a record, check [Referencing record fields](/docs/processors/referencing-fields) for more details.
The method will return a resolver that can be used to resolve a reference to the specified field in a record and
manipulate that field (get, set and delete the value, or rename the referenced field).

Using these utility functions, most of the `Configure()` implementations would look something like:
````go
func (p *AddFieldProcessor) Configure(ctx context.Context, m map[string]string) error {
	err := sdk.ParseConfig(ctx, m, &p.config, addFieldConfig{}.Parameters())
	if err != nil {
		return fmt.Errorf("failed to parse configuration: %w", err)
	}

	resolver, err := sdk.NewReferenceResolver(p.config.Field)
	if err != nil {
		return fmt.Errorf("failed to parse the %q param: %w", "field", err)
	}
	p.referenceResolver = resolver
	return nil
}
````

### Open

This function is used to open connections, start background jobs, or initialize resources that are needed for the processor.

Note that implementing this function is **_Optional_**

### Process

Process is the main show of the processor, here you would manipulate the records received and return the processed ones.

After processing the slice of records that the function got, and if no errors occurred, it should return a slice of 
`sdk.ProcessedRecord` that matches the length of the input slice. However, if an error occurred while processing a 
specific record, then it should be reflected in the `ProcessedRecord` with the same index as the input record, and
should return the slice at that index length.

For the interface `sdk.ProcessedRecord`, there are three main processed records types:
1. `sdk.SingleRecord`: is a single processed record that will continue down the pipeline.
2. `sdk.FilterRecord`: is a record that will be acked and filtered out of the pipeline.
3. `sdk.ErrorRecord`: is a record that failed to be processed and will be nacked.

Example:

````go
func (p *AddFieldProcessor) Process(ctx context.Context, records []opencdc.Record) []sdk.ProcessedRecord {
	out := make([]sdk.ProcessedRecord, 0, len(records))
	for _, record := range records {
		resolver, err := p.referenceResolver.Resolve(&record)
		if err != nil {
			return append(out, sdk.ErrorRecord{Error: err})
		}
		err = resolver.Set(p.config.Name)
		if err != nil {
			return append(out, sdk.ErrorRecord{Error: err})
		}
		out = append(out, sdk.SingleRecord(record))
	}
	return out
}

````

Note that `Process` should be idempotent, as it may be called multiple times with the same records (e.g. after a restart
when records were not flushed).

### Teardown

This function acts like a counterpart to [`Open`](#open), use this function to close any open connections or resources
that were initialized under `Open`.

Note that implementing this function is **_Optional_**

### Entrypoint

Since the processor will be run as a standalone WASM plugin, you need to add an entrypoint to it. Also, make
sure to add a `go:build` tag to ensure that this file is only included in the build when targeting WebAssembly.

the entrypoint will have to be in a separate package (i.e. folder), by Go convention it's normally under 
`cmd/my-binary-name`, so it would look something like:
````
.
├── my-processor.go    # actual processor implementation
└── cmd
    └── processor
        └── main.go    # entrypoint
````

Entry point example:
````go
//go:build wasm

package main

import (
	sdk "github.com/conduitio/conduit-processor-sdk"
	"github.com/conduitio/my-processor/simple"
)

func main() {
	sdk.Run(simple.NewProcessor())
}

````
Check [Compiling the processor](#compiling-the-processor) for what to do next, and how to compile the processor.

## Logging

You can get a `zerolog.logger` instance from the context using the [`sdk.Logger`](https://pkg.go.dev/github.com/conduitio/conduit-processor-sdk#Logger)
function. This logger is pre-configured to append logs in the format expected by Conduit.

Keep in mind that logging in the hot path (i.e. in the `Process` method) can have a significant impact on the performance
of your processor, therefore we recommend to use the `Trace` level for logs that are not essential for the operation of the
processor.

Example:

```go
func (p *AddFieldProcessor) Process(ctx context.Context, records []opencdc.Record) []sdk.ProcessedRecord {
logger := sdk.Logger(ctx)
logger.Trace().Msg("Processing records")
// ...
}
```

## Compiling the processor

To compile the processor, run:
````
GOARCH=wasm GOOS=wasip1 go build -o processor.wasm cmd/processor/main.go
````

Conduit uses [WebAssembly](https://webassembly.org) to run standalone processors. This means that you need to build
your processor as a WebAssembly module. You can do this by setting the environment variables `GOARCH=wasm` and `GOOS=wasip1`
when running `go build`. This will produce a WebAssembly module that can be used as a processor in Conduit.

**_Congratulations!_** Now you have a new standalone processor.
Check [Standalone processors](/docs/processors/standalone/index.mdx) for details on how to use your standalone
processor in a Conduit pipeline.

---