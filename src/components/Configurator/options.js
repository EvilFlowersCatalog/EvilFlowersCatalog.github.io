/**
 * The choices on /deploy and how they depend on each other. What each choice puts into the files
 * is in assemble.js; the files themselves come from EvilFlowersCatalog/deploy.
 */

/** Services each Compose profile (and Kubernetes component) of the deploy repository starts. */
export const PROFILES = {
  postgres: {services: ['postgres'], role: 'data'},
  redis: {services: ['redis'], role: 'data'},
  lending: {services: ['readium', 'lcpencrypt'], role: 'worker'},
  ocr: {services: ['ocr'], role: 'worker'},
  search: {services: ['tei-embed'], role: 'model'},
  extraction: {services: ['analyzer', 'image', 'equation', 'text'], role: 'worker'},
  assistant: {services: ['ollama'], role: 'model'},
  mail: {services: ['maildev'], role: 'support'},
  telemetry: {services: ['otel-lgtm'], role: 'support'},
};

export const DEFAULTS = {
  target: 'compose',
  channel: 'stable',
  database: 'bundled',
  redis: 'bundled',
  portal: true,
  lending: false,
  ocr: false,
  search: 'off',
  extraction: false,
  assistant: 'off',
  mcp: true,
  mail: 'off',
  backup: false,
  telemetry: 'off',

  domain: 'library.example.org',
  portalDomain: 'portal.example.org',
  contactEmail: 'library@example.org',
  installDir: '/opt/elvira',
  portalRoot: '/var/www/elvira-portal',
  dbHost: 'db.example.org',
  dbPort: '5432',
  dbName: 'evilflowers',
  dbUser: 'evilflowers',
  redisHost: 'redis.example.org',
  redisPort: '6379',
  searchUrl: 'https://embed.example.org',
  assistantEndpoint: 'https://ollama.com/api/chat',
  assistantModel: 'qwen3.6:35b-a3b-q4_K_M',
  smtpHost: 'smtp.example.org',
  smtpPort: '587',
  smtpUser: '',
  backupDestination: 's3://backups/evilflowers',
  backupS3Host: 's3.example.org',
  backupSchedule: '0 3 * * *',
  otlpEndpoint: 'http://otel-collector:4318',
  namespace: 'elvira',
  storageClass: '',
};

/**
 * `requires` lists what must hold while the option is on: `{key, value}` demands that value,
 * `{key, not, set}` anything but `not` (turned to `set` when needed). `targets` limits an option
 * to some platforms; elsewhere it is hidden.
 */
