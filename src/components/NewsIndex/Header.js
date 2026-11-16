import React from 'react';
import styles from './styles.module.css';

/** Page heading of the News list pages: a title, a lede and a row of links. */
export default function NewsHeader({title, children, links}) {
  return (
    <header className={styles.header}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {children && <div className="e-lede e-measure">{children}</div>}
      {links && <p className={styles.headerLinks}>{links}</p>}
    </header>
  );
}
