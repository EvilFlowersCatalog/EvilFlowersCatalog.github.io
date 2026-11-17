// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import {NAV, GITHUB} from './src/data/site.js';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ELVIRA',
  tagline: 'Open-source digital library platform from the Slovak University of Technology: a catalog, a web reader, Readium LCP lending and search inside every book.',
  favicon: 'img/favicon.ico',

  url: 'https://elvira.digital',
  baseUrl: '/',

  organizationName: 'EvilFlowersCatalog',
  projectName: 'EvilFlowersCatalog.github.io',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  clientModules: ['./src/fonts.js'],

  // Icons and colour are rendered from brand/*.html (see the README).
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'icon', type: 'image/png', sizes: '512x512', href: '/img/favicon-512.png'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'},
    },
    {
      tagName: 'meta',
      attributes: {name: 'theme-color', content: '#a80331'},
    },
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {from: '/ecosystem', to: '/how-it-works'},
          {from: '/projects', to: '/how-it-works'},
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.github.io/edit/main/',
        },
        blog: {
          path: 'news',
          routeBasePath: 'news',
          blogTitle: 'News',
          blogDescription:
            'Release announcements and project news from ELVIRA and EvilFlowers.',
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          postsPerPage: 10,
          showReadingTime: false,
          authorsMapPath: 'authors.yml',
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'throw',
          feedOptions: {
            type: ['rss', 'atom'],
            title: 'ELVIRA news',
            description: 'Release announcements and project news from ELVIRA.',
            copyright: `© ${new Date().getFullYear()} EvilFlowers Catalog`,
            limit: 20,
            // <Figure dark={…}> renders a light and a dark image and lets CSS
            // pick one. Feed readers have no such CSS, so keep the light one.
            createFeedItems: async ({blogPosts, defaultCreateFeedItems, ...rest}) => {
              const items = await defaultCreateFeedItems({blogPosts, ...rest});
              return items.map((item) => ({
                ...item,
                content: item.content?.replace(/<img[^>]*themedComponent--dark[^>]*>/g, ''),
              }));
            },
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.jpg',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      // The desktop header is src/theme/Navbar/Content; these items feed the
      // mobile menu. The footer is src/theme/Footer (no themeConfig.footer).
      navbar: {
        title: 'ELVIRA',
        items: [
          ...NAV.map(({to, label}) => ({to, label, position: 'left'})),
          {href: GITHUB, label: 'GitHub', position: 'left'},
        ],
      },
      docs: {
        sidebar: {hideable: false},
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
        // The deploy page shows a generated nginx file.
        additionalLanguages: ['nginx'],
      },
    }),
};

export default config;
