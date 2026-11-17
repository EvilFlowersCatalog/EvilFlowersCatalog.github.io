/**
 * Builds the files of an ELVIRA installation from EvilFlowersCatalog/deploy (src/data/
 * deploy-blocks.json): compose.yml with only the chosen services, .env from .env.example with
 * the reader's values and secrets, the nginx and readium files from their templates, and for
 * Kubernetes one manifest from k8s/base and the chosen components.
 *
 * Plain functions on text, so `node scripts/check-deploy.mjs` runs the same code as the page.
 */
import {PROFILES} from './options.js';

export function profilesOf(s) {
  const compose = s.target === 'compose';
  const k8s = s.target === 'k8s';
  return [
    s.database === 'bundled' && 'postgres',
    s.redis === 'bundled' && 'redis',
    (compose || k8s) && s.lending && 'lending',
    (compose || k8s) && s.ocr && 'ocr',
    (compose || k8s) && s.search === 'bundled' && 'search',
    (compose || k8s) && s.extraction && 'extraction',
    (compose || k8s) && s.assistant === 'bundled' && 'assistant',
    (compose || k8s) && s.mail === 'catcher' && 'mail',
    (compose || k8s) && s.telemetry === 'bundled' && 'telemetry',
  ].filter(Boolean);
}

/** The .env values the choices decide, by key. */
function envValues(s, secrets) {
  const develop = s.channel === 'develop';
  const tag = develop ? 'develop' : 'master';
  const redisHost = s.redis === 'bundled' ? 'redis' : s.redisHost;
  const redisPort = s.redis === 'bundled' ? '6379' : s.redisPort;
  const broker = `redis://${redisHost}:${redisPort}/7`;
  const portalUrl = `https://${s.portalDomain}`;
  const readiumUser = 'evilflowers';
  const readiumPassword = secrets.ELVIRA_READIUM_PASSWORD ?? 'change-me';
  const {READIUM_HTPASSWD, ...envSecrets} = secrets;
  return {
    COMPOSE_PROFILES: profilesOf(s).join(','),
    ELVIRA_CATALOG_IMAGE: `ghcr.io/evilflowerscatalog/evilflowerscatalog:${tag}`,
    ELVIRA_LCPENCRYPT_IMAGE: `ghcr.io/evilflowerscatalog/evilflowers-lcpencrypt-worker:${tag}`,

    ELVIRA_DOMAIN: s.domain,
    ELVIRA_PORTAL_DOMAIN: s.portal ? s.portalDomain : '',
    ELVIRA_HTTP_BIND: s.target === 'k8s' ? '0.0.0.0' : '127.0.0.1',
    ELVIRA_DIR: s.installDir.replace(/\/+$/, ''),
    ELVIRA_PORTAL_ROOT: s.portalRoot.replace(/\/+$/, ''),
    INSTANCE_NAME: s.domain,
    ALLOWED_HOSTS: `${s.domain};evilflowers`,
    EVILFLOWERS_BASE_URL: `https://${s.domain}`,
    EVILFLOWERS_READIUM_BASE_URL: `https://${s.domain}`,
    EVILFLOWERS_PORTAL_URL: portalUrl,
    CORS_ALLOWED_ORIGINS: portalUrl,
    EVILFLOWERS_CONTACT_EMAIL: s.contactEmail,
    DEFAULT_FROM_EMAIL: s.contactEmail,

    PGHOST: s.database === 'bundled' ? 'postgres' : s.dbHost,
    PGPORT: s.database === 'bundled' ? '5432' : s.dbPort,
    PGDATABASE: s.dbName,
    PGUSER: s.dbUser,
    REDIS_HOST: redisHost,
    REDIS_PORT: redisPort,
    CELERY_BROKER_URL: broker,
    CELERY_RESULT_BACKEND: broker,

    EVILFLOWERS_MCP_ENABLED: s.mcp ? '1' : '0',

    ELVIRA_READIUM_USER: readiumUser,
    EVILFLOWERS_READIUM_LCPSV_URL: `http://${readiumUser}:${readiumPassword}@readium:8989`,
    EVILFLOWERS_READIUM_LSDSV_URL: `http://${readiumUser}:${readiumPassword}@readium:8990`,

    EVILFLOWERS_OCR_ENABLED: s.ocr ? 'true' : 'false',
    EVILFLOWERS_EMBEDDING_URL: {off: '', bundled: 'http://tei-embed', external: s.searchUrl}[s.search],
    EVILFLOWERS_EXTRACTION_ENABLED: s.extraction ? '1' : '0',

    EVILFLOWERS_ASSISTANT_ENABLED: s.assistant === 'off' ? '0' : '1',
    EVILFLOWERS_ASSISTANT_OLLAMA_ENDPOINT: s.assistant === 'external' ? s.assistantEndpoint : 'http://ollama:11434/api/chat',
    EVILFLOWERS_ASSISTANT_OLLAMA_MODEL: s.assistantModel,

    EVILFLOWERS_NOTIFICATIONS_ENABLED: s.mail === 'off' ? 'false' : 'true',
    EMAIL_HOST: {off: '', smtp: s.smtpHost, catcher: 'maildev'}[s.mail],
    EMAIL_PORT: s.mail === 'catcher' ? '1025' : s.smtpPort,
    EMAIL_USE_TLS: s.mail === 'catcher' ? 'false' : 'true',
    EMAIL_HOST_USER: s.mail === 'smtp' ? s.smtpUser : '',

    EVILFLOWERS_BACKUP_SCHEDULE: s.backup ? s.backupSchedule : '',
    EVILFLOWERS_BACKUP_DESTINATION: s.backupDestination,
    EVILFLOWERS_BACKUP_S3_HOST: s.backupS3Host,

    OTEL_SDK_DISABLED: s.telemetry === 'off' ? 'true' : 'false',
    OTEL_EXPORTER_OTLP_ENDPOINT: {off: '', bundled: 'http://otel-lgtm:4318', external: s.otlpEndpoint}[s.telemetry],

    ...envSecrets,
  };
}

