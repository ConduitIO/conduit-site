---
title: "Kafka Connect Connectors with Conduit"
sidebar_position: 8
---

# Using Kafka Connect Connectors with Conduit

The [Conduit Kafka Connect Wrapper connector](https://github.com/ConduitIO/conduit-kafka-connect-wrapper) is a special
connector that allows you to use [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 
connectors with Conduit. Conduit doesn't come bundled with Kafka Connect connectors, but you can use it to bring any
Kafka Connect connector with Conduit.

This connector gives you the ability to:

- Easily migrate from Kafka Connect to Conduit.
- Remove Kafka as a dependency to move data between data infrastructure.
- Leverage a datastore if Conduit doesn't have a native connector.

Since the Conduit Kafka Connect Wrapper itself is written in Java, but most of Conduit's connectors are written in Go,
it also serves as a good example of the flexibility of the Conduit Plugin SDK.

Let's begin.

## How it works

To use the Kafka Connect wrapper connector, you'll need to:

1. Clone the [`conduit-kafka-connect-wrapper`](https://github.com/ConduitIO/conduit-kafka-connect-wrapper) repository.
1. Build the Connector JAR.
1. Download Kafka Connect JARs and any dependencies you would like to add.
1. Create a pipeline configuration file.
1. Run Conduit.


## Setup

To begin, clone the connector:

```
git clone git@github.com:ConduitIO/conduit-kafka-connect-wrapper.git
```

Then, we need to build the connector. The Kafka Connect wrapper connector is written in Java, so it needs to be compiled.


```bash
cd conduit-kafka-connect-wrapper

./scripts/dist.sh
```

This script will:

1. Create a directory called `dist`.
1. Compile the connector and place the JAR in `dist`.
1. Create `dist/libs` directory.

Now that we have everything setup, we can add the Kafka Connect connectors.

## Adding Kafka Connect Connector

The `libs` directory is where you put the Kafka Connect connector JARs and their dependencies (if any). The wrapper 
plugin will automatically load connectors and all the other dependencies from a `libs` directory.

For this example, we will use the PostgreSQL Kafka Connect JDBC Connector. To install, add the following:

- [Aiven's Kafka Connect JDBC Connectors](https://github.com/aiven/jdbc-connector-for-apache-kafka)
- [Postgres Connector JAR](https://repo1.maven.org/maven2/org/postgresql/postgresql/42.3.3/postgresql-42.3.3.jar)

This connector allows you to connect to any [JDBC database](https://en.wikipedia.org/wiki/Java_Database_Connectivity#:~:text=Java%20Database%20Connectivity%20(JDBC)%20is,Edition%20platform%2C%20from%20Oracle%20Corporation.).

## Create Pipeline Configuration File

Now that the Kafka Connect connectors included in `lib`, we can use it in a pipeline configuration file.

1. [Install Conduit](https://github.com/ConduitIO/conduit#installation-guide).
2. Create a pipeline configuration file: Create a folder called `pipelines` at the same level as your Conduit 
binary. Inside of that folder create a file named `jdbc-to-file.yml`, check [Specifications](https://conduit.io/docs/pipeline-configuration-files/specifications)
for more details about Pipeline Configuration Files.

````yaml
version: 2.0
pipelines:
  - id: kafka-connect-pipeline
    status: running
    description: This pipeline is for testing
    connectors:
      - id: jdbc-kafka-connect
        type: source
        plugin: standalone:conduit-kafka-connect-wrapper
        settings:
          wrapper.connector.class: "io.aiven.connect.jdbc.JdbcSourceConnector",
          connection.url: "jdbc:postgresql://localhost/conduit-test-db",
          connection.user: "username",
          connection.password: "password",
          incrementing.column.name: "id",
          mode: "incrementing",
          tables: "customers",
          topic.prefix: "my_topic_prefix"
      - id: slack
        type: destination
        plugin: builtin:file
        settings:
          path: "path/to/the/file.txt"
````
3. Run Conduit! And see how simple it is to migrate to Conduit.

Note that the `wrapper.connector.class` should be a class which is present on the classpath, i.e. in one of the JARs in
the `libs` directory.
For more information, check the [Wrapper Configuration](https://github.com/ConduitIO/conduit-kafka-connect-wrapper#configuration) section.
