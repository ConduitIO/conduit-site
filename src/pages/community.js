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
            <div className="flex-1 items-center flex">
              <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/server-illustration.svg" alt="Data Transformation Visual" />
            </div>
            <div className="flex-1 items-center flex">
              <h1 className="font-bold text-2xl lg:text-5xl md:text-5xl text-white">Data Integration for <span className="text-sky-40" >Any</span> Data Stores </h1>
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
      title="Meroxa Data Platform Documentation"
      description={siteConfig.tagline}
    >
      <main className="bg-orange-700">
        <Navbar />
        <section className=" py-20" >
          <div className="max-w-screen-lg  mx-auto py-2 pb-10 mt-10">
            <div className="flex flex-row">
              <div className="flex-1 items-start flex flex-col">
                <h1 className="pb-10 font-bold text-2xl lg:text-5xl md:text-5xl text-white">Get up.<br />Get involved. <br />Get into it.</h1>
                <p className="pb-10 text-md text-white">The Conduit Community is the ultimate resource of information to help you get started and optimize your infrastructure to build and deploy connectors.</p>
                <div>

                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 mr-4 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View the Repository
                    <MailIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Join our Discord
                    <MailIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="flex-1 items-center flex">
                <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/big-data-storage.svg" alt="Data Transformation Visual" />
              </div>
            </div>

          </div>
        </section>
      </main>
    </Layout>
  );
}
