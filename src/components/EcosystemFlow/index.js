import React from 'react';
import {FaGithub} from 'react-icons/fa';

import {getNode, NODES, STATUSES} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

/**
 * What happens to one publication, from upload to reader, and which
 * repositories do each step. Stages marked `dev` run in the development
 * environment and are not in production yet.
 */
const STAGES = [
  {
    key: 'arrives',
    title: 'It arrives',
    blurb:
      'A librarian uploads a PDF or EPUB in the portal, a script posts it to the REST API, or a published Dataverse dataset is imported automatically. Printed books go through the digitalizer first: scans in, OCR’d PDF/A and EPUB out, published to the catalog with their metadata and cover.',
    nodes: ['catalog', 'digitalizer', 'protocol-py'],
  },
  {
    key: 'catalogued',
    title: 'The catalog files it',
    blurb:
      'The publication gets a record with authors, categories, language and files, and lands in a catalog with its own permissions. One install can host a whole university’s catalogs side by side. The data lives in PostgreSQL; the files on disk or in S3.',
    nodes: ['catalog', 'postgresql'],
  },
  {
    key: 'read-by-machines',
    title: 'Workers take it apart',
    dev: true,
    blurb:
      'The catalog queues an extraction run. The analyzer finds the page layout, the text service splits paragraphs into sentences and embeds them, the image service crops figures and the equation service turns formulas into LaTeX. Each worker posts its results back to the catalog, which keeps them next to the publication.',
    nodes: ['svc-analyzer', 'svc-text', 'svc-image', 'svc-equation'],
  },
  {
    key: 'searchable',
    title: 'It becomes searchable by passage',
    dev: true,
    blurb:
      'With paragraphs and their embeddings in PostgreSQL, a search can match the words of a query and its meaning, and return the passage with the hit highlighted. The assistant uses the same passages to answer questions and cites the ones it used.',
    nodes: ['catalog', 'svc-text'],
  },
  {
    key: 'protected',
    title: 'It can be lent',
    blurb:
      'If a title is lent with DRM, the lcpencrypt worker encrypts it and registers it with the Readium LCP server. Readers borrow, renew and return it in the portal or in any LCP-capable app such as Thorium. A reservation queue handles titles with a limited number of copies.',
    nodes: ['worker-lcp', 'lcp-server'],
  },
  {
    key: 'read',
    title: 'Someone reads it',
    blurb:
      'Most readers open it in the portal’s built-in reader, where they can search the text, highlight and cite. Others add the catalog’s OPDS feed to their e-reader app. AI agents can search and curate the catalog through its MCP server.',
    nodes: ['portal', 'viewer', 'catalog'],
  },
];

const STANDARDS = NODES.filter((n) => n.category === 'standard');

function RepoChip({id}) {
  const node = getNode(id);
  if (!node) return null;
  return (
    <a
      href={node.repo}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.chip}
      title={node.description}>
      <FaGithub aria-hidden="true" />
      <span className={styles.chipName}>{node.name}</span>
      {node.language && <span className={styles.chipLang}>{node.language}</span>}
    </a>
  );
}

export default function EcosystemFlow() {
  return (
    <div className={styles.wrapper}>
      <ol className={styles.flow}>
        {STAGES.map((stage, i) => (
          <li key={stage.key} className={styles.stage}>
            <div className={styles.marker}>
              <span className={styles.markerNum}>{i + 1}</span>
            </div>
            <div className={styles.stageBody}>
              <h3 className={styles.stageTitle}>
                {stage.title}
                {stage.dev && (
                  <span
                    className={styles.devBadge}
                    style={{'--badge': STATUSES.dev.color}}>
                    In development
                  </span>
                )}
              </h3>
              <p className={styles.stageBlurb}>{stage.blurb}</p>
              <div className={styles.chips}>
                {stage.nodes.map((id) => (
                  <RepoChip key={id} id={id} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <aside className={styles.standards}>
        <span className={styles.standardsLabel}>Standards it speaks</span>
        <div className={styles.standardsRow}>
          {STANDARDS.map((s) => (
            <a
              key={s.id}
              href={s.docs}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.standardChip}
              title={s.description}>
              {s.name}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
