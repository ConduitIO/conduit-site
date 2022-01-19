---
title: "Snowflake"
slug: "snowflake"
hidden: false
createdAt: "2021-03-29T18:32:18.476Z"
updatedAt: "2021-04-22T13:40:07.920Z"
---

Snowflake is an enterprise-ready cloud Data Warehouse. As a Meroxa destination, you can capture CDC events from any [source](/docs/sources/overview) and populate your [warehouse](https://docs.snowflake.com/en/user-guide/warehouses-overview.html) in realtime.

To add a Snowflake resource to Meroxa, you need to perform the following steps:

- [Create New Snowflake User](#create-new-snowflake-user)
- [Create and Configure Snowflake Database](#create-and-configure-snowflake-database)
- [Add to Catalog](#add-to-catalog)
- [Destination Configuration](#destination-configuration)

## Create New Snowflake User

Meroxa uses [Key Pair Authentication](https://docs.snowflake.com/en/user-guide/key-pair-auth.html) to access your Snowflake account. The following steps guide you through creating a private key, public key,  a `meroxa_user` user, and associating the public key appropriately.

1. Generate a private key:

```shell
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt
```

For more details, see:  [Snowflake Docs: Generate the Private Key](https://docs.snowflake.com/en/user-guide/key-pair-auth.html#step-1-generate-the-private-key)

2. Generate a public key:

```shell
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
```

For more details, see:  [Snowflake Docs: Generate the Private Key](https://docs.snowflake.com/en/user-guide/key-pair-auth.html#step-2-generate-a-public-key)

3. [Create a new user within Snowflake](https://docs.snowflake.com/en/user-guide/admin-user-management.html#creating-users) with the username `meroxa_user`.

4. Using a [Snowflake Worksheet](https://docs.snowflake.com/en/user-guide/ui-worksheet.html#), assign the **public key** to the user: 

```sql
-- Set public key for authentication to user
ALTER USER meroxa_user SET RSA_PUBLIC_KEY = "$SNOWFLAKE_PUBLIC_KEY"
```

`$SNOWFLAKE_PUBLIC_KEY` is the public key you created in step #2.


When adding the public key, exclude the public key delimiters (`-----BEGIN PRIVATE KEY|-----END PRIVATE KEY`) in the SQL statement. For example:

```ALTER USER meroxa_user SET RSA_PUBLIC_KEY ='MIIBIjANBgkqh...';```

## Create and Configure Snowflake Database

Next, using [Snowflake Worksheet](https://docs.snowflake.com/en/user-guide/ui-worksheet.html#), we can run the following commands:

```sql
-- Use a role that can create databases
USE ROLE accountadmin;
-- Create new database 
CREATE DATABASE meroxa_db;
USE meroxa_db;
CREATE SCHEMA stream_data;
-- Create a Snowflake role with the privileges to work with the connector.
CREATE ROLE meroxa_platform_role;
-- Grant privileges on the database.
GRANT USAGE ON DATABASE meroxa_db TO ROLE meroxa_platform_role;
GRANT USAGE ON SCHEMA stream_data TO ROLE meroxa_platform_role;
GRANT CREATE TABLE ON SCHEMA stream_data TO ROLE meroxa_platform_role;
-- Grant access to stage data
GRANT CREATE STAGE ON SCHEMA stream_data TO ROLE meroxa_platform_role;
GRANT CREATE PIPE ON SCHEMA stream_data TO ROLE meroxa_platform_role;
-- Grant the custom role to an existing user.
GRANT ROLE meroxa_platform_role TO USER meroxa_user;
ALTER USER meroxa_user SET DEFAULT_ROLE = meroxa_platform_role;
```

The above does the following:
- Creates a new [Snowflake Database](https://docs.snowflake.com/en/sql-reference/sql/create-database.html) called `meroxa_db`. 
- Creates a new [Snowflake Schema](https://docs.snowflake.com/en/sql-reference/sql/create-schema.html) called `stream_data`.
- Creates a new [Snowflake Role](https://docs.snowflake.com/en/sql-reference/sql/create-role.html) called `meroxa_platform_role`.
- Grants privileges to the above for `meroxa_platform_role`. 
- Set's the role of `meroxa_user` to be `meroxa_platform_role`.

## Add to Catalog

To add a Snowflake resource to your Meroxa Resource Catalog, you can run the following command:

```shell
meroxa resource add snowflake --type snowflakedb --url snowflake://$SNOWFLAKE_URL/meroxa_db/stream_data --username meroxa_user --password "$SNOWFLAKE_PRIVATE_KEY"
```

`snowflake` is a human-friendly name to represent the resource within Meroxa. Feel free to change as desired.

In the command above, replace the following variables with valid credentials from your Postgres environment:

- $SNOWFLAKE_URL - [Snowflake Account URL](https://docs.snowflake.com/en/user-guide/connecting.html#your-snowflake-account-name)
- $SNOWFLAKE_PRIVATE_KEY - The private key created in the [previous step](#create-new-snowflake-user). 

When adding the private key, exclude the public key delimiters (`-----BEGIN PRIVATE KEY|-----END PRIVATE KEY`) in the SQL statement. For example: 

``` shell
meroxa resource add sfdb --type snowflakedb --url snowflake://$SNOWFLAKE_URL/meroxa_db/stream_data --username meroxa_user --password "MIOEvQ..."
```

## Destination Configuration

To configure Snowflake as a destination:

```shell
meroxa connector create to-snowflake --to snowflake --input $STREAM_NAME
```

The command above creates a new connector  called `to-snowflake`, sets the destination to a resource named `snowflake`, and configures the [Input Stream](/docs/pipelines/streams) .