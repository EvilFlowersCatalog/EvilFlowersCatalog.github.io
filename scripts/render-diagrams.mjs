#!/usr/bin/env node
/**
 * Renders every diagrams/*.puml to static/diagrams/<slug>.svg with the local
 * `plantuml` (Homebrew: `brew install plantuml`; Debian: `apt install plantuml graphviz`).
 *
 * The sources follow the ELVIRA diagram kit: diagrams/elvira.iuml is a verbatim
 * copy of the theme from evilflowers-knowledge, and a diagram never styles itself.
 * The SVGs are committed, so building the site needs neither Java nor PlantUML.
 *
 * Usage: npm run diagrams            (all)
 *        npm run diagrams -- <slug>  (one)
 */

import {spawnSync} from 'node:child_process';
import {readdirSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'diagrams');
const out = path.join(root, 'static', 'diagrams');
mkdirSync(out, {recursive: true});

const only = process.argv.slice(2);
const files = readdirSync(src)
  .filter((f) => f.endsWith('.puml'))
  .filter((f) => only.length === 0 || only.includes(path.basename(f, '.puml')))
  .map((f) => path.join(src, f));

if (files.length === 0) {
  console.error('render-diagrams: no matching .puml in diagrams/');
  process.exit(1);
}

const res = spawnSync(
  'plantuml',
  ['-tsvg', '-charset', 'UTF-8', '-failfast2', '-o', out, ...files],
  {stdio: 'inherit', env: {...process.env, PLANTUML_LIMIT_SIZE: '8192'}},
);
if (res.error) {
  console.error(`render-diagrams: cannot run plantuml (${res.error.message})`);
  process.exit(1);
}
if (res.status !== 0) process.exit(res.status ?? 1);
console.log(`render-diagrams: ${files.length} diagram(s) -> static/diagrams/`);
