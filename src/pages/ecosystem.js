import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {FaArrowRight, FaGithub} from 'react-icons/fa';

import EcosystemFlow from '@site/src/components/EcosystemFlow';
import Reveal from '@site/src/components/Reveal';
import {ORG_URL} from '@site/src/data/ecosystem';
import styles from './ecosystem.module.css';

export default function EcosystemPage() {
  return (
    <Layout
      title="Ecosystem"
      description="How ELVIRA fits together, told as the journey of a single publication — from the moment it arrives to the moment someone reads it, and the repositories that do each job.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            How it fits together
          </span>
          <h1 className={styles.title}>Follow one book through the system</h1>
          <p className={styles.lede}>
            ELVIRA looks like a lot of moving parts, but they line up in one
            direction. The easiest way to understand the architecture is to
            watch a single publication travel through it — each step below is
            a real job, done by real repositories you can open.
          </p>
        </div>
      </header>

      <main className="container margin-vert--xl">
        <Reveal>
          <EcosystemFlow />
        </Reveal>

        <Reveal className={styles.outro}>
          <div>
            <h2>Why split it up like this?</h2>
            <p>
              The catalog stays small and dependable; everything expensive —
              OCR, captioning, embeddings, encryption — runs as its own worker
              on a job queue. A new capability is a new service, not a change
              to the thing holding the whole library. It also means each piece
              can be a student team’s project without risking the rest.
            </p>
          </div>
          <div className={styles.outroActions}>
            <Link className="button button--primary button--lg" to="/projects">
              Browse every repository <FaArrowRight />
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
