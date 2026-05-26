/**
 * Single source of truth for the ELVIRA ecosystem.
 *
 * Consumed by:
 *   - /ecosystem (interactive D3 graph)
 *   - /projects  (categorised repo grid)
 *
 * Nodes are repositories (or external standards). Links describe
 * runtime / contract dependencies between them.
 */

export const ORG = 'EvilFlowersCatalog';
export const ORG_URL = `https://github.com/${ORG}`;
export const SITE_REPO = `${ORG}.github.io`;

export const CATEGORIES = {
  core: {
    label: 'Core platform',
    color: '#0077CC',
    description:
      'Catalog server, portal, viewer, and importer — the components users interact with directly.',
  },
  worker: {
    label: 'Workers',
    color: '#7C5CFF',
    description:
      'Celery workers behind the broker. Text extraction, OCR, captioning, transcription, semantic search, LCP encryption.',
  },
  protocol: {
    label: 'Protocol',
    color: '#34C38F',
    description:
      'OpenAPI definition of the EvilFlowers protocol, plus generated client bindings.',
  },
  standard: {
    label: 'Standard',
    color: '#F1A33A',
    description:
      'External standards ELVIRA implements: OPDS 1.2 / 2.0, Readium LCP, LSD, RWPM.',
    shape: 'diamond',
  },
  devops: {
    label: 'Infrastructure',
    color: '#8B8FA3',
    description:
      'Deployment manifests, runtime forks and benchmarks. Operator-facing; hidden from /projects.',
  },
  team: {
    label: 'Student team project',
    color: '#D89BFF',
    description:
      'FIIT STU yearly team projects (TP). Student squads contributing features as part of their thesis work.',
  },
};

const repo = (slug) => `${ORG_URL}/${slug}`;

export const STATUSES = {
  active: {label: 'Active', color: '#34C38F'},
  maintenance: {label: 'Maintenance', color: '#F1A33A'},
  stale: {label: 'Stale', color: '#D17A3A'},
  archived: {label: 'Archived', color: '#5C5F6B'},
  spec: {label: 'Specification', color: '#F1A33A'},
};

