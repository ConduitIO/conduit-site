---
slug: '2025-02-10-mysql-connector'
title: New Conduit MySQL Connector
draft: false
tags: [conduit, connector, mysql, release]
---

We're introducing the new **MySQL Connector for Conduit**, which allows extraction of
data from and loading data into MySQL databases. This connector supports dual
operation modes, including snapshot and Change Data Capture (CDC) for the source
connector, as well as a destination connector for upserting records.

<!--truncate-->

### Key Highlights

- **Source and destination connectors supported**
- **Schema support**: Transmit data between your conduit pipelines in a typesafe way.
- **No need for primary keys**: The source connector can do table snapshots without primary keys.

:::tip
For detailed setup and configuration instructions, refer to our
[documentation](https://github.com/conduitio-labs/conduit-connector-mysql).
:::

Tested with MySQL v8.0 and the required binlog configurations, the MySQL
Connector provides a practical solution for various data integration use cases.

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)

