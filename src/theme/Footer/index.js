import React from 'react';
import Footer from '@theme-original/Footer';
import useBaseUrl from '@docusaurus/useBaseUrl';

import {DEPLOYMENTS} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

function DeployLogo({deployment}) {
  const src = useBaseUrl(deployment.logo);
  return (
    <a
      href={deployment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.chip}
      title={`${deployment.name} — ${deployment.place}`}>
      <img
        src={src}
        alt={deployment.name}
        className={styles.chipLogo}
        loading="lazy"
      />
    </a>
  );
}

export default function FooterWrapper(props) {
  return (
    <>
      <div className={styles.band}>
        <div className="container">
          <span className={styles.eyebrow}>In production at</span>
          <div className={styles.chips}>
            {DEPLOYMENTS.map((d) => (
              <DeployLogo key={d.short} deployment={d} />
            ))}
          </div>
        </div>
      </div>
      <Footer {...props} />
    </>
  );
}
