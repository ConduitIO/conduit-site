import React from 'react'
import clsx from 'clsx';
import styles from './styles.module.css';

const Connectors = [
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

const Resource = ({ resource }) => (
  <a className="hover:no-underline" href={resource.link}>
    <li key={resource.title} className="h-full bg-canary-60 p-5 rounded-lg">
      <div className="space-y-3 flex items-start justify-start">
        <div className="font-medium text-lg leading-6 space-y-3">
          <h3 className="text-slate-100 font-bold">
            {resource.title}
          </h3>
          <p className="text-md mb-10 text-slate-100">
            {resource.description}
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center  px-4 py-2 font-bold border border-transparent rounded-md shadow-sm text-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              Documentation
            </button>
          </div>
        </div>
      </div>
    </li>
  </a>
)

export default function ConnectorGrid() {
  return (
    <div className="py-10">
      <ul className={clsx(styles['connector-grid'], "gap-3 grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0")}>
        {Connectors.map((source) => (
          <Resource resource={source} key={source.title} />
        ))}
      </ul>
    </div>
  )
}
