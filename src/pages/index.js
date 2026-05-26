import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  FaArrowRight,
  FaBookReader,
  FaSearch,
  FaShieldAlt,
  FaGithub,
  FaBookOpen,
} from 'react-icons/fa';

import {DEPLOYMENTS, NODES, ORG_URL} from '@site/src/data/ecosystem';
import styles from './index.module.css';

const STANDARDS = [
  {id: 'opds12', label: 'OPDS 1.2', href: 'https://specs.opds.io/opds-1.2'},
  {id: 'opds20', label: 'OPDS 2.0', href: 'https://drafts.opds.io/opds-2.0'},
  {id: 'lcp', label: 'Readium LCP', href: 'https://readium.org/lcp-specs/'},
  {id: 'rwpm', label: 'RWPM', href: 'https://readium.org/webpub-manifest/'},
  {
    id: 'lsd',
    label: 'LSD',
    href: 'https://readium.org/lcp-specs/releases/lsd/latest',
  },
];

const FEATURES = [
  {
    title: 'Read',
    Icon: FaBookReader,
    body: 'Embedded PDF viewer with annotation layer, BibTeX / RIS citation export and page-range sharing. Works for born-digital PDFs and OCR-recovered scans.',
  },
  {
    title: 'Search',
    Icon: FaSearch,
    body: 'Multilingual semantic search over the full corpus. A Slovak query finds relevant passages in English, Czech and German literature. An AI assistant answers questions over library content with passage-level citations.',
  },
  {
    title: 'Lend',
    Icon: FaShieldAlt,
    body: 'OPDS 1.2 and 2.0 distribution. End-to-end Readium LCP lending — borrow, reserve, renew, return — with EdRLab certification in progress.',
  },
];

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      {threshold: 0.2, ...options},
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [options]);
  return [ref, inView];
}

function CountUp({end, duration = 1400, suffix = ''}) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function PublicationStack() {
  // A stylised stack of publication cards — the front card is a portal /
  // catalog entry mock (cover area, title bars, format chips). Two cards
  // peek out behind it to imply collection. Subtle float animation, no
  // rotating parts.
  return (
    <svg
      viewBox="0 0 360 360"
      className={styles.publicationStack}
      aria-hidden="true">
      <defs>
        <linearGradient id="psCoverA" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#01a9e0" />
          <stop offset="100%" stopColor="#7c5cff" />
        </linearGradient>
        <linearGradient id="psCoverB" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0077cc" />
          <stop offset="100%" stopColor="#15384e" />
        </linearGradient>
        <filter
          id="psShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="18"
            floodColor="#000000"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      <g transform="translate(184 50) rotate(8)" opacity="0.45">
        <rect
          width="160"
          height="220"
          rx="14"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        <rect
          x="14"
          y="14"
          width="132"
          height="86"
          rx="8"
          fill="url(#psCoverB)"
          opacity="0.55"
        />
      </g>

      <g transform="translate(130 56) rotate(-4)" opacity="0.8">
        <rect
          width="170"
          height="232"
          rx="14"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />
        <rect
          x="14"
          y="14"
          width="142"
          height="96"
          rx="8"
          fill="url(#psCoverB)"
          opacity="0.75"
        />
        <rect
          x="14"
          y="124"
          width="120"
          height="8"
          rx="4"
          fill="rgba(255,255,255,0.45)"
        />
        <rect
          x="14"
          y="140"
          width="80"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.3)"
        />
      </g>

      <g
        className={styles.publicationStackFront}
        transform="translate(64 78)"
        filter="url(#psShadow)">
        <rect
          width="210"
          height="252"
          rx="16"
          fill="#15384e"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />
        <rect
          x="16"
          y="16"
          width="178"
          height="120"
          rx="10"
          fill="url(#psCoverA)"
        />
        <rect
          x="28"
          y="56"
          width="58"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.85)"
        />
        <rect
          x="28"
          y="70"
          width="36"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.7)"
        />

        <rect
          x="16"
          y="152"
          width="170"
          height="10"
          rx="5"
          fill="rgba(255,255,255,0.88)"
        />
        <rect
          x="16"
          y="170"
          width="128"
          height="10"
          rx="5"
          fill="rgba(255,255,255,0.7)"
        />
        <rect
          x="16"
          y="194"
          width="80"
          height="7"
          rx="3.5"
          fill="rgba(255,255,255,0.45)"
        />

        <g transform="translate(16 216)">
          <rect
            width="46"
            height="22"
            rx="11"
            fill="rgba(1,169,224,0.2)"
            stroke="rgba(1,169,224,0.6)"
            strokeWidth="1"
          />
          <rect
            x="10"
            y="9"
            width="26"
            height="4"
            rx="2"
            fill="#aee2f4"
          />
          <rect
            x="54"
            width="60"
            height="22"
            rx="11"
            fill="rgba(124,92,255,0.2)"
            stroke="rgba(124,92,255,0.6)"
            strokeWidth="1"
          />
          <rect
            x="64"
            y="9"
            width="40"
            height="4"
            rx="2"
            fill="#d3c6ff"
          />
        </g>
      </g>
    </svg>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroCopy}>
          <span className={styles.heroKicker}>
            <span className={styles.heroDot} />
            Open source · FIIT STU
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            An open digital library
            <br />
            for universities.
          </Heading>
          <p className={styles.heroSubtitle}>
            <strong>{siteConfig.title}</strong> is an OPDS publication
            catalog, a web portal and an embeddable PDF viewer. Two Slovak
            universities run it in production; the code, the protocol and
            the infrastructure are all on GitHub.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--primary button--lg', styles.heroBtn)}
              to="/ecosystem">
              Explore the ecosystem <FaArrowRight />
            </Link>
            <Link
              className={clsx(
                'button button--secondary button--lg',
                styles.heroBtn,
              )}
              href={ORG_URL}>
              <FaGithub />
              Source on GitHub
            </Link>
          </div>
          <div className={styles.standards}>
            <span className={styles.standardsLabel}>Speaks</span>
            {STANDARDS.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className={styles.standardChip}
                target="_blank"
                rel="noopener noreferrer">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <PublicationStack />
        </div>
      </div>
    </header>
  );
}

