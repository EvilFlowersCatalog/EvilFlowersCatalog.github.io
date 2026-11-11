import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {FaArrowRight, FaGithub} from 'react-icons/fa';

import ArchitectureMap from '@site/src/components/ArchitectureMap';
import EcosystemFlow from '@site/src/components/EcosystemFlow';
import Reveal from '@site/src/components/Reveal';
import {ORG_URL} from '@site/src/data/ecosystem';
import styles from './ecosystem.module.css';

export default function EcosystemPage() {
  return (
    <Layout
      title="How it fits together"
      description="A component diagram of ELVIRA and the journey of one publication through it, with links to every repository involved.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            Architecture
          </span>
          <h1 className={styles.title}>How ELVIRA fits together</h1>
          <p className={styles.lede}>
            One catalog server sits in the middle. The portal, e-reader apps,
            AI agents and the digitalizer reach it over HTTP. It keeps its data
            in PostgreSQL and hands slow work, such as encryption and
            extraction, to workers through a Redis queue. Workers report back
            to the catalog and never call each other, except along the lending
            path and inside the extraction pipeline.
          </p>
        </div>
      </header>

      <main className="container margin-vert--xl">
        <Reveal>
          <h2 className={styles.sectionTitle}>The components</h2>
        </Reveal>
        <Reveal>
          <ArchitectureMap />
        </Reveal>

        <Reveal className={styles.flowIntro}>
          <h2 className={styles.sectionTitle}>One publication, start to finish</h2>
          <p>
            The same system, followed step by step. Each step names the
            repositories that do the work.
          </p>
        </Reveal>
        <Reveal>
          <EcosystemFlow />
        </Reveal>

        <Reveal className={styles.outro}>
          <div>
            <h2>Why the catalog does so little</h2>
            <p>
              The catalog answers every reader request, so it stays small:
              records, permissions, loans and the standard feeds. Anything slow
              or experimental, such as OCR, layout analysis, embeddings or
              encryption, runs in a separate worker on a queue. A worker can
              fail, be rewritten or be a student’s thesis project without
              putting the library at risk.
            </p>
          </div>
          <div className={styles.outroActions}>
            <Link className="button button--primary button--lg" to="/projects">
              Every repository <FaArrowRight />
            </Link>
            <a
              className="button button--secondary button--lg"
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer">
              <FaGithub />&nbsp;On GitHub
            </a>
          </div>
        </Reveal>
      </main>
    </Layout>
  );
}
