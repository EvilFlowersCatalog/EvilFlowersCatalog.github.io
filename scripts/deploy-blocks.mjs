#!/usr/bin/env node
/**
 * Copies the files the /deploy page builds from out of EvilFlowersCatalog/deploy (the submodule
 * at packages/elvira-deploy) into src/data/deploy-blocks.json: compose.yml, .env.example, the
 * nginx and readium templates, docker/run.sh and the Kubernetes manifests.
 *
 * The file is committed, so `npm start` works without the submodule. The deploy workflow runs
 * this after checking out the head of deploy/main, so the page always matches the repository.
 *
 * Usage: npm run deploy-blocks
 */
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.join(site, 'packages/elvira-deploy');
const out = path.join(site, 'src/data/deploy-blocks.json');

if (!existsSync(path.join(repo, 'compose.yml'))) {
  console.error('deploy-blocks: no packages/elvira-deploy checkout (git submodule update --init); keeping the committed copy');
  process.exit(0);
}

const files = [
  'compose.yml',
  '.env.example',
  'nginx/catalog.conf.tmpl',
  'nginx/portal.conf.tmpl',
  'readium/config.yaml.tmpl',
  'readium/supervisord.conf',
  'docker/run.sh',
  'k8s/base/catalog.yaml',
  ...readdirSync(path.join(repo, 'k8s/components'))
    .sort()
    .map((c) => `k8s/components/${c}/${c}.yaml`),
];

const commit = spawnSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], {encoding: 'utf8'}).stdout.trim();
const blocks = {
  source: `EvilFlowersCatalog/deploy@${commit}`,
  files: Object.fromEntries(files.map((f) => [f, readFileSync(path.join(repo, f), 'utf8')])),
};
writeFileSync(out, `${JSON.stringify(blocks, null, 2)}\n`);
console.log(`deploy-blocks: ${files.length} files from ${blocks.source} -> src/data/deploy-blocks.json`);
