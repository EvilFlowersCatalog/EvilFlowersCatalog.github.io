// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'using',
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: ['architecture', 'standards'],
    },
    {
      type: 'category',
      label: 'Run it',
      collapsed: false,
      items: ['quickstart', 'adopting'],
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
      items: ['whats-new', 'status-2026'],
    },
  ],
};

export default sidebars;
