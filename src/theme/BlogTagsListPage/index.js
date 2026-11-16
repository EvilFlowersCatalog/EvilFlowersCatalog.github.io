import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import SearchMetadata from '@theme/SearchMetadata';
import {FaArrowLeft} from 'react-icons/fa';
import NewsHeader from '@site/src/components/NewsIndex/Header';
import styles from './styles.module.css';

export default function BlogTagsListPage({tags, sidebar}) {
  const sorted = [...tags].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagsListPage)}>
      <PageMetadata title="News tags" />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <NewsHeader
          title="Tags"
          links={
            <Link to="/news">
              <FaArrowLeft aria-hidden="true" /> All news
            </Link>
          }
        />
        <ul className={styles.list}>
          {sorted.map((t) => (
            <li key={t.permalink} className={styles.row}>
              <Link to={t.permalink} className={styles.label}>
                {t.label}
              </Link>
              <span className={styles.count}>
                {t.count} {t.count === 1 ? 'post' : 'posts'}
              </span>
              {t.description && <p className={styles.description}>{t.description}</p>}
            </li>
          ))}
        </ul>
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
