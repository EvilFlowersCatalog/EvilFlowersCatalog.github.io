import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';

import {generate, generateSecrets, normalize, DEFAULTS, VERSION, STATIC_ROOT} from '../src/index.js';
import {MATRIX} from './matrix.js';

const secrets = await generateSecrets(webcrypto);
const run = (partial) => generate(partial, secrets);

test('package.json and src/version.js agree', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.version, VERSION);
});

for (const [name, partial] of Object.entries(MATRIX)) {
  test(`${name}: every file is free of unfilled values`, () => {
    const {files} = run(partial);
    for (const [path, text] of Object.entries(files)) {
      assert.ok(text.length > 0, `${path} is empty`);
      for (const bad of ['undefined', '[object Object]', 'NaN']) {
        assert.ok(!text.includes(bad), `${path} contains ${bad}`);
      }
    }
  });
}

test('secrets: alphanumeric strings and an RSA private JWK on one line', () => {
  for (const [k, v] of Object.entries(secrets)) {
    if (k === 'SECURED_VIEW_JWK') continue;
    assert.match(v, /^[A-Za-z0-9]+$/, k);
  }
  const jwk = JSON.parse(secrets.SECURED_VIEW_JWK);
  assert.equal(jwk.kty, 'RSA');
  for (const part of ['n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi']) assert.ok(jwk[part], part);
  const env = run({}).files['.env'];
  assert.ok(env.includes(`SECURED_VIEW_JWK=${secrets.SECURED_VIEW_JWK}\n`));
});

