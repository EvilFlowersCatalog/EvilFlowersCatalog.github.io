import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import {DEPLOYMENTS, PEOPLE, PARTNERS, ORG_URL} from '@site/src/data/ecosystem';
import styles from './about.module.css';

const HISTORY = [
  {
    when: 'The start',
    text: 'Jakub Dubec lost his Calibre library to an OS reinstall and wrote a server to keep it safe. That server became EvilFlowersCatalog.',
  },
  {
    when: '2020',
    text: 'The Slovak University of Technology starts using it as its digital library.',
  },
  {
    when: '2022',
    text: 'A FIIT STU student team builds a portal and a reader on top of the catalog.',
  },
  {
    when: 'Every year since',
    text: 'A new student team adds a piece as their team project or thesis, and the next team picks it up.',
  },
  {
    when: '2024',
    text: 'The Catholic University in Ružomberok sets up its own instance.',
  },
  {
    when: '2026',
    text: 'The catalog learns to read its own books: search inside publications, an assistant that cites pages, OCR for scans, and a pipeline for digitizing printed books.',
  },
];

function Partner({partner}) {
  const logo = useBaseUrl(partner.logo ?? '');
  return (
    <li className={styles.partner}>
      <a href={partner.url} className={styles.logo} aria-label={partner.name}>
        {partner.logo ? (
          <img src={logo} alt={partner.name} loading="lazy" />
        ) : (
          <span>{partner.name}</span>
        )}
      </a>
      <div>
        <strong>
          <a href={partner.url}>{partner.name}</a>
        </strong>
        <p>{partner.role}</p>
      </div>
    </li>
  );
}

export default function About() {
  return (
    <Layout
      title="About"
      description="Who builds ELVIRA, where it runs, and how to reach the team.">
      <main className="e-page">
        <header className={styles.head}>
          <h1>About</h1>
          <p className="e-lede e-measure">
            ELVIRA is an open-source digital library platform from the Slovak
            University of Technology in Bratislava. It is developed mostly at
            the Faculty of Informatics and Information Technologies (FIIT
            STU), by staff, PhD candidates and student teams.
          </p>
        </header>

        <section className={styles.section}>
          <h2>How it started</h2>
          <ol className={styles.history}>
            {HISTORY.map((h) => (
              <li key={h.when}>
                <span className={styles.when}>{h.when}</span>
                <span>{h.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Where it runs</h2>
          <dl className={styles.list}>
            {DEPLOYMENTS.map((d) => (
              <div key={d.short}>
                <dt>
                  <a href={d.url}>{d.name}</a>
                  <span className="e-muted"> since {d.since}</span>
                </dt>
                <dd>{d.note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2>People</h2>
          <p className="e-measure e-muted">
            A few people keep the project going from year to year. Much of the
            code comes from{' '}
            <Link to="/how-it-works#teams">student team projects</Link> and
            theses.
          </p>
          <dl className={styles.list}>
            {PEOPLE.map((p) => (
              <div key={p.name}>
                <dt>
                  {p.name}
                  <span className="e-muted">, {p.role}</span>
                </dt>
                <dd>{p.bio}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2>Built with</h2>
          <ul className={styles.partners}>
            {PARTNERS.map((p) => (
              <Partner key={p.short} partner={p} />
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <Heading as="h2" id="contact">
            Contact
          </Heading>
          <div className={styles.contact}>
            <div>
              <p>
                Questions about running ELVIRA, ideas and bug reports go to{' '}
                <a href={`${ORG_URL}/EvilFlowersCatalog/discussions`}>
                  GitHub Discussions
                </a>{' '}
                or the issues of the{' '}
                <a href={ORG_URL}>repository concerned</a>.
              </p>
              <p>
                E-mail:{' '}
                <a href="mailto:jakub.dubec@stuba.sk">jakub.dubec@stuba.sk</a>,
                or the library at{' '}
                <a href="mailto:sik@fiit.stuba.sk">sik@fiit.stuba.sk</a>.
              </p>
            </div>
            <address className={styles.address}>
              Faculty of Informatics and Information Technologies
              <br />
              Slovak University of Technology
              <br />
              Ilkovičova 2, 842 16 Bratislava, Slovakia
            </address>
          </div>
        </section>
      </main>
    </Layout>
  );
}
