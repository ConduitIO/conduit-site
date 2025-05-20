---
slug: '2023-02-28-conduit-0-5-0-release'
title: Conduit 0.5.0 release
draft: false
tags: [conduit, release, conduit-release]
---

[**Conduit v0.5**](https://github.com/ConduitIO/conduit/releases/tag/v0.5.0) is out! This release focuses on making Conduit easier to operate as a service, with enhancements aimed at improving usability and functionality for developers building streaming data pipelines.

<!--truncate-->


### Key Enhancements

- **Stream Inspector**: Enhanced to allow inspection of data as it enters or leaves processors, providing better visibility into data flow.
- **Dead Letter Queues (DLQs)**: DLQ configuration is now accessible via HTTP and gRPC APIs, along with new metrics to monitor DLQ behavior.
- **New Processors**:
  - **Parse Json Processor**: Converts raw JSON data into structured data.
  - **Unwrap Processor**: Unwraps records from payloads for both Debezium and Kafka Connect formats.
- **Health Check**: A new health check endpoint to verify Conduit’s operational status and connectivity to configured databases.


:::tip
For a deeper dive into the new features and enhancements in Conduit v0.5, check out our [blog post](https://meroxa.com/blog/conduit-0.5/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)