---
title: "PostgreSQL"
slug: "postgres"
hidden: false
createdAt: "2020-05-13T16:15:58.991Z"
updatedAt: "2021-04-15T18:50:25.410Z"
---

[PostgreSQL](https://www.postgresql.org/) is a powerful, open-source object-relational database system. As a Meroxa destination, you can capture events from any [source](/docs/sources/overview) and populate a table within a PostgreSQL in real-time.

## Environments

We support the following PostgreSQL environments:

- Self-hosted PostgreSQL
- [Amazon RDS](/docs/sources/postgres/environments/amazon-rds)

The Meroxa Platform has been tested against the following PostgreSQL versions:

* `9.6.x`
* `10.x`
* `11.x`
* `12.x`
  

## Adding Resource

To add a PostgreSQL resource with Logical Replication enabled:

```shell
meroxa resource add postgresDB --type postgres -u postgres://$PG_USER:$PG_PASS@$PG_URL:$PG_PORT/$PG_DB
```

`postgresDB` is a human-friendly name to represent the resource within Meroxa. Feel free to change as desired.

In the command above, replace the following variables with valid credentials from your PostgreSQL environment:

- $PG_USER - PostgreSQL Username
- $PG_PASS - PostgreSQL Password
- $PG_URL - PostgreSQL URL
- $PG_DB - PostgreSQL Database Name
- $PG_PORT - PostgreSQL Port (e.g., 5432).

## Destination Configuration

To configure Postgres as a destination:

```shell
meroxa connector create to-pg --to postgresDB --input $STREAM_NAME
```

The command above creates a new Connector called `to-pg`, sets the destination to a resource named `postgresDB`  and configures the Input Stream.