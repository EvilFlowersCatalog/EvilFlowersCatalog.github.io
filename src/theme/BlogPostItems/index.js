import React from 'react';
import NewsIndex from '@site/src/components/NewsIndex';

// List pages (/news, /news/tags/*) show an index of posts, not their excerpts.
// `image` is the post's cover: front matter `image: ./cover.jpg`, resolved by
// Docusaurus into assets.image. It is also the post's social card.
export default function BlogPostItems({items}) {
  return (
    <NewsIndex
      posts={items.map(({content}) => ({
        ...content.metadata,
        image: content.assets?.image ?? content.frontMatter?.image ?? null,
      }))}
    />
  );
}
