---
slug: '2022-01-21-conduit-0-1-0-release'
title: Conduit 0.1.0 release
draft: false
tags: [conduit, release]
---

[**Conduit** is now open-sourced](https://github.com/ConduitIO/conduit/releases/tag/v0.1.0)! Designed to simplify data integration for software engineers, Conduit provides a flexible and developer-friendly solution for streaming data orchestration.

<!--truncate-->

### Key Features

- **Easy Setup**: Get started quickly by downloading the Conduit binary, unzipping it, and building pipelines. Simply run the following commands:

```bash
$ tar zxvf conduit_0.1.0_Darwin_x86_64.tar.gz
$ ./conduit
```

- **User Interface**: Conduit includes a built-in UI for local development, allowing you to easily navigate to [http://localhost:8080/ui/](http://localhost:8080/ui/) and start building pipelines.
- **Developer-Centric Design**: Conduit aims to provide an excellent experience for connector developers, ensuring consistency and familiarity with modern programming practices.
- **Open Source**: Conduit is open-sourced with a permissive license, promoting accessibility for all developers.

### Use Cases

With Conduit, you can build pipelines to move data between various sources, including:
- Kafka to Postgres
- File to Kafka
- File to File
- PostgreSQL to Postgres
- PostgreSQL to Amazon S3

As we continue to expand our connector offerings, we encourage you to explore these use cases and share your ideas with us!

:::tip
For more information on getting started with Conduit, visit our [GitHub releases page](https://github.com/meroxa/conduit/releases). To read more, check out [our blog post](https://meroxa.com/blog/conduit-streaming-data-integration-for-developers/).
:::
