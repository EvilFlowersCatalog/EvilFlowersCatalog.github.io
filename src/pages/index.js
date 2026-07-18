import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  FaArrowRight,
  FaBookOpen,
  FaSearch,
  FaLock,
  FaQuoteRight,
  FaRobot,
  FaGithub,
} from 'react-icons/fa';

import Reveal from '@site/src/components/Reveal';
import {DEPLOYMENTS, ORG_URL} from '@site/src/data/ecosystem';
import styles from './index.module.css';

const LIBRARY_URL = 'https://elvira.stuba.sk/';

const FEATURES = [
  {
    title: 'Read in the browser',
    Icon: FaBookOpen,
    body: 'Open any title in the built-in reader — search the text, jump between pages, highlight, print or download. No app to install, nothing to configure.',
  },
  {
    title: 'Search across languages',
    Icon: FaSearch,
    body: 'Ask in Slovak and still find matching passages in English, Czech and German. Meaning-based and keyword search run side by side, down to the sentence.',
  },
  {
    title: 'Borrow securely',
    Icon: FaLock,
    body: 'Borrow, renew and return protected titles with Readium LCP — the same open standard public libraries use. EdRLab certification is in progress.',
  },
  {
    title: 'Cite in one click',
    Icon: FaQuoteRight,
    body: 'Export a citation in BibTeX, BibLaTeX or RIS, or share a single page range instead of passing around the whole file.',
  },
];

function BrowserFrame({src, alt, url, className, tall = false}) {
  return (
    <figure className={clsx(styles.frame, tall && styles.frameTall, className)}>
      <div className={styles.frameBar}>
        <span className={styles.frameDot} />
        <span className={styles.frameDot} />
        <span className={styles.frameDot} />
        <span className={styles.frameUrl}>{url}</span>
      </div>
      <div className={styles.frameBody}>
        <img src={src} alt={alt} loading="lazy" />
      </div>
    </figure>
  );
}

function Hero() {
  const portalImg = useBaseUrl('/img/portal.png');
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            Digital library · Slovak University of Technology
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            Your library,
            <br />
            open in the browser.
          </Heading>
          <p className={styles.heroSubtitle}>
            ELVIRA holds the university&rsquo;s publications — textbooks,
            lecture notes, papers and scanned collections. Search the
            catalog, read on any device and borrow what you need. Nothing
            to install.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--primary button--lg', styles.btn)}
              href={LIBRARY_URL}>
              Open the library <FaArrowRight />
            </Link>
            <a
              className={clsx(
                'button button--secondary button--lg',
                styles.btn,
              )}
              href="#reader">
              See the reader
            </a>
          </div>
          <p className={styles.heroMeta}>
            Live at the Slovak University of Technology and KU Ružomberok ·
            free for students and staff
          </p>
        </div>
        <div className={styles.heroVisual}>
          <BrowserFrame
            src={portalImg}
            alt="The ELVIRA catalog — a grid of publication covers with search"
            url="elvira.stuba.sk"
            className={styles.heroFrame}
          />
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>What you can do</div>
          <h2 className={styles.sectionTitle}>
            A library that keeps up with how you actually read
          </h2>
          <p className={styles.sectionLede}>
            Everything happens in the browser — finding a title, reading it,
            borrowing it and citing it. No queues, no reader software, no
            copy sitting on a shared drive.
          </p>
        </Reveal>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({title, Icon, body}, i) => (
            <Reveal
              key={title}
              className={styles.featureCard}
              delay={i * 60}>
              <div className={styles.featureIcon}>
                <Icon aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reader() {
  const readerImg = useBaseUrl('/img/reader.png');
  return (
    <section id="reader" className={styles.showcase}>
      <div className={clsx('container', styles.showcaseInner)}>
        <Reveal className={styles.showcaseCopy}>
          <div className={styles.sectionLabelLight}>The reader</div>
          <h2 className={styles.showcaseTitle}>Read it like it&rsquo;s yours</h2>
          <p className={styles.showcaseBody}>
            Every publication opens in the same reader, right where you left
            off. Search inside the text, page through thumbnails, highlight
            and annotate, switch to dark mode, and pull out a citation — all
            without leaving the tab.
          </p>
          <ul className={styles.checkList}>
            <li>Full-text search inside the document</li>
            <li>Highlights, notes and page-range sharing</li>
            <li>Citation export &amp; download when it&rsquo;s allowed</li>
          </ul>
        </Reveal>
        <Reveal className={styles.showcaseVisual} delay={80}>
          <BrowserFrame
            src={readerImg}
            alt="The ELVIRA reader with a book open, page thumbnails along the bottom"
            url="elvira.stuba.sk/reader"
            tall
          />
        </Reveal>
      </div>
    </section>
  );
}

function Assistant() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.assistantCard}>
          <div className={styles.assistantIcon}>
            <FaRobot aria-hidden="true" />
          </div>
          <div className={styles.assistantBody}>
            <div className={styles.assistantHead}>
              <h2>Ask the library a question</h2>
              <span className={styles.badge}>In development</span>
            </div>
            <p>
              An assistant that reads the collection answers in plain
              language and links back to the exact passage it drew from —
              so you can check the source, not just trust the summary. It
              runs today in our development environment and is rolling out
              to the academic community.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Deployments() {
  return (
    <section className={styles.deployments}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>Where it runs</div>
          <h2 className={styles.sectionTitle}>
            In production at two universities
          </h2>
          <p className={styles.sectionLede}>
            One codebase, themed per campus. The portal changes its branding
            per deployment; the catalog underneath is the same software.
          </p>
        </Reveal>
        <div className={styles.deploymentsGrid}>
          {DEPLOYMENTS.map((d, i) => (
            <Reveal
              key={d.short}
              className={styles.deploymentCard}
              delay={i * 60}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.deploymentLink}>
                <strong>{d.short}</strong>
                <span>{d.name}</span>
                <p>{d.note}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.osCard}>
          <div>
            <div className={styles.sectionLabelLight}>Open source</div>
            <h2>Built in the open at FIIT STU</h2>
            <p>
              The catalog, the reader and the wire protocol are all public
              and permissively licensed. ELVIRA speaks the standards
              e-readers already know — OPDS for catalogs, Readium LCP for
              lending — so nothing here is locked to us.
            </p>
          </div>
          <div className={styles.osActions}>
            <Link
              className={clsx('button button--primary button--lg', styles.btn)}
              href={ORG_URL}>
              <FaGithub />
              &nbsp;Browse the source
            </Link>
            <Link
              className={clsx(
                'button button--secondary button--lg',
                styles.btn,
              )}
              to="/docs/intro">
              Read the docs
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className={styles.closing}>
      <div className="container">
        <div className={styles.closingCard}>
          <h2>Everything the university has, one login away.</h2>
          <p>
            Sign in with your university account and start reading. Free for
            the whole academic community.
          </p>
          <Link
            className={clsx('button button--lg', styles.btnLight)}
            href={LIBRARY_URL}>
            Open ELVIRA <FaArrowRight />
          </Link>
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
      description="ELVIRA — the digital library of the Slovak University of Technology. Search, read and borrow academic publications in your browser. Open source, built at FIIT STU, in production at STU and KU Ružomberok.">
      <Hero />
      <main>
        <Features />
        <Reader />
        <Assistant />
        <Deployments />
        <OpenSource />
        <ClosingCTA />
      </main>
    </Layout>
  );
}
