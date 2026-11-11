import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import {
  FaArrowRight,
  FaBookOpen,
  FaLock,
  FaQuoteRight,
  FaGithub,
  FaRss,
  FaLayerGroup,
  FaCode,
  FaSearch,
  FaShapes,
  FaRobot,
  FaPrint,
  FaUniversity,
  FaTabletAlt,
  FaServer,
} from 'react-icons/fa';

import Reveal from '@site/src/components/Reveal';
import ArchitectureMap from '@site/src/components/ArchitectureMap';
import {DEPLOYMENTS, ORG_URL} from '@site/src/data/ecosystem';
import styles from './index.module.css';

const FEATURES = [
  {
    title: 'Read in the browser',
    Icon: FaBookOpen,
    body: 'Every PDF opens in the built-in reader. Search inside the text, page through thumbnails, highlight and take notes. Nothing to install.',
  },
  {
    title: 'Borrow protected titles',
    Icon: FaLock,
    body: 'Lend e-books with Readium LCP, the open DRM public libraries use. Readers borrow, renew, return and join a waiting list when all copies are out.',
  },
  {
    title: 'Use any e-reader app',
    Icon: FaRss,
    body: 'Every catalog is also an OPDS 1.2 and 2.0 feed. Add it to Thorium or another OPDS app and browse, borrow and read there.',
  },
  {
    title: 'Cite and share',
    Icon: FaQuoteRight,
    body: 'Copy a citation as BibTeX, BibLaTeX or RIS. Share a page range instead of the whole file.',
  },
  {
    title: 'Many libraries, one install',
    Icon: FaLayerGroup,
    body: 'One server hosts separate catalogs, each with its own publications and permissions. Sign in with local accounts or your university’s LDAP.',
  },
  {
    title: 'An API for everything',
    Icon: FaCode,
    body: 'Whatever the portal can do, a script can do over the documented REST API. AI agents connect over the Model Context Protocol.',
  },
];

const IN_PROGRESS = [
  {
    title: 'Search by passage',
    Icon: FaSearch,
    body: 'Search returns the paragraph that matches, with the hit highlighted. It matches the words of a query and its meaning, so a Slovak question can find an English paragraph.',
  },
  {
    title: 'Structure from every PDF',
    Icon: FaShapes,
    body: 'Extraction workers split each publication into paragraphs and sentences, crop its figures and tables, and turn its formulas into LaTeX.',
  },
  {
    title: 'An assistant that cites',
    Icon: FaRobot,
    body: 'Ask a question about the collection and get an answer built from its passages, with a link to each one it used.',
  },
  {
    title: 'Printed books, digitized',
    Icon: FaPrint,
    body: 'The digitalizer turns scans into an OCR’d PDF, a PDF/A archival copy and an EPUB, and publishes them to the catalog.',
  },
];

const REASONS = [
  {
    title: 'Open standards, no lock-in',
    body: 'OPDS for catalogs, Readium LCP for lending, OpenAPI for the API. Reader apps you already use work with it, and your data leaves in formats other software reads.',
  },
  {
    title: 'Open source',
    body: 'The code is public on GitHub under permissive licenses. Read it, run it, change it, and send your changes back if you like.',
  },
  {
    title: 'In daily use',
    body: 'It serves the whole Slovak University of Technology, and the Catholic University in Ružomberok runs its own instance.',
  },
  {
    title: 'Your servers, your data',
    body: 'It runs on your own hardware: PostgreSQL for records, a local disk or any S3 store for files. Nothing is sent to a vendor.',
  },
  {
    title: 'Made for academic texts',
    body: 'Citation export, annotations, page-range sharing and Dataverse research datasets are built in.',
  },
  {
    title: 'A small core',
    body: 'The catalog handles records, permissions and loans. OCR, AI and encryption run as separate workers you add when you need them.',
  },
];

