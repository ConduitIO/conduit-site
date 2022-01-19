/** @type {import('@docusaurus/types').DocusaurusConfig} */

const path = require('path')

module.exports = {
  title: 'Conduit',
  tagline: 'Explore our docs and guides to help you build data pipelines.',
  url: 'https://conduit.io', // Url to your site with no trailing slash
  baseUrl: '/',
  onBrokenLinks: 'error',
  onBrokenMarkdownLinks: 'error',
  onDuplicateRoutes: 'error',
  favicon: 'images/favicon.ico',
  scripts: [
    {
      src:
        'https://platform.twitter.com/widgets.js',
      async: true,
    },
  ],
  organizationName: 'conduitio', // Usually your GitHub org/user name.
  projectName: 'conduit-site', // Usually your repo name.
  themeConfig: {
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
      additionalLanguages: ['hcl'],
    },
    // Relative to "static" directory.
    image: 'images/generic-social-image.png',
    googleAnalytics: {
      trackingID: '',
    },
    navbar: {
      logo: {
        alt: 'Conduit Logo',
        src: 'images/conduit/conduit-dark-logo.svg',
        href: 'https://conduit.io',
        srcDark: 'images/conduit-logo-dark.svg',
      },
      items: [
        { to: '/', label: 'Home', position: 'left', activeBaseRegex: `///` },
        {
          type: 'doc',
          docId: 'introduction/what-is-meroxa',
          position: 'left',
          label: 'Docs',
        },
        { to: '/docs/connectors/overview', label: 'Connectors', position: 'left' },
        { to: '/guides', label: 'Build', position: 'left' },
        { to: '/community', label: 'Join Community', position: 'left' },
        
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
              to: '/docs/connectors/overview',
            },
            {
              label: 'Documentation',
              to: '/docs/introduction/what-is-conduit',
            },
            {
              label: 'Join our Discord',
              to: '/community',
            },
            {
              label: 'Issues',
              to: 'TODO_LINK',
            },
            {
              label: 'GitHub Discussions',
              to: 'TODO_LINK',
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
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./src/sidebars/sidebars.js'),
          docItemComponent: '@theme/CustomDocItem',
          // Please change this to your repo.
          editUrl:
            'https://github.com/meroxa/conduit-site/edit/main/',
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
  plugins: ['./plugins/plugin-was-this-helpful', './plugins/postcss-tailwindcss-loader', [
      '@docusaurus/plugin-content-blog',
      {
        /**
         * Required for any multi-instance plugin
         */
        id: 'guides',
        showReadingTime: true,
        blogPostComponent: '@theme/GuidePostPage',
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
