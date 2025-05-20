---
slug: '2024-04-30-conduit-0-10-0-release'
title: Conduit 0.10.0 release
draft: false
tags: [conduit, release, conduit-release]
---

[**Conduit v0.10**](https://github.com/ConduitIO/conduit/releases/tag/v0.10.0) is here! This release introduces **native support for multiple collections**, addressing user feedback and enhancing the flexibility of data integration.

<!--truncate-->

### Key Highlights

- **Multiple Collections Support**: Connect and integrate multiple data collections simultaneously, improving scalability and simplifying pipeline management. Collections can refer to tables in databases, topics in Kafka, or indices in Elasticsearch.
- **Kafka Connector Enhancements**: The Kafka connector now supports reading from and writing to multiple topics. You can configure it to route records based on the `opencdc.collection` metadata field.
- **Postgres Connector Improvements**: The Postgres connector can now read from multiple tables, including support for wildcard options to capture all tables in a public schema. This feature simplifies initial data ingestion and schema changes.
- **Generator Connector Updates**: The generator connector can emit records with different formats, simulating multiple collections in a single configuration.
- **Dynamic Configuration Parameters**: Introduced dynamic parameters in connectors, allowing for more flexible configurations using wildcards.


:::tip
For an in-depth look at how multiple collections support can enhance your data integration, check out our [blog post](https://meroxa.com/blog/conduit-0.10-comes-with-multiple-collections-support/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)