const QUICKSTART = `git clone https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.git
cd EvilFlowersCatalog
docker compose up -d --build django
docker compose exec django python3 manage.py setup
docker compose exec django python3 manage.py createsuperuser`;

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
            Open-source digital library
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            Your library,
            <br />
            open in the browser.
          </Heading>
          <p className={styles.heroSubtitle}>
            ELVIRA is an open-source digital library: a catalog, a web portal
            with a built-in reader, and Readium LCP lending. The Slovak
            University of Technology keeps its publications in it, and any
            university can run its own.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--primary button--lg', styles.btn)}
              to="/docs/quickstart">
              Run your own <FaArrowRight />
            </Link>
            <a
              className={clsx(
                'button button--secondary button--lg',
                styles.btn,
              )}
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer">
              <FaGithub />
              &nbsp;Source on GitHub
            </a>
          </div>
          <p className={styles.heroMeta}>
            In production at the Slovak University of Technology and the
            Catholic University in Ružomberok. Free and open source.
          </p>
        </div>
        <div className={styles.heroVisual}>
          <BrowserFrame
            src={portalImg}
            alt="The ELVIRA portal: a grid of publication covers with a search bar"
            url="elvira.stuba.sk"
            className={styles.heroFrame}
          />
        </div>
      </div>
    </header>
  );
}

function Names() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>Two names</div>
          <h2 className={styles.sectionTitle}>ELVIRA and EvilFlowers</h2>
          <p className={styles.sectionLede}>
            You will see both names on this site. ELVIRA is the platform you
            run and readers use. EvilFlowers is the name of its catalog server
            and of the GitHub organization that holds the code, so most
            repositories carry it.
          </p>
        </Reveal>
        <div className={styles.namesGrid}>
          <Reveal className={styles.nameCard}>
            <span className={styles.nameTag}>The platform</span>
            <h3>ELVIRA</h3>
            <p>
              The whole digital library: the catalog, the portal readers sign
              in to, the PDF reader, lending and the workers that process
              publications. STU runs it at elvira.stuba.sk, and the Catholic
              University in Ružomberok runs its own instance.
            </p>
          </Reveal>
          <Reveal className={styles.nameCard} delay={70}>
            <span className={styles.nameTag}>The catalog and the code</span>
            <h3>EvilFlowers</h3>
            <p>
              <a
                href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog"
                target="_blank"
                rel="noopener noreferrer">
                EvilFlowersCatalog
              </a>{' '}
              is the catalog server at the centre of ELVIRA. It started as a
              side project before ELVIRA existed and kept its name. All ELVIRA
              code lives in the{' '}
              <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
                EvilFlowersCatalog
              </a>{' '}
              organization on GitHub.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.sectionAlt}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>What it does</div>
          <h2 className={styles.sectionTitle}>Find it, read it, borrow it, cite it</h2>
          <p className={styles.sectionLede}>
            Everything below runs in production today.
          </p>
        </Reveal>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({title, Icon, body}, i) => (
            <Reveal key={title} className={styles.featureCard} delay={(i % 3) * 60}>
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
  const readerImg = useBaseUrl('/img/viewer-preview.jpg');
  return (
    <section id="reader" className={styles.showcase}>
      <div className={clsx('container', styles.showcaseInner)}>
        <Reveal className={styles.showcaseCopy}>
          <div className={styles.sectionLabelLight}>The reader</div>
          <h2 className={styles.showcaseTitle}>Built for reading papers and textbooks</h2>
          <p className={styles.showcaseBody}>
            Every publication opens in the same reader, at the page where you
            stopped. Search the full text, highlight and annotate, switch to
            dark mode and copy a citation without leaving the tab. The reader
            is a standalone npm package, so you can embed it in your own app.
          </p>
          <ul className={styles.checkList}>
            <li>Full-text search inside the document</li>
            <li>Highlights, notes and page-range sharing</li>
            <li>Citation export, and download where the license allows</li>
          </ul>
        </Reveal>
        <Reveal className={styles.showcaseVisual} delay={80}>
          <BrowserFrame
            src={readerImg}
            alt="The ELVIRA reader with a book open and page thumbnails along the bottom"
            url="elvira.stuba.sk/reader"
            tall
          />
        </Reveal>
      </div>
    </section>
  );
}

