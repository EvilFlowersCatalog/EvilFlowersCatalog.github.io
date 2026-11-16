import React from 'react';
import styles from './styles.module.css';

/**
 * Markdown images, `![alt](./picture.png "Caption")`, everywhere in MDX
 * (registered in src/theme/MDXComponents). The title becomes a visible
 * caption and the picture links to its full-size file.
 *
 * Markdown puts an image inside a <p>, so this returns only <span>, <a> and
 * <img>; a <figure> or <div> here would be invalid HTML.
 */
// Docusaurus turns a local markdown image into JSX with the alt text
// HTML-escaped, so quotes arrive as literal "&quot;". Undo that.
function unescape(text) {
  return text
    ?.replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export default function Img({src, alt: rawAlt, title: rawTitle, ...rest}) {
  const alt = unescape(rawAlt);
  const title = unescape(rawTitle);
  if (!alt || !alt.trim()) {
    throw new Error(
      `Image ${src} has no alt text. Write what the picture shows: ![What it shows](${src}).`,
    );
  }
  return (
    <span className={styles.figure}>
      <a href={src} target="_blank" rel="noopener noreferrer" className={styles.frame}>
        <img src={src} alt={alt} loading="lazy" decoding="async" {...rest} />
      </a>
      {title && <span className={styles.caption}>{title}</span>}
    </span>
  );
}
