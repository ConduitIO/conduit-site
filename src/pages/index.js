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
          <div className="flex items-center">
            <div className="basis-2/5 flex-1 items-center flex p-10">
              <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/server-illustration.svg" alt="Data Transformation Visual" />
            </div>
            <div className="basis-3/5 flex flex-col p-10">
              <h1 className="font-bold text-2xl lg:text-5xl md:text-5xl leading-6 text-white">
                Data Integration for Production Data Stores
              </h1>

              <p className='mt-10 text-white'>
                Sync data between your production systems using an extensible, event-first experience with minimal dependencies that fit within your existing workflow.
              </p>

              <div className='mt-6'>
                <a href="https://github.com/ConduitIO/conduit"
                  className="inline-flex items-center mb-5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-700 mr-4 hover:text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span>Download</span>
                </a>

                <a href="/docs/introduction/what-is-conduit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-transparent-200 hover:text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span>Documentation</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div role="presentation" aria-hidden="true" className="text-white -mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
            <path
              d="M1662 .974V141H0V96L1662 .974z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className=" max-w-screen-lg px-12 py-12 mx-auto">
        <HomepageFeatures />
      </div>

      <div role="presentation" aria-hidden="true" className="color-light text-slate-100 -mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
          <path
            d="M1662 .974V141H0V96L1662 .974z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
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
      <section className="bg-slate-100 pt-10" >
        <div className=" max-w-screen-lg  mx-auto px-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-4xl font-bold leading-7 text-canary-100 sm:text-4xl sm:truncate">Well Connected</h2>
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

        <div role="presentation" aria-hidden="true" className="text-orange-700 -mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
            <path
              d="M1662 .974V141H0V96L1662 .974z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </section>
      <section className="bg-orange-700 pt-10" >
        <div className=" max-w-screen-lg  mx-auto px-10">
          <div className="max-w-screen-lg  mx-auto py-2 pb-10 mt-10">
            <div className="flex flex-row">
              <div className="flex-1 items-start flex flex-col">
                <h1 className="pb-10 font-bold text-2xl lg:text-5xl md:text-5xl text-white leading-4">Get up.<br />Get involved. <br />Get into it.</h1>
                <p className="pb-10 text-md text-white">The Conduit Community is the ultimate resource of information to help you get started and optimize your infrastructure to build and deploy connectors.</p>
                <div>
                  <a href="https://github.com/ConduitIO/conduit"
                    className="inline-flex items-center mb-5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 mr-4 hover:text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 72 70" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M36 0C55.8895 0 72 16.0623 72 35.8923C72 51.7564 61.6796 65.1967 47.3812 69.9559C45.5912 70.2864 44.9282 69.1848 44.9282 68.2153C44.9282 67.356 44.9503 65.1086 44.9724 62.112C54.9834 64.2713 57.105 57.3088 57.105 57.3088C58.7403 53.1665 61.105 52.0428 61.105 52.0428C64.3757 49.8174 60.8619 49.8615 60.8619 49.8615C57.2597 50.1259 55.337 53.5631 55.337 53.5631C52.1326 59.0494 46.9171 57.463 44.8619 56.5376C44.5304 54.2241 43.6022 52.6377 42.5856 51.7343C50.5635 50.853 58.9613 47.7683 58.9613 34.0195C58.9613 30.0976 57.5691 26.9027 55.2486 24.3909C55.6243 23.4655 56.8619 19.83 54.9171 14.8946C54.9171 14.8946 51.8895 13.9251 45.0166 18.5741C42.1436 17.7809 39.0718 17.3843 36 17.3623C32.9503 17.3843 29.8564 17.7809 26.9834 18.5741C20.1105 13.9251 17.0829 14.8946 17.0829 14.8946C15.116 19.83 16.3536 23.4876 16.7293 24.3909C14.4309 26.9027 13.0387 30.0976 13.0387 34.0195C13.0387 47.8124 21.4586 50.831 29.4807 51.7343C28.1989 52.836 27.0276 55.0393 27.0276 58.3884C27.0276 63.1917 27.0718 67.0475 27.0718 68.2373C27.0718 69.2068 26.4309 70.3085 24.5967 69.9559C10.2983 65.1967 0 51.7564 0 35.9144C0 16.0623 16.1105 0 36 0Z" fill="currentColor"></path></g><defs><clipPath id="clip0"><rect width="72" height="70" fill="white"></rect></clipPath></defs></svg>
                    <span className='ml-2'>View the Repository</span>
                  </a>

                  <a href="http://discord.meroxa.com/"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 hover:text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg aria-hidden="true" width="33" height="25" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path d="M27.32 2.226A26.612 26.612 0 0 0 20.751.19a.1.1 0 0 0-.105.05 18.547 18.547 0 0 0-.818 1.68 24.569 24.569 0 0 0-7.378 0 17.016 17.016 0 0 0-.831-1.68.104.104 0 0 0-.106-.05 26.54 26.54 0 0 0-6.569 2.037.094.094 0 0 0-.043.037C.717 8.514-.429 14.611.133 20.633a.11.11 0 0 0 .042.075 26.763 26.763 0 0 0 8.059 4.074.104.104 0 0 0 .113-.038 19.126 19.126 0 0 0 1.649-2.681.102.102 0 0 0-.056-.142 17.618 17.618 0 0 1-2.518-1.2.103.103 0 0 1-.01-.172c.17-.127.339-.258.5-.392a.1.1 0 0 1 .104-.014c5.282 2.412 11 2.412 16.22 0a.1.1 0 0 1 .105.013c.162.133.33.266.501.393a.103.103 0 0 1-.009.172c-.804.47-1.64.867-2.518 1.198a.103.103 0 0 0-.055.144 21.476 21.476 0 0 0 1.647 2.68.103.103 0 0 0 .113.039 26.675 26.675 0 0 0 8.072-4.074.104.104 0 0 0 .042-.074c.673-6.962-1.127-13.009-4.772-18.37a.082.082 0 0 0-.042-.038Zm-16.535 14.74c-1.59 0-2.9-1.46-2.9-3.253 0-1.793 1.284-3.252 2.9-3.252 1.628 0 2.925 1.472 2.9 3.252 0 1.793-1.285 3.253-2.9 3.253Zm10.723 0c-1.59 0-2.9-1.46-2.9-3.253 0-1.793 1.284-3.252 2.9-3.252 1.628 0 2.926 1.472 2.9 3.252 0 1.793-1.272 3.253-2.9 3.253Z" fill="currentColor"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h32.273v25H0z"/></clipPath></defs></svg>
                    <span className='ml-2'>Join our Discord</span>
                  </a>
                </div>
              </div>
              <div className="flex-1 items-center flex">
                <img className="w-full h-46 md:h-96 mx-auto" src="/images/conduit/big-data-storage.svg" alt="Data Transformation Visual" />
              </div>
            </div>

          </div>
        </div>

        <div role="presentation" aria-hidden="true" className="text-white -mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
            <path
              d="M1662 .974V141H0V96L1662 .974z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </section>
    </Layout>
  );
}
