// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ELVIRA',
  tagline: 'Open OPDS catalog, portal and PDF viewer — built at FIIT STU.',
  favicon: 'img/favicon.ico',

  url: 'https://elvira.digital',
  baseUrl: '/',

  organizationName: 'EvilFlowersCatalog',
  projectName: 'EvilFlowersCatalog.github.io',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

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
      navbar: {
        title: 'ELVIRA',
        logo: {
          alt: 'ELVIRA — FIIT STU',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/ecosystem', label: 'Ecosystem', position: 'left'},
          {to: '/projects', label: 'Projects', position: 'left'},
          {to: '/docs/intro', label: 'Docs', position: 'left'},
          {to: '/about', label: 'About', position: 'left'},
          {
            href: 'https://elvira.digital/EvilFlowersCatalog/',
            label: 'API',
            position: 'right',
          },
          {
            href: 'https://github.com/EvilFlowersCatalog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'Faculty of Informatics and Information Technologies, STU',
          src: 'img/fiit-logo.png',
          href: 'https://www.fiit.stuba.sk',
          width: 164,
          height: 54,
        },
        links: [
          {
            title: 'Project',
            items: [
              {label: 'Ecosystem', to: '/ecosystem'},
              {label: 'Projects', to: '/projects'},
              {label: 'Documentation', to: '/docs/intro'},
              {label: 'About', to: '/about'},
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Wiki',
                href: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki',
              },
              {
                label: 'OpenAPI reference',
                href: 'https://elvira.digital/EvilFlowersCatalog/',
              },
              {
                label: 'Protocol spec',
                href: 'https://github.com/EvilFlowersCatalog/evilflowers-protocol',
              },
              {
                label: 'Container image',
                href: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/pkgs/container/evilflowerscatalog',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/EvilFlowersCatalog',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions',
              },
              {label: 'Contact', to: '/about'},
            ],
          },
        ],
        copyright: `
          <div class="footerAttribution">
            <p>
              Developed at
              <a href="https://www.fiit.stuba.sk/" target="_blank" rel="noopener noreferrer">FIIT STU</a>
              in Bratislava. In production at FIIT STU and
              <a href="https://www.ku.sk/" target="_blank" rel="noopener noreferrer">KU Ružomberok</a>.
            </p>
            <p>
              © ${new Date().getFullYear()} EvilFlowers Catalog · MIT &amp; BSD-3-Clause ·
              <a href="https://github.com/EvilFlowersCatalog" target="_blank" rel="noopener noreferrer">github.com/EvilFlowersCatalog</a>
            </p>
          </div>
        `,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
