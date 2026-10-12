import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageConnectors from '@site/src/components/HomepageConnectors';
import HomepageFooter from '@site/src/components/HomepageFooter';

import SplitPair from '@site/src/components/SplitPair';
import Stack from '@site/src/components/Stack';
import Wrapper from '@site/src/components/Wrapper';
import DiagonalDivider from '@site/src/components/DiagonalDivider';
import styles from './index.module.css';

function HeaderSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <>
      <div className="max-w-full page__header header">
        <Wrapper className='py-12'>
          <SplitPair data-reversed data-skewed="60:40">
            <Stack className="basis-3/5">
              <h1 className="font-bold text-5xl lg:text-5xl md:text-5xl text-white">
                The Open-Source Kafka Connect Replacement
              </h1>

              <p className='mt-10 text-white'>
                {siteConfig.tagline}
              </p>

              <div className='mt-6'>
                <a href="/docs/installing-and-running"
                   className="download inline-flex items-center mb-5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-700 mr-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span>Download</span>
                </a>

                <a href="/docs"
                   className={clsx(styles['bg-transparent-200'], "docs inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500")}
                >
                  <span>Documentation</span>
                </a>
              </div>
            </Stack>
            <div className="basis-2/5">
              <img className="w-full h-46 md:h-96 mx-auto" src="/img/conduit/server-illustration.svg" alt="Data Transformation Visual" />
            </div>
          </SplitPair>
        </Wrapper>
        <DiagonalDivider className="text-white" lightBgColor="white" darkBgColor="#282D39" />
      </div>
    </>
  );
}

function FeaturesSection() {
  return (
    <>
      <Wrapper className="py-12">
        <HomepageFeatures />
      </Wrapper>
      <DiagonalDivider className="text-slate-100" lightBgColor="#101827" darkBgColor="#101827" />
    </>
)
}

function ConnectorsSection() {
  return (
    <section className="bg-slate-100 pt-10 connectors" >
      <Wrapper className='py-10'>
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-4xl font-bold leading-7 text-canary-100 sm:text-4xl sm:truncate">Well Connected</h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <a href="/docs/using/connectors/list">
              <button
                type="button"
                className="inline-flex items-center  px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
              >
                View More
              </button>
            </a>
          </div>
        </div>
        <HomepageConnectors />
      </Wrapper>


      <DiagonalDivider className="text-orange-700" lightBgColor="#C2420D" darkBgColor="#282D39" />
    </section>
  )
}

function CommunitySection() {
  return (
    <section className="community bg-orange-700 pt-10" >
      <Wrapper className="py-2 pb-10">
        <SplitPair>
            <div className="flex-1 items-start flex flex-col">
                <h2 className='text-4xl font-bold pb-10 text-white'>Get up.<br/>Get involved. <br/>Get into it.</h2>
                <p className="pb-10 text-md text-white">The Conduit Community is the ultimate resource of information to
                    help you get started and optimize your infrastructure to build and deploy connectors.</p>
                <img referrerPolicy="no-referrer-when-downgrade" alt="scarf pixel conduit-site-landing-page"
                     src="https://static.scarf.sh/a.png?x-pxid=80cfd08d-1f82-4068-960a-cee31e1ae3fa"/>
                <div>
                    <a href="https://github.com/ConduitIO/conduit"
                       className="inline-flex items-center mb-5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 mr-4 hover:text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 72 70" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0)">
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M36 0C55.8895 0 72 16.0623 72 35.8923C72 51.7564 61.6796 65.1967 47.3812 69.9559C45.5912 70.2864 44.9282 69.1848 44.9282 68.2153C44.9282 67.356 44.9503 65.1086 44.9724 62.112C54.9834 64.2713 57.105 57.3088 57.105 57.3088C58.7403 53.1665 61.105 52.0428 61.105 52.0428C64.3757 49.8174 60.8619 49.8615 60.8619 49.8615C57.2597 50.1259 55.337 53.5631 55.337 53.5631C52.1326 59.0494 46.9171 57.463 44.8619 56.5376C44.5304 54.2241 43.6022 52.6377 42.5856 51.7343C50.5635 50.853 58.9613 47.7683 58.9613 34.0195C58.9613 30.0976 57.5691 26.9027 55.2486 24.3909C55.6243 23.4655 56.8619 19.83 54.9171 14.8946C54.9171 14.8946 51.8895 13.9251 45.0166 18.5741C42.1436 17.7809 39.0718 17.3843 36 17.3623C32.9503 17.3843 29.8564 17.7809 26.9834 18.5741C20.1105 13.9251 17.0829 14.8946 17.0829 14.8946C15.116 19.83 16.3536 23.4876 16.7293 24.3909C14.4309 26.9027 13.0387 30.0976 13.0387 34.0195C13.0387 47.8124 21.4586 50.831 29.4807 51.7343C28.1989 52.836 27.0276 55.0393 27.0276 58.3884C27.0276 63.1917 27.0718 67.0475 27.0718 68.2373C27.0718 69.2068 26.4309 70.3085 24.5967 69.9559C10.2983 65.1967 0 51.7564 0 35.9144C0 16.0623 16.1105 0 36 0Z"
                                      fill="currentColor"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <rect width="72" height="70" fill="white"></rect>
                                </clipPath>
                            </defs>
                        </svg>
                        <span className='ml-2'>View the Repository</span>
                    </a>

                    <a href="https://github.com/ConduitIO/conduit/discussions"
                       className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-800 hover:text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span>Ask on GitHub Discussions</span>
                    </a>
                </div>
            </div>
            <div className="flex-1 items-center flex">
                <img className="w-full h-46 md:h-96 mx-auto" src="/img/conduit/big-data-storage.svg" alt="Data Transformation Visual" />
          </div>
        </SplitPair>
      </Wrapper>

      <DiagonalDivider className="text-white" lightBgColor="white" darkBgColor="#3C4754" />
    </section>
  )
}

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      description={siteConfig.tagline}
      noFooter={true}>
      <Head>
        <html className="home" />
      </Head>

      <HeaderSection />
      <FeaturesSection />
      <ConnectorsSection />
      <CommunitySection />

      <HomepageFooter />
    </Layout>
  );
}
