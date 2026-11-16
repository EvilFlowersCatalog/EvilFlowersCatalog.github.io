import React from 'react';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

/**
 * A picture with a caption, for what markdown cannot say: a separate
 * screenshot for dark mode, or a caption with links or emphasis.
 *
 *   import shot from './sync-light.png';
 *   import shotDark from './sync-dark.png';
 *
 *   <Figure src={shot} dark={shotDark} alt="What the picture shows">
 *     Caption, may contain **markdown**.
 *   </Figure>
 *
 * Plain pictures need no component: ![alt](./picture.png "Caption").
 */
export default function Figure({src, dark, alt, caption, children}) {
  if (!alt || !alt.trim()) {
    throw new Error(`<Figure src="${src}"> has no alt text.`);
  }
  const text = children ?? caption;
  return (
    <figure className={styles.figure}>
      <a href={src} target="_blank" rel="noopener noreferrer" className={styles.frame}>
        {dark ? (
          <ThemedImage alt={alt} sources={{light: src, dark}} loading="lazy" decoding="async" />
        ) : (
          <img src={src} alt={alt} loading="lazy" decoding="async" />
        )}
      </a>
      {text && <figcaption className={styles.caption}>{text}</figcaption>}
    </figure>
  );
}

/** Two pictures side by side (one above the other on a phone). */
export function Figures({children}) {
  return <div className={styles.row}>{children}</div>;
}
