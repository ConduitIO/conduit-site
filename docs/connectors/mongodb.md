---
title: "MongoDB"
slug: "mongodb"
hidden: false
createdAt: "2020-05-17T23:42:45.804Z"
updatedAt: "2021-04-15T20:20:12.595Z"
---

[MongoDB](https://www.mongodb.com/) is a NoSQL database that uses JSON-like documents with optional schemas. As a Meroxa destination, you can capture events from any [source](/docs/sources/overview) and populate a collection in real-time.

## Supported Environments
- Self-hosted MongoDB
- [Mongo Atlas](https://www.mongodb.com/cloud/atlas)

The Meroxa Platform has been tested against the following MongoDB versions:
* `3.4.x`
* `3.6.x`
* `4.0.x`
* `4.2.x`

## Adding Resource

To add a MongoDB resource to your Meroxa Resource Catalog, you can run the following command:

```shell
meroxa resource add mongo --type mongodb -u "$MONGO_CONNECTION_STRING"
```

`$MONGO_CONNECTION_STRING` represents a valid [Mongo Connection String](https://docs.mongodb.com/manual/reference/connection-string/).

## Destination Configuration

To configure MongoDB as a destination:

```shell
meroxa connector create to-mongo --to mongo --input $STREAM_NAME
```

The command above creates a new Connector called `to-mongo`, sets the destination to a resource named `mongo`  and configures the Input Stream.

### Configuration Options

The following [configuration](/docs/pipelines/connectors#configuration) is supported for this Connector:

| Configuration  | Destination
| -----------    | -----------
| `collection`      | Whitelist filter for extracting a subset of fields from elastic-search JSON documents. The whitelist filter supports nested fields. To provide multiple fields use ; as separator (e.g. `customer;order.qty;order.price`).
| `index.prefix`      | Indices prefix to include in copying.
| `incrementing.field.name`      | An incremental/temporal field such as a `timestamp` or an incrementing `id`. 
