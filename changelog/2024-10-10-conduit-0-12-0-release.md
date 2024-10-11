---
slug: '2024-10-10-conduit-0-12-0-release'
title: Conduit 0.12.0 release
draft: false
tags: [conduit, release]
---

We’re excited to announce the release of [**Conduit v0.12.0**](https://github.com/ConduitIO/conduit/releases/tag/v0.12.0), which introduces **Pipeline Recovery**! This new feature enhances the resilience of your data streaming pipelines, ensuring they can recover from temporary errors without manual intervention.

<!--truncate-->

#### Key Highlights

-  **Automatic Pipeline Restart:** Pipelines that encounter errors will now automatically restart, using a smart backoff algorithm to manage retries.
-  **Configurable Backoff Settings:** Customize the backoff parameters through CLI flags, environment variables, or a global configuration file.
-  **Smart Retry Management:** Limits on retries prevent indefinite restarts, keeping your pipelines efficient and reliable.

:::tip
For a detailed overview of how Pipeline Recovery works and its benefits, check out our [blog post](https://meroxa.com/blog/unlocking-resilience:-conduit-v0.12.0-introduces-pipeline-recovery/), or our documentation for [Pipeline Recovery](/docs/features/pipeline-recovery) and learn how to make your data streaming experience smoother than ever!
:::