export const NODES = [
  // -------- Core platform --------
  {
    id: 'catalog',
    name: 'EvilFlowersCatalog',
    category: 'core',
    status: 'active',
    language: 'Python',
    version: '0.13.0 → 0.14.0 (develop)',
    pushed_at: '2026-05-25',
    repo: repo('EvilFlowersCatalog'),
    docs: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki',
    api: 'https://elvira.digital/EvilFlowersCatalog/',
    description:
      'OPDS publication catalog server. Stores publications, exposes them over OPDS 1.2 (Atom) and OPDS 2.0 (JSON), and hosts many libraries from a single install. Django backend, Pydantic schemas, optional Readium LCP lending.',
    highlights: [
      'OPDS 1.2 and 2.0 endpoints',
      'Multi-tenant — separate catalogs, ACLs and themes',
      'Borrow / reserve / renew / return via Readium LCP',
      'Dataverse integration for research datasets',
    ],
  },
  {
    id: 'viewer',
    name: 'EvilFlowersViewer',
    category: 'core',
    status: 'active',
    language: 'Vue',
    pushed_at: '2026-05-19',
    repo: repo('EvilFlowersViewer'),
    npm: '@evilflowers/evilflowersviewer',
    description:
      'Embeddable PDF viewer built on pdf.js. In-document search, citation export (BibTeX/BibLaTeX/RIS), annotation layer, page-range sharing, theming. Ships as an npm package.',
    highlights: [
      'Citation export — BibTeX, BibLaTeX, RIS',
      'Share a page range, not the whole file',
      'Annotation and highlight layer',
      'Themeable; published on npm',
    ],
  },
  {
    id: 'portal',
    name: 'elvira-portal',
    category: 'core',
    status: 'active',
    language: 'TypeScript',
    pushed_at: '2026-05-25',
    repo: repo('elvira-portal'),
    description:
      'React + Vite frontend. Catalog browsing, search, user shelves, university SSO. Single codebase, themed per deployment.',
    highlights: [
      'Per-deployment theming (FIIT STU, Catholic University in Ružomberok)',
      'Umami analytics',
      'Feature flags',
    ],
  },
  {
    id: 'importer',
    name: 'evilflowers-importer',
    category: 'core',
    status: 'active',
    language: 'Python',
    pushed_at: '2025-06-27',
    repo: repo('evilflowers-importer'),
    description:
      'Imports publications from Kramerius and WebDAV sources, then uses an LLM (OpenAI or Ollama) to fill in missing metadata — titles, authors, abstracts. Outputs JSON the catalog can ingest.',
  },

  // -------- Microservices / workers --------
  {
    id: 'svc-text',
    name: 'evilflowers-text-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2026-05-14',
    repo: repo('evilflowers-text-service'),
    description:
      'Celery worker. Extracts text from PDF publications and emits it back to the catalog for indexing and downstream analysis.',
  },
  {
    id: 'svc-image',
    name: 'evilflowers-image-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2025-04-27',
    repo: repo('evilflowers-image-service'),
    description:
      'Extracts figures from publications and runs captioning (PaliGemma) and classification (ViT / ResNet50). Outputs captions and tags for accessibility and image search.',
  },
  {
    id: 'svc-equation',
    name: 'evilflowers-equation-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2025-04-27',
    repo: repo('evilflowers-equation-service'),
    description:
      'Detects equations in PDF publications and reconstructs them as LaTeX using the Nougat model.',
  },
  {
    id: 'svc-video',
    name: 'evilflowers-video-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2025-04-27',
    repo: repo('evilflowers-video-service'),
    description:
      'Transcribes audio tracks from video publications using Whisper large-v3. Output is searchable text aligned to timestamps.',
  },
  {
    id: 'svc-search',
    name: 'evilflowers-search-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2026-05-14',
    repo: repo('evilflowers-search-service'),
    description:
      'Semantic search over the extracted text corpus. Sits behind the catalog search endpoint and consumes output from the text service.',
  },
  {
    id: 'svc-analyzer',
    name: 'evilflowers-analyzer-service',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2025-04-27',
    repo: repo('evilflowers-analyzer-service'),
    description:
      'Pipeline orchestrator. Routes a newly ingested publication to the text, image, equation and video services and aggregates their results.',
  },
  {
    id: 'worker-ocr',
    name: 'evilflowers-ocr-worker',
    category: 'worker',
    status: 'active',
    language: 'Docker',
    pushed_at: '2024-10-01',
    repo: repo('evilflowers-ocr-worker'),
    description:
      'Dockerised Celery worker wrapping ocrmypdf. Adds a searchable text layer to scanned PDFs ingested by the catalog.',
  },
  {
    id: 'worker-lcp',
    name: 'evilflowers-lcpencrypt-worker',
    category: 'worker',
    status: 'active',
    language: 'Python',
    pushed_at: '2026-03-14',
    repo: repo('evilflowers-lcpencrypt-worker'),
    description:
      'Celery worker wrapping Readium lcpencrypt. AES-256-CBC encryption for EPUB 2/3, PDF, Readium Web Pubs and W3C Audiobooks. Filesystem storage only.',
  },

  // -------- Protocol --------
  {
    id: 'protocol',
    name: 'evilflowers-protocol',
    category: 'protocol',
    status: 'active',
    language: 'OpenAPI',
    pushed_at: '2026-05-25',
    repo: repo('evilflowers-protocol'),
    description:
      'OpenAPI 3.1 definition of the EvilFlowers protocol — the wire contract between catalog, portal, importer and third-party clients.',
  },
  {
    id: 'protocol-py',
    name: 'evilflowers-protocol-python',
    category: 'protocol',
    status: 'active',
    language: 'Python',
    pushed_at: '2026-03-31',
    repo: repo('evilflowers-protocol-python'),
    description:
      'Python client and Pydantic v2 models generated from the protocol spec.',
  },

  // -------- Infrastructure / forks --------
  {
    id: 'devops',
    name: 'elvira-devops',
    category: 'devops',
    status: 'active',
    language: 'HTML',
    pushed_at: '2026-05-25',
    repo: repo('elvira-devops'),
    description: 'Deployment manifests, dashboards and operator tooling.',
  },
  {
    id: 'lcp-server',
    name: 'readium-lcp-server (fork)',
    category: 'devops',
    status: 'maintenance',
    language: 'Go',
    pushed_at: '2026-04-08',
    repo: repo('readium-lcp-server'),
    description:
      'Fork of the upstream Readium LCP server. Issues and proxies licenses for the catalog borrow flow.',
  },
  {
    id: 'isbnlib',
    name: 'isbnlib (fork)',
    category: 'devops',
    status: 'active',
    language: 'Python',
    pushed_at: '2026-05-25',
    repo: repo('isbnlib'),
    description:
      'Patched fork of isbnlib. ISBN validation and metadata lookup for the catalog and importer.',
  },
  {
    id: 'ppc-bench',
    name: 'ppc64le-cuda-benchmark',
    category: 'devops',
    status: 'maintenance',
    language: 'Python',
    pushed_at: '2024-10-13',
    repo: repo('ppc64le-cuda-benchmark'),
    description:
      'CUDA benchmarks from the IBM PowerPC platform evaluation. Reference only.',
  },

  // -------- Team projects --------
  {
    id: 'tp2025',
    name: 'TP2025-T23',
    category: 'team',
    status: 'active',
    language: 'TypeScript',
    pushed_at: '2026-05-08',
    repo: repo('TP2025-T23'),
    description:
      'FIIT STU Team 23, 2025/26 academic year. Current student squad.',
  },
  {
    id: 'tp-text-2025',
    name: 'evilflowers-text-service-tp2025',
    category: 'team',
    status: 'maintenance',
    language: 'Python',
    pushed_at: '2025-12-21',
    repo: repo('evilflowers-text-service-tp2025'),
    description:
      'Fork of the text service used by the 2024/25 team. Frozen at the version their thesis was defended against.',
  },
  {
    id: 'tp2024',
    name: 'TP2024-T5',
    category: 'team',
    status: 'maintenance',
    language: 'MDX',
    pushed_at: '2025-05-02',
    repo: repo('TP2024-T5'),
    description:
      'FIIT STU Team 5, 2024/25 academic year.',
  },
  {
    id: 'tp2022',
    name: 'TP2022-T16',
    category: 'team',
    status: 'maintenance',
    language: 'TypeScript',
    pushed_at: '2023-05-13',
    repo: repo('TP2022-T16'),
    description:
      'FIIT STU Team 16, 2021/22 academic year. Where ELVIRA started.',
  },
  {
    id: 'ai-agent',
    name: 'elvira-ai-agent',
    category: 'team',
    status: 'active',
    language: 'TypeScript',
    pushed_at: '2026-02-11',
    repo: repo('elvira-ai-agent'),
    description:
      'In-portal chat assistant. Searches the catalog, summarises publications and answers questions about library holdings.',
  },

  // -------- External standards --------
  {
    id: 'std-opds12',
    name: 'OPDS 1.2',
    category: 'standard',
    status: 'spec',
    description:
      'Atom-based catalog feed format for publications. ELVIRA implements it under /opds/v1.2/.',
    docs: 'https://specs.opds.io/opds-1.2',
  },
  {
    id: 'std-opds20',
    name: 'OPDS 2.0',
    category: 'standard',
    status: 'spec',
    description:
      'JSON catalog feed format with paginated browsing, manifests, borrowing and shelves. Mounted under /opds/v2/.',
    docs: 'https://drafts.opds.io/opds-2.0',
  },
  {
    id: 'std-lcp',
    name: 'Readium LCP',
    category: 'standard',
    status: 'spec',
    description:
      'Lightweight DRM for ebooks and audiobooks. Drives the catalog’s borrow / reserve / renew / return flow.',
    docs: 'https://readium.org/lcp-specs/',
  },
  {
    id: 'std-lsd',
    name: 'Readium LSD',
    category: 'standard',
    status: 'spec',
    description:
      'License Status Document — used to revoke, renew or return active LCP licenses.',
    docs: 'https://readium.org/lcp-specs/releases/lsd/latest',
  },
  {
    id: 'std-rwpm',
    name: 'Readium Web Pub Manifest',
    category: 'standard',
    status: 'spec',
    description:
      'JSON manifest format for digital publications shared via OPDS 2.0.',
    docs: 'https://readium.org/webpub-manifest/',
  },
];

