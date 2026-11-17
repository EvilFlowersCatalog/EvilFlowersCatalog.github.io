import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';

import Configurator from '@site/src/components/Configurator';
import styles from './deploy.module.css';

export default function DeployPage() {
  return (
    <Layout
      title="Deploy"
      description="Choose the ELVIRA features you need and get a Docker Compose file or Kubernetes manifests, an nginx file and a .env of fresh secrets.">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Deploy ELVIRA</h1>
          <p className="e-lede e-measure">
            Pick the features you need and copy the result: a Docker Compose file or Kubernetes manifests, an nginx
            file for the catalog and the portal, a <code>.env</code> with secrets made in your browser, and the
            commands for the first start. The smallest installation is three containers: the catalog, PostgreSQL
            and Redis.
          </p>
          <p className={styles.links}>
            <Link to="/docs/quickstart">Quickstart</Link>
            <Link to="/docs/architecture">Architecture</Link>
            <Link to="/docs/adopting">Adopting ELVIRA</Link>
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <BrowserOnly fallback={<p>Loading the configurator…</p>}>{() => <Configurator />}</BrowserOnly>
      </main>
    </Layout>
  );
}
