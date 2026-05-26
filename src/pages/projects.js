import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {
  FaGithub,
  FaCircle,
  FaCodeBranch,
  FaArchive,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import {NODES, CATEGORIES, STATUSES, ORG_URL} from '@site/src/data/ecosystem';
import styles from './projects.module.css';

const STATUS_ORDER = ['active', 'maintenance', 'stale', 'archived'];
const CATEGORY_ORDER = [
  'core',
  'worker',
  'protocol',
  'team',
];
const FILTERS = ['all', ...CATEGORY_ORDER];
const HIDDEN_CATEGORIES = new Set(['standard', 'devops']);

function statusIcon(status) {
  if (!status) return null;
  if (status === 'archived') return <FaArchive />;
  if (status === 'stale') return <FaCircle />;
  return <FaCircle />;
}

function ProjectCard({node}) {
  const cat = CATEGORIES[node.category];
  const status = STATUSES[node.status];
  const issuesUrl = node.repo
    ? `${node.repo}/issues`
    : null;
  return (
    <article
      className={`${styles.card} ${
        node.category === 'legacy' ? styles.cardLegacy : ''
      }`}>
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
          <span className={styles.metaChipMuted}>
            pushed {node.pushed_at}
          </span>
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
    </article>
  );
}

function CategorySection({category, nodes}) {
  if (!nodes.length) return null;
  const cat = CATEGORIES[category];
  return (
    <section className={styles.section} id={`cat-${category}`}>
      <header
        className={styles.sectionHeader}
        style={{borderColor: cat.color}}>
        <h2 style={{color: cat.color}}>{cat.label}</h2>
        <p>{cat.description}</p>
      </header>
      <div className={styles.grid}>
        {nodes.map((n) => (
          <ProjectCard key={n.id} node={n} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all');

  const visibleNodes = useMemo(
    () => NODES.filter((n) => n.repo && !HIDDEN_CATEGORIES.has(n.category)),
    [],
  );

  const filteredNodes = useMemo(
    () =>
      visibleNodes
        .filter((n) => filter === 'all' || n.category === filter)
        .sort((a, b) => {
          const sa = STATUS_ORDER.indexOf(a.status);
          const sb = STATUS_ORDER.indexOf(b.status);
          if (sa !== sb) return sa - sb;
          return (b.pushed_at || '').localeCompare(a.pushed_at || '');
        }),
    [filter, visibleNodes],
  );

  const grouped = useMemo(() => {
    const out = {};
    for (const cat of CATEGORY_ORDER) out[cat] = [];
    for (const n of filteredNodes) {
      if (out[n.category]) out[n.category].push(n);
    }
    return out;
  }, [filteredNodes]);

  return (
    <Layout
      title="Projects"
      description="Repositories under the EvilFlowersCatalog organisation, grouped by role, with status and links to issues.">
      <header className={styles.hero}>
        <div className="container">
          <span className={styles.kicker}>Repositories</span>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.lede}>
            {visibleNodes.length} repositories under{' '}
            <a
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer">
              @EvilFlowersCatalog
            </a>
            . Filter by role below; each card links to the repo and its
            issues.
          </p>
          <div className={styles.filterBar}>
            {FILTERS.map((f) => {
              const label = f === 'all' ? 'All' : CATEGORIES[f].label;
              return (
                <button
                  key={f}
                  type="button"
                  className={`${styles.filterChip} ${
                    filter === f ? styles.filterChipActive : ''
                  }`}
                  onClick={() => setFilter(f)}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container margin-vert--lg">
        {CATEGORY_ORDER.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            nodes={grouped[cat] || []}
          />
        ))}
      </main>
    </Layout>
  );
}
