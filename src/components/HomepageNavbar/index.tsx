import React from 'react'
import Cluster from '@site/src/components/Cluster';
import Wrapper from '@site/src/components/Wrapper';

const navLinks = [
  {
    label: 'Connectors',
    href: '/docs/connectors/connector-list',
  },
  {
    label: 'Documentation',
    href: '/docs',
  },
  {
    label: 'Changelog',
    href: '/changelog',
  },
  {
    label: 'GitHub',
    href: 'http://github.com/ConduitIO/',
  },
  {
    label: 'Discord',
    href: 'http://discord.meroxa.com/',
  },
]

export default function NavBar() {
  return (
    <Wrapper className="bg-transparent pt-5">
      <Cluster>
        <div className='justify-between items-center'>
          <div>
            <div className="flex-shrink-0 flex items-center">
              <a href="/">
                <img
                  className="block lg:hidden h-10 w-auto"
                  src="/img/conduit/conduit-logo.svg"
                  alt="Conduit Logo"
                />
                <img
                  className="hidden lg:block h-16 w-auto"
                  src="/img/conduit/conduit-logo.svg"
                  alt="Conduit Logo"
                />
              </a>
            </div>
          </div>
          <div>
            {navLinks.map(({ label, href }) => (
              <a
                href={href}
                className="text-white hover:text-white inline-flex items-center px-2 pt-1 text-sm md:text-lg font-extrabold"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </Cluster>
    </Wrapper>
  )
}
