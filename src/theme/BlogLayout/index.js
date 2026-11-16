import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

// News pages without the "Recent posts" sidebar: the list page already is
// that list. A post keeps its table of contents on the right.
export default function BlogLayout(props) {
  const {sidebar, toc, children, ...layoutProps} = props;
  return (
    <Layout {...layoutProps}>
      <div className={clsx(styles.page, toc && styles.withToc)}>
        <main className={styles.main}>{children}</main>
        {toc && <aside className={styles.toc}>{toc}</aside>}
      </div>
    </Layout>
  );
}
