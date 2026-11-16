import React from 'react';

import {DEPLOYMENTS} from '@site/src/data/ecosystem';
import releasesData from '@site/src/data/releases.json';
import styles from './styles.module.css';

const fmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * ELVIRA described the way a library describes a book: as a catalog card.
 * Every field is a fact from src/data; the latest release comes from
 * releases.json, so the card stays current without edits.
 */
export default function CatalogCard() {
  const catalog = releasesData.releases.find((r) => r.repo === 'EvilFlowersCatalog');
  const stu = DEPLOYMENTS.find((d) => d.short === 'STU');
  return (
    <figure className={styles.card} aria-label="ELVIRA at a glance">
      <header className={styles.head}>
        <span className={styles.title}>ELVIRA</span>
        <span className={styles.kind}>since {stu.since}</span>
      </header>
      <dl className={styles.fields}>
        <dt>Inside</dt>
        <dd>catalog, web reader, e-book lending, search, an assistant</dd>
        <dt>Works with</dt>
        <dd>Thorium and other OPDS apps, Calibre</dd>
        <dt>Code</dt>
        <dd>
          <a href="https://github.com/EvilFlowersCatalog">open source on GitHub</a>
        </dd>
        <dt>Licence</dt>
        <dd>MIT, BSD-3-Clause</dd>
        {catalog && (
          <>
            <dt>Latest</dt>
            <dd>
              <a href={catalog.url} target="_blank" rel="noopener noreferrer">
                catalog {catalog.tag}
              </a>
              , {fmt.format(new Date(catalog.date))}
            </dd>
          </>
        )}
      </dl>
      <footer className={styles.foot}>
        <span className={styles.hole} aria-hidden="true" />
      </footer>
    </figure>
  );
}
