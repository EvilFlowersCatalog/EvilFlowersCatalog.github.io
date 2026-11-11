/**
 * Single source of truth for the ELVIRA / EvilFlowers ecosystem.
 *
 * Consumed by:
 *   - the architecture map (src/components/ArchitectureMap)
 *   - /ecosystem (the journey of one publication)
 *   - /projects  (repositories grouped by job)
 *   - /about     (student team repos)
 *
 * `status` says where a component stands today, not how often it is pushed:
 *   live     — runs in production at STU
 *   dev      — runs in the development environment, not yet in production
 *   library  — a package other components use; nothing to deploy
 *   dormant  — no recent work, nothing runs it
 *   spec     — an external standard
 *
 * Only public repositories are linked.
 */

export const ORG = 'EvilFlowersCatalog';
export const ORG_URL = `https://github.com/${ORG}`;

export const CATEGORIES = {
  core: {
    label: 'Core',
    color: '#0077CC',
  },
  content: {
    label: 'Ingest',
    color: '#2BA6A0',
  },
  lending: {
    label: 'Lending',
    color: '#E0712C',
  },
  extraction: {
    label: 'Extraction',
    color: '#7C5CFF',
  },
  foundation: {
    label: 'Protocol and data',
    color: '#34C38F',
  },
  team: {
    label: 'Student team projects',
    color: '#C77DDB',
  },
  earlier: {
    label: 'Earlier experiments',
    color: '#8B8FA3',
  },
  standard: {
    label: 'Standard',
    color: '#F1A33A',
  },
  devops: {
    label: 'Supporting forks',
    color: '#8B8FA3',
  },
};

export const STATUSES = {
  live: {label: 'In production', color: '#2FAE7F'},
  dev: {label: 'In development', color: '#E59A2F'},
  library: {label: 'Library', color: '#3B8FD9'},
  dormant: {label: 'Dormant', color: '#8B8FA3'},
  spec: {label: 'Specification', color: '#F1A33A'},
};

const repo = (slug) => `${ORG_URL}/${slug}`;

