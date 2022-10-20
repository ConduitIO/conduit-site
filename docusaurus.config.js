/** @type {import('@docusaurus/types').DocusaurusConfig} */

const path = require('path')

module.exports = {
  title: 'Conduit | Data Integration for Production Data Stores',
  tagline: 'Sync data between your production systems using an extensible, event-first experience with minimal dependencies that fit within your existing workflow for free.',
  url: 'https://conduit.io', // Url to your site with no trailing slash
  baseUrl: '/',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'warn',
  favicon: 'images/favicon.ico',
  scripts: [
    {
      src:
        'https://platform.twitter.com/widgets.js',
      async: true,
    },
    "https://unpkg.com/rapidoc/dist/rapidoc-min.js"
  ],
  organizationName: 'conduitio', // Usually your GitHub org/user name.
  projectName: 'conduit-site', // Usually your repo name.
  themeConfig: {
    metadata: [{ name: 'facebook-domain-verification', content: '0aq4u2ydyv4axal6x65gslmidlhc7j' }],
    colorMode: {
      // "light" | "dark"
      defaultMode: 'light',

      // Hides the switch in the navbar
      // Useful if you want to support a single color mode
      disableSwitch: true,

      // Should we use the prefers-color-scheme media-query,
      // using user system preferences, instead of the hardcoded defaultMode
      respectPrefersColorScheme: false
    },
    prism: {
      theme: require('prism-react-renderer/themes/dracula'),
      additionalLanguages: ['hcl', 'yaml'],
    },
    // Relative to "static" directory.
    image: 'images/generic-social-image.png',
    navbar: {
      logo: {
        alt: 'Conduit Logo',
        src: 'images/conduit/on-white-conduit-logo.png',
        srcDark: 'images/conduit-logo-dark.svg',
      },
      items: [
        { to: '/', label: 'Home', position: 'left', activeBaseRegex: `///` },
        {
          type: 'doc',
          docId: 'introduction/getting-started',
          position: 'left',
          label: 'Documentation',
        },
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
          title: 'Resources',
          items: [
            {
              label: 'Connectors',
              to: 'https://github.com/ConduitIO/conduit/blob/main/docs/connectors.md',
            },
            {
              label: 'Documentation',
              to: '/docs/introduction/what-is-conduit',
            },
            {
              label: 'Join our Discord',
              to: 'https://discord.meroxa.com',
            },
            {
              label: 'Issues',
              to: 'https://github.com/ConduitIO/conduit/issues',
            },
            {
              label: 'GitHub Discussions',
              to: 'https://github.com/ConduitIO/conduit/discussions',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About Meroxa',
              to: 'https://meroxa.com/about',
            },
            {
              label: 'Careers',
              href: 'https://jobs.lever.co/meroxa'
            },
            {
              label: 'Meroxa Twitter',
              href: 'https://twitter.com/meroxadata',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
    },
    announcementBar: {
      id: 'announcement-banner',
      content: `
        <div class='wrapper announcement-banner'>
          <p class='content'>
            Now you&rsquo;re able to contribute to the Conduit Connector ecosystem.&nbsp;
            <a class='cta' href='https://github.com/ConduitIO/conduit-connector-sdk' target='_blank' rel='noreferrer noopener'>Conduit Connector SDK</a>&nbsp;
            makes building connectors painless.
          </p>
        </div>
      `,
      backgroundColor: '#E3C9C3',
      textColor: '#3C3C3C',
      isCloseable: false,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        gtag: {
          trackingID: 'G-QKF0TW3J6Z',
          anonymizeIP: true,
        },
        docs: {
          sidebarPath: require.resolve('./src/sidebars/sidebars.js'),
          docItemComponent: '@theme/CustomDocItem',
          // Please change this to your repo.
          editUrl:
            'https://github.com/conduitio/conduit-site/edit/main/',
        },
        blog: {
          showReadingTime: true,
          blogPostComponent: '@theme/GuidePostPage',
          blogListComponent: '@theme/BlogList',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [ './plugins/postcss-tailwindcss-loader', [
      '@docusaurus/plugin-content-blog',
      {
        /**
         * Required for any multi-instance plugin
         */
        id: 'guides',
        showReadingTime: true,
        blogPostComponent: '@theme/GuidePostPage',
        blogListComponent: '@theme/BlogList',
        feedOptions: {
          type: 'all',
          copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
        },
        /**
         * URL route for the blog section of your site.
         * *DO NOT* include a trailing slash.
         */
        routeBasePath: 'guides',
        /**
         * Path to data on filesystem relative to site dir.
         */
        path: './guides',
      },
    ], [
      '@docusaurus/plugin-content-blog',
      {
        /**
         * Required for any multi-instance plugin
         */
        id: 'changelog',
        feedOptions: {
          type: 'all',
          copyright: `Copyright © ${new Date().getFullYear()} Meroxa, Inc.`,
        },
        showReadingTime: true,
        /**
         * URL route for the blog section of your site.
         * *DO NOT* include a trailing slash.
         */
        routeBasePath: 'changelog',
        /**
         * Path to data on filesystem relative to site dir.
         */
        path: './changelog',
        blogPostComponent: '@theme/ChangeLogPage'
      },
    ] ]
};
