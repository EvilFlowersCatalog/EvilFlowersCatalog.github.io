import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  FaGithub,
  FaExternalLinkAlt,
  FaTimes,
  FaCodeBranch,
  FaSearch,
  FaChevronRight,
} from 'react-icons/fa';

import {
  NODES,
  LINKS,
  CATEGORIES,
  STATUSES,
  ORG_URL,
} from '@site/src/data/ecosystem';
import styles from './styles.module.css';

/**
 * The ecosystem is rendered as a static layered architecture diagram —
 * five stacked lanes (Standards → Protocol → Core → Services → Workers)
 * plus an "Adjacent" rail for Infrastructure / Team / Legacy.
 *
 * No force simulation. Nothing jiggles. Connections are drawn as SVG
 * curves overlaid on top of the HTML layout, anchored to live node
 * coordinates measured with getBoundingClientRect, so the lines follow
 * the layout through resizes.
 */

const STACK_LAYERS = [
  {id: 'standard', label: 'Standards', sub: 'What ELVIRA speaks'},
  {id: 'protocol', label: 'Protocol', sub: 'EvilFlowers contract & bindings'},
  {id: 'core', label: 'Core platform', sub: 'Server, portal, viewer, importer'},
  {
    id: 'worker',
    label: 'Workers',
    sub: 'Celery jobs on the event broker — content services, OCR, LCP',
  },
];

const SIDE_RAIL = [
  {id: 'devops', label: 'Infrastructure'},
  {id: 'team', label: 'Team projects (TP)'},
];

const LINK_LABEL = {
  feeds: 'feeds',
  implements: 'implements',
  depends: 'depends on',
  fork: 'forked from',
};

const LINK_COLOR = {
  feeds: '#34c38f',
  implements: 'var(--ifm-color-primary)',
  depends: 'var(--ifm-color-emphasis-500)',
  fork: '#7c5cff',
};

function nodesIn(category) {
  return NODES.filter((n) => n.category === category);
}

function neighboursOf(nodeId) {
  const out = new Set();
  for (const l of LINKS) {
    if (l.source === nodeId) out.add(l.target);
    if (l.target === nodeId) out.add(l.source);
  }
  return out;
}

function NodePill({
  node,
  selected,
  focusId,
  dimmed,
  hidden,
  onSelect,
  onHover,
  innerRef,
}) {
  const cat = CATEGORIES[node.category];
  const status = STATUSES[node.status];
  return (
    <button
      ref={innerRef}
      type="button"
      data-node-id={node.id}
      className={[
        styles.pill,
        styles[`pill_${node.category}`],
        selected ? styles.pillSelected : '',
        focusId === node.id ? styles.pillFocused : '',
        dimmed ? styles.pillDimmed : '',
        hidden ? styles.pillHidden : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--node-color': cat?.color,
      }}
      onClick={() => onSelect(node)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}>
      <span className={styles.pillDot} aria-hidden="true" />
      <span className={styles.pillLabel}>{node.name}</span>
      {status && status.label !== 'Specification' && (
        <span
          className={styles.pillStatus}
          style={{background: status.color}}
          title={status.label}
        />
      )}
    </button>
  );
}

