/**
 * What the deployment configurator (/deploy) knows about ELVIRA's services.
 *
 * Sources, read in November 2026:
 * - EvilFlowersCatalog `develop`: compose.yml, .env.example, Dockerfile, conf/entrypoint.sh,
 *   conf/supervisor.conf, evil_flowers_catalog/settings/base.py
 * - the k8s role in EvilFlowersCatalog/knowledge (ansible/roles/evilflowers_k8s): commands,
 *   queues, mount points and environment of every worker
 *
 * When a worker changes its queue, command or environment, change it here.
 */

export const IMAGES = {
  catalog: {
    stable: 'ghcr.io/evilflowerscatalog/evilflowerscatalog:master',
    develop: 'ghcr.io/evilflowerscatalog/evilflowerscatalog:develop',
  },
  postgres: 'ghcr.io/evilflowerscatalog/evilflowers-postgresql:18',
  redis: 'redis:7',
  readium: 'ghcr.io/evilflowerscatalog/readium-lcp-server:master',
  lcpencrypt: {
    stable: 'ghcr.io/evilflowerscatalog/evilflowers-lcpencrypt-worker:master',
    develop: 'ghcr.io/evilflowerscatalog/evilflowers-lcpencrypt-worker:develop',
  },
  ocr: 'ghcr.io/evilflowerscatalog/evilflowers-ocr-service:master',
  analyzer: 'ghcr.io/evilflowerscatalog/evilflowers-analyzer-service:develop',
  image: 'ghcr.io/evilflowerscatalog/evilflowers-image-service:develop',
  equation: 'ghcr.io/evilflowerscatalog/evilflowers-equation-service:develop',
  text: 'ghcr.io/evilflowerscatalog/evilflowers-text-service:develop',
  tei: 'ghcr.io/huggingface/text-embeddings-inference:cpu-1.9.4',
  ollama: 'ollama/ollama:0.40.15',
  maildev: 'maildev/maildev:2.2.1',
  otelLgtm: 'grafana/otel-lgtm:0.39.0',
};

/** The embedding model the catalog and the text worker are built for (1024 dimensions). */
export const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large-instruct';
export const EMBEDDING_REVISION = '274baa43b0e13e37fafa6428dbc7938e62e5c439';

/** Where every container that reads or writes publication files mounts the shared storage. */
export const DATA_PATH = '/var/local/evilflowers';

/** Celery broker database shared by the catalog and every worker. */
export const BROKER_DB = 7;
/** Redis database of the catalog's cache. */
export const CACHE_DB = 1;
/** Redelivery timeout of unacknowledged tasks; the shortest value on a broker db wins. */
export const VISIBILITY_TIMEOUT = 43200;

export const DEFAULTS = {
  target: 'compose',
  channel: 'stable',
  processes: 'single',
  database: 'bundled',
  redis: 'bundled',
  storage: 'filesystem',
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
  portalUrl: 'https://portal.example.org',
  contactEmail: 'library@example.org',
  dbHost: 'db.example.org',
  dbPort: '5432',
  dbName: 'evilflowers',
  dbUser: 'evilflowers',
  redisHost: 'redis.example.org',
  redisPort: '6379',
  s3Host: 's3.example.org',
  s3Bucket: 'evilflowers',
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
  namespace: 'evilflowers',
  storageClass: '',
};

/**
 * Choices a reader makes. `requires` lists what must hold while the option is on:
 * `{key, value}` demands that exact value, `{key, not, set}` demands anything but `not`
 * and turns it to `set` when needed. resolve.js keeps every requirement satisfied.
 */
export const OPTIONS = [
  // ----- platform -----
  {
    key: 'target',
    group: 'platform',
    label: 'Run on',
    choices: [
      {value: 'compose', label: 'Docker Compose', hint: 'One machine.'},
      {value: 'k8s', label: 'Kubernetes', hint: 'Plain manifests, any cluster.'},
    ],
  },
  {
    key: 'channel',
    group: 'platform',
    label: 'Release channel',
    choices: [
      {value: 'stable', label: 'Stable', hint: 'The master images, what STU runs in production.'},
      {value: 'develop', label: 'Development', hint: 'The develop images. Hybrid search, OCR and extraction live here for now.'},
    ],
  },
  {
    key: 'processes',
    group: 'platform',
    label: 'Catalog processes',
    choices: [
      {value: 'single', label: 'One container', hint: 'Web server, Celery worker and scheduler under supervisord.'},
      {value: 'split', label: 'Separate containers', hint: 'Web, worker, scheduler and event listener scale and restart on their own.'},
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
    key: 'storage',
    group: 'platform',
    label: 'File storage',
    choices: [
      {value: 'filesystem', label: 'Volume', hint: 'A volume the catalog and the workers share.'},
      {value: 's3', label: 'S3', hint: 'Any S3 API. The workers read files from a shared volume, so S3 rules them out.'},
    ],
  },

  // ----- features -----
  {
    key: 'lending',
    group: 'features',
    label: 'Lending with Readium LCP',
    description:
      'Loans of protected EPUB and PDF that expire on their own, readable in Thorium and other LCP apps. Adds the Readium LCP server and the lcpencrypt worker.',
    off: false,
    requires: [{key: 'storage', value: 'filesystem'}],
  },
  {
    key: 'search',
    group: 'features',
    label: 'Search by meaning',
    description:
      'Ranks results by meaning as well as by words. The catalog asks an embedding service for one vector per query; without one, search ranks on words only.',
    off: 'off',
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
    description: 'Adds a text layer to scanned PDFs so they can be searched. Tesseract by default. Adds the OCR worker.',
    off: false,
    requires: [
      {key: 'channel', value: 'develop'},
      {key: 'storage', value: 'filesystem'},
    ],
  },
  {
    key: 'extraction',
    group: 'features',
    label: 'Extraction',
    description:
      'Reads every PDF into paragraphs, tables, figures and formulas, for passage search, similar books and the assistant. Adds four workers; the text worker embeds paragraphs through the embedding service.',
    off: false,
    requires: [
      {key: 'channel', value: 'develop'},
      {key: 'storage', value: 'filesystem'},
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
      {value: 'bundled', label: 'Run Ollama here', hint: 'Plan for a large model: the default needs about 25 GB of RAM.'},
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
    description: 'Every component speaks OpenTelemetry over OTLP/HTTP.',
    off: 'off',
    choices: [
      {value: 'off', label: 'Off'},
      {value: 'bundled', label: 'Run Grafana here', hint: 'grafana/otel-lgtm: a collector, Tempo, Loki, Mimir and Grafana in one container.'},
      {value: 'external', label: 'Send to my collector'},
    ],
  },
];

export const OPTION_BY_KEY = Object.fromEntries(OPTIONS.map((o) => [o.key, o]));

/** Short names for the notices that explain an automatic change. */
export function optionLabel(key) {
  return OPTION_BY_KEY[key]?.label ?? key;
}

export function choiceLabel(key, value) {
  const option = OPTION_BY_KEY[key];
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  return option?.choices?.find((c) => c.value === value)?.label ?? String(value);
}