function InProgress() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>In development</div>
          <h2 className={styles.sectionTitle}>What we are building now</h2>
          <p className={styles.sectionLede}>
            These run in our development environment and are moving to
            production. The code is already public.{' '}
            <Link to="/docs/whats-new">What changed since May</Link>.
          </p>
        </Reveal>
        <div className={styles.devGrid}>
          {IN_PROGRESS.map(({title, Icon, body}, i) => (
            <Reveal key={title} className={styles.devCard} delay={(i % 2) * 60}>
              <div className={styles.devHead}>
                <Icon aria-hidden="true" className={styles.devIcon} />
                <h3>{title}</h3>
                <span className={styles.badge}>In development</span>
              </div>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className={styles.sectionAlt}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>How it works</div>
          <h2 className={styles.sectionTitle}>One catalog, everything around it</h2>
          <p className={styles.sectionLede}>
            A catalog server holds the records and serves them over standard
            protocols. The portal, e-reader apps, AI agents and the digitalizer
            are its clients. Encryption and extraction run as separate workers.
          </p>
        </Reveal>
        <Reveal>
          <ArchitectureMap />
        </Reveal>
        <Reveal className={styles.mapMore}>
          <Link to="/ecosystem">
            Follow one publication through the system <FaArrowRight />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>Why ELVIRA</div>
          <h2 className={styles.sectionTitle}>Reasons to run it</h2>
        </Reveal>
        <div className={styles.whyGrid}>
          {REASONS.map((r, i) => (
            <Reveal key={r.title} className={styles.whyItem} delay={(i % 3) * 60}>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section className={styles.sectionAlt}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>Get started</div>
          <h2 className={styles.sectionTitle}>Pick where you start</h2>
        </Reveal>
        <div className={styles.startGrid}>
          <Reveal className={styles.startCard}>
            <FaUniversity className={styles.startIcon} aria-hidden="true" />
            <h3>Read at STU</h3>
            <p>
              Go to{' '}
              <a href="https://elvira.stuba.sk" target="_blank" rel="noopener noreferrer">
                elvira.stuba.sk
              </a>{' '}
              and sign in with your university account. Search, open a book,
              borrow it.
            </p>
            <Link to="/docs/using#readers">Reader guide →</Link>
          </Reveal>
          <Reveal className={styles.startCard} delay={60}>
            <FaTabletAlt className={styles.startIcon} aria-hidden="true" />
            <h3>Use your own app</h3>
            <p>
              Add the catalog’s OPDS feed to Thorium Reader or another OPDS
              app to browse and borrow outside the browser.
            </p>
            <Link to="/docs/using#reading-apps">Connect an app →</Link>
          </Reveal>
          <Reveal className={clsx(styles.startCard, styles.startWide)} delay={120}>
            <FaServer className={styles.startIcon} aria-hidden="true" />
            <h3>Run your own</h3>
            <p>
              The catalog starts with Docker Compose and is ready on{' '}
              <code>localhost:8000</code>:
            </p>
            <CodeBlock language="bash">{QUICKSTART}</CodeBlock>
            <Link to="/docs/quickstart">Full quickstart, with the portal →</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DeployCard({d, index}) {
  const logo = useBaseUrl(d.logo);
  return (
    <Reveal
      className={styles.deployCard}
      style={{'--accent': d.accent}}
      delay={index * 80}>
      <a
        href={d.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.deployLink}>
        <div className={styles.deployTop}>
          <span className={styles.deployPlaque}>
            <img src={logo} alt={d.name} className={styles.deployLogo} loading="lazy" />
          </span>
          <span className={styles.deploySince}>Since {d.since}</span>
        </div>
        <h3 className={styles.deployName}>{d.name}</h3>
        <span className={styles.deployPlace}>{d.place}</span>
        <p className={styles.deployNote}>{d.note}</p>
        <span className={styles.deployCta}>
          Visit <FaArrowRight />
        </span>
      </a>
    </Reveal>
  );
}

function Deployments() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
          <div className={styles.sectionLabel}>Where it runs</div>
          <h2 className={styles.sectionTitle}>Two universities, one codebase</h2>
          <p className={styles.sectionLede}>
            Both run the same catalog and portal. Each instance has its own
            servers, accounts and colours.
          </p>
        </Reveal>
        <div className={styles.deploymentsGrid}>
          {DEPLOYMENTS.map((d, i) => (
            <DeployCard key={d.short} d={d} index={i} />
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
          <h2>Could your library run on this?</h2>
          <p>
            Start with the quickstart, or write to us. We help faculties and
            universities set it up.
          </p>
          <div className={styles.closingButtons}>
            <Link className={clsx('button button--lg', styles.btnLight)} to="/docs/adopting">
              Adopting ELVIRA <FaArrowRight />
            </Link>
            <Link className={clsx('button button--lg', styles.btnGhost)} to="/about">
              Contact the team
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
      description="ELVIRA is an open-source digital library platform, used by the Slovak University of Technology: an OPDS catalog (EvilFlowersCatalog), a web portal with an in-browser reader, and Readium LCP lending.">
      <Hero />
      <main>
        <Names />
        <Features />
        <Reader />
        <InProgress />
        <HowItWorks />
        <Why />
        <GetStarted />
        <Deployments />
        <ClosingCTA />
      </main>
    </Layout>
  );
}