/** .env.example with `KEY=value` lines replaced; comments, order and other keys stay. */
function applyEnv(template, values) {
  const seen = new Set();
  const text = template.replace(/^([A-Z][A-Z0-9_]*)=.*$/gm, (line, key) => {
    if (!(key in values)) return line;
    seen.add(key);
    return `${key}=${values[key]}`;
  });
  const missing = Object.keys(values).filter((k) => !seen.has(k));
  if (missing.length) throw new Error(`.env.example has no line for ${missing.join(', ')}`);
  return text;
}

export function parseEnv(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

/** Fills `${NAME}` from `vars`, as scripts/setup.sh does; an unknown name is an error. */
function render(template, vars) {
  return template.replace(/\$\{([A-Z][A-Z0-9_]*)\}/g, (m, name) => {
    if (vars[name] === undefined) throw new Error(`no value for \${${name}}`);
    return vars[name];
  });
}

/**
 * compose.yml with only `keep` services: their `profiles:` lines go, depends_on entries on
 * services left out go, and so do the volumes and the x-worker anchor nobody uses any more.
 */
export function trimCompose(text, keep, header) {
  const lines = text.split('\n');
  const body = lines.slice(lines.findIndex((l) => l !== '' && !l.startsWith('#')));
  // Top-level sections: x-…, services:, volumes:.
  const sections = [];
  for (const line of body) {
    if (/^[a-z][\w-]*:/.test(line)) sections.push({head: line, lines: []});
    else if (sections.length) sections.at(-1).lines.push(line);
  }
  const get = (head) => sections.find((x) => x.head.startsWith(head));

  // Services: each with the comment lines above it.
  const services = [];
  let pending = [];
  for (const line of get('services:').lines) {
    const m = line.match(/^ {2}([a-z][a-z0-9-]*):$/);
    if (m) {
      services.push({name: m[1], lines: [...pending, line]});
      pending = [];
    } else if (/^ {4}/.test(line) && services.length) services.at(-1).lines.push(line);
    else pending.push(line);
  }

  const kept = services.filter((x) => keep.includes(x.name));
  const serviceText = kept
    .map(({lines: ls}) => {
      const out = [];
      for (let i = 0; i < ls.length; i++) {
        const line = ls[i];
        if (/^ {4}profiles: /.test(line)) continue;
        const dep = line.match(/^ {6}([a-z][a-z0-9-]*): \{(.*), required: false\}$/);
        if (dep) {
          if (keep.includes(dep[1])) out.push(`      ${dep[1]}: {${dep[2]}}`);
          continue;
        }
        out.push(line);
      }
      // A depends_on whose entries all went.
      return out.filter((l, i) => !(l === '    depends_on:' && !/^ {6}/.test(out[i + 1] ?? ''))).join('\n');
    })
    .join('\n')
    .replace(/^\s*\n/, '');

  const used = new Set([...serviceText.matchAll(/^\s+- ([a-z][a-z0-9-]*):\//gm)].map((m) => m[1]));
  const volumes = get('volumes:').lines.filter((l) => {
    const m = l.match(/^ {2}([a-z][a-z0-9-]*): \{\}$/);
    return m && used.has(m[1]);
  });

  const out = [header, ''];
  for (const s of sections) {
    if (!s.head.startsWith('x-')) continue;
    const anchor = s.head.match(/&([\w-]+)/)?.[1];
    if (anchor && !serviceText.includes(`*${anchor}`)) continue;
    out.push(s.head, ...s.lines);
  }
  out.push('services:', serviceText.trimEnd(), '');
  if (volumes.length) out.push('volumes:', ...volumes, '');
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

/** One manifest from k8s/base and the chosen components, with tag, host and storage class. */
function k8sManifest(blocks, s, profiles, header) {
  const tag = s.channel === 'develop' ? 'develop' : 'master';
  const docs = [blocks['k8s/base/catalog.yaml'], ...profiles.map((p) => blocks[`k8s/components/${p}/${p}.yaml`])];
  let text = docs.map((d) => d.trim()).join('\n---\n');
  text = text
    .replace(/(evilflowerscatalog\/evilflowerscatalog):master/g, `$1:${tag}`)
    .replace(/(evilflowerscatalog\/evilflowers-lcpencrypt-worker):master/g, `$1:${tag}`)
    .replace(/^(\s+- host: )library\.example\.org$/m, `$1${s.domain}`);
  if (s.storageClass) {
    text = text.replace(/^( {2})accessModes: (.*)$/gm, `$1storageClassName: ${s.storageClass}\n$1accessModes: $2`);
  }
  return `${header}\n${text}\n`;
}

function steps(s, profiles) {
  const out = [];
  const lending = profiles.includes('lending');
  if (s.target === 'compose') {
    out.push({
      title: 'Start it',
      body: `Unpack the download in ${s.installDir} on your server (or anywhere, by hand) and start the containers.`,
      commands: [`cd ${s.installDir}`, 'docker compose up -d --wait', 'docker compose exec evilflowers python3 manage.py createsuperuser'],
    });
  } else if (s.target === 'docker') {
    out.push({
      title: 'Start it',
      body: `Unpack the download in ${s.installDir}. docker/run.sh starts the catalog${s.database === 'bundled' || s.redis === 'bundled' ? ' with PostgreSQL and Redis' : ''} from the same .env.`,
      commands: [`cd ${s.installDir}`, 'docker/run.sh up', 'docker exec -it elvira-evilflowers python3 manage.py createsuperuser'],
    });
  } else {
    out.push({
      title: 'Apply it',
      body: 'The settings and secrets go in as Secrets made from .env (and the license server’s files); the manifest is everything else.',
      commands: [
        `kubectl create namespace ${s.namespace}`,
        `kubectl -n ${s.namespace} create secret generic elvira-env --from-env-file=.env`,
        ...(lending ? [`kubectl -n ${s.namespace} create secret generic readium --from-file=readium/config.yaml --from-file=readium/htpasswd`] : []),
        `kubectl apply -n ${s.namespace} -f elvira.yaml`,
        `kubectl -n ${s.namespace} exec -it deploy/evilflowers -- python3 manage.py createsuperuser`,
      ],
    });
  }
  if (s.target !== 'k8s') {
    const names = [s.domain, ...(s.portal ? [s.portalDomain] : [])];
    out.push({
      title: 'Put nginx in front',
      body: `The sites answer on port 80; certbot adds TLS. nginx serves the admin assets from ${s.installDir}/static${s.portal ? ` and the portal from ${s.portalRoot}` : ''}.`,
      commands: [
        'sudo cp nginx/catalog.conf /etc/nginx/conf.d/elvira-catalog.conf',
        ...(s.portal ? ['sudo cp nginx/portal.conf /etc/nginx/conf.d/elvira-portal.conf'] : []),
        'sudo nginx -t && sudo systemctl reload nginx',
        `sudo certbot --nginx ${names.map((n) => `-d ${n}`).join(' ')}`,
      ],
    });
  }
  if (s.portal && s.target !== 'k8s') {
    out.push({
      title: 'Build the portal',
      body: `Build elvira-portal against https://${s.domain} and copy it to ${s.portalRoot}.`,
      commands: [
        'git clone https://github.com/EvilFlowersCatalog/elvira-portal.git && cd elvira-portal',
        `docker run --rm -v "$PWD:/src" -w /src -e ELVIRA_BASE_URL=https://${s.domain} -e ELVIRA_THEME=default node:24 sh -c "npm ci && npm run build:prod"`,
        `sudo rsync -a --delete dist/ ${s.portalRoot}/`,
      ],
    });
  }
  const exec =
    s.target === 'k8s' ? `kubectl -n ${s.namespace} exec -i deploy/evilflowers --` : 'docker compose exec -T evilflowers';
  if (s.extraction) {
    out.push({
      title: 'Give the extraction workers an API key',
      body: 'The workers post their results as a service user. This prints its key: put it in EXTRACTION_API_KEY in .env and start again (on Kubernetes, recreate the elvira-env Secret).',
      commands: [
        'curl -fsSLO https://raw.githubusercontent.com/EvilFlowersCatalog/deploy/main/scripts/extraction-api-key.py',
        `${exec} python3 manage.py shell < extraction-api-key.py`,
      ],
    });
  }
  if (s.assistant === 'bundled') {
    out.push({
      title: 'Download the assistant model',
      body: `Ollama starts empty. Pull ${s.assistantModel} once.`,
      commands: [s.target === 'k8s' ? `kubectl -n ${s.namespace} exec deploy/ollama -- ollama pull ${s.assistantModel}` : `docker compose exec ollama ollama pull ${s.assistantModel}`],
    });
  }
  return out;
}

function warnings(s) {
  const out = [];
  if (s.database === 'external') out.push('Your PostgreSQL needs the pgvector extension. With pg_search the catalog also ranks with BM25.');
  if (s.lending && s.target !== 'docker') {
    out.push('Lending starts with EDRLab’s test certificate: only test builds of reading apps open its books. The comment in .env shows how to switch to your own.');
  }
  if (s.target === 'k8s' && s.channel === 'stable') {
    out.push('On Kubernetes the stable images do not serve /static/, so /admin/ loads without its styles. The development images serve them themselves.');
  }
  if (s.portal && s.portalDomain === s.domain) out.push('The portal and the catalog need their own host names.');
  return out;
}

/**
 * The installation as files: [{name, text, mode, language}], plus what runs and the steps.
 * `blocks` is src/data/deploy-blocks.json; `secrets` comes from secrets.js.
 */
export function assemble(s, secrets, blocks) {
  const files = blocks.files;
  const profiles = profilesOf(s);
  const values = envValues(s, secrets);
  const env = applyEnv(files['.env.example'], values);
  const vars = parseEnv(env);
  const features = ['catalog', ...profiles].join(', ');
  const made = `generated at elvira.digital/deploy from ${blocks.source}`;

  const out = [];
  const add = (name, text, language, mode = 0o644) => out.push({name, text, language, mode});

  if (s.target === 'compose') {
    const keep = ['evilflowers', ...profiles.flatMap((p) => PROFILES[p].services)];
    const header = `# ELVIRA on Docker Compose, ${made}.\n# Runs: ${features}. Settings and secrets: .env.\n# Start: docker compose up -d --wait`;
    add('compose.yml', trimCompose(files['compose.yml'], keep, header), 'yaml');
  }
  if (s.target === 'k8s') {
    const header = `# ELVIRA on Kubernetes, ${made}.\n# Runs: ${features}. Settings and secrets: Secret elvira-env, from .env.`;
    add('elvira.yaml', k8sManifest(files, s, profiles, header), 'yaml');
  }
  add('.env', env, 'bash', 0o600);
  if (s.target === 'docker') add('docker/run.sh', files['docker/run.sh'], 'bash', 0o755);
  if (s.target !== 'k8s') {
    add('nginx/catalog.conf', render(files['nginx/catalog.conf.tmpl'], vars), 'nginx');
    if (s.portal) add('nginx/portal.conf', render(files['nginx/portal.conf.tmpl'], vars), 'nginx');
  }
  if (profiles.includes('lending')) {
    add('readium/config.yaml', render(files['readium/config.yaml.tmpl'], vars), 'yaml', 0o600);
    add('readium/htpasswd', `${secrets.READIUM_HTPASSWD ?? 'evilflowers:change-me'}\n`, 'text', 0o600);
    if (s.target === 'compose') {
      add('readium/supervisord.conf', files['readium/supervisord.conf'], 'ini');
      add('readium/certs/', '', null, 0o755);
    }
  }

  const services = [
    {name: 'evilflowers', role: 'core', feature: 'Catalog'},
    ...profiles.flatMap((p) => PROFILES[p].services.map((name) => ({name, role: PROFILES[p].role, feature: p}))),
  ];
  return {files: out, plan: {services, profiles, steps: steps(s, profiles), warnings: warnings(s)}};
}
