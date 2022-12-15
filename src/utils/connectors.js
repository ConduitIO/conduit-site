import React from 'react';

export const Connectors = [
  {
    title: 'File',
    id: 'file',
    link: 'https://github.com/ConduitIO/conduit-connector-file',
    description: "Allows you to read and write to files in pipelines.",
  },
  {
    title: 'PostgreSQL',
    id: 'postgres',
    link: 'https://github.com/ConduitIO/conduit-connector-postgres',
    description: "Allows you to listen to changes and publish to PostgreSQL in pipelines.",
  },
  {
    title: 'Amazon S3',
    id: 'amazon-s3',
    link: 'https://github.com/ConduitIO/conduit-connector-s3',
    description: "Allows you to listen to and publish to S3 buckets in pipelines.",
  },
  {
    title: 'Kafka',
    id: "kafka",
    link: 'https://github.com/ConduitIO/conduit-connector-kafka',
    description: "Allows you to publish and consume from Kafka topics in pipelines.",
  }
  
];


