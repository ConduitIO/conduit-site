import React from "react";
import Layout from "@theme/HomeLayout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "../components/HomepageFeatures";
import Connectors from "@theme/HomeLayout/Connectors";
import Navbar from '@theme/HomeLayout/NavBar';
import { MailIcon } from '@heroicons/react/solid'

function HomepageHeader() {
  return (
    <>
      <div style={{ 'background': 'linear-gradient(289.62deg, #20BED9 -11.02%, #0B525D 97.11%)' }} className="max-w-full">
        <Navbar />
        <div className="max-w-screen-lg  mx-auto py-2 pb-10 mt-10">
          <div className="flex flex-row">
            <div className="flex-1 items-center flex p-10">
              <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/server-illustration.svg" alt="Data Transformation Visual" />
            </div>
            <div className="flex-1 items-center flex p-10">
              <h1 className="font-bold text-2xl lg:text-5xl md:text-5xl text-white">Data Integration for <span className="text-sky-40" >Production</span> Data Stores </h1>
            </div>
          </div>

        </div>
      </div>
      <div className=" max-w-screen-lg px-12 mx-auto">
        <HomepageFeatures />
      </div>
    </>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      description={siteConfig.tagline}
    >
      <HomepageHeader />
      <section className="bg-slate-100 py-10" >
        <div className=" max-w-screen-lg  mx-auto px-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-canary-100 sm:text-3xl sm:truncate">Well Connected</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <a href="/docs/connectors/overview">
                <button
                  type="button"
                  className="inline-flex items-center  px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                  View More
                </button>
              </a>
            </div>
          </div>
          <Connectors />
        </div>
      </section>
      <section className="bg-orange-700 py-10" >
        <div className=" max-w-screen-lg  mx-auto px-10">
          <div className="max-w-screen-lg  mx-auto py-2 pb-10 mt-10">
            <div className="flex flex-row">
              <div className="flex-1 items-start flex flex-col">
                <h1 className="pb-10 font-bold text-2xl lg:text-5xl md:text-5xl text-white">Get up.<br />Get involved. <br />Get into it.</h1>
                <p className="pb-10 text-md text-white">The Conduit Community is the ultimate resource of information to help you get started and optimize your infrastructure to build and deploy connectors.</p>
                <div>
                  <a href="https://github.com/ConduitIO/conduit">
                    <button
                      type="button"
                      className="inline-flex items-center mb-5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 mr-4 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View the GitHub Repository
                      {/* <MailIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" /> */}
                    </button>
                  </a>

                  <a href="http://discord.meroxa.com/">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Join our Community
                      {/* <MailIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" /> */}
                    </button>
                  </a>
                </div>
              </div>
              <div className="flex-1 items-center flex">
                <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/big-data-storage.svg" alt="Data Transformation Visual" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
