/**
 * Releases that have a post in /news. Key: `<repository>@<tag>`.
 * Add a line here when you publish an announcement, and the /releases page
 * and the home page link the release to it.
 */
export const ANNOUNCEMENTS = {
  'EvilFlowersCatalog@0.15.0': '/news/catalog-0.15.0',
  'calibre-evilflowers@2.1.0': '/news/calibre-plugin-2.1',
};

/** What each releasing repository is, in a few words. */
export const REPO_ROLES = {
  EvilFlowersCatalog: 'Catalog server',
  EvilFlowersViewer: 'PDF reader',
  'calibre-evilflowers': 'Calibre plugin',
  'evilflowers-postgresql': 'PostgreSQL image',
};

export function announcementFor(release) {
  return ANNOUNCEMENTS[`${release.repo}@${release.tag}`];
}

/**
 * The newest release of each repository, in the order of REPO_ROLES (most
 * user-facing first), then any other repository by date.
 */
export function latestPerRepo(releases) {
  const latest = new Map();
  for (const r of releases) if (!latest.has(r.repo)) latest.set(r.repo, r);
  const order = Object.keys(REPO_ROLES);
  const rank = (repo) => (order.includes(repo) ? order.indexOf(repo) : order.length);
  return [...latest.values()].sort((a, b) => rank(a.repo) - rank(b.repo));
}
