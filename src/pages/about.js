import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  FaEnvelope,
  FaGithub,
  FaComments,
  FaArrowRight,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import Reveal from '@site/src/components/Reveal';
import {
  DEPLOYMENTS,
  PEOPLE,
  PARTNERS,
  NODES,
  ORG_URL,
} from '@site/src/data/ecosystem';
import styles from './about.module.css';

const STANDARDS = [
  {label: 'OPDS 1.2', href: 'https://specs.opds.io/opds-1.2'},
  {label: 'OPDS 2.0', href: 'https://drafts.opds.io/opds-2.0'},
  {label: 'Readium LCP', href: 'https://readium.org/lcp-specs/'},
  {label: 'RWPM', href: 'https://readium.org/webpub-manifest/'},
];

const CHAPTERS = [
  {
    year: '2020',
    title: 'The campus closed',
    body: 'Lockdown shut the buildings and the library with them. ELVIRA started as a way to get study materials to students legally, from home, while nothing else was open.',
  },
  {
    year: '2022',
    title: 'The first team',
    body: 'A FIIT STU student team took the stopgap and turned it into a real platform — a proper catalog, a portal, a reader. Where ELVIRA as we know it actually started.',
  },
  {
    year: 'Every year since',
    title: 'Handed down, team to team',
    body: 'Each academic year a new student squad adds a piece as their thesis work — a worker, a language, a feature — and hands it on. The project is a relay, not a sprint.',
  },
  {
    year: '2024',
    title: 'A second university',
    body: 'The Catholic University in Ružomberok stood up its own instance, re-themed in KU’s colours on the same catalog software. Proof the thing travels.',
  },
  {
    year: 'Today',
    title: 'Campus-wide, and reading back',
    body: 'ELVIRA runs across the whole Slovak University of Technology, lends protected titles with Readium LCP, and is growing an AI assistant that answers from the text — with the passage it drew from, so you can check it.',
  },
];

const TEAMS = NODES.filter((n) => n.category === 'team' && n.repo).sort(
  (a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''),
);

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

function PersonCard({person, index}) {
  return (
    <Reveal className={styles.personCard} delay={index * 70}>
      <div className={styles.avatar} aria-hidden="true">
        {initials(person.name)}
      </div>
      <h3 className={styles.personName}>{person.name}</h3>
      <span className={styles.personRole}>{person.role}</span>
      <p className={styles.personBio}>{person.bio}</p>
      {person.email && (
        <a className={styles.personEmail} href={`mailto:${person.email}`}>
          <FaEnvelope /> {person.email.replace('@', ' [at] ')}
        </a>
      )}
    </Reveal>
  );
}

function PartnerCard({partner, index}) {
  const logo = useBaseUrl(partner.logo || '/img/logo.svg');
  const inner = (
    <>
      <div className={styles.partnerMark}>
        {partner.logo ? (
          <img src={logo} alt="" loading="lazy" />
        ) : (
          <span>{partner.short}</span>
        )}
      </div>
      <div>
        <strong className={styles.partnerName}>{partner.name}</strong>
        <span className={styles.partnerPlace}>{partner.place}</span>
        <p className={styles.partnerRole}>{partner.role}</p>
      </div>
    </>
  );
  return (
    <Reveal className={styles.partnerCard} delay={index * 70}>
      {partner.url ? (
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.partnerInner}>
          {inner}
        </a>
      ) : (
        <div className={styles.partnerInner}>{inner}</div>
      )}
    </Reveal>
  );
}

