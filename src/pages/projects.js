import React, {useMemo} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  FaGithub,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaArrowRight,
} from 'react-icons/fa';

import Reveal from '@site/src/components/Reveal';
import {NODES, CATEGORIES, STATUSES, ORG_URL} from '@site/src/data/ecosystem';
import styles from './projects.module.css';

const CATEGORY_ORDER = ['core', 'content', 'lending', 'extraction', 'foundation'];
const STATUS_ORDER = ['live', 'library', 'dev', 'dormant'];

const GROUP_INTRO = {
  core: 'What you deploy to run a library: the catalog server, the portal readers sign in to, and the PDF reader inside it.',
  content:
    'Ways to fill the catalog besides uploading in the portal. The digitalizer turns printed books into PDFs and EPUBs and publishes them.',
  lending:
    'Readium LCP lending. The worker encrypts files; the LCP server issues licenses. Readers only ever talk to the catalog.',
  extraction:
    'Workers that take each PDF apart into paragraphs, figures, tables and formulas, so it can be searched by passage. Running in development.',
  foundation:
    'The API contract, a generated Python client, and the PostgreSQL image the catalog runs on.',
};

function StatusPill({status}) {
  const s = STATUSES[status];
  if (!s) return null;
  return (
    <span className={styles.cardStatus} style={{color: s.color}} title={s.label}>
      <span className={styles.statusDot} style={{background: s.color}} />
      {s.label}
    </span>
  );
}

function ProjectCard({node, index = 0}) {
  const cat = CATEGORIES[node.category];
  return (
    <Reveal as="article" delay={(index % 3) * 60} className={styles.card}>
      <header className={styles.cardHeader}>
        <span
          className={styles.cardCategory}
          style={{color: cat?.color, borderColor: cat?.color}}>
          {cat?.label}
        </span>
        <StatusPill status={node.status} />
      </header>
      <h3 className={styles.cardTitle}>{node.name}</h3>
      <p className={styles.cardDescription}>{node.description}</p>
      {node.highlights && (
        <ul className={styles.cardHighlights}>
          {node.highlights.slice(0, 4).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <div className={styles.cardMeta}>
        {node.language && <span className={styles.metaChip}>{node.language}</span>}
        {node.npm && <span className={styles.metaChip}>npm</span>}
      </div>
      <div className={styles.cardActions}>
        <a
          href={node.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionPrimary}>
          <FaGithub /> Repository
        </a>
        <a
          href={`${node.repo}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionSecondary}>
          <FaCodeBranch /> Issues
        </a>
        {node.api && (
          <a
            href={node.api}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionSecondary}>
            <FaExternalLinkAlt /> API
          </a>
        )}
        {node.docs && (
          <a
            href={node.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionSecondary}>
            <FaExternalLinkAlt /> Docs
          </a>
        )}
      </div>
    </Reveal>
  );
}

function CategorySection({category, nodes}) {
  if (!nodes.length) return null;
  const cat = CATEGORIES[category];
  return (
    <section className={styles.section} id={`cat-${category}`}>
      <Reveal
        as="header"
        className={styles.sectionHeader}
        style={{'--cat-color': cat.color}}>
        <div className={styles.sectionHeaderTop}>
          <h2 style={{color: cat.color}}>{cat.label}</h2>
          <span className={styles.sectionCount}>
            {nodes.length} {nodes.length === 1 ? 'repo' : 'repos'}
          </span>
        </div>
        <p>{GROUP_INTRO[category]}</p>
      </Reveal>
      <div className={styles.grid}>
        {nodes.map((n, i) => (
          <ProjectCard key={n.id} node={n} index={i} />
        ))}
      </div>
    </section>
  );
}

function CompactList({id, title, intro, nodes}) {
  return (
    <section className={styles.section} id={id}>
      <Reveal as="header" className={styles.sectionHeader}>
        <div className={styles.sectionHeaderTop}>
          <h2>{title}</h2>
          <span className={styles.sectionCount}>{nodes.length} repos</span>
        </div>
        <p>{intro}</p>
      </Reveal>
      <ul className={styles.compactList}>
        {nodes.map((n) => (
          <li key={n.id}>
            <a href={n.repo} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" /> {n.name}
            </a>
            <span>{n.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProjectsPage() {
  const grouped = useMemo(() => {
    const out = {};
    for (const cat of CATEGORY_ORDER) {
      out[cat] = NODES.filter((n) => n.category === cat && n.repo).sort(
        (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      );
    }
    return out;
  }, []);
  const teams = NODES.filter((n) => n.category === 'team');
  const earlier = NODES.filter((n) => n.category === 'earlier');
  const active = CATEGORY_ORDER.reduce((sum, c) => sum + grouped[c].length, 0);

  return (
    <Layout
      title="Projects"
      description="Every repository behind ELVIRA, grouped by job, with what each one does and whether it runs in production.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            Repositories
          </span>
          <h1 className={styles.title}>Every repository, by what it does</h1>
          <p className={styles.lede}>
            ELVIRA is {active} active repositories under{' '}
            <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
              github.com/EvilFlowersCatalog
            </a>
            , plus student team projects and a few earlier experiments. Each
            card says whether the component runs in production, in
            development, or is a library other parts use.
          </p>
          <nav className={styles.jumpNav} aria-label="Jump to a group">
            {CATEGORY_ORDER.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat}`}
                className={styles.jumpChip}
                style={{'--cat-color': CATEGORIES[cat].color}}>
                <span className={styles.jumpDot} />
                {CATEGORIES[cat].label}
                <span className={styles.jumpCount}>{grouped[cat].length}</span>
              </a>
            ))}
            <a href="#teams" className={styles.jumpChip}>
              <span className={styles.jumpDot} />
              Student teams
              <span className={styles.jumpCount}>{teams.length}</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="container margin-vert--lg">
        {CATEGORY_ORDER.map((cat) => (
          <CategorySection key={cat} category={cat} nodes={grouped[cat]} />
        ))}

        <CompactList
          id="teams"
          title="Student team projects"
          intro="FIIT STU students work on ELVIRA in yearly team projects and theses. These are the repositories they left behind."
          nodes={teams}
        />
        <CompactList
          id="earlier"
          title="Earlier experiments"
          intro="Repositories nobody is working on. Kept public for reference; nothing in production depends on them."
          nodes={earlier}
        />

        <Reveal className={styles.moreCard}>
          <div>
            <h2>How do they connect?</h2>
            <p>
              The ecosystem page has a component diagram of the services
              above and follows one publication through them.
            </p>
          </div>
          <div className={styles.moreActions}>
            <Link className="button button--primary" to="/ecosystem">
              See how it fits together <FaArrowRight />
            </Link>
            <a
              className="button button--secondary"
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer">
              <FaGithub />
              &nbsp;All repos on GitHub
            </a>
          </div>
        </Reveal>
      </main>
    </Layout>
  );
}
