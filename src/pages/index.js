import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

import CatalogCard from '@site/src/components/CatalogCard';
import releasesData from '@site/src/data/releases.json';
import {announcementFor, latestPerRepo, REPO_ROLES} from '@site/src/data/announcements';
import styles from './index.module.css';

const FEATURES = [
  {
    title: 'Read in the browser',
    body: 'Every PDF opens in the built-in reader. Search inside the text, page through thumbnails, highlight and take notes. Nothing to install.',
  },
  {
    title: 'Borrow protected titles',
    body: 'E-books are lent with Readium LCP, the open DRM public libraries use. Readers borrow, renew, return and join a waiting list when all copies are out.',
  },
  {
    title: 'Use any e-reader app',
    body: 'Every catalog is also an OPDS 1.2 and 2.0 feed. Add it to Thorium or another OPDS app and browse, borrow and read there.',
  },
  {
    title: 'Cite and share',
    body: 'Copy a citation as BibTeX, BibLaTeX or RIS. Share a page range instead of the whole file.',
  },
  {
    title: 'Many libraries, one install',
    body: 'One server hosts separate catalogs, each with its own publications and permissions. Sign in with a local account or the university’s LDAP.',
  },
  {
    title: 'An API for everything',
    body: 'Whatever the portal can do, a script can do over the documented REST API. AI agents connect over the Model Context Protocol.',
  },
];

const SEARCH_AND_AI = [
  {
    title: 'Multilingual search',
    body: 'Results are ranked by what a query means, so a question in Slovak can find a paragraph in English. Word search handles Slovak and Czech word forms and suggests corrections.',
  },
  {
    title: 'Search inside publications',
    body: 'A search returns the paragraph that matches, not only the book, with a link that opens the reader on that page.',
  },
  {
    title: 'Structure from every PDF',
    body: 'Workers add a text layer to scanned PDFs, split each publication into paragraphs, crop its figures and tables, and turn its formulas into LaTeX.',
  },
  {
    title: 'An assistant that cites',
    body: 'Ask about the collection, or about a passage or figure in the reader, and get an answer with a link to each page it used. Titles lent with Readium LCP are never read by AI.',
  },
];

const QUICKSTART = `git clone https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.git
cd EvilFlowersCatalog
docker compose up -d --build django
docker compose exec django python3 manage.py setup
docker compose exec django python3 manage.py createsuperuser`;

const fmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function Shot({src, alt, caption, wide}) {
  const url = useBaseUrl(src);
  return (
    <figure className={wide ? styles.shotWide : styles.shot}>
      <img src={url} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>
          An open-source digital library for universities
        </h1>
        <p className="e-lede">
          ELVIRA puts a library’s publications in one catalog, opens them in a
          reader in the browser, lends protected e-books, and lets readers
          search inside every book. It is developed at the Slovak University
          of Technology in Bratislava, and any library can run it on its own
          servers.
        </p>
        <p className={styles.heroLinks}>
          <Link className={styles.primary} to="/docs/quickstart">
            Run it yourself
          </Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/docs/adopting">Adopting ELVIRA</Link>
        </p>
        <p className={styles.usedBy}>
          Libraries using it include the{' '}
          <a href="https://elvira.stuba.sk">Slovak University of Technology</a>{' '}
          and the Catholic University in Ružomberok.
        </p>
      </div>
      <div className={styles.heroCard}>
        <CatalogCard />
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <h2>What it does</h2>
      <dl className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title}>
            <dt>{f.title}</dt>
            <dd>{f.body}</dd>
          </div>
        ))}
      </dl>
      <Shot
        wide
        src="/img/viewer-preview.jpg"
        alt="The ELVIRA reader with a book open and page thumbnails along the bottom"
        caption="The reader. It is a separate npm package, EvilFlowersViewer, so other applications can embed it."
      />
    </section>
  );
}

