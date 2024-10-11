---
slug: '2022-09-27-conduit-0-3-0-release'
title: Conduit 0.3.0 release
draft: false
tags: [conduit, release]
---

[**Conduit v0.3**](https://github.com/ConduitIO/conduit/releases/tag/v0.3.0) is ready for use, and this release enhances the tool's capabilities for moving data within your infrastructure.

<!--truncate-->

### What’s New

- **OpenCDC Support**: Conduit now supports OpenCDC, providing consistent payload formats for Change Data Capture (CDC) across connectors. Note that this introduces a breaking change in the Connector SDK; connectors not updated for v0.3 will only work with v0.2.
- **Pipeline Configuration File**: You can now configure pipelines using a static YAML file, making it easier to manage and version control your pipeline configurations.
- **JavaScript Processors**: Transform data using JavaScript to handle tasks like removing personally identifiable information before it reaches downstream systems. This feature allows for the injection of processors at various points in the pipeline.

:::tip
For more details on the new features in Conduit v0.3, check out our [blog post](https://meroxa.com/blog/conduit-0.3/).
:::
