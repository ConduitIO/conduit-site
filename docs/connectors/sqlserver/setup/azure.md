---
title: "SQL Server Azure Setup"
slug: "azure"
sidebar_label: "Azure"
---

Here is everything you need to do before [creating a SQL Server resource](docs/destinations/sqlserver/add-resource) and using [Azure](https://azure.microsoft.com/en-us/services/sql-database/campaign/). 

## Networking

Before you can add, the SQL Server instance needs to be accessible by Meroxa. You may [Connect use SSH Tunneling](/docs/networking/ssh-tunneling) or [Connect directly and only allow Meroxa IPs](/docs/networking/meroxa-ips).

To configure the Meroxa IPs in Azure:

1. Navigate to your MS SQL Server in the Azure Portal.
2. Select "Firewalls and virtual networks"

![Azure SQL Server Firewall](/images/docs/sources/sqlserver/azure-sqlserver-firewall.png)

3. Add [Meroxa IPs](/docs/networking/meroxa-ips).
4. Save the new configuration.