function DeploymentCard({d, index}) {
  const logo = useBaseUrl(d.logo);
  return (
    <Reveal
      className={styles.deploymentCard}
      style={{'--accent': d.accent}}
      delay={index * 70}>
      <a
        href={d.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.deploymentLink}>
        <img src={logo} alt="" className={styles.deploymentLogo} loading="lazy" />
        <div>
          <strong>{d.name}</strong>
          <span>{d.place} · since {d.since}</span>
          <p>{d.note}</p>
        </div>
      </a>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="ELVIRA is an open-source digital academic library developed at the Faculty of Informatics and Information Technologies (Slovak University of Technology in Bratislava), running campus-wide there and at the Catholic University in Ružomberok.">
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            About
          </span>
          <h1 className={styles.title}>
            A university library, built in the open
          </h1>
          <p className={styles.lede}>
            ELVIRA began in 2020 as a way to keep books reaching students
            while the campus was locked. Six years and a dozen student teams
            later, it catalogs a whole university&rsquo;s publications, lends
            them, searches them across languages, and is teaching itself to
            answer questions about them — all open source, all built at FIIT
            STU.
          </p>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>The story</div>
              <h2 className={styles.sectionTitle}>
                From a lockdown fix to a campus library
              </h2>
            </Reveal>
            <div className={styles.chapters}>
              {CHAPTERS.map((c, i) => (
                <Reveal key={c.title} className={styles.chapter} delay={i * 60}>
                  <div className={styles.chapterYear}>{c.year}</div>
                  <div className={styles.chapterBody}>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Who builds it</div>
              <h2 className={styles.sectionTitle}>A small core, a rotating crew</h2>
              <p className={styles.introText}>
                A handful of people hold the thread across years; the rest of
                the code comes from students and PhD candidates building their
                thesis work into something real people use.
              </p>
            </Reveal>
            <div className={styles.peopleGrid}>
              {PEOPLE.map((p, i) => (
                <PersonCard key={p.name} person={p} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Built with</div>
              <h2 className={styles.sectionTitle}>Three institutions, one catalog</h2>
            </Reveal>
            <div className={styles.partnerGrid}>
              {PARTNERS.map((p, i) => (
                <PartnerCard key={p.short} partner={p} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>The relay</div>
              <h2 className={styles.sectionTitle}>Student teams that carried it</h2>
              <p className={styles.introText}>
                Every FIIT STU team project (TP) leaves its mark in the repos.
                Here are the squads whose work is still in the tree.
              </p>
            </Reveal>
            <div className={styles.teamGrid}>
              {TEAMS.map((t, i) => (
                <Reveal
                  as="a"
                  key={t.id}
                  href={t.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.teamCard}
                  delay={(i % 3) * 60}>
                  <span className={styles.teamName}>
                    <FaGithub /> {t.name}
                  </span>
                  <p>{t.description}</p>
                  {t.pushed_at && (
                    <span className={styles.teamMeta}>
                      last active {t.pushed_at}
                    </span>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Where it runs</div>
              <h2 className={styles.sectionTitle}>In production, not in a demo</h2>
            </Reveal>
            <div className={styles.deploymentGrid}>
              {DEPLOYMENTS.map((d, i) => (
                <DeploymentCard key={d.short} d={d} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal className={styles.osCard}>
              <div>
                <div className={styles.sectionLabel}>Open source</div>
                <h2 className={styles.sectionTitle}>Nothing here is locked to us</h2>
                <p className={styles.osText}>
                  The catalog, the reader and the wire protocol are all
                  public and permissively licensed. ELVIRA speaks the
                  standards e-readers already know, so a library can adopt
                  it without betting on a single vendor.
                </p>
                <div className={styles.chips}>
                  {STANDARDS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chip}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className={styles.osActions}>
                <Link
                  className="button button--primary button--lg"
                  href={ORG_URL}>
                  <FaGithub />
                  &nbsp;GitHub
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/projects">
                  Browse projects <FaArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Get in touch</div>
              <h2 className={styles.sectionTitle}>Questions, ideas, deployments</h2>
            </Reveal>
            <div className={styles.contactGrid}>
              <Reveal className={styles.contactCard}>
                <h3>
                  <FaGithub /> On GitHub
                </h3>
                <p>
                  Everything lives at{' '}
                  <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
                    @EvilFlowersCatalog
                  </a>
                  . Open an issue on the relevant repository, or start a
                  thread in{' '}
                  <a
                    href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions"
                    target="_blank"
                    rel="noopener noreferrer">
                    Discussions
                  </a>{' '}
                  for design and deployment questions.
                </p>
                <div className={styles.linkRow}>
                  <Link className="button button--primary" href={ORG_URL}>
                    Organisation
                  </Link>
                  <Link
                    className="button button--secondary"
                    href="https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions">
                    <FaComments />&nbsp;Discussions
                  </Link>
                </div>
              </Reveal>
              <Reveal className={styles.contactCard} delay={70}>
                <h3>
                  <FaEnvelope /> By e-mail
                </h3>
                <ul className={styles.emailList}>
                  <li>
                    <a href="mailto:sik@fiit.stuba.sk">sik [at] fiit.stuba.sk</a>
                  </li>
                  <li>
                    <a href="mailto:jakub.dubec@stuba.sk">
                      jakub.dubec [at] stuba.sk
                    </a>
                  </li>
                </ul>
                <address className={styles.address}>
                  Faculty of Informatics and Information Technologies
                  <br />
                  Slovak University of Technology
                  <br />
                  Ilkovičova 2, 842 16 Bratislava, Slovakia
                </address>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