function Layer({
  layer,
  nodes,
  registerRef,
  selectedId,
  hoverId,
  onSelect,
  onHover,
  visibleSet,
  matchSet,
  searchActive,
}) {
  if (!nodes.length) return null;
  return (
    <section
      className={styles.layer}
      data-layer={layer.id}
      style={{'--layer-accent': CATEGORIES[layer.id]?.color}}>
      <header className={styles.layerHeader}>
        <span className={styles.layerLabel}>{layer.label}</span>
        <span className={styles.layerSub}>{layer.sub}</span>
        <span className={styles.layerCount}>{nodes.length}</span>
      </header>
      <div className={styles.layerRow}>
        {nodes.map((n) => (
          <NodePill
            key={n.id}
            node={n}
            innerRef={(el) => registerRef(n.id, el)}
            selected={selectedId === n.id}
            focusId={hoverId}
            dimmed={
              hoverId
                ? hoverId !== n.id && !neighboursOf(hoverId).has(n.id)
                : selectedId
                  ? selectedId !== n.id && !neighboursOf(selectedId).has(n.id)
                  : false
            }
            hidden={!visibleSet.has(n.category) || (searchActive && !matchSet.has(n.id))}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </section>
  );
}

function SideRail({
  bucket,
  nodes,
  registerRef,
  selectedId,
  hoverId,
  onSelect,
  onHover,
  visibleSet,
  matchSet,
  searchActive,
}) {
  if (!nodes.length) return null;
  return (
    <section
      className={styles.sideBucket}
      data-bucket={bucket.id}
      style={{'--bucket-accent': CATEGORIES[bucket.id]?.color}}>
      <header className={styles.sideBucketHeader}>
        <span className={styles.sideBucketLabel}>{bucket.label}</span>
        <span className={styles.sideBucketCount}>{nodes.length}</span>
      </header>
      <div className={styles.sideBucketCol}>
        {nodes.map((n) => (
          <NodePill
            key={n.id}
            node={n}
            innerRef={(el) => registerRef(n.id, el)}
            selected={selectedId === n.id}
            focusId={hoverId}
            dimmed={
              hoverId
                ? hoverId !== n.id && !neighboursOf(hoverId).has(n.id)
                : selectedId
                  ? selectedId !== n.id && !neighboursOf(selectedId).has(n.id)
                  : false
            }
            hidden={!visibleSet.has(n.category) || (searchActive && !matchSet.has(n.id))}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </section>
  );
}

function EdgeOverlay({edges, hoverId, selectedId}) {
  // Only emphasise edges connected to the focused / selected node.
  const focusId = hoverId || selectedId;
  return (
    <svg className={styles.edgeOverlay} aria-hidden="true">
      <defs>
        <marker
          id="edge-arrow"
          viewBox="0 -4 8 8"
          refX="7"
          refY="0"
          markerWidth="6"
          markerHeight="6"
          orient="auto">
          <path d="M0,-3 L7,0 L0,3 Z" fill="currentColor" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const isActive =
          focusId && (e.source === focusId || e.target === focusId);
        const cls = [
          styles.edge,
          styles[`edge_${e.type}`],
          isActive ? styles.edgeActive : '',
          focusId && !isActive ? styles.edgeDimmed : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <g key={i} className={cls} style={{color: LINK_COLOR[e.type]}}>
            <path d={e.path} fill="none" markerEnd="url(#edge-arrow)" />
            {isActive && (
              <text
                className={styles.edgeLabel}
                x={(e.sx + e.tx) / 2}
                y={(e.sy + e.ty) / 2 - 4}
                textAnchor="middle">
                {LINK_LABEL[e.type]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function NodeDetails({node, onClose}) {
  if (!node) return null;
  const cat = CATEGORIES[node.category];
  const status = STATUSES[node.status];
  const issuesUrl =
    node.repo && node.repo.startsWith(ORG_URL) ? `${node.repo}/issues` : null;

  // Render the "connects to" list grouped by relationship type.
  const links = LINKS.filter((l) => l.source === node.id || l.target === node.id).map((l) => ({
    other: l.source === node.id ? l.target : l.source,
    direction: l.source === node.id ? 'out' : 'in',
    type: l.type,
  }));

  return (
    <aside className={styles.panel} role="dialog" aria-labelledby="ecosystem-node-title">
      <button
        type="button"
        onClick={onClose}
        className={styles.panelClose}
        aria-label="Close details">
        <FaTimes />
      </button>
      <div className={styles.panelHeader} style={{borderColor: cat?.color}}>
        <span className={styles.panelCategory} style={{color: cat?.color}}>
          {cat?.label}
        </span>
        <h3 id="ecosystem-node-title" className={styles.panelTitle}>
          {node.name}
        </h3>
        <div className={styles.panelMeta}>
          {status && (
            <span
              className={styles.panelStatus}
              style={{
                background: `${status.color}22`,
                color: status.color,
                borderColor: status.color,
              }}>
              {status.label}
            </span>
          )}
          {node.language && <span className={styles.panelChip}>{node.language}</span>}
          {node.version && <span className={styles.panelChip}>{node.version}</span>}
          {node.pushed_at && (
            <span className={styles.panelChipMuted}>pushed {node.pushed_at}</span>
          )}
        </div>
      </div>
      <p className={styles.panelDescription}>{node.description}</p>
      {node.highlights && (
        <ul className={styles.panelHighlights}>
          {node.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <div className={styles.panelConnections}>
          <h4>Connections</h4>
          <ul>
            {links.map((l, i) => {
              const other = NODES.find((n) => n.id === l.other);
              if (!other) return null;
              return (
                <li key={i}>
                  <span
                    className={styles.connRel}
                    style={{color: LINK_COLOR[l.type]}}>
                    {l.direction === 'out' ? LINK_LABEL[l.type] : `← ${LINK_LABEL[l.type]}`}
                  </span>
                  <span className={styles.connTarget}>{other.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className={styles.panelLinks}>
        {node.repo && (
          <a href={node.repo} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
            <FaGithub /> Repo
          </a>
        )}
        {issuesUrl && (
          <a href={issuesUrl} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
            <FaCodeBranch /> Issues
          </a>
        )}
        {node.api && (
          <a href={node.api} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
            <FaExternalLinkAlt /> OpenAPI
          </a>
        )}
        {node.docs && (
          <a href={node.docs} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
            <FaExternalLinkAlt /> Docs
          </a>
        )}
      </div>
    </aside>
  );
}

function EcosystemGraphInner() {
  const containerRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(
    () => new Set(Object.keys(CATEGORIES)),
  );

  const registerRef = useCallback((id, el) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  // Recompute edge paths whenever layout could have changed.
  const recomputeEdges = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const next = [];
    for (const l of LINKS) {
      const a = nodeRefs.current.get(l.source);
      const b = nodeRefs.current.get(l.target);
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const sx = ra.left + ra.width / 2 - containerRect.left;
      const sy = ra.top + ra.height / 2 - containerRect.top;
      const tx = rb.left + rb.width / 2 - containerRect.left;
      const ty = rb.top + rb.height / 2 - containerRect.top;
      // Anchor on edges of pills (not centers) for a cleaner look.
      const fromBottom = sy < ty;
      const fromTop = sy > ty;
      const startY = fromBottom ? sy + ra.height / 2 : fromTop ? sy - ra.height / 2 : sy;
      const endY = fromBottom ? ty - rb.height / 2 : fromTop ? ty + rb.height / 2 : ty;
      const dy = endY - startY;
      const c1y = startY + dy * 0.45;
      const c2y = startY + dy * 0.55;
      const path = `M ${sx},${startY} C ${sx},${c1y} ${tx},${c2y} ${tx},${endY}`;
      next.push({
        source: l.source,
        target: l.target,
        type: l.type,
        path,
        sx,
        sy: startY,
        tx,
        ty: endY,
      });
    }
    setEdges(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    recomputeEdges();
    const ro = new ResizeObserver(() => recomputeEdges());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recomputeEdges);
    // Also recompute on scroll-into-view animations (e.g. fonts loaded).
    const id = window.setTimeout(recomputeEdges, 50);
    const id2 = window.setTimeout(recomputeEdges, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recomputeEdges);
      window.clearTimeout(id);
      window.clearTimeout(id2);
    };
    // recomputeEdges is stable; visible/search changes trigger layout
    // changes which the ResizeObserver picks up.
  }, [recomputeEdges]);

  // Recompute when visibility or search-narrowed list changes (DOM re-flows).
  useEffect(() => {
    const id = window.setTimeout(recomputeEdges, 30);
    return () => window.clearTimeout(id);
  }, [visible, search, recomputeEdges]);

  const toggleCategory = (cat) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const matchSet = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return new Set();
    const matches = new Set();
    for (const n of NODES) {
      if (n.name.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)) {
        matches.add(n.id);
      }
    }
    return matches;
  }, [search]);

  const searchActive = search.trim().length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search the stack…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search nodes"
          />
        </div>
        <div className={styles.filters}>
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${
                visible.has(key) ? '' : styles.filterChipOff
              }`}
              style={{'--chip-color': c.color}}
              onClick={() => toggleCategory(key)}
              title={c.description}>
              <span className={styles.filterDot} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.board} ref={containerRef}>
        <EdgeOverlay edges={edges} hoverId={hoverId} selectedId={selected?.id} />

        <div className={styles.stack}>
          {STACK_LAYERS.map((layer) => (
            <Layer
              key={layer.id}
              layer={layer}
              nodes={nodesIn(layer.id)}
              registerRef={registerRef}
              selectedId={selected?.id}
              hoverId={hoverId}
              onSelect={(n) => setSelected(n)}
              onHover={setHoverId}
              visibleSet={visible}
              matchSet={matchSet}
              searchActive={searchActive}
            />
          ))}
        </div>

        <div className={styles.sideRail}>
          <span className={styles.sideRailHeading}>
            <FaChevronRight aria-hidden="true" />
            Adjacent
          </span>
          {SIDE_RAIL.map((bucket) => (
            <SideRail
              key={bucket.id}
              bucket={bucket}
              nodes={nodesIn(bucket.id)}
              registerRef={registerRef}
              selectedId={selected?.id}
              hoverId={hoverId}
              onSelect={(n) => setSelected(n)}
              onHover={setHoverId}
              visibleSet={visible}
              matchSet={matchSet}
              searchActive={searchActive}
            />
          ))}
        </div>
      </div>

      <NodeDetails node={selected} onClose={() => setSelected(null)} />

      <p className={styles.legendLine}>
        Pills are repos · diamonds are external standards · curves show data
        flow and dependencies · hover a pill to highlight its neighbours,
        click for details.
      </p>
    </div>
  );
}

export default function EcosystemGraph() {
  return (
    <BrowserOnly fallback={<div style={{minHeight: 520}} />}>
      {() => <EcosystemGraphInner />}
    </BrowserOnly>
  );
}
