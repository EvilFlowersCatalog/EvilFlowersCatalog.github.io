import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import ArchitectureMap from '@site/src/components/ArchitectureMap';
import EcosystemFlow from '@site/src/components/EcosystemFlow';
import {NODES, CATEGORIES, ORG_URL} from '@site/src/data/ecosystem';
import styles from './how-it-works.module.css';

const GROUPS = [
  {
    id: 'core',
    intro: 'What you deploy to run a library: the catalog server, the portal readers sign in to, and the PDF reader inside it.',
  },
  {
    id: 'content',
    intro: 'Ways to get books in and out besides the portal.',
  },
  {
    id: 'lending',
    intro: 'Readium LCP lending. The worker encrypts files; the LCP server issues licenses. Readers only ever talk to the catalog.',
  },
  {
    id: 'extraction',
    intro: 'Workers that process files after upload: OCR for scanned PDFs, and extraction of paragraphs, figures, tables and formulas.',
  },
  {
    id: 'foundation',
    intro: 'The API contract and its Python client, the shared worker runtime and CI actions, and the PostgreSQL image the catalog runs on.',
  },
];

function RepoTable({nodes}) {
  return (
    <table className={styles.repos}>
      <thead>
        <tr>
          <th>Repository</th>
          <th>What it does</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((n) => (
          <tr key={n.id}>
            <td className={styles.repoName}>
              <a href={n.repo}>{n.name}</a>
              {n.language && <span className={styles.lang}>{n.language}</span>}
            </td>
            <td className={styles.repoText}>
              {n.description}
              {(n.docs || n.releases) && (
                <span className={styles.repoLinks}>
                  {n.docs && <a href={n.docs}>Documentation</a>}
                  {n.releases && <a href={`${n.repo}/releases`}>Releases</a>}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function HowItWorks() {
  const teams = NODES.filter((n) => n.category === 'team');
  const earlier = NODES.filter((n) => n.category === 'earlier');
  const standards = NODES.filter((n) => n.category === 'standard');
  return (
    <Layout
      title="How it works"
      description="The components of ELVIRA, how one publication moves through them, and every repository behind them.">
      <main className="e-page">
        <header className={styles.head}>
          <h1>How it works</h1>
          <p className="e-lede e-measure">
            One catalog server sits in the middle. The portal, e-reader apps,
            the Calibre plugin, AI agents and the digitalizer reach it over
            HTTP. It keeps its records in PostgreSQL and hands slow work, such
            as encryption, OCR and extraction, to workers through a Redis
            queue.
          </p>
          <p className="e-measure e-muted">
            You will see two names. ELVIRA is the library as a whole.
            EvilFlowers is the name of its catalog server, which started as a
            side project before ELVIRA existed, and of the GitHub organization
            that holds all the code. The{' '}
            <Link to="/docs/architecture">architecture docs</Link> cover the
            interfaces in detail.
          </p>
        </header>

        <section className={styles.section}>
          <h2>Components</h2>
          <ArchitectureMap />
        </section>

        <section className={styles.section}>
          <h2>One publication, step by step</h2>
          <EcosystemFlow />
        </section>

        <section className={styles.section}>
          <Heading as="h2" id="repositories">
            Repositories
          </Heading>
          <p className="e-measure">
            Everything is public under{' '}
            <a href={ORG_URL}>github.com/EvilFlowersCatalog</a>.
          </p>
          {GROUPS.map((g) => {
            const nodes = NODES.filter((n) => n.category === g.id && n.repo);
            return (
              <div key={g.id} className={styles.group} id={`group-${g.id}`}>
                <h3>{CATEGORIES[g.id].label}</h3>
                <p className="e-muted e-measure">{g.intro}</p>
                <RepoTable nodes={nodes} />
              </div>
            );
          })}

          <div className={styles.group}>
            <Heading as="h3" id="teams">
              Student team projects
            </Heading>
            <p className="e-muted e-measure">
              FIIT STU students work on ELVIRA in yearly team projects and
              theses. These are the repositories they left.
            </p>
            <ul className={styles.compact}>
              {teams.map((n) => (
                <li key={n.id}>
                  <a href={n.repo}>{n.name}</a> {n.description}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.group}>
            <h3>Earlier experiments</h3>
            <p className="e-muted e-measure">
              Nobody works on these and nothing in production depends on them.
            </p>
            <ul className={styles.compact}>
              {earlier.map((n) => (
                <li key={n.id}>
                  <a href={n.repo}>{n.name}</a> {n.description}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Standards</h2>
          <ul className={styles.compact}>
            {standards.map((s) => (
              <li key={s.id}>
                <a href={s.docs}>{s.name}</a> {s.description}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}
