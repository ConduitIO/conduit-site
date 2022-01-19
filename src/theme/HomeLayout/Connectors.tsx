import React from 'react'
import ResourceTags from './ResourceTags'
import { Connectors } from '../../utils/connectors'
import { resourceUsage } from 'process'

const Resource = ({ resource }) => (
    <a className="hover:no-underline" href={resource.link}>
        <li
            key={resource.name}
            className="h-full bg-canary-60 p-5 rounded-lg"
        >
            <div className="space-y-6">
                <div className="space-y-2 flex items-start justify-start">
                    <div className="font-medium text-lg leading-6 space-y-1">
                        <h3 className="text-slate-100 font-bold">
                            {resource.title}
                        </h3>
                        <p className="text-md text-slate-100">
                            {resource.description}
                        </p>
                        <div className="mt-4 flex">
                            <button
                                type="button"
                                className="inline-flex items-center  px-4 py-2 font-bold border border-transparent rounded-md shadow-sm text-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                            >
                                Docs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    </a>
)

export default function ConnectorGrid({ list }) {
    return (
        <div className="py-10">
            <ul className="gap-3 grid grid-cols-1 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                {Connectors.map((source) => (
                    <Resource resource={source} key={source.name} />
                ))}
            </ul>
        </div>
    )
}
