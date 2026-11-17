/**
 * Writes the plan's reverse proxy (plan.proxy) as one nginx file: an http-level map and a
 * server block per host. It goes into /etc/nginx/conf.d/ (or sites-enabled/), both of which
 * nginx includes inside `http {}`.
 *
 * The server blocks listen on port 80 only. A file naming certificates that do not exist yet
 * fails `nginx -t`, so certbot --nginx adds `listen 443 ssl`, the certificates and the redirect
 * from http after the first reload.
 */
import {GENERATOR} from './version.js';
import {GUNICORN_TIMEOUT, UPLOAD_LIMIT} from './data.js';

/** Above gunicorn's worker timeout, so a slow request ends in gunicorn, not in a 504. */
const PROXY_TIMEOUT = GUNICORN_TIMEOUT + 60;

/** Vite's output: flat in /assets/, `name-<8 character hash>.ext`. */
const HASHED_ASSET = String.raw`^/assets/[^/]+-[A-Za-z0-9_-]{8}\.(?:js|mjs|css|woff2?|ttf|png|jpe?g|gif|svg|webp|avif|wasm)$`;

function block(lines, indent = 0) {
  const pad = '    '.repeat(indent);
  return lines
    .flat(Infinity)
    .filter((l) => l !== null && l !== undefined && l !== false)
    .map((l) => (l === '' ? '' : `${pad}${l}`))
    .join('\n');
}

function catalogServer(proxy) {
  const staticLocation = proxy.staticRoot
    ? [
        '# The admin assets, collected into the compose directory on every start (the stable',
        "# images don't serve them). Their names carry no hash, so browsers revalidate after a day.",
        'location /static/ {',
        `    alias ${proxy.staticRoot};`,
        '    expires 1d;',
        '    access_log off;',
        '}',
      ]
    : [
        '# The admin assets, served by the catalog itself (WhiteNoise) with hashed names and',
        '# far-future caching. Nothing to do here but pass them on.',
        'location /static/ {',
        '    proxy_pass http://elvira_catalog;',
        '}',
      ];

  const streaming = proxy.streaming.map((path) => [
    '',
    `# Streamed answers (text/event-stream): every event goes out as it is written.`,
    `location ${path.endsWith('/') ? path : `= ${path}`} {`,
    '    proxy_pass http://elvira_catalog;',
    '    proxy_buffering off;',
    '    proxy_cache off;',
    `    proxy_read_timeout ${PROXY_TIMEOUT * 2}s;`,
    '}',
  ]);
  // `= /mcp/v1` matches the endpoint itself; its upload links (/mcp/v1/uploads/…) fall through to `/`.

  return block([
    `# The catalog: REST API, OPDS feeds, files, the admin console${proxy.streaming.length ? ', streamed answers' : ''}.`,
    'server {',
    block(
      [
        'listen 80;',
        'listen [::]:80;',
        `server_name ${proxy.domain};`,
        'server_tokens off;',
        '',
        '# Publication uploads. The catalog keeps up to 100 MB of a form in memory and spools the',
        '# rest to disk; nginx buffers the whole body first, so gunicorn never waits on a slow client.',
        `client_max_body_size ${UPLOAD_LIMIT};`,
        '',
        '# Set once here: a location that sets any proxy_set_header of its own inherits none of these.',
        '# Host must be the public name: the catalog builds every absolute link (OPDS, covers, LCP',
        '# licences) from it, and treats requests for that name as https.',
        'proxy_set_header Host $host;',
        'proxy_set_header X-Real-IP $remote_addr;',
        'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
        'proxy_set_header X-Forwarded-Proto $scheme;',
        'proxy_http_version 1.1;',
        'proxy_set_header Connection "";',
        '',
        `# Gunicorn gives a request ${GUNICORN_TIMEOUT} s; wait a little longer than that.`,
        `proxy_connect_timeout ${PROXY_TIMEOUT}s;`,
        `proxy_send_timeout ${PROXY_TIMEOUT}s;`,
        `proxy_read_timeout ${PROXY_TIMEOUT}s;`,
        `send_timeout ${PROXY_TIMEOUT}s;`,
        '',
        '# The catalog compresses its own responses (OPDS, JSON); compressing them again buys nothing.',
        'gzip off;',
        '',
        'location / {',
        '    proxy_pass http://elvira_catalog;',
        '}',
        '',
        '# Publications, covers and thumbnails. Never put proxy_cache here: downloads are per reader',
        '# (personal copies, redirects), and the catalog sends Cache-Control and ETag for each one.',
        'location /data/v1/ {',
        '    proxy_pass http://elvira_catalog;',
        '}',
        '',
        staticLocation,
        streaming,
      ],
      1,
    ),
    '}',
  ]);
}

function portalServer(portal) {
  return block([
    '# The portal: a single-page app built from elvira-portal (npm run build:prod, then dist/).',
    'server {',
    block(
      [
        'listen 80;',
        'listen [::]:80;',
        `server_name ${portal.host};`,
        'server_tokens off;',
        '',
        `root ${portal.root};`,
        'index index.html;',
        '',
        'gzip on;',
        'gzip_vary on;',
        'gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;',
        '',
        '# At server level only: an add_header inside a location drops every inherited one.',
        'add_header Cache-Control $elvira_portal_cache_control always;',
        '',
        '# Deep links (/library/…) are routes of the app: hand them index.html.',
        'location / {',
        '    try_files $uri $uri/ /index.html;',
        '}',
        '',
        '# A missing hashed chunk (a tab opened before the last deploy) is a 404, never index.html',
        '# served as JavaScript.',
        `location ~ "${HASHED_ASSET}" {`,
        '    try_files $uri =404;',
        '}',
      ],
      1,
    ),
    '}',
  ]);
}

/** The nginx file, or null when the plan has no proxy to write. */
export function renderNginx(s, plan) {
  const proxy = plan.proxy;
  if (!proxy) return null;
  const parts = [
    block([
      `# ELVIRA behind nginx, generated by ${GENERATOR}`,
      `# Hosts: ${[proxy.domain, ...(proxy.portal ? [proxy.portal.host] : [])].join(', ')}`,
      '#',
      '# Install: sudo cp nginx/elvira.conf /etc/nginx/conf.d/elvira.conf',
      '#          sudo nginx -t && sudo systemctl reload nginx',
      `#          sudo certbot --nginx ${[proxy.domain, ...(proxy.portal ? [proxy.portal.host] : [])].map((h) => `-d ${h}`).join(' ')}`,
      '# certbot adds the https listeners and the redirect from http to this file.',
    ]),
    '',
    block([
      '# The catalog container, published on loopback only by compose.yml.',
      'upstream elvira_catalog {',
      `    server ${proxy.upstream};`,
      '    # Idle connections kept open to gunicorn; its --keep-alive (75 s) outlasts nginx\'s 60 s.',
      '    keepalive 16;',
      '}',
    ]),
  ];
  if (proxy.portal) {
    parts.push(
      '',
      block([
        "# Cache-Control for the portal's files: hashed chunks for a year, everything else (index.html,",
        '# unhashed images) revalidated on every load. Keyed on the status as well, so a missing chunk',
        '# is not pinned as immutable.',
        'map "$status:$uri" $elvira_portal_cache_control {',
        `    "~^(?:200|206|304):${HASHED_ASSET.slice(1)}" "public, max-age=31536000, immutable";`,
        '    default "no-cache";',
        '}',
      ]),
    );
  }
  parts.push('', catalogServer(proxy));
  if (proxy.portal) parts.push('', portalServer(proxy.portal));
  return `${parts.join('\n')}\n`;
}
