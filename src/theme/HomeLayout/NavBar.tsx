/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import React, { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { SearchIcon } from '@heroicons/react/solid'
import Cluster from './../../containers/Cluster';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const navLinks = [
    {
        label: 'Connectors',
        href: '/docs/connectors/overview',
    },
    {
        label: 'Documentation',
        href: '/docs/introduction/getting-started',
    },
    {
        label: 'Github',
        href: 'http://github.com/ConduitIO/',
    },
    {
        label: 'Discord',
        href: 'http://discord.meroxa.com/',
    },
]

export default function NavBar() {
    return (
        <Disclosure as="nav" className="max-w-screen-lg bg-transparent mx-auto pt-5">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                      <Cluster>
                        <div className='justify-between'>
                          <div>
                              <div className="flex-shrink-0 flex items-center">
                                  <a href="/">
                                      <img
                                          className="block lg:hidden h-10 w-auto"
                                          src="/images/conduit/conduit-logo.svg"
                                          alt="Conduit Logo"
                                      />
                                      <img
                                          className="hidden lg:block h-16 w-auto"
                                          src="/images/conduit/conduit-logo.svg"
                                          alt="Conduit Logo"
                                      />
                                  </a>
                              </div>
                            </div>
                            <div className='flex items-center'>
                                    {/* Current: "border-sky-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600" */}
                                {navLinks.map(({ label, href }) => (
                                    <a
                                        href={href}
                                        className="text-white hover:text-white inline-flex items-center px-1 pt-1 text-sm md:text-lg font-extrabold"
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>
                          </div>
                        </Cluster>
                      </div>
                            {/* <div className="flex-1 flex items-center justify-center px-2 lg:justify-end bg-transparent">
                                <div className="max-w-lg w-full lg:max-w-xs">
                                    <label htmlFor="search" className="sr-only">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon
                                                className="h-5 w-5 text-white"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <input
                                            id="search"
                                            name="search"
                                            className="block w-full pl-10 pr-3 py-2 rounded-md leading-5 border-none placeholder-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-white focus:border-white bg-transparent sm:text-sm"
                                            placeholder="Search"
                                            type="search"
                                        />
                                    </div>
                                </div>
                            </div> */}

                    <Disclosure.Panel className="lg:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {/* Current: "bg-sky-50 border-sky-500 text-sky-600", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
                            {navLinks.map(({ label, href }) => (
                                <Disclosure.Button
                                    as="a"
                                    href={href}
                                    className="bg-sky-50 border-sky-500 text-sky-600 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                                >
                                    {label}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
