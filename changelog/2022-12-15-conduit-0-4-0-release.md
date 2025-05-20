---
slug: '2022-12-15-conduit-0-4-0-release'
title: Conduit 0.4.0 release
draft: false
tags: [conduit, release, conduit-release]
---

[**Conduit v0.4**](https://github.com/ConduitIO/conduit/releases/tag/v0.4.0) is out now. This release enhances error handling and debugging capabilities for developers building streaming data pipelines.

<!--truncate-->

### Key Features

-  **Stream Inspector**: Inspect data as it enters Conduit through source connectors and observe its journey to destination connectors. This feature helps in debugging by providing visibility into data flow.
-  **Dead Letter Queues (DLQs)**: Configure DLQs to redirect messages that fail processing to another connector for further handling. This allows for better management of erroneous data.
-  **Connector Parameter Validation**: Developers can now define required parameters for connectors, enabling Conduit to provide clearer error messages and streamline the setup process.

:::tip
For more details on the new features in Conduit v0.4, check out our [blog post](https://meroxa.com/blog/conduit-0.4/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)