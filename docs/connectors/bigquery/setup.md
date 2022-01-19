---
title: "BigQuery Setup"
sidebar_label: "Setup"
sidebar_position: 2
---

Here is everything you need to do before [creating a BigQuery resource](docs/destinations/bigquery/add-resource). The setup includes:

- Creating a new [GCP Service Account](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account) with the proper credentials to access BigQuery.
- Creating a new [BigQuery dataset](https://cloud.google.com/bigquery/docs/datasets) that the pipeline will send data to.


## Prerequisites

You must have a [Google Cloud Platform (GCP) account](https://cloud.google.com) that has billing enabled for BigQuery.

## Setup

To setup BigQuery, follow these steps:

1. Create a new [GCP Service Account](https://cloud.google.com/docs/authentication/getting-started#creating_a_service_account) to create a secure authentication Meroxa. 

2. Give the Service Account the role of [BigQuery Data Editor](https://cloud.google.com/bigquery/docs/access-control).

<div style={{ textAlign: "center" }}>
  <img alt="Meroxa BigQuery Permissons" style={{ maxWidth: "500px" }} src="/images/docs/destinations/bigquery/bigquery-permissions.png" />
</div>

3. Create a [Service Account Key](https://cloud.google.com/docs/authentication/getting-started) and download the credentials JSON file. You will need this file when [adding the resource](/docs/destinations/bigquery/add-resource).

4. [Create a BigQuery dataset](https://cloud.google.com/bigquery/docs/datasets) that will contain destination data:

![Create BigQuery Dataset for Meroxa](/images/docs/destinations/bigquery/create-dataset.png)

In the screenshot above, a dataset named `meroxa` is being created. You will need the dataset name when [adding the resource](/docs/destinations/bigquery/add-resource).

5. You are now ready to [add your BigQuery resource to Meroxa](/docs/destinations/bigquery/add-resource).