CONN_LIST_DIR=../../docs/1-using/5-connectors/7-list/

.PHONY: clean-pages
clean-pages:
	# Remove all files in the connectors list directory except index.mdx
	find $(CONN_LIST_DIR) ! -name 'index.mdx' -type f -exec rm -f {} +

.PHONY: registry
registry:
	go run . registry -o ../../static/connectors.json

.PHONY: specifications
specifications:
	go run . specifications -c ../../static/connectors.json -o ../../static/connectors

.PHONY: pages
pages: clean-pages
	go run . pages -c ../../static/connectors.json -s ../../static/connectors -o $(CONN_LIST_DIR)

.PHONY: generate
generate: registry specifications pages
