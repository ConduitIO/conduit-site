---
slug: '2023-07-19-conduit-0-7-0-release'
title: Conduit 0.7.0 release
draft: false
tags: [conduit, release]
---

[**Conduit v0.7**](https://github.com/ConduitIO/conduit/releases/tag/v0.7.0) has a new release! We continue to enhance Conduit as a powerful alternative to Kafka Connect, moving closer to our goal of supporting elaborate data pipelines.

<!--truncate-->

#### Key Highlights

- **Native Schema Registry Support**: This release introduces native schema registry support, allowing you to store metadata about the data flowing through your pipelines. This ensures data types and required fields are enforced, enhancing confidence in the data being processed. You can interact with the schema registry using four built-in processors: Decode with Schema Key, Decode with Schema Payload, Encode with Schema Key, and Encode with Schema Payload. Currently, only Avro is supported, with plans to add Protobuf and JSON schema in future releases.
- **gRPC Connector**: We are excited to introduce gRPC Server and Client connectors, enabling Conduit to operate in distributed environments. This allows data to be aggregated in one location and forwarded to another, facilitating data movement across regions.

:::tip
For an in-depth look at the new features and improvements in Conduit v0.7, check out our [blog post](https://meroxa.com/blog/conduit-0.7-is-here).
:::
