import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {FaEnvelope, FaGithub, FaComments} from 'react-icons/fa';

import {DEPLOYMENTS, ORG_URL} from '@site/src/data/ecosystem';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="ELVIRA is an open-source digital academic library platform developed at the Faculty of Informatics and Information Technologies (Slovak University of Technology in Bratislava) and deployed there and at the Catholic University in Ružomberok.">
      <header className={styles.hero}>
        <div className="container">
          <span className={styles.kicker}>About</span>
          <h1 className={styles.title}>
            An academic library platform, open source
          </h1>
          <p className={styles.lede}>
            ELVIRA began in 2020 as a way to make study materials legally
            available to students during the COVID lockdowns. Six years
            later it&rsquo;s an OPDS 2.0 catalog with Readium LCP lending,
            multilingual semantic search, and an AI assistant that
            answers questions grounded in source passages. Built at
            FIIT STU, deployed STU-wide, with a second site at KU
            Ružomberok.
          </p>
        </div>
      </header>

      <main className="container margin-vert--lg">
        <section className={styles.section}>
          <h2>Who builds it</h2>
          <p>
            ELVIRA is developed at the{' '}
            <a
              href="https://www.fiit.stuba.sk/"
              target="_blank"
              rel="noopener noreferrer">
              Faculty of Informatics and Information Technologies
            </a>{' '}
            of the Slovak University of Technology in Bratislava (FIIT STU).
            Most commits come from students and PhD candidates. The
            platform runs STU-wide at{' '}
            <a
              href="https://elvira.stuba.sk/"
              target="_blank"
              rel="noopener noreferrer">
              elvira.stuba.sk
            </a>
            , with the faculty-specific instance at{' '}
            <a
              href="https://elvira.fiit.stuba.sk/"
              target="_blank"
              rel="noopener noreferrer">
              elvira.fiit.stuba.sk
            </a>
            .
          </p>
          <p>
            The{' '}
            <a
              href="https://www.ku.sk/"
              target="_blank"
              rel="noopener noreferrer">
              Catholic University in Ružomberok
            </a>{' '}
            (<em>Katolícka univerzita v Ružomberku</em>) runs a second
            production instance, themed for KU and sharing the same
            catalog software.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Where it runs</h2>
          <div className={styles.deploymentGrid}>
            {DEPLOYMENTS.map((d) => (
              <a
                key={d.short}
                className={styles.deploymentCard}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer">
                <strong>{d.short}</strong>
                <span>{d.name}</span>
                <p>{d.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Get in touch</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>
                <FaGithub /> On GitHub
              </h3>
              <p>
                Everything lives at{' '}
                <a
                  href={ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer">
                  @EvilFlowersCatalog
                </a>
                . Open an issue on whichever repository it concerns, or
                start a thread in{' '}
                <a
                  href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions"
                  target="_blank"
                  rel="noopener noreferrer">
                  Discussions
                </a>
                {' '}for design / deployment questions.
              </p>
              <div className={styles.linkRow}>
                <Link className="button button--primary" href={ORG_URL}>
                  Organisation
                </Link>
                <Link
                  className="button button--secondary"
                  href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions">
                  <FaComments />&nbsp;Discussions
                </Link>
              </div>
            </div>
            <div className={styles.contactCard}>
              <h3>
                <FaEnvelope /> By e-mail
              </h3>
              <ul className={styles.emailList}>
                <li>
                  <a href="mailto:sik@fiit.stuba.sk">sik [at] fiit.stuba.sk</a>
                </li>
                <li>
                  <a href="mailto:jakub.dubec@stuba.sk">
                    jakub.dubec [at] stuba.sk
                  </a>
                </li>
              </ul>
              <address className={styles.address}>
                Faculty of Informatics and Information Technologies
                <br />
                Slovak University of Technology
                <br />
                Ilkovičova 2, 842 16 Bratislava
                <br />
                Slovakia
              </address>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
