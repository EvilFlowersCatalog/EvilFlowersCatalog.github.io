import React from 'react';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {FaArrowLeft} from 'react-icons/fa';
import styles from './styles.module.css';

// Under a post: its tags and the way back to the list.
export default function BlogPostItemFooter() {
  const {metadata} = useBlogPost();
  const {tags} = metadata;
  return (
    <footer className={styles.footer}>
      {tags.length > 0 && (
        <p className={styles.tags}>
          Filed under{' '}
          {tags.map((t, i) => (
            <React.Fragment key={t.permalink}>
              {i > 0 && ', '}
              <Link to={t.permalink}>{t.label}</Link>
            </React.Fragment>
          ))}
        </p>
      )}
      <Link to="/news" className={styles.back}>
        <FaArrowLeft aria-hidden="true" /> All news
      </Link>
    </footer>
  );
}
