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
      title={deployment.name}>
      <img src={src} alt="" className={styles.chipLogo} loading="lazy" />
      <span className={styles.chipText}>
        <strong>{deployment.name}</strong>
        <span>{deployment.place}</span>
      </span>
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
