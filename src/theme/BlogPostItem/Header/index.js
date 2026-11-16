import React from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import styles from './styles.module.css';

const fmtDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function Author({author}) {
  const name = author.page?.permalink ? (
    <a href={author.page.permalink}>{author.name}</a>
  ) : (
    author.name
  );
  return (
    <span>
      {name}
      {author.title && <span className={styles.role}>, {author.title}</span>}
    </span>
  );
}

// A post's title with its date and authors on one quiet line underneath.
// List pages render NewsIndex instead, so this only runs on a post page.
export default function BlogPostItemHeader() {
  const {metadata} = useBlogPost();
  const {title, date, authors} = metadata;
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.meta}>
        <time dateTime={date}>{fmtDate.format(new Date(date))}</time>
        {authors.map((a) => (
          <React.Fragment key={a.key ?? a.name}>
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
            <Author author={a} />
          </React.Fragment>
        ))}
      </p>
    </header>
  );
}
