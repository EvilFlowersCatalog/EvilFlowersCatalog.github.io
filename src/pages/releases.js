import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {FaGithub, FaRss, FaBullhorn, FaArrowRight} from 'react-icons/fa';

import data from '@site/src/data/releases.json';
import {announcementFor, latestPerRepo, REPO_ROLES} from '@site/src/data/announcements';
import {ORG_URL} from '@site/src/data/ecosystem';
import styles from './releases.module.css';

const fmtDay = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const fmtMonth = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function day(iso) {
  return fmtDay.format(new Date(iso));
}

// "0.15.0 (The Library Reads Back)" → "The Library Reads Back"; "v0.7.9" → null.
function titleBeyondTag(r) {
  let rest = (r.name ?? '').trim();
  const bare = r.tag.replace(/^v/, '');
  for (const prefix of [r.tag, `v${bare}`, bare]) {
    if (rest.startsWith(prefix)) {
      rest = rest.slice(prefix.length).trim();
      break;
    }
  }
  rest = rest.replace(/^\((.*)\)$/, '$1').trim();
  return rest || null;
}

function Title({r}) {
  const extra = titleBeyondTag(r);
  return (
    <>
      <span className={styles.tag}>{r.tag}</span>
      {extra && <span className={styles.name}>{extra}</span>}
      {r.prerelease && <span className={styles.pre}>pre-release</span>}
    </>
  );
}

function LatestCard({r}) {
  const post = announcementFor(r);
  return (
    <article className={styles.latestCard}>
      <span className={styles.repoRole}>{REPO_ROLES[r.repo] ?? 'Repository'}</span>
      <h3 className={styles.repoName}>{r.repo}</h3>
      <p className={styles.latestTitle}>
        <Title r={r} />
      </p>
      <p className={styles.date}>{day(r.date)}</p>
      <div className={styles.links}>
        <a href={r.url} target="_blank" rel="noopener noreferrer">
          <FaGithub aria-hidden="true" /> Release notes
        </a>
        {post && (
          <Link to={post}>
            <FaBullhorn aria-hidden="true" /> Announcement
          </Link>
        )}
      </div>
    </article>
  );
}

export default function ReleasesPage() {
  const releases = data.releases;
  const repos = useMemo(() => latestPerRepo(releases), [releases]);
  const [filter, setFilter] = useState(null);

  const months = useMemo(() => {
    const out = [];
    for (const r of releases) {
      if (filter && r.repo !== filter) continue;
      const key = r.date.slice(0, 7);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(r);
      else out.push({key, label: fmtMonth.format(new Date(r.date)), items: [r]});
    }
    return out;
  }, [releases, filter]);

  return (
    <Layout
      title="Releases"
      description="Every release of every public ELVIRA repository, newest first, with links to the release notes on GitHub.">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Releases</h1>
          <p className="e-lede e-measure">
            Releases of the public repositories in the{' '}
            <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
              EvilFlowersCatalog
            </a>{' '}
            organization, collected from GitHub every day. The notes live on
            GitHub; releases that change something for users also get a post
            in <Link to="/news">News</Link>.
          </p>
          <div className={styles.heroLinks}>
            <Link to="/news">
              <FaBullhorn aria-hidden="true" /> News
            </Link>
            <a href="/news/rss.xml">
              <FaRss aria-hidden="true" /> RSS feed
            </a>
            <Link to="/docs/releases">
              How we release <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {releases.length === 0 ? (
          <p>
            The release list could not be loaded when this site was built. See{' '}
            <a href={ORG_URL}>the repositories on GitHub</a>.
          </p>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Latest from each project</h2>
              <div className={styles.latestGrid}>
                {repos.map((r) => (
                  <LatestCard key={r.repo} r={r} />
                ))}
              </div>
              <p className={styles.note}>
                The portal, the digitalizer and the workers do not tag releases
                yet. <Link to="/docs/releases">Releases and versions</Link>{' '}
                explains which repositories do and how we plan to tag the rest.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>All releases</h2>
              <div className={styles.filters} role="group" aria-label="Filter by repository">
                <button
                  type="button"
                  className={clsx(styles.filter, !filter && styles.filterOn)}
                  aria-pressed={!filter}
                  onClick={() => setFilter(null)}>
                  All
                </button>
                {repos.map((r) => (
                  <button
                    key={r.repo}
                    type="button"
                    className={clsx(styles.filter, filter === r.repo && styles.filterOn)}
                    aria-pressed={filter === r.repo}
                    onClick={() => setFilter(r.repo)}>
                    {REPO_ROLES[r.repo] ?? r.repo}
                  </button>
                ))}
              </div>

              {months.map((m) => (
                <div key={m.key} className={styles.month}>
                  <h3 className={styles.monthTitle}>{m.label}</h3>
                  <ul className={styles.list}>
                    {m.items.map((r) => {
                      const post = announcementFor(r);
                      return (
                        <li key={`${r.repo}@${r.tag}`} className={styles.row}>
                          <span className={styles.rowDate}>{day(r.date)}</span>
                          <span className={styles.rowRepo}>{r.repo}</span>
                          <span className={styles.rowTitle}>
                            <Title r={r} />
                          </span>
                          <span className={styles.rowLinks}>
                            {post && (
                              <Link to={post} aria-label={`Announcement of ${r.repo} ${r.tag}`}>
                                <FaBullhorn aria-hidden="true" /> Post
                              </Link>
                            )}
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Release notes of ${r.repo} ${r.tag} on GitHub`}>
                              <FaGithub aria-hidden="true" /> Notes
                            </a>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {data.generatedAt && (
                <p className={styles.note}>
                  Collected from GitHub on {day(data.generatedAt)}.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
