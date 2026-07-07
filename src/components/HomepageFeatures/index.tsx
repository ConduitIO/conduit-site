import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '60-Second Start',
    img: require('@site/static/img/simple.png').default,
    description: "Download a single binary and run conduit quickstart to watch a demo pipeline stream records to your console in under a minute — zero configuration.",
  },
  {
    title: 'Any Language',
    img: require('@site/static/img/scalable.png').default,
    description: "Connectors and processors run over gRPC or compile to WASM, so you can write plugins in any language — not just the JVM.",
  },
  {
    title: 'Broker-Neutral',
    img: require('@site/static/img/realtime.png').default,
    description: "Conduit isn't tied to Kafka. Move data between any source and destination — databases, warehouses, queues, and more — with the same pipeline model.",
  },
  {
    title: 'Embeddable & Agent-Ready',
    img: require('@site/static/img/flexible.png').default,
    description: "Run it standalone or embed it as a Go library in your own service. Every command supports --json and returns structured, stable error codes, so agents and scripts can drive it directly.",
  },
];

const Feature = ({ img, title, description }) => (
<li key={title} className="h-full bg-forest-60 py-5 px-6 shadow rounded-lg text-white">
  <div className="space-y-6">
    <img className="h-8 w-8" src={img} alt="" />
    <div className="space-y-2 flex items-center justify-between">
      <div className="font-medium text-lg leading-6 space-y-1">
        <h3 className="font-bold text-white pb-2">{title}</h3>
        <p className="text-white">{description}</p>
      </div>
    </div>
  </div>
</li>)

export default function HomepageFeatures() {
  return (
    <div className="pb-10 mt-10 features">
      <h2 className='text-4xl font-bold pb-10 text-forest-100 text-center'>Everything Kafka Connect does — without the JVM or the Kafka lock-in</h2>
      <ul className={clsx(styles['feature-grid'], "gap-3 grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0")}>
        {FeatureList.map((feature) => (
          <Feature {...feature} />
        ))}
      </ul>
    </div>
  );
}
