/**
 * Turns the reader's settings into a platform-neutral plan: services, volumes, the .env file
 * and the steps after the first start. render.js writes the plan as Compose or Kubernetes.
 */
import {
  IMAGES,
  EMBEDDING_MODEL,
  EMBEDDING_REVISION,
  DATA_PATH,
  BROKER_DB,
  CACHE_DB,
  VISIBILITY_TIMEOUT,
} from '../../data/deployment.js';

const CATALOG = 'evilflowers';
const CATALOG_URL = `http://${CATALOG}:8000`;
const TEI_URL = 'http://tei-embed';
const OLLAMA_URL = 'http://ollama:11434/api/chat';
const LGTM_URL = 'http://otel-lgtm:4318';

/** Commands of the catalog image when its processes run apart (from the k8s role). */
export const CATALOG_COMMANDS = {
  web: ['/root/.local/bin/gunicorn', 'evil_flowers_catalog.wsgi', '-c', 'conf/gunicorn.conf.py'],
  worker: ['/root/.local/bin/celery', '--quiet', '-A', 'evil_flowers_catalog.celery', 'worker', '--loglevel=info'],
  beat: ['/root/.local/bin/celery', '--quiet', '-A', 'evil_flowers_catalog.celery', 'beat', '--loglevel=info', '-s', '/tmp/celerybeat-schedule'],
  events: ['/usr/local/bin/python', 'manage.py', 'celery_event_handler'],
  migrate: [
    '/bin/sh',
    '-c',
    "until psql -c '\\q'; do echo 'Waiting for PostgreSQL' >&2; sleep 2; done; " +
      'python3 manage.py migrate --noinput && python3 manage.py setup && python3 manage.py entry_defaults',
  ],
  wait: [
    '/bin/sh',
    '-c',
    "until python3 manage.py migrate --check >/dev/null 2>&1; do echo 'Waiting for migrations' >&2; sleep 5; done",
  ],
};

function origin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function env(name, value) {
  return {name, value: String(value)};
}

function secret(name, key = name) {
  return {name, secret: key};
}

