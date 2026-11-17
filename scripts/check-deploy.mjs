#!/usr/bin/env node
/**
 * Checks what /deploy hands out, for a set of choices, against EvilFlowersCatalog/deploy itself:
 *
 *   - the trimmed compose.yml resolves (docker compose config) to exactly the repository's
 *     compose.yml with the same profiles, apart from the profiles themselves
 *   - every file a container mounts is in the download (or is a directory Docker creates)
 *   - the nginx sites pass nginx -t; the Kubernetes manifest passes kubeconform -strict
 *
 * Needs Docker (pulls only nginx and kubeconform). Run before every build: a change on
 * deploy/main that the page cannot handle fails here instead of on readers' servers.
 *
 * Usage: node scripts/check-deploy.mjs
 */
import {spawnSync} from 'node:child_process';
import {cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {webcrypto} from 'node:crypto';

import {assemble} from '../src/components/Configurator/assemble.js';
import {resolve} from '../src/components/Configurator/options.js';
import {generateSecrets} from '../src/components/Configurator/secrets.js';

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocks = JSON.parse(readFileSync(path.join(site, 'src/data/deploy-blocks.json'), 'utf8'));
const work = mkdtempSync(path.join(tmpdir(), 'elvira-check-'));
const secrets = await generateSecrets(webcrypto);

const CASES = {
  default: {},
  develop: {channel: 'develop'},
  everything: {
    channel: 'develop', lending: true, ocr: true, search: 'bundled', extraction: true,
    assistant: 'bundled', mail: 'catcher', backup: true, telemetry: 'bundled',
  },
  'own-services': {database: 'external', redis: 'external', mail: 'smtp', portal: false},
  'plain-docker': {target: 'docker'},
  k8s: {target: 'k8s', channel: 'develop', lending: true, extraction: true, storageClass: 'longhorn'},
};

let failures = 0;
function fail(name, what, detail = '') {
  failures += 1;
  console.log(`FAIL ${name}: ${what}${detail ? `\n${String(detail).trim().split('\n').slice(0, 12).join('\n')}` : ''}`);
}
function run(cmd, args, input) {
  const r = spawnSync(cmd, args, {encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024});
  return {ok: r.status === 0, out: r.stdout ?? '', err: (r.stderr ?? '') + (r.error?.message ?? '')};
}
function write(dir, files) {
  for (const f of files) {
    const target = path.join(dir, f.name);
    if (f.name.endsWith('/')) mkdirSync(target, {recursive: true});
    else {
      mkdirSync(path.dirname(target), {recursive: true});
      writeFileSync(target, f.text, {mode: f.mode});
    }
  }
}

/** docker compose config as JSON, with the directory and the profile bookkeeping taken out. */
function composeConfig(dir, profiles) {
  const r = run('docker', ['compose', '--project-directory', dir, ...profiles.flatMap((p) => ['--profile', p]), 'config', '--format', 'json']);
  if (!r.ok) return {error: r.err};
  const config = JSON.parse(r.out.split(dir).join('<dir>'));
  for (const service of Object.values(config.services)) {
    delete service.profiles;
    for (const [dep, spec] of Object.entries(service.depends_on ?? {})) {
      if (!(dep in config.services)) delete service.depends_on[dep];
      else delete spec.required;
    }
    if (service.depends_on && !Object.keys(service.depends_on).length) delete service.depends_on;
  }
  return {services: config.services, volumes: config.volumes ?? {}};
}

for (const [name, partial] of Object.entries(CASES)) {
  const s = resolve(partial);
  const {files, plan} = assemble(s, secrets, blocks);
  const dir = path.join(work, name);
  write(dir, files);
  const names = new Set(files.map((f) => f.name.replace(/\/$/, '')));
  const done = [];

  if (s.target === 'compose') {
    // The repository's compose.yml, with the same .env and files, and the same profiles on.
    const repo = path.join(work, `${name}-repo`);
    write(repo, files.filter((f) => f.name !== 'compose.yml'));
    writeFileSync(path.join(repo, 'compose.yml'), blocks.files['compose.yml']);
    const ours = composeConfig(dir, []);
    const theirs = composeConfig(repo, plan.profiles);
    if (ours.error || theirs.error) fail(name, 'docker compose config', ours.error ?? theirs.error);
    else if (JSON.stringify(ours) !== JSON.stringify(theirs)) {
      fail(name, 'trimmed compose.yml differs from the repository with the same profiles',
        `ours:   ${Object.keys(ours.services).sort().join(',')} / ${Object.keys(ours.volumes).sort().join(',')}\ntheirs: ${Object.keys(theirs.services).sort().join(',')} / ${Object.keys(theirs.volumes).sort().join(',')}`);
    } else done.push(`compose = repository (${Object.keys(ours.services).length} services)`);

    // Every bind mount points at a file in the download, or at a directory Docker makes.
    for (const service of Object.values(ours.services ?? {})) {
      for (const v of service.volumes ?? []) {
        if (v.type !== 'bind') continue;
        const src = v.source.replace('<dir>/', '');
        if (!names.has(src) && src !== 'static') fail(name, `mount ${src} is not in the download`);
      }
    }
  }

  const sites = files.filter((f) => f.name.startsWith('nginx/'));
  if (sites.length) {
    const mounts = sites.flatMap((f) => ['-v', `${path.join(dir, f.name)}:/etc/nginx/conf.d/${path.basename(f.name)}:ro`]);
    const r = run('docker', ['run', '--rm', ...mounts, 'nginx:1.29-alpine', 'nginx', '-t', '-q']);
    if (r.ok) done.push('nginx -t');
    else fail(name, 'nginx -t', r.err);
  }

  const manifest = files.find((f) => f.name === 'elvira.yaml');
  if (manifest) {
    const r = run('docker', ['run', '--rm', '-i', 'ghcr.io/yannh/kubeconform:v0.7.0', '-strict', '-summary', '-'], manifest.text);
    if (r.ok) done.push(r.out.trim().replace('Summary: ', 'kubeconform: '));
    else fail(name, 'kubeconform', r.out + r.err);
  }

  if (s.target === 'docker') {
    const r = run('sh', ['-n', path.join(dir, 'docker/run.sh')]);
    if (r.ok) done.push('run.sh syntax');
    else fail(name, 'docker/run.sh', r.err);
  }

  console.log(`ok   ${name}: ${files.map((f) => f.name).join(' ')}\n     ${done.join('; ')}`);
}

console.log(failures ? `\n${failures} failure(s)` : '\nall passed');
process.exit(failures ? 1 : 0);
