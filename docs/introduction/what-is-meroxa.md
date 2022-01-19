---
title: "What is Conduit?"
sidebar_position: 1
slug: "what-is-conduit"
---

Meroxa is a real-time data platform as a service that gives data teams the data orchestration tools they need to build real-time streaming infrastructure in minutes, not months. Our platform removes the time and overhead associated with configuring and managing brokers, connectors, transforms, functions, and streaming infrastructure. 

All you have to do is add your resources and construct your pipelines. Meroxa takes care of the rest. Giving you more time to focus on the execution of your data projects.

<div style={{textAlign: 'center'}}>
  <img src="/images/docs/getting-started/change-data-capture.png" width="500" />
</div>

## What can you use Meroxa for?

Our customers use Meroxa to do the following:

- Real-time data warehouse sync for analytics and dashboard visualizations.
- Archival of raw records into a data lake for model training/active learning.
- Processing data in real-time ensures it reaches the destination in the proper format without introducing latency or complexity with external tools.
- From a custom service, programmatically listen and receive data from a pipeline.

## Example Use Cases

Here are some example pipelines you can build with Meroxa:

### Capture Changes from PostgreSQL and send to Snowflake and Amazon S3

This is an example pipeline ingest data from PostgreSQL to Snowflake, extend that pipeline to send to Amazon S3, and keep both destinations up to date in real-time. Using Meroxa, we can set up a CDC pipeline to capture every insert, update, and delete and send to both destinations. 

<div style={{textAlign: 'center'}}>
  <img src="/images/docs/getting-started/pg-to-snowflake-and-s3.png" />
</div>

For more information:
- [5-minute Demo](https://youtu.be/JZ_02ugnHbQ)
- [PostgreSQL](/docs/sources/postgres/overview)
- [Snowflake](/docs/destinations/snowflake) 
- [Amazon S3](/docs/destinations/amazon-s3) 

### Sync PostgreSQL and MongoDB

This pipeline assists with migration from PostgreSQL to Mongo. Using Meroxa, we can set up a CDC pipeline to capture every insert, update, and delete and to both databases in sync, in real-time. 

<div style={{textAlign: 'center'}}>
  <img src="/images/docs/getting-started/pg-to-mongo.png" />
</div>

For more information:
- [30-second Demo](https://youtu.be/zwKE3SiJTi8)
- [5-minute Demo](https://youtu.be/HVtm9EAVpbU)
- [PostgreSQL](/docs/sources/postgres/overview) 
- [MongoDB](/docs/destinations/mongodb) 