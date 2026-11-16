import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import {FaRss, FaTags} from 'react-icons/fa';
import NewsHeader from '@site/src/components/NewsIndex/Header';

export default function BlogListPage(props) {
  const {metadata, items, sidebar} = props;
  const {blogTitle, blogDescription} = metadata;
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
      <BlogListPageStructuredData {...props} />
      <BlogLayout sidebar={sidebar}>
        <NewsHeader
          title={blogTitle}
          links={
            <>
              <a href="/news/rss.xml">
                <FaRss aria-hidden="true" /> RSS feed
              </a>
              <a href="/news/atom.xml">
                <FaRss aria-hidden="true" /> Atom feed
              </a>
              <Link to="/news/tags">
                <FaTags aria-hidden="true" /> Tags
              </Link>
            </>
          }>
          <p>
            Posts about releases that change something for readers, librarians
            or the people who run ELVIRA, and about the project itself. Every
            release, with or without a post, is listed on{' '}
            <Link to="/releases">Releases</Link>.
          </p>
        </NewsHeader>
        <BlogPostItems items={items} />
        <BlogListPaginator metadata={metadata} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
