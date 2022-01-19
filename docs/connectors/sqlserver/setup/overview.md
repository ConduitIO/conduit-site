---
title: "SQL Server Setup"
sidebar_label: "Overview"
sidebar_position: 1
---

Here is everything you need to do before [creating a SQL Server resource](/docs/sources/sqlserver/add-resource). 

## Environments

We support the following SQL Server environments:

- [Self-hosted SQL Server](#setup)
- [Azure](/docs/sources/sqlserver/setup/azure)

The Meroxa Platform has been tested against the following SQL Server versions: **SQL Server 2012 - 2019**

## Setup

To setup SQL Server, follow these steps:

1. Before you can add, the SQL Server instance needs to be accessible by Meroxa. You may:

   - [Connect directly and only allow Meroxa IPs](/docs/networking/meroxa-ips).
   - [Connect use SSH Tunneling](/docs/networking/ssh-tunneling).

2. After you've enabled connectivity  for your databases and tables, you are now ready to [add your SQL Server resource to Meroxa](/docs/sources/sqlserver/add-resource).