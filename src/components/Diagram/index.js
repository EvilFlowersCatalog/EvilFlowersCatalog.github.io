import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import figure from '@site/src/components/Figure/styles.module.css';
import styles from './styles.module.css';

const SOURCE =
  'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.github.io/blob/main/diagrams';

/**
 * A PlantUML diagram rendered by `npm run diagrams` into static/diagrams/.
 * Same frame and caption as <Figure>. The ELVIRA theme draws on white, so the
 * diagram keeps a white panel in dark mode too. Click it to open it full size.
 */
export default function Diagram({name, alt, caption}) {
  const src = useBaseUrl(`/diagrams/${name}.svg`);
  return (
    <figure className={figure.figure}>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(figure.frame, styles.panel)}>
        <img src={src} alt={alt} loading="lazy" />
      </a>
      <figcaption className={figure.caption}>
        {caption && <span>{caption} </span>}
        <a href={`${SOURCE}/${name}.puml`} target="_blank" rel="noopener noreferrer">
          PlantUML source
        </a>
      </figcaption>
    </figure>
  );
}
