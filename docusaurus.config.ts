import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Conduit | Data Integration for Production Data Stores',
  tagline: 'Sync data between your production systems using an extensible, event-first experience with minimal dependencies that fit within your existing workflow for free.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://conduit.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'conduitio', // Usually your GitHub org/user name.
  projectName: 'conduit-site', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        gtag: {
          trackingID: 'G-QKF0TW3J6Z',
          anonymizeIP: true,
        },
        docs: {
          sidebarPath: './src/sidebars/sidebars.ts',
          editUrl: 'https://github.com/conduitio/conduit-site/edit/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
          },
          routeBasePath: 'guides',
          path: './guides',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [{ name: 'facebook-domain-verification', content: '0aq4u2ydyv4axal6x65gslmidlhc7j' }],
    image: 'img/generic-social-image.png',
    navbar: {
      logo: {
        alt: 'Conduit Logo',
        src: 'img/conduit/on-white-conduit-logo.png',
      },
      items: [
        { to: '/', label: 'Home', position: 'left', activeBaseRegex: `///` },
        { type: 'doc', docId: 'introduction/getting-started', position: 'left', label: 'Documentation' },
        { to: '/guides', label: 'Guides', position: 'left' },
        { to: '/api', label: 'HTTP API', position: 'left' },
        { to: 'https://github.com/ConduitIO/conduit/discussions', label: 'GitHub Discussions', position: 'right' },
        { to: 'https://discord.meroxa.com', label: 'Discord Community', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          items: [
            {
              html: `
                <a href="/" class="text-black hover:text-gray-600">
                  <img id="footer-logo" src="/img/conduit/conduit-logo.svg" width="178" height="70" alt="Conduit Logo" />
                </a>
              `
            },
            {
              html: `
                <div class='flex mt-6'>
                  <a href='https://twitter.com/ConduitIO'>
                    <svg aria-label="ConduitIO on twitter" width="35" height="35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.625 35H4.375A4.377 4.377 0 0 1 0 30.625V4.375A4.377 4.377 0 0 1 4.375 0h26.25A4.377 4.377 0 0 1 35 4.375v26.25A4.377 4.377 0 0 1 30.625 35Z" fill="#1D9BF0"/><path d="M13.44 26.39c8.251 0 12.766-6.843 12.766-12.766 0-.193 0-.385-.008-.578a9.14 9.14 0 0 0 2.24-2.327 9.093 9.093 0 0 1-2.582.709 4.515 4.515 0 0 0 1.978-2.486 8.926 8.926 0 0 1-2.853 1.085A4.478 4.478 0 0 0 21.71 8.61a4.492 4.492 0 0 0-4.489 4.489c0 .35.044.691.114 1.024a12.741 12.741 0 0 1-9.249-4.69 4.499 4.499 0 0 0 1.391 5.994 4.538 4.538 0 0 1-2.03-.56v.06c0 2.17 1.549 3.99 3.597 4.402-.377.105-.77.157-1.182.157-.288 0-.568-.026-.84-.079a4.487 4.487 0 0 0 4.191 3.116 8.999 8.999 0 0 1-5.573 1.925c-.359 0-.718-.018-1.068-.062a12.763 12.763 0 0 0 6.869 2.004Z" fill="#fff"/></svg>
                  </a>
                  <a href='https://github.com/ConduitIO/' class='text-black ml-4'>
                    <svg aria-label="ConduitIO on GitHub" width="35" height="35" viewBox="0 0 72 70" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M36 0C55.8895 0 72 16.0623 72 35.8923C72 51.7564 61.6796 65.1967 47.3812 69.9559C45.5912 70.2864 44.9282 69.1848 44.9282 68.2153C44.9282 67.356 44.9503 65.1086 44.9724 62.112C54.9834 64.2713 57.105 57.3088 57.105 57.3088C58.7403 53.1665 61.105 52.0428 61.105 52.0428C64.3757 49.8174 60.8619 49.8615 60.8619 49.8615C57.2597 50.1259 55.337 53.5631 55.337 53.5631C52.1326 59.0494 46.9171 57.463 44.8619 56.5376C44.5304 54.2241 43.6022 52.6377 42.5856 51.7343C50.5635 50.853 58.9613 47.7683 58.9613 34.0195C58.9613 30.0976 57.5691 26.9027 55.2486 24.3909C55.6243 23.4655 56.8619 19.83 54.9171 14.8946C54.9171 14.8946 51.8895 13.9251 45.0166 18.5741C42.1436 17.7809 39.0718 17.3843 36 17.3623C32.9503 17.3843 29.8564 17.7809 26.9834 18.5741C20.1105 13.9251 17.0829 14.8946 17.0829 14.8946C15.116 19.83 16.3536 23.4876 16.7293 24.3909C14.4309 26.9027 13.0387 30.0976 13.0387 34.0195C13.0387 47.8124 21.4586 50.831 29.4807 51.7343C28.1989 52.836 27.0276 55.0393 27.0276 58.3884C27.0276 63.1917 27.0718 67.0475 27.0718 68.2373C27.0718 69.2068 26.4309 70.3085 24.5967 69.9559C10.2983 65.1967 0 51.7564 0 35.9144C0 16.0623 16.1105 0 36 0Z" fill="currentColor"></path></g><defs><clipPath id="clip0"><rect width="72" height="70" fill="white"></rect></clipPath></defs></svg>
                  </a>
                  <a href='https://discord.meroxa.com' class='ml-4'>
                    <svg aria-label="Join our Discord" width="45" height="35" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#discord-clipPath)"><path d="M38.248 3.117A37.258 37.258 0 0 0 29.052.264a.14.14 0 0 0-.148.07 25.924 25.924 0 0 0-1.145 2.352 34.397 34.397 0 0 0-10.33 0A23.784 23.784 0 0 0 16.268.334a.145.145 0 0 0-.148-.07 37.155 37.155 0 0 0-9.197 2.853.132.132 0 0 0-.06.052C1.004 11.919-.6 20.455.187 28.885c.003.042.026.081.058.106 3.865 2.838 7.609 4.561 11.283 5.703a.146.146 0 0 0 .158-.052 26.79 26.79 0 0 0 2.308-3.754.143.143 0 0 0-.078-.199 24.679 24.679 0 0 1-3.525-1.68.145.145 0 0 1-.014-.24c.237-.178.474-.362.7-.549a.14.14 0 0 1 .146-.02c7.394 3.376 15.4 3.376 22.707 0a.14.14 0 0 1 .147.018c.227.187.464.373.702.55a.145.145 0 0 1-.012.241 23.16 23.16 0 0 1-3.527 1.678.144.144 0 0 0-.076.201 30.078 30.078 0 0 0 2.306 3.752c.036.05.1.072.159.054 3.691-1.142 7.435-2.865 11.3-5.703a.145.145 0 0 0 .058-.104c.942-9.746-1.578-18.212-6.68-25.716a.115.115 0 0 0-.059-.054Zm-23.15 20.635c-2.226 0-4.06-2.043-4.06-4.553s1.798-4.554 4.06-4.554c2.28 0 4.096 2.061 4.06 4.554 0 2.51-1.798 4.553-4.06 4.553Zm15.013 0c-2.226 0-4.06-2.043-4.06-4.553s1.799-4.554 4.06-4.554c2.28 0 4.096 2.061 4.06 4.554 0 2.51-1.78 4.553-4.06 4.553Z" fill="#5865F2"/></g><defs><clipPath id="discord-clipPath"><path fill="#fff" d="M0 0h45.182v35H0z"/></clipPath></defs></svg>
                  </a>
                </div>
              `
            }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'Connectors', to: '/docs/connectors/connector-list' },
            { label: 'Documentation', to: '/docs/introduction/what-is-conduit' },
            { label: 'Join our Discord', to: 'https://discord.meroxa.com' },
            { label: 'Issues', to: 'https://github.com/ConduitIO/conduit/issues' },
            { label: 'GitHub Discussions', to: 'https://github.com/ConduitIO/conduit/discussions' },
          ],
        },
        {
          title: 'Company',
          items: [
            { label: 'About Meroxa', to: 'https://meroxa.com/about' },
            { label: 'Careers', href: 'https://jobs.lever.co/meroxa' },
            { label: 'Meroxa Twitter', href: 'https://twitter.com/meroxadata' }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
    },
    announcementBar: {
      id: 'announcement-bar-1', // increment on change
      content: `Conduit 0.8 is here! <a class='cta' href='https://github.com/ConduitIO/conduit/releases/latest' target='_blank' rel='noreferrer noopener'>See what's new</a>.`,
      isCloseable: true,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    prism: {
      theme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'hcl', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    async function tailwindPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: "link",
                attributes: {
                  rel: "stylesheet",
                  href: "https://cdn.jsdelivr.net/npm/tailwindcss/dist/preflight.min.css",
                },
              },
            ],
          };
        },
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],
};

export default config;