function Tools() {
  return (
    <section className={styles.section}>
      <h2>Getting books in</h2>
      <p className="e-measure">
        Besides uploading in the portal or through the API, two tools fill a
        catalog: one from a Calibre library, one from a book scanner.
      </p>
      <div className={styles.pair}>
        <div>
          <Shot
            src="/img/calibre/sync-plan-conflict-light.png"
            alt="The Calibre plugin’s sync window: books grouped as to upload, to download and needs a decision, with a side-by-side comparison of a book changed on both sides"
          />
          <h3>Calibre plugin</h3>
          <p>
            Keeps a Calibre library and a catalog in sync in both directions.
            It shows what it will do to every book first, asks when both sides
            changed, and never deletes anything. Released as version 2.1.
          </p>
          <p className={styles.more}>
            <Link to="/news/calibre-plugin-2.1">About the plugin</Link>
            <a href="https://github.com/EvilFlowersCatalog/calibre-evilflowers">Repository</a>
          </p>
        </div>
        <div>
          <Shot
            src="/img/digitalizer/page-studio.png"
            alt="The digitalizer’s page studio: a scanned textbook page with text, picture and formula regions outlined, and a disputed formula waiting for a decision"
          />
          <h3>Books digitalizer</h3>
          <p>
            Cleans and OCRs scans of printed books, renders a searchable PDF,
            a PDF/A master and an EPUB, and publishes them to the catalog. A
            person reviews only the pages the machine was unsure of.
          </p>
          <p className={styles.more}>
            <Link to="/news/books-digitalizer">About the digitalizer</Link>
            <a href="https://github.com/EvilFlowersCatalog/evilflowers-books-digitalizer">
              Repository
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function SearchAndAI() {
  return (
    <section className={styles.section}>
      <h2>Search and AI</h2>
      <p className="e-measure">
        The catalog reads its own books: it searches inside them, explains
        them and cites the page. See{' '}
        <Link to="/news/catalog-0.15.0">catalog 0.15.0</Link> for what changed
        and how to set it up.
      </p>
      <dl className={styles.features}>
        {SEARCH_AND_AI.map((f) => (
          <div key={f.title}>
            <dt>{f.title}</dt>
            <dd>{f.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Releases() {
  const latest = latestPerRepo(releasesData.releases);
  if (latest.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2>Latest releases</h2>
      <table className={styles.releases}>
        <thead>
          <tr>
            <th>Project</th>
            <th>Version</th>
            <th>Released</th>
            <th>
              <span className="sr-only">Links</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {latest.map((r) => {
            const post = announcementFor(r);
            return (
              <tr key={r.repo}>
                <td>{REPO_ROLES[r.repo] ?? r.repo}</td>
                <td>
                  <code>{r.tag}</code>
                </td>
                <td>{fmt.format(new Date(r.date))}</td>
                <td className={styles.releaseLinks}>
                  {post && <Link to={post}>Announcement</Link>}
                  <a href={r.url}>Notes</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.more}>
        <Link to="/releases">All releases</Link>
        <Link to="/news">News</Link>
      </p>
    </section>
  );
}

function Start() {
  return (
    <section className={styles.section}>
      <h2>Where to start</h2>
      <div className={styles.start}>
        <div>
          <h3>See it in use</h3>
          <p>
            The Slovak University of Technology runs ELVIRA at{' '}
            <a href="https://elvira.stuba.sk">elvira.stuba.sk</a>, and the
            Catholic University in Ružomberok runs its own instance.
          </p>
          <h3>Plan a deployment</h3>
          <p>
            What you get, what you need to bring, and where the limits are:{' '}
            <Link to="/docs/adopting">Adopting ELVIRA</Link>. To talk it
            through, <Link to="/about#contact">write to us</Link>.
          </p>
        </div>
        <div>
          <h3>Run your own</h3>
          <p>
            The catalog starts with Docker Compose on <code>localhost:8000</code>.
            Its code is in the{' '}
            <a href="https://github.com/EvilFlowersCatalog">EvilFlowersCatalog</a>{' '}
            organization on GitHub; EvilFlowers is the name of the catalog
            server at the centre of ELVIRA.
          </p>
          <CodeBlock language="bash">{QUICKSTART}</CodeBlock>
          <p>
            <Link to="/docs/quickstart">Full quickstart, with the portal</Link>
            {' · '}
            <Link to="/docs/adopting">Running it for real</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Open-source digital library for universities"
      description="ELVIRA is an open-source digital library platform developed at the Slovak University of Technology in Bratislava: a catalog, a web reader, Readium LCP lending and search inside every book.">
      <main className="e-page">
        <Hero />
        <Features />
        <SearchAndAI />
        <Tools />
        <Releases />
        <Start />
      </main>
    </Layout>
  );
}
