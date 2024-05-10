// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ELVIRA - Digital academic library',
  tagline: 'Open and easy to use tools for document distribution',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://elvira.digital',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'EvilFlowersCatalog', // Usually your GitHub org/user name.
  projectName: 'EvilFlowersCatalog.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        title: 'Elvira',
        logo: {
          alt: 'Elvira logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/goals', label: 'Goals', position: 'left'},
          {to: '/docs', label: 'Documents', position: 'left'},
          {to: '/about', label: 'About', position: 'left'},
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'FIIT STU',
          src: 'img/fiit-logo.png',
          href: 'https://www.fiit.stuba.sk',
          width: 164,
          height: 54,
        },
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} FIIT STU.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
