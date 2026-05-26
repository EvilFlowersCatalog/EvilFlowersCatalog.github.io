import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import EcosystemGraph from '@site/src/components/EcosystemGraph';
import {ORG_URL} from '@site/src/data/ecosystem';
import styles from './ecosystem.module.css';

export default function EcosystemPage() {
  return (
    <Layout
      title="Ecosystem"
      description="Layered architecture map of the ELVIRA / EvilFlowersCatalog stack — standards, protocol, core, services, workers, and the adjacent repos that orbit them.">
      <header className={styles.hero}>
        <div className="container">
          <span className={styles.kicker}>Map</span>
          <h1 className={styles.title}>How it all fits together</h1>
          <p className={styles.lede}>
            Four layers, top to bottom: standards we speak, the protocol that
            wraps them, the apps that use them, and the workers on the
            broker that do the heavy lifting. On the right rail — the
            infrastructure, student projects, and old experiments that sit
            next to the stack.
          </p>
        </div>
      </header>

      <main className="container margin-vert--lg">
        <EcosystemGraph />

        <section className={styles.legend}>
          <div className={styles.legendCol}>
            <h3>The arrows</h3>
            <ul>
              <li>
                <span style={{color: '#34c38f'}}>Solid green</span> —
                <strong> feeds</strong>. Data flows along the arrow (worker
                or service → catalog).
              </li>
              <li>
                <span style={{color: 'var(--ifm-color-primary)'}}>Dashed cyan</span> —
                <strong> implements</strong>. A repo implements a standard or
                the EvilFlowers protocol.
              </li>
              <li>
                <span>Plain grey</span> —
                <strong> depends on</strong>. Library / runtime dependency.
              </li>
              <li>
                <span style={{color: '#7c5cff'}}>Dotted purple</span> —
                <strong> forked from</strong>. Working copy, usually for a
                student team.
              </li>
            </ul>
          </div>
          <div className={styles.legendCol}>
            <h3>Want to grow the map?</h3>
            <p>
              Everything is read from{' '}
              <code>src/data/ecosystem.js</code>. Add a node, give it a
              category, draw the edges you want — the layout, projects grid
              and roadmap pick it up. This page is the seed for the
              org-orchestration tooling we&rsquo;re slowly building out.
            </p>
            <Link className="button button--primary" href={ORG_URL}>
              Browse the GitHub org
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