/** Builds the plan. `secrets` holds generated values (see secrets.js); missing ones become placeholders. */
export function buildPlan(s, secrets = {}) {
  const develop = s.channel === 'develop';
  const fs = s.storage === 'filesystem';
  const services = [];
  const volumes = {};
  const envFile = [];
  const steps = [];
  const warnings = [];

  const addVolume = (name, size, note) => {
    volumes[name] = volumes[name] ?? {name, size, note, users: 0};
    volumes[name].users += 1;
  };
  const addEnv = (section, key, value, note) => envFile.push({section, key, value, note});
  const gen = (key, fallback = 'change-me') => secrets[key] ?? fallback;

  const pgHost = s.database === 'bundled' ? 'postgres' : s.dbHost;
  const pgPort = s.database === 'bundled' ? '5432' : s.dbPort;
  const redisHost = s.redis === 'bundled' ? 'redis' : s.redisHost;
  const redisPort = s.redis === 'bundled' ? '6379' : s.redisPort;
  const broker = `redis://${redisHost}:${redisPort}/${BROKER_DB}`;
  const publicUrl = `https://${s.domain}`;

  const telemetryOn = s.telemetry !== 'off';
  const otlp = s.telemetry === 'bundled' ? LGTM_URL : s.otlpEndpoint;
  const telemetryEnv = (serviceName) =>
    telemetryOn
      ? [
          env('OTEL_EXPORTER_OTLP_ENDPOINT', otlp),
          env('OTEL_SERVICE_NAME', serviceName),
          env('OTEL_RESOURCE_ATTRIBUTES', 'service.namespace=elvira,deployment.environment.name=production'),
        ]
      : [];

  // ----- .env: the catalog's secrets -----
  addEnv('Catalog', 'SECRET_KEY', gen('SECRET_KEY'), 'Django secret key.');
  addEnv('Catalog', 'SECURED_VIEW_JWK', gen('SECURED_VIEW_JWK', '{"kty":"RSA","n":"…"}'), 'RSA private key (JWK) that signs access tokens. Keep it on one line.');
  addEnv(
    'Catalog',
    'PGPASSWORD',
    s.database === 'bundled' ? gen('PGPASSWORD') : 'change-me',
    s.database === 'bundled' ? 'Password of the bundled PostgreSQL.' : 'Password of your PostgreSQL user.',
  );

  // ----- catalog environment -----
  const catalogEnv = [
    env('DJANGO_SETTINGS_MODULE', 'evil_flowers_catalog.settings.production'),
    env('INSTANCE_NAME', s.domain),
    env('ALLOWED_HOSTS', `${s.domain};${CATALOG}`),
    env('EVILFLOWERS_BASE_URL', publicUrl),
    env('EVILFLOWERS_READIUM_BASE_URL', publicUrl),
    env('EVILFLOWERS_PORTAL_URL', s.portalUrl),
    env('CORS_ALLOWED_ORIGINS', origin(s.portalUrl)),
    env('EVILFLOWERS_CONTACT_EMAIL', s.contactEmail),
    env('PGHOST', pgHost),
    env('PGPORT', pgPort),
    env('PGDATABASE', s.dbName),
    env('PGUSER', s.dbUser),
    env('REDIS_HOST', redisHost),
    env('REDIS_PORT', redisPort),
    env('REDIS_DATABASE', CACHE_DB),
    env('CELERY_BROKER_URL', broker),
    env('CELERY_RESULT_BACKEND', broker),
    env('CELERY_BROKER_VISIBILITY_TIMEOUT', VISIBILITY_TIMEOUT),
    env('CELERY_WORKER_CONCURRENCY', 2),
    // The worker started by supervisord consumes only the default queue; without this the
    // nightly backup and cleanup tasks would wait on a queue nobody reads.
    env('EVILFLOWERS_MAINTENANCE_QUEUE', 'celery'),
    env('EVILFLOWERS_EVENT_BROKER_EXECUTOR', 'apps.events.services.CeleryEventExecutionService'),
    env('EVILFLOWERS_EVENT_BROKER_TRANSFORMER', 'apps.events.transformers.DjangoTransformer'),
    env('GUNICORN_CMD_ARGS', '-w 4 -b 0.0.0.0:8000 --keep-alive 75'),
    env('EVILFLOWERS_LOG_FORMAT', 'json'),
  ];

  if (fs) {
    catalogEnv.push(
      env('EVILFLOWERS_STORAGE_DRIVER', 'apps.files.storage.filesystem.FileSystemStorage'),
      env('EVILFLOWERS_STORAGE_FILESYSTEM_DATADIR', DATA_PATH),
    );
  } else {
    catalogEnv.push(
      env('EVILFLOWERS_STORAGE_DRIVER', 'apps.files.storage.s3.S3Storage'),
      env('EVILFLOWERS_STORAGE_S3_HOST', s.s3Host),
      env('EVILFLOWERS_STORAGE_S3_BUCKET', s.s3Bucket),
      env('EVILFLOWERS_STORAGE_S3_SECURE', 1),
    );
    addEnv('Storage', 'EVILFLOWERS_STORAGE_S3_ACCESS_KEY', 'change-me', 'S3 access key.');
    addEnv('Storage', 'EVILFLOWERS_STORAGE_S3_SECRET_KEY', 'change-me', 'S3 secret key.');
  }

  catalogEnv.push(env('EVILFLOWERS_MCP_ENABLED', s.mcp ? 1 : 0));
  if (s.mcp) catalogEnv.push(env('EVILFLOWERS_MCP_AUTHENTICATION_SCHEMAS', 'Bearer'));

  catalogEnv.push(env('EVILFLOWERS_ASSISTANT_ENABLED', s.assistant !== 'off' ? 1 : 0));
  if (s.assistant !== 'off') {
    catalogEnv.push(
      env('EVILFLOWERS_ASSISTANT_OLLAMA_ENDPOINT', s.assistant === 'bundled' ? OLLAMA_URL : s.assistantEndpoint),
      env('EVILFLOWERS_ASSISTANT_OLLAMA_MODEL', s.assistantModel),
      env('EVILFLOWERS_ASSISTANT_OLLAMA_THINK', 0),
      env('EVILFLOWERS_ASSISTANT_OLLAMA_NUM_CTX', 32768),
    );
    if (s.assistant === 'external') {
      addEnv('Assistant', 'EVILFLOWERS_ASSISTANT_OLLAMA_API_KEY', '', 'Bearer token of the Ollama API; empty for a server without one.');
    }
  }

  catalogEnv.push(env('EVILFLOWERS_EXTRACTION_ENABLED', s.extraction ? 1 : 0));
  catalogEnv.push(env('EVILFLOWERS_OCR_ENABLED', s.ocr ? 'true' : 'false'));
  if (s.ocr) catalogEnv.push(env('EVILFLOWERS_OCR_QUEUE', 'evilflowers_ocr_worker'));

  if (s.search !== 'off') {
    catalogEnv.push(env('EVILFLOWERS_EMBEDDING_URL', s.search === 'bundled' ? TEI_URL : s.searchUrl));
    if (s.search === 'bundled') catalogEnv.push(env('EVILFLOWERS_EMBEDDING_MODEL', `${EMBEDDING_MODEL}@${EMBEDDING_REVISION}`));
    addEnv(
      'Search',
      'EVILFLOWERS_EMBEDDING_API_KEY',
      s.search === 'bundled' ? gen('EVILFLOWERS_EMBEDDING_API_KEY') : 'change-me',
      s.search === 'bundled' ? 'API key of the bundled embedding service.' : 'Bearer key of your embedding service.',
    );
  }

  if (s.lending) {
    const user = 'evilflowers';
    const password = gen('READIUM_PASSWORD');
    catalogEnv.push(
      env('EVILFLOWERS_READIUM_LCPENCRYPT_NOTIFY_URL', `${CATALOG_URL}/readium/v1/hooks/encryption`),
      env('EVILFLOWERS_READIUM_LCPENCRYPT_REPORT_URL', `${CATALOG_URL}/readium/v1/hooks/encryption/result`),
    );
    addEnv('Lending', 'EVILFLOWERS_READIUM_LCPSV_URL', `http://${user}:${password}@readium:8989`, `License server, with the user and password from readium/htpasswd.`);
    addEnv('Lending', 'EVILFLOWERS_READIUM_LSDSV_URL', `http://${user}:${password}@readium:8990`, 'Status server, same credentials.');
  }

  catalogEnv.push(env('EVILFLOWERS_NOTIFICATIONS_ENABLED', s.mail !== 'off' ? 'true' : 'false'));
  if (s.mail === 'smtp') {
    catalogEnv.push(
      env('EMAIL_HOST', s.smtpHost),
      env('EMAIL_PORT', s.smtpPort),
      env('EMAIL_USE_TLS', 'true'),
      env('EMAIL_HOST_USER', s.smtpUser),
      env('DEFAULT_FROM_EMAIL', s.contactEmail),
    );
    addEnv('E-mail', 'EMAIL_HOST_PASSWORD', s.smtpUser ? 'change-me' : '', 'SMTP password; empty for a relay without authentication.');
  } else if (s.mail === 'catcher') {
    catalogEnv.push(env('EMAIL_HOST', 'maildev'), env('EMAIL_PORT', 1025), env('EMAIL_USE_TLS', 'false'), env('DEFAULT_FROM_EMAIL', s.contactEmail));
  }

  if (s.backup) {
    catalogEnv.push(
      env('EVILFLOWERS_BACKUP_DESTINATION', s.backupDestination),
      env('EVILFLOWERS_BACKUP_SCHEDULE', s.backupSchedule),
      env('EVILFLOWERS_BACKUP_S3_HOST', s.backupS3Host),
      env('EVILFLOWERS_BACKUP_S3_SECURE', 1),
    );
    addEnv('Backup', 'EVILFLOWERS_BACKUP_S3_ACCESS_KEY', 'change-me', 'Access key of the backup bucket.');
    addEnv('Backup', 'EVILFLOWERS_BACKUP_S3_SECRET_KEY', 'change-me', 'Secret key of the backup bucket.');
  }

  if (telemetryOn) catalogEnv.push(...telemetryEnv('evilflowers'));
  else catalogEnv.push(env('OTEL_SDK_DISABLED', 'true'));

  // ----- catalog containers -----
  const catalogMounts = fs ? [{volume: 'data', path: DATA_PATH}] : [];
  const catalogDeps = [
    ...(s.database === 'bundled' ? [{name: 'postgres', condition: 'service_healthy'}] : []),
    ...(s.redis === 'bundled' ? [{name: 'redis', condition: 'service_healthy'}] : []),
  ];
  const catalogBase = {
    image: develop ? IMAGES.catalog.develop : IMAGES.catalog.stable,
    role: 'core',
    feature: 'Catalog',
    env: catalogEnv,
    envFile: true,
    mounts: catalogMounts,
  };
  if (fs) addVolume('data', '20Gi', 'Publications, covers, encrypted copies and extraction crops.');

  if (s.processes === 'single') {
    services.push({
      ...catalogBase,
      name: CATALOG,
      summary: 'Web server, Celery worker, scheduler and event listener under supervisord. Migrates the database on start.',
      ports: [{name: 'http', port: 8000, publish: 8000}],
      probe: {tcp: 8000, startupSeconds: 300},
      dependsOn: catalogDeps,
    });
  } else {
    const after = [{name: `${CATALOG}-migrate`, condition: 'service_completed_successfully'}];
    services.push(
      {
        ...catalogBase,
        name: `${CATALOG}-migrate`,
        summary: 'Migrates the database, loads languages and currencies, then exits.',
        args: CATALOG_COMMANDS.migrate,
        oneShot: true,
        dependsOn: catalogDeps,
      },
      {
        ...catalogBase,
        name: CATALOG,
        summary: 'Web server (gunicorn).',
        args: CATALOG_COMMANDS.web,
        ports: [{name: 'http', port: 8000, publish: 8000}],
        probe: {tcp: 8000},
        noImageHealthcheck: true,
        dependsOn: [...catalogDeps, ...after],
        init: 'wait',
      },
      {
        ...catalogBase,
        name: `${CATALOG}-worker`,
        summary: 'Celery worker: notifications, encryption jobs, backups.',
        args: CATALOG_COMMANDS.worker,
        noImageHealthcheck: true,
        dependsOn: [...catalogDeps, ...after],
        init: 'wait',
        grace: 300,
      },
      {
        ...catalogBase,
        name: `${CATALOG}-beat`,
        summary: 'Celery beat: the schedule of reminders, sweeps and backups. Keep exactly one.',
        args: CATALOG_COMMANDS.beat,
        noImageHealthcheck: true,
        dependsOn: [...catalogDeps, ...after],
        init: 'migrate',
      },
      {
        ...catalogBase,
        name: `${CATALOG}-events`,
        summary: 'Listens for task events from the workers and records their outcome.',
        args: CATALOG_COMMANDS.events,
        noImageHealthcheck: true,
        dependsOn: [...catalogDeps, ...after],
        init: 'wait',
      },
    );
    // Only one copy of the volume per platform, but every catalog container uses it.
    if (fs) volumes.data.users += 4;
  }

  // ----- data services -----
  if (s.database === 'bundled') {
    services.push({
      name: 'postgres',
      image: IMAGES.postgres,
      role: 'data',
      feature: 'Catalog',
      summary: 'PostgreSQL 18 with pgvector and pg_search.',
      env: [env('POSTGRES_DB', s.dbName), env('POSTGRES_USER', s.dbUser), secret('POSTGRES_PASSWORD', 'PGPASSWORD')],
      mounts: [{volume: 'postgres', path: '/var/lib/postgresql/data'}],
      ports: [{name: 'postgres', port: 5432}],
      probe: {cmd: ['pg_isready', '-h', '127.0.0.1', '-U', s.dbUser, '-d', s.dbName], tcp: 5432},
      shm: '1g',
    });
    addVolume('postgres', '10Gi', 'The database.');
  }
  if (s.redis === 'bundled') {
    services.push({
      name: 'redis',
      image: IMAGES.redis,
      role: 'data',
      feature: 'Catalog',
      summary: 'Celery broker and the catalog cache.',
      mounts: [{volume: 'redis', path: '/data'}],
      ports: [{name: 'redis', port: 6379}],
      probe: {cmd: ['redis-cli', 'ping'], tcp: 6379},
    });
    addVolume('redis', '1Gi', 'Queued tasks survive a restart.');
  }

  const brokerDeps = s.redis === 'bundled' ? [{name: 'redis', condition: 'service_healthy'}] : [];
  const workerBase = (name, feature, image, extra = {}) => ({
    name,
    image,
    role: 'worker',
    feature,
    dependsOn: brokerDeps,
    mounts: [{volume: 'data', path: DATA_PATH}],
    ...extra,
  });

  // ----- lending -----
  if (s.lending) {
    services.push({
      name: 'readium',
      image: IMAGES.readium,
      role: 'support',
      feature: 'Lending with Readium LCP',
      summary: 'Readium License Server (8989) and Status Server (8990).',
      ports: [
        {name: 'lcp', port: 8989},
        {name: 'lsd', port: 8990},
      ],
      probe: {tcp: 8989},
      mounts: [
        {volume: 'data', path: DATA_PATH},
        {volume: 'readium', path: '/usr/local/var/readium/db'},
        {file: 'config.yaml', path: '/usr/local/etc/readium/config.yaml'},
        {file: 'htpasswd', path: '/usr/local/etc/readium/htpasswd'},
        {file: 'cert.pem', path: '/usr/local/var/readium/lcp/cert/cert.pem'},
        {file: 'privkey.pem', path: '/usr/local/var/readium/lcp/cert/privkey.pem'},
      ],
      fileSecret: 'readium',
    });
    addVolume('readium', '1Gi', 'License and status databases (SQLite).');
    volumes.data.users += 1;
    services.push(
      workerBase('lcpencrypt', 'Lending with Readium LCP', develop ? IMAGES.lcpencrypt.develop : IMAGES.lcpencrypt.stable, {
        summary: 'Encrypts each lent title and registers it with the license server.',
        env: [
          env('BROKER', broker),
          env('STORAGE_PATH', DATA_PATH),
          env('BROKER_VISIBILITY_TIMEOUT', VISIBILITY_TIMEOUT),
          env('CELERY_HOSTNAME', 'lcpencrypt'),
          ...telemetryEnv('lcpencrypt'),
        ],
        noImageHealthcheck: false,
      }),
    );
    volumes.data.users += 1;
    steps.push({
      title: 'Prepare the license server',
      body:
        'Put four files in readium/: config.yaml, htpasswd, cert.pem and privkey.pem. The Readium LCP deployment guide in the catalog wiki explains each one. Create htpasswd with the user and password from EVILFLOWERS_READIUM_LCPSV_URL in .env, and point auth_file in config.yaml at /usr/local/etc/readium/htpasswd. The test certificate baked into the image only works with test apps; production lending needs a certificate from EDRLab.',
      link: 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Readium-LCP-Deployment',
      commands: {
        compose: ['htpasswd -bc readium/htpasswd evilflowers <password from .env>'],
        k8s: [
          'htpasswd -bc readium/htpasswd evilflowers <password from .env>',
          `kubectl -n ${s.namespace} create secret generic readium --from-file=readium/config.yaml --from-file=readium/htpasswd --from-file=readium/cert.pem --from-file=readium/privkey.pem`,
        ],
      },
    });
  }

  // ----- OCR -----
  if (s.ocr) {
    services.push(
      workerBase('ocr', 'OCR for scanned PDFs', IMAGES.ocr, {
        summary: 'Adds a text layer to scanned PDFs (ocrmypdf, Tesseract).',
        args: ['celery', '-A', 'evilflowers_ocr_worker.worker', 'worker', '--loglevel=INFO', '-E', '--concurrency=1', '--queues=evilflowers_ocr_worker', '--hostname=ocr@%h'],
        env: [
          env('BROKER', broker),
          env('STORAGE_PATH', DATA_PATH),
          env('BROKER_VISIBILITY_TIMEOUT', VISIBILITY_TIMEOUT),
          env('OCR_JOBS', 2),
          ...telemetryEnv('ocr'),
        ],
        // The worker creates <entry>/ocr/ in directories the catalog (root) owns.
        runAsRoot: true,
        platform: 'linux/amd64',
        tmp: true,
      }),
    );
    volumes.data.users += 1;
  }

  // ----- extraction -----
  if (s.extraction) {
    const extractionEnv = [
      env('REDIS_URL', broker),
      env('STORAGE_PATH', DATA_PATH),
      env('CATALOG_API_URL', CATALOG_URL),
      secret('CATALOG_API_KEY', 'EXTRACTION_API_KEY'),
      env('BROKER_VISIBILITY_TIMEOUT', VISIBILITY_TIMEOUT),
    ];
    const prefork = ['worker', '--loglevel=INFO', '-E', '--concurrency=1'];
    const withModels = [
      {volume: 'data', path: DATA_PATH},
      {volume: 'models', path: '/models'},
    ];
    services.push(
      workerBase('analyzer', 'Extraction', IMAGES.analyzer, {
        summary: 'Finds the page layout with Docling and hands regions to the other workers.',
        args: ['celery', '-A', 'evilflowers_analyzer.worker', ...prefork, '--queues=evilflowers_analyzer', '--hostname=analyzer@%h'],
        env: [...extractionEnv, env('HF_HOME', '/models'), env('LAYOUT_THREADS', 2), env('OMP_NUM_THREADS', 2), env('LAYOUT_BATCH_PAGES', 8), ...telemetryEnv('analyzer')],
        mounts: withModels,
        platform: 'linux/amd64',
        tmp: true,
      }),
      workerBase('image', 'Extraction', IMAGES.image, {
        summary: 'Crops figures.',
        args: ['celery', '-A', 'evilflowers_image.worker', ...prefork, '--queues=evilflowers_image', '--hostname=image@%h'],
        env: [...extractionEnv, env('HF_HOME', '/models'), env('CAPTIONS_ENABLED', 0), ...telemetryEnv('image')],
        mounts: withModels,
        platform: 'linux/amd64',
        tmp: true,
      }),
      workerBase('equation', 'Extraction', IMAGES.equation, {
        summary: 'Crops formulas and reads them as LaTeX.',
        args: ['celery', '-A', 'evilflowers_equation.worker', ...prefork, '--queues=evilflowers_equation', '--hostname=equation@%h'],
        env: [...extractionEnv, env('HF_HOME', '/models'), env('MODELS_PATH', '/models/latex-ocr'), env('LATEX_THREADS', 1), env('LATEX_WORKERS', 2), ...telemetryEnv('equation')],
        mounts: withModels,
        platform: 'linux/amd64',
        tmp: true,
      }),
      workerBase('text', 'Extraction', IMAGES.text, {
        summary: 'Paragraphs and sentences with their positions, paragraph embeddings, tables as Markdown.',
        args: [
          'celery',
          '-A',
          'evilflowers_text.worker',
          ...prefork,
          '--queues=evilflowers.text.paragraphs,evilflowers.text.tables,evilflowers_text_worker',
          '--hostname=text@%h',
        ],
        env: [
          ...extractionEnv,
          env('TEI_URL', s.search === 'bundled' ? TEI_URL : s.searchUrl),
          secret('TEI_API_KEY', 'EVILFLOWERS_EMBEDDING_API_KEY'),
          env('TEI_BATCH_SIZE', 8),
          env('TABLE_REVIEW_ENABLED', 'false'),
          ...telemetryEnv('text'),
        ],
        platform: 'linux/amd64',
        tmp: true,
      }),
    );
    addVolume('models', '10Gi', 'Layout and LaTeX-OCR models, downloaded on first use.');
    volumes.models.users += 2;
    volumes.data.users += 4;
    addEnv('Extraction', 'EXTRACTION_API_KEY', '', 'API key of the catalog user the extraction workers post as. Fill it in after the first start (see the steps).');
    steps.push({
      title: 'Give the extraction workers an API key',
      body:
        'The workers post their results to the catalog as a user with the extraction.ingest_extraction permission. Create that user in /admin/, sign in as it, create an API key with POST /api/v1/api_keys, put the key in EXTRACTION_API_KEY in .env and apply the configuration again. Existing PDFs are processed only when you ask: manage.py backfill_extraction --missing.',
      commands: {
        compose: ['docker compose up -d', 'docker compose exec evilflowers python3 manage.py backfill_extraction --missing --dry-run'],
        k8s: [
          `kubectl -n ${s.namespace} create secret generic evilflowers --from-env-file=.env --dry-run=client -o yaml | kubectl apply -f -`,
          `kubectl -n ${s.namespace} rollout restart deployment analyzer image equation text`,
          `kubectl -n ${s.namespace} exec deploy/evilflowers -- python3 manage.py backfill_extraction --missing --dry-run`,
        ],
      },
    });
  }

  // ----- models -----
  if (s.search === 'bundled') {
    services.push({
      name: 'tei-embed',
      image: IMAGES.tei,
      role: 'model',
      feature: 'Search by meaning',
      summary: `Text Embeddings Inference serving ${EMBEDDING_MODEL}.`,
      args: ['--model-id', EMBEDDING_MODEL, '--revision', EMBEDDING_REVISION, '--port', '80'],
      env: [secret('API_KEY', 'EVILFLOWERS_EMBEDDING_API_KEY')],
      ports: [{name: 'http', port: 80}],
      probe: {tcp: 80, startupSeconds: 1800},
      mounts: [{volume: 'tei', path: '/data'}],
    });
    addVolume('tei', '5Gi', 'Embedding model weights.');
  }
  if (s.assistant === 'bundled') {
    services.push({
      name: 'ollama',
      image: IMAGES.ollama,
      role: 'model',
      feature: 'Reading assistant',
      summary: 'Ollama, serving the assistant model.',
      env: [env('OLLAMA_KEEP_ALIVE', '-1'), env('OLLAMA_CONTEXT_LENGTH', 32768), env('OLLAMA_FLASH_ATTENTION', 1)],
      ports: [{name: 'http', port: 11434}],
      probe: {tcp: 11434},
      mounts: [{volume: 'ollama', path: '/root/.ollama'}],
    });
    addVolume('ollama', '60Gi', 'Model weights.');
    steps.push({
      title: 'Download the assistant model',
      body: `Ollama starts empty. Pull ${s.assistantModel} once; the weights stay in the ollama volume.`,
      commands: {
        compose: [`docker compose exec ollama ollama pull ${s.assistantModel}`],
        k8s: [`kubectl -n ${s.namespace} exec deploy/ollama -- ollama pull ${s.assistantModel}`],
      },
    });
  }

  // ----- support -----
  if (s.mail === 'catcher') {
    services.push({
      name: 'maildev',
      image: IMAGES.maildev,
      role: 'support',
      feature: 'E-mail notifications',
      summary: 'Catches every e-mail; inbox on port 1080.',
      ports: [
        {name: 'smtp', port: 1025},
        {name: 'http', port: 1080, publish: 1080},
      ],
      probe: {tcp: 1025},
    });
  }
  if (s.telemetry === 'bundled') {
    services.push({
      name: 'otel-lgtm',
      image: IMAGES.otelLgtm,
      role: 'support',
      feature: 'Traces, metrics and logs',
      summary: 'OpenTelemetry collector with Tempo, Loki, Mimir and Grafana (port 3000).',
      ports: [
        {name: 'grafana', port: 3000, publish: 3000},
        {name: 'otlp-http', port: 4318},
      ],
      probe: {tcp: 3000},
    });
  }

  // ----- warnings -----
  if (fs && volumes.data.users > 1) {
    warnings.push(
      s.target === 'k8s'
        ? 'Several pods share the data volume. Use a ReadWriteMany storage class, or keep every pod on one node with a ReadWriteOnce volume.'
        : null,
    );
  }
  if (s.ocr) {
    warnings.push('The OCR worker needs an image built from evilflowers-ocr-service develop (efc2599 or later), which writes the outcome file the catalog reads. Check that :master has it before you switch OCR on.');
  }
  if (s.database === 'external') {
    warnings.push('Your PostgreSQL needs the pgvector extension. With pg_search installed the catalog also ranks with BM25; without it, search falls back to PostgreSQL full text.');
  }

  // ----- first start -----
  steps.unshift({
    title: 'Start it and create the first administrator',
    body:
      s.processes === 'single'
        ? 'The catalog migrates the database and loads languages and currencies each time it starts. Then create your administrator and the first catalog in /admin/.'
        : 'The migrate step runs first; the other catalog containers wait for it. Then create your administrator and the first catalog in /admin/.',
    commands: {
      compose: ['docker compose up -d', 'docker compose exec evilflowers python3 manage.py createsuperuser'],
      k8s: [
        `kubectl create namespace ${s.namespace}`,
        `kubectl -n ${s.namespace} create secret generic evilflowers --from-env-file=.env`,
        'kubectl apply -f evilflowers.yaml',
        `kubectl -n ${s.namespace} rollout status deployment/evilflowers --timeout=10m`,
        `kubectl -n ${s.namespace} exec -it deploy/evilflowers -- python3 manage.py createsuperuser`,
      ],
    },
  });
  if (s.lending) {
    // The license server's files must exist before the first start.
    const lending = steps.findIndex((x) => x.title === 'Prepare the license server');
    steps.unshift(steps.splice(lending, 1)[0]);
  }
  steps.push({
    title: 'Point the portal at the catalog',
    body: `The catalog answers on ${publicUrl} once your reverse proxy or ingress terminates TLS for ${s.domain}. Build elvira-portal with ELVIRA_BASE_URL=${publicUrl} and serve it from ${s.portalUrl}; the catalog accepts browser requests from that origin only.`,
    link: '/docs/quickstart#2-start-the-portal',
  });

  return {services, volumes: Object.values(volumes), envFile, steps, warnings: warnings.filter(Boolean)};
}
