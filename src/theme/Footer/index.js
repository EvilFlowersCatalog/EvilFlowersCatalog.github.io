import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import {NAV, GITHUB} from '@site/src/data/site';
import styles from './styles.module.css';

const CODE = [
  {href: GITHUB, label: 'GitHub organization'},
  {href: `${GITHUB}/EvilFlowersCatalog/discussions`, label: 'Discussions'},
  {href: 'https://elvira.digital/EvilFlowersCatalog/', label: 'API reference (OpenAPI)'},
  {href: `${GITHUB}/evilflowers-protocol`, label: 'Protocol definition'},
];

/** The site's own footer; replaces the Docusaurus one (themeConfig.footer is unset). */
export default function Footer() {
  const stu = useBaseUrl('/img/stu-logo.png');
  const fiit = useBaseUrl('/img/fiit-logo.png');
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.logos}>
            <a href="https://www.stuba.sk/" target="_blank" rel="noopener noreferrer">
              <img src={stu} alt="Slovak University of Technology in Bratislava" height="32" />
            </a>
            <a href="https://www.fiit.stuba.sk/" target="_blank" rel="noopener noreferrer">
              <img src={fiit} alt="Faculty of Informatics and Information Technologies, STU" height="32" />
            </a>
          </p>
          <p className={styles.about}>
          ELVIRA is an open-source digital library platform developed at the{' '}
          <a href="https://www.stuba.sk/" target="_blank" rel="noopener noreferrer">
            Slovak University of Technology in Bratislava
          </a>
          , mostly at its Faculty of Informatics and Information Technologies.
          MIT and BSD-3-Clause licenses.
          </p>
        </div>
        <nav className={styles.columns} aria-label="Footer">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <ul>
            {CODE.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href="https://elvira.stuba.sk" target="_blank" rel="noopener noreferrer">
                elvira.stuba.sk
              </a>
            </li>
            <li>
              <Link to="pathname:///news/rss.xml">News feed (RSS)</Link>
            </li>
            <li>
              <Link to="/about#contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
