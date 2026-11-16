import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogPostItems from '@theme/BlogPostItems';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import {FaArrowLeft, FaTags} from 'react-icons/fa';
import NewsHeader from '@site/src/components/NewsIndex/Header';

export default function BlogTagsPostsPage({tag, items, sidebar, listMetadata}) {
  const title = `Posts tagged “${tag.label}”`;
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagPostListPage)}>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
      <BlogLayout sidebar={sidebar}>
        {tag.unlisted && <Unlisted />}
        <NewsHeader
          title={title}
          links={
            <>
              <Link to="/news">
                <FaArrowLeft aria-hidden="true" /> All news
              </Link>
              <Link to={tag.allTagsPath}>
                <FaTags aria-hidden="true" /> All tags
              </Link>
            </>
          }>
          {tag.description && <p>{tag.description}</p>}
        </NewsHeader>
        <BlogPostItems items={items} />
        <BlogListPaginator metadata={listMetadata} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
