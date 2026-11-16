import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const fmtDay = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const fmtMonth = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

// Posts arrive newest first; keep that order and start a group per month.
function byMonth(posts) {
  const out = [];
  for (const post of posts) {
    const key = post.date.slice(0, 7);
    const last = out[out.length - 1];
    if (last && last.key === key) last.posts.push(post);
    else out.push({key, label: fmtMonth.format(new Date(post.date)), posts: [post]});
  }
  return out;
}

function Tags({tags}) {
  if (!tags?.length) return null;
  return (
    <p className={styles.tags}>
      {tags.map((t, i) => (
        <React.Fragment key={t.permalink}>
          {i > 0 && ', '}
          <Link to={t.permalink}>{t.label}</Link>
        </React.Fragment>
      ))}
    </p>
  );
}

/**
 * The list of News posts: grouped by month, one ruled row per post.
 * `posts` is a list of blog post metadata objects (title, permalink, date,
 * description, tags, and optionally `image`, the cover URL), newest first.
 */
export default function NewsIndex({posts}) {
  if (!posts.length) {
    return <p className="e-muted">No posts yet.</p>;
  }
  return (
    <div className={styles.index}>
      {byMonth(posts).map((m) => (
        <section key={m.key} className={styles.month} aria-labelledby={`m-${m.key}`}>
          <h2 id={`m-${m.key}`} className={styles.monthTitle}>
            {m.label}
          </h2>
          <ol className={styles.list}>
            {m.posts.map((p) => (
              <li key={p.permalink} className={styles.row}>
                <time className={styles.date} dateTime={p.date}>
                  {fmtDay.format(new Date(p.date))}
                </time>
                <div className={styles.body}>
                  <h3 className={styles.title}>
                    <Link to={p.permalink}>{p.title}</Link>
                  </h3>
                  {p.description && <p className={styles.description}>{p.description}</p>}
                  {p.image && (
                    // The title above is the link; the picture repeats it
                    // for the mouse only, so it is hidden from screen readers.
                    <Link
                      to={p.permalink}
                      className={styles.cover}
                      tabIndex={-1}
                      aria-hidden="true">
                      <img src={p.image} alt="" loading="lazy" decoding="async" />
                    </Link>
                  )}
                  <Tags tags={p.tags} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
