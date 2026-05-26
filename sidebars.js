// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: ['architecture', 'standards'],
    },
    {
      type: 'category',
      label: 'Get hands-on',
      collapsed: false,
      items: ['quickstart'],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['reference'],
    },
    {
      type: 'category',
      label: 'Project status',
      collapsed: false,
      items: ['status-2026'],
    },
  ],
};

export default sidebars;
