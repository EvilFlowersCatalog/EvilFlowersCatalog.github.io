import React from 'react';
import {FaGithub} from 'react-icons/fa';

import {getNode, NODES} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

/**
 * The ecosystem, told as a story: what happens to a publication from the
 * moment it arrives to the moment someone reads it. Each stage names the
 * repositories that do that job. No graph, no filters — just the path.
 */
const STAGES = [
  {
    key: 'arrives',
    title: 'It arrives',
    blurb:
      'A PDF, EPUB or scanned collection lands — uploaded by a librarian, or pulled in automatically from Kramerius and WebDAV with an LLM filling in the missing metadata.',
    nodes: ['importer'],
  },
  {
    key: 'read-by-machines',
    title: 'Machines read it first',
    blurb:
      'Before a human ever opens it, a fleet of independent workers goes through every page — pulling out text, OCR-ing scans, captioning figures, rebuilding equations as LaTeX, transcribing any video.',
    nodes: [
      'svc-analyzer',
      'svc-text',
      'worker-ocr',
      'svc-image',
      'svc-equation',
      'svc-video',
    ],
  },
  {
    key: 'searchable',
    title: 'It becomes searchable',
    blurb:
      'The extracted text is embedded into a vector index, so a Slovak query can surface a matching English or German passage — down to the sentence, next to classic keyword hits.',
    nodes: ['svc-search'],
  },
  {
    key: 'protected',
    title: 'It can be lent, safely',
    blurb:
      'If a title needs protecting, it’s encrypted with Readium LCP — the same open lending standard public libraries use — so it can be borrowed, renewed and returned.',
    nodes: ['worker-lcp', 'lcp-server'],
  },
  {
    key: 'catalogued',
    title: 'The catalog holds it',
    blurb:
      'Everything lands in the catalog at the centre — one install hosting many libraries — and is served over OPDS 1.2 and 2.0 through a single documented protocol.',
    nodes: ['catalog', 'protocol', 'protocol-py'],
  },
  {
    key: 'read',
    title: 'Someone reads it',
    blurb:
      'Students meet all of this as one thing: a portal they log into and a reader that opens any title in the browser — search inside, highlight, cite, borrow.',
    nodes: ['portal', 'viewer'],
  },
];

const STANDARDS = NODES.filter((n) => n.category === 'standard');

function RepoChip({id}) {
  const node = getNode(id);
  if (!node) return null;
  const chip = (
    <>
      <FaGithub aria-hidden="true" />
      <span className={styles.chipName}>{node.name}</span>
      {node.language && (
        <span className={styles.chipLang}>{node.language}</span>
      )}
    </>
  );
  if (!node.repo) {
    return (
      <span className={styles.chip} title={node.description}>
        {chip}
      </span>
    );
  }
  return (
    <a
      href={node.repo}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.chip}
      title={node.description}>
      {chip}
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
              <h3 className={styles.stageTitle}>{stage.title}</h3>
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
        <span className={styles.standardsLabel}>Speaking, underneath</span>
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
