---
title: "MySQL Setup"
sidebar_label: "Overview"
sidebar_position: 1
---

Here is everything you need to do before [creating a MySQL resource](docs/destinations/mysql/add-resource). 

## Environments

We support the following MySQL environments:

- [Self-hosted MySQL](#setup)
- [Amazon RDS](/docs/destinations/mysql/setup/amazon-rds)

The Meroxa Platform has been tested against the following MySQL versions:

* `8.x`

## Setup

Before you can add, the MySQL instance needs to be accessible by Meroxa. You may:

   - [Connect directly and only allow Meroxa IPs](/docs/networking/meroxa-ips).
   - [Connect use SSH Tunneling](/docs/networking/ssh-tunneling).


1. (Optional) Create a user for Meroxa:

```sql

# Create User 
CREATE USER 'meroxa'@'localhost' IDENTIFIED BY 'supersecret!23';

# Grant Privalages
GRANT CREATE ON *.* TO 'meroxa' IDENTIFIED BY 'supersecret!23';

# Finalize
FLUSH PRIVILEGES;
```

4. You are now ready to [add your MySQL resource to Meroxa](/docs/destinations/mysql/add-resource).