import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  FaEnvelope,
  FaGithub,
  FaComments,
  FaArrowRight,
} from 'react-icons/fa';

import Reveal from '@site/src/components/Reveal';
import {DEPLOYMENTS, ORG_URL} from '@site/src/data/ecosystem';
import styles from './about.module.css';

const STANDARDS = [
  {label: 'OPDS 1.2', href: 'https://specs.opds.io/opds-1.2'},
  {label: 'OPDS 2.0', href: 'https://drafts.opds.io/opds-2.0'},
  {label: 'Readium LCP', href: 'https://readium.org/lcp-specs/'},
  {label: 'RWPM', href: 'https://readium.org/webpub-manifest/'},
];

const MILESTONES = [
  {
    year: '2020',
    title: 'Started during lockdown',
    body: 'A way to get study materials to students legally while the campus was closed.',
  },
  {
    year: 'Every year',
    title: 'A new student team',
    body: 'FIIT STU team projects and theses have carried it forward each academic year since.',
  },
  {
    year: 'Today',
    title: 'A real campus library',
    body: 'In production STU-wide and at KU Ružomberok, with search, lending and an AI pipeline in rollout.',
  },
];

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="ELVIRA is an open-source digital academic library developed at the Faculty of Informatics and Information Technologies (Slovak University of Technology in Bratislava) and deployed there and at the Catholic University in Ružomberok.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            About
          </span>
          <h1 className={styles.title}>
            A university library, built in the open
          </h1>
          <p className={styles.lede}>
            ELVIRA started in 2020 as a way to get study materials to
            students legally during the COVID lockdowns. Six years on it
            catalogs the university&rsquo;s publications, lends them with
            Readium LCP, searches them across languages, and is growing an
            AI assistant grounded in the text itself — all developed as
            open source at FIIT STU.
          </p>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>The story</div>
              <h2 className={styles.sectionTitle}>
                From a lockdown fix to a campus library
              </h2>
            </Reveal>
            <div className={styles.timeline}>
              {MILESTONES.map((m, i) => (
                <Reveal key={m.title} className={styles.milestone} delay={i * 70}>
                  <span className={styles.milestoneYear}>{m.year}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal className={styles.prose}>
              <div className={styles.sectionLabel}>Who builds it</div>
              <h2 className={styles.sectionTitle}>Students and PhD candidates</h2>
              <p>
                ELVIRA is developed at the{' '}
                <a
                  href="https://www.fiit.stuba.sk/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Faculty of Informatics and Information Technologies
                </a>{' '}
                of the Slovak University of Technology in Bratislava. Most
                of the code comes from students and PhD candidates, and the
                platform runs STU-wide at{' '}
                <a
                  href="https://elvira.stuba.sk/"
                  target="_blank"
                  rel="noopener noreferrer">
                  elvira.stuba.sk
                </a>
                , with the faculty instance at{' '}
                <a
                  href="https://elvira.fiit.stuba.sk/"
                  target="_blank"
                  rel="noopener noreferrer">
                  elvira.fiit.stuba.sk
                </a>
                . The{' '}
                <a
                  href="https://www.ku.sk/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Catholic University in Ružomberok
                </a>{' '}
                runs a second instance, themed for KU on the same catalog
                software.
              </p>
            </Reveal>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Where it runs</div>
              <h2 className={styles.sectionTitle}>In production at two universities</h2>
            </Reveal>
            <div className={styles.deploymentGrid}>
              {DEPLOYMENTS.map((d, i) => (
                <Reveal
                  key={d.short}
                  className={styles.deploymentCard}
                  delay={i * 70}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.deploymentLink}>
                    <strong>{d.short}</strong>
                    <span>{d.name}</span>
                    <p>{d.note}</p>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal className={styles.osCard}>
              <div>
                <div className={styles.sectionLabel}>Open source</div>
                <h2 className={styles.sectionTitle}>Nothing here is locked to us</h2>
                <p className={styles.osText}>
                  The catalog, the reader and the wire protocol are all
                  public and permissively licensed. ELVIRA speaks the
                  standards e-readers already know, so libraries can adopt
                  it without betting on a single vendor.
                </p>
                <div className={styles.chips}>
                  {STANDARDS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chip}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className={styles.osActions}>
                <Link
                  className="button button--primary button--lg"
                  href={ORG_URL}>
                  <FaGithub />
                  &nbsp;GitHub
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/projects">
                  Browse projects <FaArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Get in touch</div>
              <h2 className={styles.sectionTitle}>Questions, ideas, deployments</h2>
            </Reveal>
            <div className={styles.contactGrid}>
              <Reveal className={styles.contactCard}>
                <h3>
                  <FaGithub /> On GitHub
                </h3>
                <p>
                  Everything lives at{' '}
                  <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
                    @EvilFlowersCatalog
                  </a>
                  . Open an issue on the relevant repository, or start a
                  thread in{' '}
                  <a
                    href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions"
                    target="_blank"
                    rel="noopener noreferrer">
                    Discussions
                  </a>{' '}
                  for design and deployment questions.
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
              </Reveal>
              <Reveal className={styles.contactCard} delay={70}>
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
                  Ilkovičova 2, 842 16 Bratislava, Slovakia
                </address>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
