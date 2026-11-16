import React from 'react';
import clsx from 'clsx';

import {getNode} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

/**
 * Component diagram of ELVIRA: who talks to the catalog, through which of its
 * interfaces, and what the catalog hands work to. Every service meets the
 * others through the catalog, except on the lending path (lcpencrypt →
 * LCP server) and inside the extraction pipeline (analyzer → workers).
 *
 * Drawn by hand on a fixed 1240×640 grid so it stays legible; boxes link to
 * their repositories and take name and status from src/data/ecosystem.js.
 */

const W = 1240;
const H = 640;

function Box({x, y, w, h = 64, id, title, sub, external, href}) {
  const node = id ? getNode(id) : null;
  const link = href ?? node?.repo;
  const label = title ?? node?.name;
  const body = (
    <g className={clsx(styles.box, external && styles.external)}>
      {node?.description && <title>{`${label}: ${node.description}`}</title>}
      <rect x={x} y={y} width={w} height={h} rx="10" />
      <text x={x + 14} y={y + 25} className={styles.boxTitle}>
        {label}
      </text>
      {sub && (
        <text x={x + 14} y={y + 44} className={styles.boxSub}>
          {sub}
        </text>
      )}
    </g>
  );
  if (!link) return body;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
      aria-label={`${label} (opens repository)`}>
      {body}
    </a>
  );
}

