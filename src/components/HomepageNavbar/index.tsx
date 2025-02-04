import React from 'react'
import Cluster from '@site/src/components/Cluster';
import Wrapper from '@site/src/components/Wrapper';

const navLinks = [
  {
    label: 'Connectors',
    href: '/docs/using/connectors/list',
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
    label: 'Conduit Platform',
    href: 'https://meroxa.io',
  }
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
            <a
              href="http://github.com/ConduitIO/"
              className="text-white hover:text-gray-300 ml-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg aria-label="ConduitIO on GitHub" width="35" height="35" viewBox="0 0 72 70" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M36 0C55.8895 0 72 16.0623 72 35.8923C72 51.7564 61.6796 65.1967 47.3812 69.9559C45.5912 70.2864 44.9282 69.1848 44.9282 68.2153C44.9282 67.356 44.9503 65.1086 44.9724 62.112C54.9834 64.2713 57.105 57.3088 57.105 57.3088C58.7403 53.1665 61.105 52.0428 61.105 52.0428C64.3757 49.8174 60.8619 49.8615 60.8619 49.8615C57.2597 50.1259 55.337 53.5631 55.337 53.5631C52.1326 59.0494 46.9171 57.463 44.8619 56.5376C44.5304 54.2241 43.6022 52.6377 42.5856 51.7343C50.5635 50.853 58.9613 47.7683 58.9613 34.0195C58.9613 30.0976 57.5691 26.9027 55.2486 24.3909C55.6243 23.4655 56.8619 19.83 54.9171 14.8946C54.9171 14.8946 51.8895 13.9251 45.0166 18.5741C42.1436 17.7809 39.0718 17.3843 36 17.3623C32.9503 17.3843 29.8564 17.7809 26.9834 18.5741C20.1105 13.9251 17.0829 14.8946 17.0829 14.8946C15.116 19.83 16.3536 23.4876 16.7293 24.3909C14.4309 26.9027 13.0387 30.0976 13.0387 34.0195C13.0387 47.8124 21.4586 50.831 29.4807 51.7343C28.1989 52.836 27.0276 55.0393 27.0276 58.3884C27.0276 63.1917 27.0718 67.0475 27.0718 68.2373C27.0718 69.2068 26.4309 70.3085 24.5967 69.9559C10.2983 65.1967 0 51.7564 0 35.9144C0 16.0623 16.1105 0 36 0Z" fill="currentColor"></path></g><defs><clipPath id="clip0"><rect width="72" height="70" fill="white"></rect></clipPath></defs></svg>
            </a>
            <a
              href="http://discord.meroxa.com/"
              className="text-white hover:text-gray-300 ml-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg aria-label="Join our Discord" width="45" height="35" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#discord-clipPath)"><path d="M38.248 3.117A37.258 37.258 0 0 0 29.052.264a.14.14 0 0 0-.148.07 25.924 25.924 0 0 0-1.145 2.352 34.397 34.397 0 0 0-10.33 0A23.784 23.784 0 0 0 16.268.334a.145.145 0 0 0-.148-.07 37.155 37.155 0 0 0-9.197 2.853.132.132 0 0 0-.06.052C1.004 11.919-.6 20.455.187 28.885c.003.042.026.081.058.106 3.865 2.838 7.609 4.561 11.283 5.703a.146.146 0 0 0 .158-.052 26.79 26.79 0 0 0 2.308-3.754.143.143 0 0 0-.078-.199 24.679 24.679 0 0 1-3.525-1.68.145.145 0 0 1-.014-.24c.237-.178.474-.362.7-.549a.14.14 0 0 1 .146-.02c7.394 3.376 15.4 3.376 22.707 0a.14.14 0 0 1 .147.018c.227.187.464.373.702.55a.145.145 0 0 1-.012.241 23.16 23.16 0 0 1-3.527 1.678.144.144 0 0 0-.076.201 30.078 30.078 0 0 0 2.306 3.752c.036.05.1.072.159.054 3.691-1.142 7.435-2.865 11.3-5.703a.145.145 0 0 0 .058-.104c.942-9.746-1.578-18.212-6.68-25.716a.115.115 0 0 0-.059-.054Zm-23.15 20.635c-2.226 0-4.06-2.043-4.06-4.553s1.798-4.554 4.06-4.554c2.28 0 4.096 2.061 4.06 4.554 0 2.51-1.798 4.553-4.06 4.553Zm15.013 0c-2.226 0-4.06-2.043-4.06-4.553s1.799-4.554 4.06-4.554c2.28 0 4.096 2.061 4.06 4.554 0 2.51-1.78 4.553-4.06 4.553Z" fill="currentColor"/></g><defs><clipPath id="discord-clipPath"><path fill="#fff" d="M0 0h45.182v35H0z"/></clipPath></defs></svg>
            </a>
          </div>
        </div>
      </Cluster>
    </Wrapper>
  )
}
