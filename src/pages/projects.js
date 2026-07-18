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

const STATUS_ORDER = ['active', 'maintenance', 'stale', 'archived'];
const CATEGORY_ORDER = ['core', 'worker', 'protocol', 'team'];
const HIDDEN_CATEGORIES = new Set(['standard', 'devops']);

// What each layer is *for*, in reader's terms — the thing a category
// description on the card can't say on its own.
const GROUP_INTRO = {
  core: 'Start here. The four pieces you would actually run — the catalog that holds everything, the portal people log into, the reader they open books in, and the importer that fills it.',
  worker:
    'The heavy lifting. Independent services on a job queue that read every publication — pulling text, captioning figures, reconstructing equations, transcribing video, encrypting loans — so the catalog can stay simple.',
  protocol:
    'The contract. One OpenAPI definition of how the pieces talk, plus the generated client so you don’t hand-write requests.',
  team: 'The relay. Each FIIT STU student team leaves a repo behind — features and forks defended as thesis work, then handed to the next crew.',
};

function ProjectCard({node, index = 0}) {
  const cat = CATEGORIES[node.category];
  const status = STATUSES[node.status];
  const issuesUrl = node.repo ? `${node.repo}/issues` : null;
  return (
    <Reveal as="article" delay={(index % 3) * 60} className={styles.card}>
      <header className={styles.cardHeader}>
        <span
          className={styles.cardCategory}
          style={{color: cat?.color, borderColor: cat?.color}}>
          {cat?.label}
        </span>
        {status && (
          <span
            className={styles.cardStatus}
            style={{color: status.color}}
            title={`Status: ${status.label}`}>
            <span
              className={styles.statusDot}
              style={{background: status.color}}
            />
            {status.label}
          </span>
        )}
      </header>
      <h3 className={styles.cardTitle}>{node.name}</h3>
      <p className={styles.cardDescription}>{node.description}</p>
      {node.highlights && (
        <ul className={styles.cardHighlights}>
          {node.highlights.slice(0, 3).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <div className={styles.cardMeta}>
        {node.language && (
          <span className={styles.metaChip}>{node.language}</span>
        )}
        {node.version && (
          <span className={styles.metaChip}>{node.version}</span>
        )}
        {node.pushed_at && (
          <span className={styles.metaChipMuted}>pushed {node.pushed_at}</span>
        )}
      </div>
      <div className={styles.cardActions}>
        {node.repo && (
          <a
            href={node.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionPrimary}>
            <FaGithub /> Repository
          </a>
        )}
        {issuesUrl && (
          <a
            href={issuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionSecondary}>
            <FaCodeBranch /> Issues
          </a>
        )}
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
        <p>{GROUP_INTRO[category] || cat.description}</p>
      </Reveal>
      <div className={styles.grid}>
        {nodes.map((n, i) => (
          <ProjectCard key={n.id} node={n} index={i} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  const visibleNodes = useMemo(
    () => NODES.filter((n) => n.repo && !HIDDEN_CATEGORIES.has(n.category)),
    [],
  );

  const grouped = useMemo(() => {
    const out = {};
    for (const cat of CATEGORY_ORDER) out[cat] = [];
    for (const n of visibleNodes) {
      if (out[n.category]) out[n.category].push(n);
    }
    for (const cat of CATEGORY_ORDER) {
      out[cat].sort((a, b) => {
        const sa = STATUS_ORDER.indexOf(a.status);
        const sb = STATUS_ORDER.indexOf(b.status);
        if (sa !== sb) return sa - sb;
        return (b.pushed_at || '').localeCompare(a.pushed_at || '');
      });
    }
    return out;
  }, [visibleNodes]);

  return (
    <Layout
      title="Projects"
      description="The repositories that make up ELVIRA, grouped by what they do — core platform, AI workers, the protocol, and the student teams that built them.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            Repositories
          </span>
          <h1 className={styles.title}>ELVIRA is a constellation, not a repo</h1>
          <p className={styles.lede}>
            The platform is {visibleNodes.length} small, focused repositories
            under{' '}
            <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
              @EvilFlowersCatalog
            </a>{' '}
            — a catalog at the centre, a fleet of workers around it, one
            protocol tying them together, and the student teams who built the
            whole thing. Jump to a layer:
          </p>
          <nav className={styles.jumpNav} aria-label="Jump to a layer">
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
          </nav>
        </div>
      </header>

      <main className="container margin-vert--lg">
        {CATEGORY_ORDER.map((cat) => (
          <CategorySection key={cat} category={cat} nodes={grouped[cat] || []} />
        ))}

        <Reveal className={styles.moreCard}>
          <div>
            <h2>There’s more under the hood</h2>
            <p>
              Deployment manifests, runtime forks, benchmarks and the external
              standards ELVIRA implements don’t get cards here — they live on
              the ecosystem map and in the org. That’s where the wiring is.
            </p>
          </div>
          <div className={styles.moreActions}>
            <Link className="button button--primary" to="/ecosystem">
              See the ecosystem map <FaArrowRight />
            </Link>
            <a
              className="button button--secondary"
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer">
              <FaGithub />&nbsp;All repos on GitHub
            </a>
          </div>
        </Reveal>
      </main>
    </Layout>
  );
}