function Pill({cx, cy, w, text}) {
  return (
    <g className={styles.pill}>
      <rect x={cx - w / 2} y={cy - 12} width={w} height="24" rx="12" />
      <text x={cx} y={cy + 4} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

function Edge({from, to, label, lx, ly, dashed, anchor = 'start'}) {
  return (
    <g className={styles.edge}>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        className={clsx(dashed && styles.dashed)}
        markerEnd="url(#elvira-map-arrow)"
      />
      {label && (
        <text
          x={lx ?? (from[0] + to[0]) / 2 + 7}
          y={ly ?? (from[1] + to[1]) / 2 + 4}
          textAnchor={anchor}
          className={styles.edgeLabel}>
          {label}
        </text>
      )}
    </g>
  );
}

function Group({x, y, w, h}) {
  return (
    <g className={styles.group}>
      <rect x={x} y={y} width={w} height={h} rx="14" />
    </g>
  );
}

// Drawn last, with a halo, so edges that cross a group's top pass under it.
function GroupLabel({x, y, label}) {
  return (
    <text x={x + 16} y={y + 22} className={styles.groupLabel}>
      {label}
    </text>
  );
}

export default function ArchitectureMap({caption = true}) {
  const catalog = getNode('catalog');
  return (
    <figure className={styles.figure}>
      <div className={styles.scroller}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-labelledby="elvira-map-title elvira-map-desc">
          <title id="elvira-map-title">ELVIRA component diagram</title>
          <desc id="elvira-map-desc">
            The web portal, OPDS reading apps, the Calibre plugin, AI agents
            and the books digitalizer all talk to EvilFlowersCatalog through
            its HTTP interfaces. The catalog stores data in PostgreSQL, sends
            encryption tasks to the lcpencrypt worker and OCR and extraction
            tasks to the processing workers through Redis, and proxies the
            Readium LCP server. Extraction workers post their results back to
            the catalog.
          </desc>
          <defs>
            <marker
              id="elvira-map-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
            </marker>
          </defs>

          {/* ---------- Clients ---------- */}
          <Group x={20} y={20} w={420} h={112} />
          <Box x={36} y={52} w={180} id="portal" sub="React web app" />
          <Box x={232} y={52} w={194} id="viewer" sub="PDF reader, npm" />
          <Edge from={[216, 84]} to={[232, 84]} dashed />

          <Box
            x={460}
            y={52}
            w={170}
            title="Reading apps"
            sub="Thorium, any OPDS app"
            external
            href="https://opds.io/"
          />
          <Box
            x={650}
            y={52}
            w={180}
            id="calibre"
            title="Calibre plugin"
            sub="two-way library sync"
          />
          <Box
            x={850}
            y={52}
            w={160}
            title="AI agents"
            sub="any MCP client"
            external
            href="https://modelcontextprotocol.io/"
          />
          <Box
            x={1030}
            y={52}
            w={190}
            id="digitalizer"
            title="books-digitalizer"
            sub="scans → PDF/A, EPUB"
          />

          {/* ---------- Client → catalog ---------- */}
          <Edge from={[126, 116]} to={[126, 186]} label="REST, files, chat" />
          <Edge
            from={[200, 116]}
            to={[330, 186]}
            label="loans"
            lx={262}
            ly={146}
          />
          <Edge from={[560, 116]} to={[560, 186]} label="catalog feeds" />
          <Edge
            from={[480, 116]}
            to={[384, 186]}
            label="loan status"
            lx={412}
            ly={146}
            anchor="middle"
          />
          <Edge from={[740, 116]} to={[740, 186]} label="sync, API key" />
          <Edge from={[930, 116]} to={[930, 186]} label="tools, API key" />
          <Edge from={[1125, 116]} to={[1125, 186]} label="publish, API key" />

          {/* ---------- Catalog ---------- */}
          <a
            href={catalog.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="EvilFlowersCatalog (opens repository)">
            <g className={clsx(styles.box, styles.catalog)}>
              <title>{`EvilFlowersCatalog: ${catalog.description}`}</title>
              <rect x={20} y={200} width={1200} height={130} rx="16" />
              <text x={40} y={252} className={styles.catalogTitle}>
                EvilFlowersCatalog
              </text>
              <text x={40} y={276} className={styles.boxSub}>
                Django + Celery. Catalogs, publications, users, loans,
                annotations.
              </text>
              <text x={40} y={296} className={styles.boxSub}>
                One install hosts many separate libraries.
              </text>
            </g>
          </a>
          <Pill cx={160} cy={200} w={264} text="/api/v1 · /data/v1 · /assistant/v1" />
          <Pill cx={354} cy={200} w={110} text="/readium/v1" />
          <Pill cx={560} cy={200} w={172} text="/opds/v1.2 · /opds/v2" />
          <Pill cx={740} cy={200} w={80} text="/api/v1" />
          <Pill cx={930} cy={200} w={90} text="/mcp/v1" />
          <Pill cx={1125} cy={200} w={80} text="/api/v1" />
          <Pill cx={1100} cy={330} w={124} text="/extraction/v1" />

          {/* ---------- Lending ---------- */}
          <Group x={20} y={420} w={400} h={196} />
          <Box
            x={36}
            y={470}
            w={164}
            id="worker-lcp"
            title="lcpencrypt-worker"
            sub="encrypts files"
          />
          <Box
            x={232}
            y={470}
            w={174}
            id="lcp-server"
            sub="licenses, status"
          />
          <Edge from={[200, 502]} to={[232, 502]} />
          <text x={216} y={560} textAnchor="middle" className={styles.note}>
            registers encrypted files
          </text>

          {/* ---------- Storage ---------- */}
          <Group x={450} y={420} w={340} h={196} />
          <Box
            x={466}
            y={470}
            w={150}
            id="postgresql"
            title="PostgreSQL 18"
            sub="pgvector, pg_search"
          />
          <Box
            x={630}
            y={470}
            w={144}
            title="Redis"
            sub="task queue"
            external
            href="https://redis.io/"
          />
          <Box
            x={466}
            y={550}
            w={308}
            h={50}
            title="Files"
            sub="local disk or any S3 store"
            external
          />

          {/* ---------- Extraction ---------- */}
          <Group x={820} y={420} w={400} h={196} />
          <Box x={836} y={462} w={170} h={56} id="svc-analyzer" title="analyzer" sub="page layout" />
          <Box x={836} y={546} w={118} h={56} id="svc-text" title="text" sub="paragraphs" />
          <Box x={966} y={546} w={118} h={56} id="svc-image" title="image" sub="figures" />
          <Box x={1096} y={546} w={112} h={56} id="svc-equation" title="equation" sub="LaTeX" />
          <Box x={1030} y={462} w={176} h={56} id="svc-ocr" title="ocr-service" sub="text layer for scans" />
          <Edge from={[900, 518]} to={[895, 546]} />
          <Edge from={[960, 518]} to={[1020, 546]} />
          <Edge from={[995, 518]} to={[1140, 546]} />

          {/* ---------- Catalog → back end ---------- */}
          <Edge from={[121, 330]} to={[121, 470]} label="encryption task" />
          <Edge from={[325, 330]} to={[325, 470]} label="licenses, status" />
          <Edge from={[541, 330]} to={[541, 470]} label="SQL" />
          <Edge from={[702, 330]} to={[702, 470]} label="Celery tasks" />
          <Edge from={[921, 330]} to={[921, 462]} label="extraction task" />
          <Edge
            from={[1100, 420]}
            to={[1100, 342]}
            label="results"
            lx={1093}
            anchor="end"
            dashed
          />
          <Edge
            from={[1185, 330]}
            to={[1185, 462]}
            label="OCR task"
            lx={1178}
            ly={400}
            anchor="end"
          />

          <GroupLabel x={20} y={20} label="In the reader’s browser" />
          <GroupLabel x={20} y={420} label="Lending · Readium LCP" />
          <GroupLabel x={450} y={420} label="Storage" />
          <GroupLabel x={820} y={420} label="Processing" />
        </svg>
      </div>
      {caption && (
        <figcaption className={styles.legend}>
          <span>
            <i className={styles.legendExternal} /> Dashed: not part of the
            project
          </span>
          <span className={styles.legendHint}>
            Click a box to open its repository.
          </span>
        </figcaption>
      )}
    </figure>
  );
}
