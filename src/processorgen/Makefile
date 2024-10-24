.PHONY: clean
clean:
	# Remove all files in the builtin directory except index.mdx
	find ../../docs/1-using/5-processors/1-builtin/ ! -name 'index.mdx' -type f -exec rm -f {} +

.PHONY: generate
generate: clean
	go run main.go -output=../../docs/1-using/5-processors/1-builtin/ ./specs
