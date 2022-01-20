import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/solid'

export default function Alert({ title, list }) {
    return (
        <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 mt-0.5">{title}</h3>
                    {list && <div className="mt-2 text-sm text-blue-700">
                        <ul role="list" className="list-disc pl-5 space-y-1">
                            {list.map((item, index) => (
                                <li>{item}</li>))}
                        </ul>
                    </div>}
                </div>
            </div>
        </div>
    )
}
