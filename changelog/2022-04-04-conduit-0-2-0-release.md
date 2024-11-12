---
slug: '2022-04-04-conduit-0-2-0-release'
title: Conduit 0.2.0 release
draft: false
tags: [conduit, release]
---

[**Conduit v0.2**](https://github.com/ConduitIO/conduit/releases/tag/v0.2.0) is now available. This release enhances Conduit's capabilities for data movement across various systems and simplifies the transition from legacy systems.

<!--truncate-->

### What’s New

- **Official SDK for Connectors**: Developers can now build connectors for any data store using the new Conduit Connector SDK, making it easier to support diverse production environments.
- **Kafka Connect Integration**: Conduit 0.2 allows you to leverage existing Kafka Connect connectors, enabling a smooth transition to Conduit while minimizing downtime and impact on downstream systems.
-  **Simplified Connector Lifecycle**: The SDK simplifies connector implementation, requiring only four functions to create a fully functional connector. This design goal aims to make building connectors straightforward and efficient.

:::tip
For more details on the new features in Conduit v0.2, check out our [blog post](https://meroxa.com/blog/conduit-0.2-making-connectors-a-reality/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)