export const NODES = [
  // -------- Core --------
  {
    id: 'catalog',
    name: 'EvilFlowersCatalog',
    category: 'core',
    status: 'live',
    language: 'Python',
    repo: repo('EvilFlowersCatalog'),
    docs: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki',
    api: 'https://elvira.digital/EvilFlowersCatalog/',
    description:
      'EvilFlowersCatalog is the server every other component talks to. This Django application stores publications, users and loans, serves them over OPDS 1.2, OPDS 2.0 and a REST API, and can host many separate catalogs in one install.',
    highlights: [
      'OPDS 1.2 and 2.0 feeds, REST API with OpenAPI docs',
      'Readium LCP lending: borrow, reserve, renew, return',
      'Local accounts, LDAP, JWT and long-lived API keys',
      'MCP server and AI assistant endpoints',
    ],
  },
  {
    id: 'portal',
    name: 'elvira-portal',
    category: 'core',
    status: 'live',
    language: 'TypeScript',
    repo: repo('elvira-portal'),
    description:
      'Readers and librarians use the portal to search the catalog, borrow LCP titles, manage loans and reservations, keep a shelf and read PDFs in the built-in reader. It is a React and Vite app in Slovak and English, themed per institution at build time.',
    highlights: [
      'Static build, served by any web server',
      'Theme and API address set per deployment',
      'Talks to the catalog only through its public API',
    ],
  },
  {
    id: 'viewer',
    name: 'EvilFlowersViewer',
    category: 'core',
    status: 'library',
    language: 'Vue',
    repo: repo('EvilFlowersViewer'),
    npm: '@evilflowers/evilflowersviewer',
    docs: 'https://www.npmjs.com/package/@evilflowers/evilflowersviewer',
    description:
      'EvilFlowersViewer is the PDF reader inside the portal. It is built on pdf.js, published on npm, and supports search inside the document, highlights and notes, page-range sharing and citation export.',
    highlights: [
      'Citation export: BibTeX, BibLaTeX, RIS',
      'Share a page range instead of the whole file',
      'Annotations stored in the catalog',
    ],
  },

  // -------- Getting content in --------
  {
    id: 'digitalizer',
    name: 'evilflowers-books-digitalizer',
    category: 'content',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-books-digitalizer'),
    docs: 'https://evilflowerscatalog.github.io/evilflowers-books-digitalizer/',
    description:
      'The digitalizer takes TIFF scans of printed books, cleans the pages and runs Slovak OCR. For each book it produces a fast distribution PDF, a PDF/A-2b archival master and an EPUB, then publishes the book to the catalog. It runs as a batch job or as a web studio for reviewing books page by page.',
    highlights: [
      'Resumable: re-running skips finished books',
      'Publishes through the catalog API with an API key',
      'Exports Internet Archive items',
    ],
  },

  // -------- Lending --------
  {
    id: 'worker-lcp',
    name: 'evilflowers-lcpencrypt-worker',
    category: 'lending',
    status: 'live',
    language: 'Python',
    repo: repo('evilflowers-lcpencrypt-worker'),
    description:
      'This Celery worker encrypts each file the catalog marks for lending with Readium’s lcpencrypt, registers it with the LCP server and reports the result back to the catalog.',
  },
  {
    id: 'lcp-server',
    name: 'readium-lcp-server',
    category: 'lending',
    status: 'live',
    language: 'Go',
    repo: repo('readium-lcp-server'),
    description:
      'This repository packages the upstream Readium LCP server for our deployments. The server issues licenses and the License Status Documents reading apps use to renew and return loans. Only the catalog talks to it.',
  },

  // -------- Extraction --------
  {
    id: 'svc-analyzer',
    name: 'evilflowers-analyzer-service',
    category: 'extraction',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-analyzer-service'),
    description:
      'The analyzer starts each extraction run. It opens the PDF, finds the page layout with Docling, and sends paragraphs and tables to the text service, figures to the image service and formulas to the equation service.',
  },
  {
    id: 'svc-text',
    name: 'evilflowers-text-service',
    category: 'extraction',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-text-service'),
    description:
      'The text service extracts paragraphs and their sentences with positions on the page, and embeds each paragraph so similar passages can be found. It also converts tables to Markdown and embeds the queries for passage search.',
  },
  {
    id: 'svc-image',
    name: 'evilflowers-image-service',
    category: 'extraction',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-image-service'),
    description:
      'The image service crops each figure out of the page so readers can browse a publication’s figures. Generated captions are optional and off by default.',
  },
  {
    id: 'svc-equation',
    name: 'evilflowers-equation-service',
    category: 'extraction',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-equation-service'),
    description:
      'The equation service crops each formula and reads it back as LaTeX with a LaTeX-OCR model, so equations can be searched and copied.',
  },
  {
    id: 'svc-search',
    name: 'evilflowers-search-service',
    category: 'extraction',
    status: 'dev',
    language: 'Python',
    repo: repo('evilflowers-search-service'),
    description:
      'This service keeps a separate keyword and vector index for the catalog’s OPDS search. It will be retired as search moves into the catalog’s own PostgreSQL, with full-text search and pgvector.',
  },

  // -------- Protocol and data --------
  {
    id: 'protocol',
    name: 'evilflowers-protocol',
    category: 'foundation',
    status: 'library',
    language: 'OpenAPI',
    repo: repo('evilflowers-protocol'),
    description:
      'This repository holds the OpenAPI definition of the catalog API, generated from the catalog source for each catalog branch.',
  },
  {
    id: 'protocol-py',
    name: 'evilflowers-protocol-python',
    category: 'foundation',
    status: 'library',
    language: 'Python',
    repo: repo('evilflowers-protocol-python'),
    description:
      'This typed Python client is generated from the protocol. The digitalizer publishes books with it, and you can use it for your own scripts and imports.',
  },
  {
    id: 'postgresql',
    name: 'evilflowers-postgresql',
    category: 'foundation',
    status: 'live',
    language: 'Docker',
    repo: repo('evilflowers-postgresql'),
    description:
      'This is the PostgreSQL 18 image the catalog runs on, with pgvector for embeddings, pg_search for BM25 ranking, and pg_cron and pgaudit for operations.',
  },

  // -------- Student team projects --------
  {
    id: 'tp2025',
    name: 'TP2025-T23',
    category: 'team',
    status: 'dormant',
    language: 'TypeScript',
    repo: repo('TP2025-T23'),
    description: 'Website of FIIT STU team 23, academic year 2025/26.',
  },
  {
    id: 'tp-text-2025',
    name: 'evilflowers-text-service-tp2025',
    category: 'team',
    status: 'dormant',
    language: 'Python',
    repo: repo('evilflowers-text-service-tp2025'),
    description: 'The 2025/26 team’s fork of the text service.',
  },
  {
    id: 'ai-agent',
    name: 'elvira-ai-agent',
    category: 'team',
    status: 'dormant',
    language: 'TypeScript',
    repo: repo('elvira-ai-agent'),
    description:
      'A student prototype of a chat assistant for the portal. The assistant now in development is part of the catalog.',
  },
  {
    id: 'tp2024',
    name: 'TP2024-T5',
    category: 'team',
    status: 'dormant',
    language: 'MDX',
    repo: repo('TP2024-T5'),
    description: 'Website of FIIT STU team 5, academic year 2024/25.',
  },
  {
    id: 'tp2022',
    name: 'TP2022-T16',
    category: 'team',
    status: 'dormant',
    language: 'TypeScript',
    repo: repo('TP2022-T16'),
    description:
      'Website of FIIT STU team 16, academic year 2022/23, an early team project on ELVIRA.',
  },

  // -------- Earlier experiments --------
  {
    id: 'importer',
    name: 'evilflowers-importer',
    category: 'earlier',
    status: 'dormant',
    language: 'Python',
    repo: repo('evilflowers-importer'),
    description:
      'A command-line importer that used an LLM to extract metadata into JSON for the catalog.',
  },
  {
    id: 'worker-ocr',
    name: 'evilflowers-ocr-worker',
    category: 'earlier',
    status: 'dormant',
    language: 'Docker',
    repo: repo('evilflowers-ocr-worker'),
    description:
      'A Celery worker around ocrmypdf. Scanned books now go through the digitalizer instead.',
  },
  {
    id: 'svc-video',
    name: 'evilflowers-video-service',
    category: 'earlier',
    status: 'dormant',
    language: 'Python',
    repo: repo('evilflowers-video-service'),
    description: 'A Whisper transcription prototype for video publications.',
  },
  {
    id: 'calibre',
    name: 'calibre-evilflowers',
    category: 'earlier',
    status: 'dormant',
    language: 'Python',
    repo: repo('calibre-evilflowers'),
    description: 'A Calibre plugin for syncing a library with the catalog.',
  },
  {
    id: 'notion-opds',
    name: 'notion-opds',
    category: 'earlier',
    status: 'dormant',
    language: 'Python',
    repo: repo('notion-opds'),
    description: 'An OPDS feed served from a Notion database.',
  },
  {
    id: 'fe',
    name: 'EvilFlowersFE',
    category: 'earlier',
    status: 'dormant',
    language: 'TypeScript',
    repo: repo('EvilFlowersFE'),
    description: 'The first admin frontend for the catalog, in Angular.',
  },

  // -------- Supporting forks (not shown on /projects) --------
  {
    id: 'isbnlib',
    name: 'isbnlib (fork)',
    category: 'devops',
    status: 'library',
    language: 'Python',
    repo: repo('isbnlib'),
    description: 'Patched fork of isbnlib for ISBN validation and metadata.',
  },

  // -------- External standards --------
  {
    id: 'std-opds12',
    name: 'OPDS 1.2',
    category: 'standard',
    status: 'spec',
    description: 'Atom catalog feeds, read by most e-reader apps.',
    docs: 'https://specs.opds.io/opds-1.2',
  },
  {
    id: 'std-opds20',
    name: 'OPDS 2.0',
    category: 'standard',
    status: 'spec',
    description: 'JSON catalog feeds with search, pagination and borrowing.',
    docs: 'https://drafts.opds.io/opds-2.0',
  },
  {
    id: 'std-lcp',
    name: 'Readium LCP',
    category: 'standard',
    status: 'spec',
    description: 'Open DRM for lending e-books and PDFs.',
    docs: 'https://readium.org/lcp-specs/',
  },
  {
    id: 'std-lsd',
    name: 'Readium LSD',
    category: 'standard',
    status: 'spec',
    description: 'License Status Document: renew, return and revoke loans.',
    docs: 'https://readium.org/lcp-specs/releases/lsd/latest',
  },
  {
    id: 'std-rwpm',
    name: 'Readium Web Pub Manifest',
    category: 'standard',
    status: 'spec',
    description: 'JSON manifest for publications in OPDS 2.0 feeds.',
    docs: 'https://readium.org/webpub-manifest/',
  },
  {
    id: 'std-mcp',
    name: 'Model Context Protocol',
    category: 'standard',
    status: 'spec',
    description: 'Lets AI agents search and curate the catalog as tools.',
    docs: 'https://modelcontextprotocol.io/',
  },
];

