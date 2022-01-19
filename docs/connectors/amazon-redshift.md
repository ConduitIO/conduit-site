---
title: "Amazon Redshift"
slug: "redshift"
hidden: false
createdAt: "2020-05-14T23:04:07.545Z"
updatedAt: "2021-04-15T20:22:01.185Z"
---

[Amazon Redshift](https://aws.amazon.com/redshift/) is a cloud data warehouse product offed by Amazon Web Services. As a Meroxa destination, you can capture events from any [source](/docs/sources/overview) and populate a table within a Redshift in real-time.

## Adding Resource

To add a Postgres resource to your Meroxa Resource Catalog, you can run the following command:

```shell
meroxa resource add warehouse --type redshift -u \"redshift://$REDSHIFT_USER:$REDSHIFT_PASS@$REDSHIFT_URL:$REDSHIFT_PORT/REDSHIFT_DB
```

`warehouse` is a human-friendly name to represent the resource within Meroxa. Feel free to change as desired.

In the command above, replace the following variables with valid credentials from your Postgres environment:

- $REDSHIFT_USER - Redshift Username
- $REDSHIFT_PASS - Redshift Password
- $REDSHIFT_URL - Redshift URL
- $REDSHIFT_DB - Redshift Database Name
- $REDSHIFT_PORT - Redshift Port (e.g., 5432).


## Destination Configuration

The Redshift Destination connector allows you to load [Data Records](/docs/pipelines/data-records) from a [Streams](/docs/pipelines/streams) into a Redshift Table.

To configure Redshift as a destination:

```shell
meroxa connector create to-redshift --to warehouse --input $STREAM_NAME
```

The command above creates a new connector  called `to-redshift`, sets the destination to a resource named `warehouse`, and configures the input with a [stream](/docs/pipelines/streams) .

### Configuration Options

The following [configuration](/docs/pipelines/connectors#configuration) is supported for this Connector:

| Configuration  | Destination
| -----------    | -----------
| `table.name.format`      | A format string for the destination table name, which may contain '${topic}' as a placeholder for the originating stream name.
