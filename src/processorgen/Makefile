.PHONY: clean
clean:
	# Remove all files in the builtin directory except index.mdx
	find ../../docs/processors/builtin ! -name 'index.mdx' -type f -exec rm -f {} +

.PHONY: generate
generate: clean
	go run main.go -output=../../docs/processors/builtin ./specs
