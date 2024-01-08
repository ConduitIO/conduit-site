import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Simple',
    img: require('@site/static/img/simple.png').default,
    description: "Eliminate the multi-step process you go through today. Just download the binary and start building.",
  },
  {
    title: 'Extensible',
    img: require('@site/static/img/scalable.png').default,
    description: "Conduit connectors give you the ability to pull and push data to any production datastore you need. If a datastore is missing, the simple SDK allows you to extend Conduit where you need it.",
  },
  {
    title: 'Real-Time',
    img: require('@site/static/img/realtime.png').default,
    description: "Conduit pipelines listen for changes to a database, data warehouse, etc., and allows your data applications to act upon those changes in real-time.",
  },
  {
    title: 'Flexible',
    img: require('@site/static/img/flexible.png').default,
    description: "Run it in a way that works for you; use it as a standalone service or orchestrate it within your infrastructure.",
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
    <div className="pb-10 mt-10">
      <h2 className='text-4xl font-bold pb-10 text-forest-100 text-center'> Deliver real-time event-based data in no time </h2>
      <ul className={clsx(styles['feature-grid'], "gap-3 grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0")}>
        {FeatureList.map((feature) => (
          <Feature {...feature} />
        ))}
      </ul>
    </div>
  );
}