/**
 * Edges describe a dependency, contract or compatibility relationship.
 *   - depends    runtime dependency (default)
 *   - implements implementation of a standard / protocol
 *   - feeds      data flow into another service
 *   - fork       parent of a fork relationship
 */
export const LINKS = [
  // Catalog is the hub.
  {source: 'catalog', target: 'std-opds12', type: 'implements'},
  {source: 'catalog', target: 'std-opds20', type: 'implements'},
  {source: 'catalog', target: 'std-lcp', type: 'implements'},
  {source: 'catalog', target: 'std-lsd', type: 'implements'},
  {source: 'catalog', target: 'std-rwpm', type: 'implements'},

  {source: 'catalog', target: 'protocol', type: 'implements'},
  {source: 'protocol-py', target: 'protocol', type: 'depends'},

  {source: 'portal', target: 'catalog', type: 'depends'},
  {source: 'portal', target: 'viewer', type: 'depends'},
  {source: 'portal', target: 'protocol-py', type: 'depends'},

  {source: 'importer', target: 'catalog', type: 'feeds'},
  {source: 'importer', target: 'isbnlib', type: 'depends'},

  {source: 'svc-text', target: 'catalog', type: 'feeds'},
  {source: 'svc-search', target: 'catalog', type: 'feeds'},
  {source: 'svc-search', target: 'svc-text', type: 'depends'},
  {source: 'svc-image', target: 'catalog', type: 'feeds'},
  {source: 'svc-equation', target: 'catalog', type: 'feeds'},
  {source: 'svc-video', target: 'catalog', type: 'feeds'},
  {source: 'svc-analyzer', target: 'svc-text', type: 'depends'},
  {source: 'svc-analyzer', target: 'svc-image', type: 'depends'},
  {source: 'svc-analyzer', target: 'svc-equation', type: 'depends'},
  {source: 'svc-analyzer', target: 'svc-video', type: 'depends'},
  {source: 'svc-analyzer', target: 'catalog', type: 'feeds'},

  {source: 'worker-ocr', target: 'catalog', type: 'feeds'},
  {source: 'worker-lcp', target: 'catalog', type: 'feeds'},
  {source: 'worker-lcp', target: 'std-lcp', type: 'implements'},
  {source: 'worker-lcp', target: 'lcp-server', type: 'depends'},

  {source: 'catalog', target: 'isbnlib', type: 'depends'},
  {source: 'catalog', target: 'lcp-server', type: 'depends'},

  {source: 'tp-text-2025', target: 'svc-text', type: 'fork'},
  {source: 'tp2025', target: 'portal', type: 'depends'},
  {source: 'ai-agent', target: 'portal', type: 'depends'},
];

/**
 * Where ELVIRA actually runs in production.
 *
 * FIIT STU is the home faculty (where the project is developed).
 * The Catholic University in Ružomberok is the second deployment,
 * theming the portal with their branding.
 */
export const DEPLOYMENTS = [
  {
    short: 'STU Bratislava',
    name: 'Slovak University of Technology in Bratislava',
    url: 'https://elvira.stuba.sk/',
    note: 'Primary production deployment. ELVIRA runs STU-wide; FIIT STU is the home faculty where the project is developed (instance at elvira.fiit.stuba.sk).',
  },
  {
    short: 'KU Ružomberok',
    name: 'Catholic University in Ružomberok (Katolícka univerzita v Ružomberku)',
    url: 'https://www.ku.sk/',
    note: 'Second deployment site. Portal themed for KU, same catalog software underneath.',
  },
];

export function getNode(id) {
  return NODES.find((n) => n.id === id);
}

export function nodesByCategory(category) {
  return NODES.filter((n) => n.category === category);
}
