---
title: "Amazon S3"
slug: "amazon-s3"
hidden: false
createdAt: "2020-05-13T06:13:33.427Z"
updatedAt: "2021-04-15T20:02:12.019Z"
---

[Amazon S3](https://aws.amazon.com/s3/) provides flexible object storage. As a Meroxa destination, you can capture events from any [source](/docs/sources/overview) and populate a bucket within a S3 in real-time.

## Adding Resource

To add an Amazon S3 resource to your Meroxa Resource Catalog, you can run the following command:

```shell
meroxa resource add datalake --type s3 -u \"s3://$AWS_ACCESS_KEY:$AWS_ACCESS_SECRET@$AWS_REGION/$AWS_S3_BUCKET\"
```
 `datalake` is a human-friendly name to represent the S3 resource. Feel free to change as desired.

In the command above, replace the following variables with valid credentials from your S3 environment:

- $AWS_ACCESS_KEY - AWS Access Key
- $AWS_ACCESS_SECRET - AWS Access Secret
- $AWS_REGION - AWS Region (e.g., us-east-2)
- $AWS_S3_BUCKET - AWS S3 Bucket Name

## Permissions

The following [AWS Access Policy](https://docs.aws.amazon.com/AmazonS3/latest/userguide/add-bucket-policy.html) is required to be attached to the [IAM user](https://docs.aws.amazon.com/iam/index.html) of the `AWS_ACCESS_KEY ` provided in the Connection URL:

```json
{
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts",
                "s3:ListBucketMultipartUploads"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::<bucket-name>/*",
                "arn:aws:s3:::<bucket-name>"
            ]
        }
    ],
    "Version": "2012-10-17"
}
```

## Destination Configuration

The S3 Destination connector allows you to store [Data Records](/docs/pipelines/data-records) from a [Streams](/docs/pipelines/streams) into an [S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html). 

To configure an Amazon S3 resource as a destination: 

```
meroxa connector create to-s3 --to datalake --input $STREAM_NAME
```

The command above creates a new [Destination Connector](/docs/pipelines/connectors) called `to-s3`, sets the destination to a resource named `datalake`, and configures the input with a [stream](/docs/pipelines/streams) .

## Output 

[Data Records](/docs/pipelines/data-records) are written a folder within the root of the S3 bucket as gzipped JSON, with one record per file and using the following naming format:

```
<stream-name>-<partition-number>-<starting-offset>
```

In the following example, the record is from the `resource-5-499379.public.orders` stream with starting offset `0000000000` and partition `0`.

```shell
aws s3 ls s3://data-lake-bucket/resource-7-133274/resource-5-499379.public.orders-0-0000000000.gz
```

Here is an example of a Data Record: [Example Data Record](/docs/pipelines/data-records#example-data-record).

## Advanced Configuraiton

The following [configuration](/docs/pipelines/connectors#configuration) is supported for this Connector:

### Configuration Options

The following [configuration](/docs/pipelines/connectors#configuration) is supported for this Connector:

| Configuration  | Destination
| -----------    | -----------
| `output_compression`      | Compression type for output files. Supported algorithms are `gzip` and `none`. Defaults to `gzip`.