test('default: Compose, stable, nginx on the host serving ./static and the portal', () => {
  const {files, plan} = run({});
  assert.deepEqual(Object.keys(files).sort(), ['.env', 'NEXT-STEPS.md', 'compose.yml', 'nginx/elvira.conf']);
  const compose = files['compose.yml'];
  assert.ok(compose.includes('"127.0.0.1:8000:8000"'), 'catalog published on loopback only');
  assert.ok(compose.includes(`./static:${STATIC_ROOT}`), 'static bind mount');
  assert.ok(compose.includes('collectstatic --noinput'), 'collectstatic before the entrypoint');
  const nginx = files['nginx/elvira.conf'];
  assert.ok(nginx.includes(`alias ${DEFAULTS.installDir}/static/;`));
  assert.ok(nginx.includes('server_name library.example.org;'));
  assert.ok(nginx.includes('server_name portal.example.org;'));
  assert.ok(nginx.includes(`root ${DEFAULTS.portalRoot};`));
  assert.ok(nginx.includes('proxy_set_header Host $host;'));
  assert.ok(nginx.includes('proxy_set_header X-Forwarded-Proto $scheme;'));
  assert.ok(nginx.includes('client_max_body_size 500m;'));
  assert.ok(!/listen\s+443/.test(nginx), 'certbot adds TLS');
  const directives = nginx.replace(/#.*$/gm, '');
  assert.ok(!/proxy_cache\s+(?!off)/.test(directives), 'no proxy cache');
  assert.equal(plan.warnings.length, 0);
});

test('proxy headers are set at server level only, never inside a location', () => {
  const nginx = run(MATRIX.everything).files['nginx/elvira.conf'];
  for (const loc of nginx.matchAll(/location [^{]+\{([^}]*)\}/g)) {
    assert.ok(!loc[1].includes('proxy_set_header'), loc[0]);
    assert.ok(!loc[1].includes('add_header'), loc[0]);
  }
});

test('develop: WhiteNoise serves /static/, nothing is collected', () => {
  const {files} = run({channel: 'develop'});
  assert.ok(!files['compose.yml'].includes('./static'));
  assert.ok(!files['compose.yml'].includes('collectstatic'));
  assert.match(files['nginx/elvira.conf'], /location \/static\/ \{\s+proxy_pass http:\/\/elvira_catalog;/);
});

test('split: migrate collects on stable; develop web keeps its health check', () => {
  const stable = run({processes: 'split'}).plan.services;
  const migrate = stable.find((x) => x.name === 'evilflowers-migrate');
  assert.ok(migrate.args.at(-1).includes('collectstatic'));
  assert.ok(stable.find((x) => x.name === 'evilflowers').noImageHealthcheck, 'master status asks supervisord');

  const develop = run({channel: 'develop', processes: 'split'}).plan.services;
  const web = develop.find((x) => x.name === 'evilflowers');
  assert.equal(web.noImageHealthcheck, false);
  assert.ok(web.env.some((e) => e.name === 'EVILFLOWERS_STATUS_SUPERVISOR' && e.value === 'false'));
  assert.ok(develop.find((x) => x.name === 'evilflowers-worker').noImageHealthcheck);
});

test('streamed answers: no buffering on the assistant and the MCP endpoint', () => {
  const nginx = run({assistant: 'bundled'}).files['nginx/elvira.conf'];
  assert.match(nginx, /location \/assistant\/v1\/ \{[^}]*proxy_buffering off;/);
  assert.match(nginx, /location = \/mcp\/v1 \{[^}]*proxy_buffering off;/);
  const none = run({mcp: false}).files['nginx/elvira.conf'];
  assert.ok(!none.includes('/mcp/v1'));
  assert.ok(!none.includes('/assistant/v1/'));
});

test('own proxy: no nginx file, port 8000 open, a warning about /static/', () => {
  const {files, plan, settings} = run({proxy: 'none'});
  assert.equal(settings.portal, false, 'portal needs the host nginx');
  assert.ok(!('nginx/elvira.conf' in files));
  assert.ok(files['compose.yml'].includes('"8000:8000"'));
  assert.ok(plan.warnings.some((w) => w.includes('./static')));
});

test('portal off: only the catalog server, no SPA map', () => {
  const nginx = run({portal: false}).files['nginx/elvira.conf'];
  assert.ok(!nginx.includes('portal.example.org'));
  assert.ok(!nginx.includes('$elvira_portal_cache_control'));
});

test('portal on the catalog host: left out, with a warning', () => {
  const {files, plan} = run({portalUrl: 'https://library.example.org'});
  assert.equal((files['nginx/elvira.conf'].match(/server_name library\.example\.org;/g) ?? []).length, 1);
  assert.ok(plan.warnings.some((w) => w.includes('share one host name')));
});

test('Kubernetes: manifests, ingress limits, no nginx file, portal off', () => {
  const {files, notes, plan, settings} = run({target: 'k8s'});
  assert.deepEqual(Object.keys(files).sort(), ['.env', 'NEXT-STEPS.md', 'evilflowers.yaml']);
  assert.equal(settings.portal, false);
  assert.ok(notes.some((n) => n.startsWith('Serve the portal turned off')));
  assert.ok(files['evilflowers.yaml'].includes('nginx.ingress.kubernetes.io/proxy-body-size: "500m"'));
  assert.ok(!files['evilflowers.yaml'].includes('./static'));
  assert.ok(plan.warnings.some((w) => w.includes('/static/')));
});

test('requirements: extraction switches on develop and the embedding service', () => {
  const {settings} = normalize({extraction: true}, DEFAULTS);
  assert.equal(settings.channel, 'develop');
  assert.equal(settings.search, 'bundled');
});

test('the .env carries every secret the files reference', () => {
  for (const partial of Object.values(MATRIX)) {
    const {files} = run(partial);
    const defined = new Set(files['.env'].split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => l.split('=')[0]));
    const config = files['compose.yml'] ?? files['evilflowers.yaml'];
    const used = [...config.matchAll(/\$\{([A-Z_]+)\}|key: ([A-Z_]+)\b/g)].map((m) => m[1] ?? m[2]);
    for (const k of used) assert.ok(defined.has(k), `${k} missing from .env`);
  }
});
