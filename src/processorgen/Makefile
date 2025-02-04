BUILTIN_DIR = ../../docs/1-using/6-processors/1-builtin/

.PHONY: clean
clean:
	# Remove all files in the builtin directory except index.mdx
	find $(BUILTIN_DIR) ! -name 'index.mdx' -type f -exec rm -f {} +

.PHONY: generate
generate: clean
	go run main.go -output=$(BUILTIN_DIR) ./specs
