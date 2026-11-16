#!/usr/bin/env node
/**
 * Collects the GitHub releases of every public, non-fork repository in the
 * EvilFlowersCatalog organization and writes them to src/data/releases.json.
 *
 * The /releases page and the "Latest releases" strip on the home page read that
 * file. It is committed, so `npm start` and a build without network still work:
 * when GitHub cannot be reached, the script keeps the old file and exits 0.
 *
 * Only metadata is stored (repository, tag, title, date, URL). Release notes stay
 * on GitHub; the site links to them.
 *
 * Usage: npm run releases
 * Uses GITHUB_TOKEN, or `gh auth token`, to avoid the 60 requests/hour limit
 * for anonymous calls.
 */

import {readFile, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const ORG = 'EvilFlowersCatalog';
const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'releases.json',
);

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'elvira.digital-release-fetcher',
};
// CI passes GITHUB_TOKEN. Locally, fall back to the GitHub CLI's token if it is
// signed in; private repositories stay out because the listing asks for public ones.
function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  const gh = spawnSync('gh', ['auth', 'token'], {encoding: 'utf8'});
  return gh.status === 0 ? gh.stdout.trim() : '';
}
const auth = token();
if (auth) headers.Authorization = `Bearer ${auth}`;

async function get(url) {
  const res = await fetch(url, {headers});
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function all(url) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const batch = await get(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

async function publicRepos() {
  // type=public keeps private repositories out even when the token can see them.
  const repos = await all(`https://api.github.com/orgs/${ORG}/repos?type=public`);
  return repos.filter((r) => !r.private && !r.fork);
}

async function main() {
  const repos = await publicRepos();
  const releases = [];
  for (const repo of repos) {
    const items = await all(`https://api.github.com/repos/${ORG}/${repo.name}/releases`);
    for (const r of items) {
      if (r.draft || !r.published_at) continue;
      releases.push({
        repo: repo.name,
        tag: r.tag_name,
        name: r.name && r.name.trim() ? r.name.trim() : r.tag_name,
        url: r.html_url,
        date: r.published_at,
        prerelease: r.prerelease,
      });
    }
  }
  releases.sort((a, b) => b.date.localeCompare(a.date));

  const data = {generatedAt: new Date().toISOString(), releases};
  await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);

  const byRepo = new Map();
  for (const r of releases) byRepo.set(r.repo, (byRepo.get(r.repo) ?? 0) + 1);
  console.log(
    `releases.json: ${releases.length} releases from ${byRepo.size} of ${repos.length} public repositories`,
  );
  for (const [repo, n] of byRepo) console.log(`  ${repo}: ${n}`);
}

main().catch(async (err) => {
  let kept = 'no previous file';
  try {
    const old = JSON.parse(await readFile(OUT, 'utf8'));
    kept = `kept the snapshot from ${old.generatedAt}`;
  } catch {
    await writeFile(OUT, `${JSON.stringify({generatedAt: null, releases: []}, null, 2)}\n`);
    kept = 'wrote an empty snapshot';
  }
  console.warn(`fetch-releases: ${err.message}; ${kept}.`);
});
