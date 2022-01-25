import React from 'react';

const FeatureList = [
  {
    title: 'Simple',
    img: '/images/simple.png',
    description: "Eliminate the multi-step process you go through today. Just download the binary and start building.",
  },
  {
    title: 'Scaleable',
    img: '/images/scalable.png',
    description: "Conduit connectors give you the ability to pull and push data to any production datastore you need. If a datastore is missing, the simple SDK allows you to extend Conduit where you need it.",
  },
  {
    title: 'Real-Time',
    img: '/images/realtime.png',
    description: "Conduit pipelines listen for changes to a database, data warehouse, etc., and allows your data applications to act upon those changes in real-time.",
  },
  {
    title: 'Flexible',
    img: '/images/flexible.png',
    description: "Run it in a way that works for you; use it as a standalone service or orchestrate it within your infrastructure.",
  },
];

const Feature = ({ img, title, description, link }) => (<li key={title} className="h-full bg-forest-60cursor-pointer py-5 px-6 shadow rounded-lg">
  <div className="space-y-6">

    <img className="h-8 w-8" src={img} alt="" />
    <div className="space-y-2 flex items-center justify-between">
      <div className="font-medium text-lg leading-6 space-y-1">
        <h3 className="font-bold text-gray-900 pb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  </div>
</li>)

export default function HomepageFeatures() {
  return (
    <div className="pb-10 mt-10">
      <h2 className='text-2xl font-bold pb-10 text-forest-100'> Deliver real-time event-based data in no time </h2>
      <ul className="gap-3 grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {FeatureList.map((feature) => (
          <Feature title={feature.title} img={feature.img} description={feature.description} link={feature.link} />
        ))}
      </ul>
    </div>
  );
}
