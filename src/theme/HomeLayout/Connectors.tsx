import React from 'react'
import { Connectors } from '../../utils/connectors'

const Resource = ({ resource }) => (
    <a className="hover:no-underline" href={resource.link}>
        <li key={resource.name} className="h-full bg-canary-60 p-5 rounded-lg">
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

export default function ConnectorGrid({ list }) {
    return (
        <div className="py-10">
            <ul className="gap-3 grid grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {Connectors.map((source) => (
                    <Resource resource={source} key={source.name} />
                ))}
            </ul>
        </div>
    )
}
