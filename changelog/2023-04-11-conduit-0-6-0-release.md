---
slug: '2023-04-11-conduit-0-6-0-release'
title: Conduit 0.6.0 release
draft: false
tags: [conduit, release]
---

[**Conduit v0.6**](https://github.com/ConduitIO/conduit/releases/tag/v0.6.0) is now available, bringing a range of new features and improvements designed to enhance your data integration capabilities. This version focuses on providing users with more flexibility and efficiency in managing their data pipelines.

<!--truncate-->

### Key Features

- **Multiple Installation Options**: Conduit can now be installed via Homebrew, RPM, and Debian Packages.
- **Expanded Connector Lifecycle Events**: New events include Source OnCreate, OnUpdate, OnDelete, and Destination OnCreate, OnUpdate, OnDelete, providing greater control over connector behavior.
- **Parallel Processors**: Processors can now handle records concurrently. Specify the number of worker threads in your pipeline configuration for improved performance.
- **Simplified Configuration:** Enjoy a more straightforward setup process for your data pipelines.

### Looking Ahead to 1.0

We aim to ensure Conduit operates reliably without major breaking changes as we approach the 1.0 release. We're also developing a Conduit Kubernetes Operator to simplify service management in production environments.

:::tip
For an in-depth look at the new features and improvements in Conduit v0.6, check out our [blog post](https://meroxa.com/blog/conduit-0.6/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)