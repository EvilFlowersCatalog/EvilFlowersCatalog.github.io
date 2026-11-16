import React from 'react';

import {getNode} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

/**
 * What happens to one publication, from upload to reader, and which
 * repositories do each step. The steps are a real sequence, so they are numbered.
 */
const STAGES = [
  {
    key: 'arrives',
    title: 'It arrives',
    blurb:
      'A librarian uploads a PDF or EPUB in the portal, a script posts it to the REST API, the Calibre plugin syncs it from a Calibre library, or a published Dataverse dataset is imported. Printed books go through the digitalizer first: scans in, a searchable PDF, a PDF/A master and an EPUB out.',
    nodes: ['catalog', 'calibre', 'digitalizer', 'protocol-py'],
  },
  {
    key: 'catalogued',
    title: 'The catalog files it',
    blurb:
      'The publication gets a record with authors, categories, language and files, in a catalog with its own permissions. One install can host a whole university’s catalogs side by side. Records live in PostgreSQL; files on disk or in S3.',
    nodes: ['catalog', 'postgresql'],
  },
  {
    key: 'ocr',
    title: 'Scans get a text layer',
    blurb:
      'A PDF made of page images has no text to search. The OCR service adds an invisible text layer as a new file and keeps the original. Pages that already have text are skipped.',
    nodes: ['svc-ocr'],
  },
  {
    key: 'read-by-machines',
    title: 'Workers take it apart',
    blurb:
      'The analyzer finds the page layout, the text service splits paragraphs into sentences and embeds them, the image service crops figures and the equation service turns formulas into LaTeX. Each worker posts its results back to the catalog. Titles lent with Readium LCP are never read by AI.',
    nodes: ['svc-analyzer', 'svc-text', 'svc-image', 'svc-equation'],
  },
  {
    key: 'searchable',
    title: 'It becomes searchable',
    blurb:
      'Search runs inside the catalog’s PostgreSQL: full-text search with Slovak and Czech stemming, ranked by meaning as well as words, down to the paragraph. The assistant answers questions from the same passages and links to the pages it used.',
    nodes: ['catalog', 'postgresql'],
  },
  {
    key: 'protected',
    title: 'It can be lent',
    blurb:
      'If a title is lent with DRM, the lcpencrypt worker encrypts it and registers it with the Readium LCP server. Readers borrow, renew and return it in the portal or in any LCP-capable app such as Thorium, and join a waiting list when all copies are out.',
    nodes: ['worker-lcp', 'lcp-server'],
  },
  {
    key: 'read',
    title: 'Someone reads it',
    blurb:
      'Most readers open it in the portal’s reader, where they can search the text, highlight and cite. Others add the catalog’s OPDS feed to their e-reader app. AI agents search and curate the catalog through its MCP server.',
    nodes: ['portal', 'viewer', 'catalog'],
  },
];

export default function EcosystemFlow() {
  return (
    <ol className={styles.flow}>
      {STAGES.map((stage) => (
        <li key={stage.key} className={styles.stage}>
          <h3 className={styles.stageTitle}>{stage.title}</h3>
          <p className={styles.stageBlurb}>{stage.blurb}</p>
          <p className={styles.repos}>
            {stage.nodes.map((id) => {
              const node = getNode(id);
              return node ? (
                <a key={id} href={node.repo}>
                  {node.name}
                </a>
              ) : null;
            })}
          </p>
        </li>
      ))}
    </ol>
  );
}
