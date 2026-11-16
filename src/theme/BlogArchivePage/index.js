import React from 'react';
import Link from '@docusaurus/Link';
import {PageMetadata} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import {FaArrowLeft} from 'react-icons/fa';
import NewsIndex from '@site/src/components/NewsIndex';
import NewsHeader from '@site/src/components/NewsIndex/Header';

export default function BlogArchive({archive}) {
  return (
    <>
      <PageMetadata title="News archive" description="Every post in ELVIRA News, newest first." />
      <BlogLayout>
        <NewsHeader
          title="News archive"
          links={
            <Link to="/news">
              <FaArrowLeft aria-hidden="true" /> Latest news
            </Link>
          }>
          <p>Every post, newest first.</p>
        </NewsHeader>
        <NewsIndex posts={archive.blogPosts.map((p) => p.metadata)} />
      </BlogLayout>
    </>
  );
}
