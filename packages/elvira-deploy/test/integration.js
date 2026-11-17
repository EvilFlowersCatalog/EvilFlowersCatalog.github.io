#!/usr/bin/env node
/**
 * Checks the generated files with the real tools, for every settings set in test/matrix.js:
 *   docker compose config   compose.yml and .env parse; the JWK survives .env as JSON
 *   nginx -t                nginx/elvira.conf, inside the official nginx image
 *   kubeconform -strict     evilflowers.yaml against the Kubernetes schemas (no cluster needed)
 * A tool that is missing is reported and skipped; any failure exits non-zero.
 *
 * Usage: node test/integration.js [output directory]
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {webcrypto} from 'node:crypto';

import {generate, generateSecrets} from '../src/index.js';
import {MATRIX} from './matrix.js';

const NGINX_IMAGE = 'nginx:1.29-alpine';
const KUBECONFORM_IMAGE = 'ghcr.io/yannh/kubeconform:v0.7.0';
const root = path.resolve(process.argv[2] ?? mkdtempSync(path.join(tmpdir(), 'elvira-deploy-')));

function has(cmd, args) {
  const r = spawnSync(cmd, args, {encoding: 'utf8'});
  return !r.error && r.status === 0;
}

function sh(cmd, args) {
  const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  return {ok: !r.error && r.status === 0, out: r.stdout ?? '', err: (r.stderr ?? '') + (r.error?.message ?? '')};
}

const tools = {
  compose: has('docker', ['compose', 'version']),
  nginx: has('docker', ['image', 'inspect', NGINX_IMAGE]) || sh('docker', ['pull', '-q', NGINX_IMAGE]).ok,
  kubeconform: has('docker', ['image', 'inspect', KUBECONFORM_IMAGE]) || sh('docker', ['pull', '-q', KUBECONFORM_IMAGE]).ok,
};
for (const [t, ok] of Object.entries(tools)) if (!ok) console.log(`skip: ${t} not available`);

const secrets = await generateSecrets(webcrypto);
let failures = 0;
const fail = (name, what, detail) => {
  failures += 1;
  console.log(`FAIL ${name}: ${what}\n${detail.trim().split('\n').slice(0, 20).join('\n')}`);
};

for (const [name, partial] of Object.entries(MATRIX)) {
  const dir = path.join(root, name);
  const {files} = generate(partial, secrets);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
    writeFileSync(path.join(dir, file), text);
  }
  const checks = [];

  if (files['compose.yml'] && tools.compose) {
    const r = sh('docker', ['compose', '--project-directory', dir, '-f', path.join(dir, 'compose.yml'), 'config', '--format', 'json']);
    if (!r.ok) fail(name, 'docker compose config', r.err);
    else {
      const config = JSON.parse(r.out);
      const catalog = config.services.evilflowers;
      try {
        const jwk = JSON.parse(catalog.environment.SECURED_VIEW_JWK);
        if (jwk.kty !== 'RSA') throw new Error(`kty ${jwk.kty}`);
        if (catalog.environment.SECRET_KEY !== secrets.SECRET_KEY) throw new Error('SECRET_KEY changed on the way');
        checks.push('compose');
      } catch (e) {
        fail(name, 'secrets through .env', String(e));
      }
    }
  }

  if (files['nginx/elvira.conf'] && tools.nginx) {
    const r = sh('docker', [
      'run', '--rm',
      '-v', `${path.join(dir, 'nginx/elvira.conf')}:/etc/nginx/conf.d/default.conf:ro`,
      NGINX_IMAGE, 'nginx', '-t', '-q',
    ]);
    if (!r.ok) fail(name, 'nginx -t', r.err);
    else checks.push('nginx');
  }

  if (files['evilflowers.yaml'] && tools.kubeconform) {
    const r = sh('docker', [
      'run', '--rm',
      '-v', `${path.join(dir, 'evilflowers.yaml')}:/evilflowers.yaml:ro`,
      KUBECONFORM_IMAGE, '-strict', '-summary', '/evilflowers.yaml',
    ]);
    if (!r.ok) fail(name, 'kubeconform -strict', r.out + r.err);
    else checks.push(`kubeconform (${r.out.trim()})`);
  }

  console.log(`ok   ${name}: ${checks.join(', ') || 'nothing to check'}`);
}

console.log(`\n${failures ? `${failures} failure(s)` : 'all passed'}; files in ${root}`);
process.exit(failures ? 1 : 0);