export const OPTIONS = [
  {
    key: 'target',
    group: 'platform',
    label: 'Run on',
    choices: [
      {value: 'compose', label: 'Docker Compose', hint: 'One machine, every feature.'},
      {value: 'docker', label: 'Plain Docker', hint: 'The catalog, PostgreSQL and Redis with docker run.'},
      {value: 'k8s', label: 'Kubernetes', hint: 'One manifest for a cluster you already have.'},
    ],
  },
  {
    key: 'channel',
    group: 'platform',
    label: 'Release channel',
    choices: [
      {value: 'stable', label: 'Stable', hint: 'The master images: the released catalog.'},
      {value: 'develop', label: 'Development', hint: 'The develop images, with search by meaning, OCR and extraction.'},
    ],
  },
  {
    key: 'database',
    group: 'platform',
    label: 'PostgreSQL',
    choices: [
      {value: 'bundled', label: 'Run it here', hint: 'The EvilFlowers PostgreSQL image, with pgvector and pg_search.'},
      {value: 'external', label: 'Use my own', hint: 'Needs pgvector. pg_search adds BM25 ranking.'},
    ],
  },
  {
    key: 'redis',
    group: 'platform',
    label: 'Redis',
    choices: [
      {value: 'bundled', label: 'Run it here'},
      {value: 'external', label: 'Use my own'},
    ],
  },
  {
    key: 'portal',
    group: 'features',
    label: 'Serve the portal',
    description: 'nginx serves elvira-portal, the readers’ web app, next to the catalog.',
    off: false,
    targets: ['compose', 'docker'],
  },
  {
    key: 'lending',
    group: 'features',
    label: 'Lending with Readium LCP',
    description:
      'Loans of protected EPUB and PDF that expire on their own, readable in Thorium and other LCP apps. Starts with EDRLab’s test certificate; add your own for production.',
    off: false,
    targets: ['compose', 'k8s'],
  },
  {
    key: 'search',
    group: 'features',
    label: 'Search by meaning',
    description: 'Ranks results by meaning as well as by words, through an embedding service.',
    off: 'off',
    targets: ['compose', 'k8s'],
    choices: [
      {value: 'off', label: 'Off'},
      {value: 'bundled', label: 'Run the embedding service here', hint: 'Text Embeddings Inference on CPU, about 2.3 GB of model.'},
      {value: 'external', label: 'Use an embedding service I run'},
    ],
    requires: [{key: 'channel', value: 'develop'}],
  },
  {
    key: 'ocr',
    group: 'features',
    label: 'OCR for scanned PDFs',
    description: 'Adds a text layer to scanned PDFs so they can be searched.',
    off: false,
    targets: ['compose', 'k8s'],
    requires: [{key: 'channel', value: 'develop'}],
  },
  {
    key: 'extraction',
    group: 'features',
    label: 'Extraction',
    description:
      'Reads every PDF into paragraphs, tables, figures and formulas, for passage search, similar books and the assistant. Four workers.',
    off: false,
    targets: ['compose', 'k8s'],
    requires: [
      {key: 'channel', value: 'develop'},
      {key: 'search', not: 'off', set: 'bundled'},
    ],
  },
  {
    key: 'assistant',
    group: 'features',
    label: 'Reading assistant',
    description: 'Chat that answers from the library and cites pages. Needs an LLM behind an Ollama API.',
    off: 'off',
    choices: [
      {value: 'off', label: 'Off'},
      {value: 'bundled', label: 'Run Ollama here', hint: 'The default model needs about 25 GB of RAM.'},
      {value: 'external', label: 'Use an Ollama API I have'},
    ],
  },
  {
    key: 'mcp',
    group: 'features',
    label: 'MCP server for AI agents',
    description: 'Search, reading and curation tools at /mcp/v1. Agents sign in with an API key.',
    off: false,
  },
  {
    key: 'mail',
    group: 'features',
    label: 'E-mail notifications',
    description: 'Loan reminders, reservations and password e-mails.',
    off: 'off',
    choices: [
      {value: 'off', label: 'Off'},
      {value: 'smtp', label: 'Send through my SMTP server'},
      {value: 'catcher', label: 'Catch them for testing', hint: 'MailDev keeps every message in a web inbox.'},
    ],
  },
  {
    key: 'backup',
    group: 'features',
    label: 'Nightly database backup',
    description: 'pg_dump to an S3 bucket on a schedule, run by the catalog itself.',
    off: false,
  },
  {
    key: 'telemetry',
    group: 'features',
    label: 'Traces, metrics and logs',
    description: 'The catalog speaks OpenTelemetry over OTLP/HTTP.',
    off: 'off',
    choices: [
      {value: 'off', label: 'Off'},
      {value: 'bundled', label: 'Run Grafana here', hint: 'Collector, Tempo, Loki, Mimir and Grafana in one container.'},
      {value: 'external', label: 'Send to my collector'},
    ],
  },
];

const OPTION_BY_KEY = Object.fromEntries(OPTIONS.map((o) => [o.key, o]));

export function appliesTo(option, settings) {
  return !option.targets || option.targets.includes(settings.target);
}

export function optionLabel(key) {
  return OPTION_BY_KEY[key]?.label ?? key;
}

export function choiceLabel(key, value) {
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  return OPTION_BY_KEY[key]?.choices?.find((c) => c.value === value)?.label ?? String(value);
}

export function isOn(settings, option) {
  return option.off !== undefined && settings[option.key] !== option.off;
}

function satisfied(settings, req) {
  if ('value' in req) return settings[req.key] === req.value;
  return settings[req.key] !== req.not;
}

/**
 * Applies one change and keeps every requirement satisfied. When an option that is on needs
 * something the reader just changed away from, the option turns off; otherwise the requirement
 * is switched on. Returns the new settings and one sentence per automatic change.
 */
export function applyChange(settings, key, value) {
  const next = {...settings, [key]: value};
  const notes = [];
  for (let round = 0; round < 10; round++) {
    let changed = false;
    for (const option of OPTIONS) {
      if (!option.requires || !isOn(next, option)) continue;
      for (const req of option.requires) {
        if (satisfied(next, req)) continue;
        changed = true;
        if (req.key === key) {
          next[option.key] = option.off;
          const need = 'value' in req ? `set to ${choiceLabel(req.key, req.value)}` : 'switched on';
          notes.push(`${optionLabel(option.key)} turned off: it needs ${optionLabel(req.key)} ${need}.`);
          break;
        }
        const target = 'value' in req ? req.value : req.set;
        next[req.key] = target;
        notes.push(`${optionLabel(req.key)} set to ${choiceLabel(req.key, target)}: ${optionLabel(option.key)} needs it.`);
      }
    }
    if (!changed) break;
  }
  return {settings: next, notes};
}

/** Defaults plus `partial`, with every requirement applied (for checks and tests). */
export function resolve(partial = {}) {
  let settings = {...DEFAULTS, ...partial};
  for (const option of OPTIONS) {
    if (option.key in partial) settings = applyChange(settings, option.key, settings[option.key]).settings;
  }
  return settings;
}

export function requirementText(option) {
  if (!option.requires) return null;
  return option.requires
    .map((r) => ('value' in r ? `${optionLabel(r.key)}: ${choiceLabel(r.key, r.value)}` : optionLabel(r.key)))
    .join(' · ');
}
