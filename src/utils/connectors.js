import React from 'react';

export const Connectors = [
  {
    title: 'File',
    type: 'destination',
    id: 'redshift',
    logo: '/images/resources/amazon-redshift.png',
    icon: '/images/resources/amazon-redshift-icon.png',
    link: '/docs/destinations/redshift',
    conUrl: "redshift://$REDSHIFT_USER:$REDSHIFT_PASS@$REDSHIFT_URL:$REDSHIFT_URL/$REDSHIFT_TABLE",
    useCase: ' a table within Redshift',
    description: "Send data to a table.",
  },
  {
    title: 'PostgreSQL',
    type: 'destination',
    id: 's3',
    logo: '/images/resources/amazon-s3.png',
    icon: '/images/resources/amazon-s3-icon.png',
    conUrl: 's3://$AWS_ACCESS_KEY:$AWS_ACCESS_SECRET@$AWS_REGION/$AWS_S3_BUCKET',
    link: '/docs/destinations/amazon-s3',
    useCase: ' files within an S3 Bucket',
    description: "Send data to an S3 Bucket.",
  },
  {
    title: 'Amazon S3',
    type: 'destination',
    id: 'bigquery',
    logo: '/images/resources/bigquery.png',
    icon: '/images/resources/bigquery-icon.png',
    link: '/docs/destinations/bigquery/overview',
    conUrl: "bigquery://$GCP_PROJECT_ID/$DATASET_NAME",
    useCase: ' a table within BigQuery',
    description: "Send data to a table within a BigQuery Dataset.",
  },
  {
    title: 'Kafka',
    type: 'destination',
    id: "mongodb",
    logo: '/images/resources/mongodb.png',
    icon: '/images/resources/mongodb-icon.png',
    conUrl: "$MONGO_CONNECTION_STRING",
    link: '/docs/destinations/mongoDB',
    useCase: ' a collection within MongoDB',
    description: "Send data to a collection.",
  }
  
];


