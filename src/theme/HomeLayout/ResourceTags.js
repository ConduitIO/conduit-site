import React, { useState } from 'react'

const COLORTAGS = {
    'Beta': 'bg-plum-100',
    'New': 'bg-canary-100',
    'Coming Soon': 'bg-sky-100',
}

export default ({ tags, resource }) => {
    return (
        <div className="flex pt-3 flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 justify-center">
            {tags?.map((tag) => (
                <span key={`${resource}-${tag}`} style={{maxWidth: '3.5rem'}} className={`inline-flex text-gray-800 max-w bg-opacity-20 items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${COLORTAGS[tag]}`}>
                    {tag}
                </span>
            ))}
        </div>
    )
}