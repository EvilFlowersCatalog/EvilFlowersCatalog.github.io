#!/usr/bin/env node
/**
 * elvira-deploy: writes an ELVIRA installation directory.
 *
 *   elvira-deploy --out ./elvira                       defaults (Compose, stable, nginx on the host)
 *   elvira-deploy --settings site.json --out ./elvira  your choices, same keys as the web page
 *   elvira-deploy --set channel=develop --set search=bundled --out ./elvira
 *   elvira-deploy --settings elvira-deploy.json --out ./elvira   regenerate a previous run
 *   elvira-deploy --defaults                           print the settings keys and their defaults
 *
 * Secrets are made on this machine with WebCrypto. An existing .env is never overwritten
 * unless --force is given, so re-running after a settings change keeps your secrets.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {webcrypto} from 'node:crypto';

import {DEFAULTS, generate, generateSecrets, VERSION} from '../src/index.js';

function usage(code = 0) {
  const text = readFileSync(new URL(import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.startsWith(' * ') || l === ' *')
    .map((l) => l.slice(3))
    .join('\n');
  (code ? console.error : console.log)(`elvira-deploy ${VERSION}\n${text}`);
  process.exit(code);
}

function parseValue(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return raw;
}

function parseArgs(argv) {
  const args = {set: {}, out: null, settings: null, force: false, defaults: false};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) usage(2);
      return argv[++i];
    };
    if (a === '--out' || a === '-o') args.out = next();
    else if (a === '--settings' || a === '-s') args.settings = next();
    else if (a === '--set') {
      const [k, ...v] = next().split('=');
      if (!(k in DEFAULTS)) {
        console.error(`elvira-deploy: unknown setting "${k}" (see --defaults)`);
        process.exit(2);
      }
      args.set[k] = parseValue(v.join('='));
    } else if (a === '--force') args.force = true;
    else if (a === '--defaults') args.defaults = true;
    else if (a === '--help' || a === '-h') usage(0);
    else {
      console.error(`elvira-deploy: unknown argument "${a}"`);
      usage(2);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.defaults) {
  console.log(JSON.stringify(DEFAULTS, null, 2));
  process.exit(0);
}
if (!args.out) usage(2);

const loaded = args.settings ? JSON.parse(readFileSync(args.settings, 'utf8')) : {};
// Plain settings, or the elvira-deploy.json a previous run (or the web page) wrote.
const fromFile = loaded.version && loaded.settings ? loaded.settings : loaded;
for (const k of Object.keys(fromFile)) {
  if (!(k in DEFAULTS)) console.error(`elvira-deploy: ignoring unknown setting "${k}"`);
}
const partial = {...fromFile, ...args.set};

const secrets = await generateSecrets(webcrypto);
const {settings, notes, plan, files} = generate(partial, secrets);

const out = path.resolve(args.out);
let kept = false;
for (const [name, text] of Object.entries(files)) {
  const target = path.join(out, name);
  if (name === '.env' && existsSync(target) && !args.force) {
    kept = true;
    continue;
  }
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, text, {mode: name === '.env' ? 0o600 : 0o644});
}
writeFileSync(path.join(out, 'elvira-deploy.json'), `${JSON.stringify({version: VERSION, settings}, null, 2)}\n`);

for (const n of notes) console.error(`note: ${n}`);
for (const w of plan.warnings) console.error(`warning: ${w}`);
console.log(
  `elvira-deploy ${VERSION}: ${plan.services.length} containers, wrote ${Object.keys(files)
    .filter((f) => !(kept && f === '.env'))
    .join(', ')}, elvira-deploy.json to ${out}`,
);
if (kept) console.log('Kept the existing .env (use --force to replace it and its secrets).');
console.log(`Next: ${path.join(out, 'NEXT-STEPS.md')}`);
