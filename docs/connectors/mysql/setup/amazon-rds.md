---
title: "MySQL Amazon RDS Setup"
slug: "amazon-rds"
sidebar_label: "Amazon RDS"
---

Here is everything you need to do before [creating a MySQL resource](docs/destinations/mysql/add-resource) and using [Amazon RDS](https://aws.amazon.com/rds/). 

- Step One: [Configure Security Groups](#security-groups)
- Step Two: [Network ACLs](#network-acls)

## Security Groups

To allow access to your MySQL database from [Meroxa IPs](/docs/networking/meroxa-ips), follow these steps:

1. Navigate to [Amazon RDS](https://console.aws.amazon.com/rds/home?#).  
2. Select the Database you would like to add to Meroxa.  
3. In the "Connectivity & security" section, select your Security Group:  

![](https://files.readme.io/1bdab85-Screen_Shot_2021-03-18_at_12.16.36_PM.png)

4. In the Security Group for uration, select "Edit inbound rules":  

![](https://files.readme.io/b86dfee-Screen_Shot_2021-03-18_at_12.20.20_PM.png)

5. Add a new Rule:  
- Set "Protocol" to `TCP`
- Set "Port" to the port of your database. It is `5432` by default.
- Set the "Source"  to the [Meroxa IPs](/docs/networking/meroxa-ips):
- 
![](https://files.readme.io/497737f-add-custom-ips.png)

## Network ACLs

**You only need to update this if your database is within a VPC.**

To allow access to your MySQL database from [Meroxa IPs](/docs/networking/meroxa-ips), follow these steps:

1. Navigate to [Amazon RDS](https://console.aws.amazon.com/rds/home?#).
2. Select the Database you would like to create a replica of.
3. In the "Connectivity & security" section, select your VPC:  

![](https://files.readme.io/167839e-db-connectivity.png)

4. In the VPC Settings, select your VPC's "Main Network ACL":  

![](https://files.readme.io/834c8f5-vpc-page.png)

5. Update the Inbound and Outbound Rule of the Network ACL    

- 5a. If your inbound and outbound rules contain, `ALL - 0.0.0.0/0 - ALLOW`, you can move to #6.
- 5b. If your inbound and outbound rules **does not contain**, `ALL - 0.0.0.0/0 - ALLOW`, update the Source to allow [Meroxa IPs](/docs/networking/meroxa-ips) both **inbound** and **outbound**.

![](https://files.readme.io/028f7f8-Screen_Shot_2021-03-18_at_12.53.12_PM.png)

6. Now you're ready to [Add the MySQL Resource](/docs/destinations/mysql/add-resource).