/**
 * Where ELVIRA runs in production.
 */
export const DEPLOYMENTS = [
  {
    short: 'STU',
    name: 'Slovak University of Technology',
    place: 'Bratislava',
    url: 'https://www.stuba.sk/',
    logo: '/img/stu-logo.png',
    accent: '#8a1538',
    since: '2020',
    note: 'One instance for the whole university at elvira.stuba.sk. Built at the Faculty of Informatics and Information Technologies (FIIT), which does most of the development.',
  },
  {
    short: 'KU',
    name: 'Catholic University in Ružomberok',
    place: 'Ružomberok',
    url: 'https://www.ku.sk/',
    logo: '/img/ku-logo.png',
    accent: '#c99a2e',
    since: '2024',
    note: 'Its own instance on its own servers: the same catalog and portal, in KU’s colours.',
  },
];

/**
 * The people and partners behind ELVIRA. Shown on the About page.
 */
export const PEOPLE = [
  {
    name: 'Jakub Dubec',
    role: 'Project lead · FIIT STU',
    bio: 'Started EvilFlowersCatalog as a backup for his own Calibre library and has led it since, including the research on AI processing of library content.',
    email: 'jakub.dubec@stuba.sk',
  },
  {
    name: 'Pavol Batalík',
    role: 'Slovak Informatics Library (SIK) · FIIT STU',
    bio: 'Brings the librarian’s view through the Slovenská informatická knižnica, FIIT STU’s library: what a catalog has to get right for readers and for the people who run it.',
  },
  {
    name: 'Tomáš Kordoš',
    role: 'Developer',
    bio: 'Day-to-day engineering across the catalog, the portal and the workers.',
  },
];

/**
 * Institutions ELVIRA is built and run with. Shown on the About page.
 */
export const PARTNERS = [
  {
    short: 'FIIT STU',
    name: 'Faculty of Informatics and Information Technologies',
    place: 'Slovak University of Technology, Bratislava',
    url: 'https://www.fiit.stuba.sk/',
    logo: '/img/fiit-logo.png',
    role: 'Where ELVIRA is designed and built, much of it as student team projects and theses.',
  },
  {
    short: 'SIK',
    name: 'Slovenská informatická knižnica',
    place: 'The library of FIIT STU',
    url: 'https://www.fiit.stuba.sk/sik.html?page_id=587',
    logo: null,
    role: 'FIIT’s own library: cataloguing and lending practice, and what readers ask for.',
  },
  {
    short: 'KU',
    name: 'Catholic University in Ružomberok',
    place: 'Ružomberok',
    url: 'https://www.ku.sk/',
    logo: '/img/ku-logo.png',
    role: 'The second university to run ELVIRA, on its own infrastructure.',
  },
];

export function getNode(id) {
  return NODES.find((n) => n.id === id);
}
