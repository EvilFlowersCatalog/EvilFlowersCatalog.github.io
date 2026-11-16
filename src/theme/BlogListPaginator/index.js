import React from 'react';
import BlogListPaginator from '@theme-original/BlogListPaginator';

// Render nothing when everything fits on one page; the original draws an
// empty, ruled <nav>.
export default function BlogListPaginatorWrapper(props) {
  const {previousPage, nextPage} = props.metadata;
  if (!previousPage && !nextPage) return null;
  return <BlogListPaginator {...props} />;
}