function StatBand() {
  const reposVisible = NODES.filter(
    (n) => n.repo && n.category !== 'devops' && n.category !== 'standard',
  ).length;
  const workers = NODES.filter((n) => n.category === 'worker').length;
  const standards = NODES.filter((n) => n.category === 'standard').length;
  const deployments = DEPLOYMENTS.length;
  const stats = [
    {value: reposVisible, label: 'open-source repos'},
    {value: workers, label: 'background workers'},
    {value: standards, label: 'open standards spoken'},
    {value: deployments, label: 'universities running it'},
  ];
  return (
    <section className={styles.statBand}>
      <div className="container">
        <ul className={styles.statList}>
          {stats.map((s) => (
            <li key={s.label}>
              <strong>
                <CountUp end={s.value} />
              </strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionLabel}>What it does</div>
        <h2 className={styles.sectionTitle}>
          A library that understands its own content
        </h2>
        <p className={styles.sectionLede}>
          ELVIRA is more than a catalog. A pipeline of AI workers extracts
          text, tables, figures and formulas from each publication, embeds
          them with multilingual models, and exposes the result through
          semantic search, an AI assistant and standards-based lending.
        </p>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({title, Icon, body}) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Icon aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EcosystemTeaser() {
  return (
    <section className={styles.teaser}>
      <div className="container">
        <div className={styles.teaserInner}>
          <div className={styles.sectionLabel}>Architecture</div>
          <h2 className={styles.teaserTitle}>How the pieces fit</h2>
          <p className={styles.teaserBody}>
            The interactive ecosystem map shows every component, every
            dependency edge and every standard ELVIRA implements. Useful
            if you’re deciding what to extend, fork or replace.
          </p>
          <Link className="button button--primary" to="/ecosystem">
            Open the map <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Deployments() {
  return (
    <section className={styles.deployments}>
      <div className="container">
        <div className={styles.sectionLabel}>In production</div>
        <h2 className={styles.sectionTitle}>
          Two universities, one codebase
        </h2>
        <p className={styles.sectionLede}>
          ELVIRA runs at two Slovak universities today. The portal handles
          per-site theming and configuration; the catalog underneath is
          the same software.
        </p>
        <div className={styles.deploymentsGrid}>
          {DEPLOYMENTS.map((d) => (
            <a
              key={d.short}
              className={styles.deploymentCard}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer">
              <strong>{d.short}</strong>
              <span>{d.name}</span>
              <p>{d.note}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className={styles.closing}>
      <div className="container">
        <div className={styles.closingCard}>
          <div>
            <h2>Run your own deployment</h2>
            <p>
              Container images, deployment manifests and the OpenAPI
              protocol are all public. License is MIT (BSD-3-Clause for
              the Readium fork). Pull requests welcome.
            </p>
          </div>
          <div className={styles.closingActions}>
            <Link className="button button--primary button--lg" href={ORG_URL}>
              <FaGithub />
              &nbsp;Source code
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              <FaBookOpen />
              &nbsp;Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="ELVIRA — open OPDS publication catalog, web portal and PDF viewer. Built at the Faculty of Informatics and Information Technologies (Slovak University of Technology, Bratislava), deployed there and at the Catholic University in Ružomberok.">
      <HomepageHeader />
      <main>
        <StatBand />
        <Features />
        <EcosystemTeaser />
        <Deployments />
        <ClosingCTA />
      </main>
    </Layout>
  );
}
