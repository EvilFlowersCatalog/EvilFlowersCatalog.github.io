import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const SOURCE =
  'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.github.io/blob/main/diagrams';

/**
 * A PlantUML diagram rendered by `npm run diagrams` into static/diagrams/.
 * The ELVIRA theme draws on white, so the figure keeps a white panel in dark
 * mode too. Click the picture to open it full size.
 */
export default function Diagram({name, alt, caption}) {
  const src = useBaseUrl(`/diagrams/${name}.svg`);
  return (
    <figure className={styles.figure}>
      <a href={src} target="_blank" rel="noopener noreferrer" className={styles.panel}>
        <img src={src} alt={alt} loading="lazy" />
      </a>
      <figcaption className={styles.caption}>
        {caption && <span>{caption} </span>}
        <a href={`${SOURCE}/${name}.puml`} target="_blank" rel="noopener noreferrer">
          PlantUML source
        </a>
      </figcaption>
    </figure>
  );
}
