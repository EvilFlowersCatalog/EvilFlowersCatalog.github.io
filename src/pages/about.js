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
    year: 'The start',
    title: 'A backup that got out of hand',
    body: 'Jakub was procrastinating on his master’s thesis when an OS reinstall wiped his entire Calibre library. He wanted a centralized Calibre backend so it couldn’t happen again. That backend became EvilFlowersCatalog.',
  },
  {
    year: '2022',
    title: 'The first team',
    body: 'A FIIT STU student team built a portal and a reader on top of the catalog. That is where ELVIRA as a library started.',
  },
  {
    year: 'Every year since',
    title: 'Handed down, team to team',
    body: 'Each academic year a new student team adds a piece as their team project or thesis, such as a worker, a feature or a translation, and the next team picks it up.',
  },
  {
    year: '2024',
    title: 'A second university',
    body: 'The Catholic University in Ružomberok set up its own instance of the same software, in its own colours.',
  },
  {
    year: '2026',
    title: 'Extraction, search and an assistant',
    body: 'ELVIRA serves the whole Slovak University of Technology and lends protected titles with Readium LCP. In development: workers that split every PDF into paragraphs, figures and formulas, passage search, an assistant that cites its sources, and a pipeline for digitizing printed books.',
  },
];

const TEAMS = NODES.filter((n) => n.category === 'team' && n.repo);

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
        <span className={styles.deploymentPlaque}>
          <img src={logo} alt={d.name} className={styles.deploymentLogo} loading="lazy" />
        </span>
        <strong>{d.name}</strong>
        <span className={styles.deploymentPlace}>{d.place} · since {d.since}</span>
        <p>{d.note}</p>
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
            ELVIRA began as a side project, somewhere to keep e-books safe
            from the next OS reinstall. Today it is the digital library of
            the Slovak University of Technology and runs at a second
            university. It is open source, built mostly at FIIT STU by staff,
            PhD candidates and student teams, and we help the faculties and
            universities that run it.
          </p>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>The story</div>
              <h2 className={styles.sectionTitle}>
                From a side project to a campus library
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
            <Reveal as="figure" className={styles.funFact}>
              <blockquote>
                “I lost all my books in Calibre after reinstalling my OS, so I
                wanted a centralized Calibre backend. That was the whole idea.”
              </blockquote>
              <figcaption>
                Jakub Dubec · on how EvilFlowersCatalog started
              </figcaption>
            </Reveal>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Who builds it</div>
              <h2 className={styles.sectionTitle}>A small core, a rotating crew</h2>
              <p className={styles.introText}>
                A few people keep the project going from year to year. Much
                of the code comes from students and PhD candidates, as team
                projects and theses that end up in production.
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
              <h2 className={styles.sectionTitle}>Where it&rsquo;s built and run</h2>
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
              <div className={styles.sectionLabel}>Student teams</div>
              <h2 className={styles.sectionTitle}>Team projects on GitHub</h2>
              <p className={styles.introText}>
                FIIT STU team projects (TP) that worked on ELVIRA, and the
                repositories they left.
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Reveal>
              <div className={styles.sectionLabel}>Where it runs</div>
              <h2 className={styles.sectionTitle}>In production at two universities</h2>
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
                  The catalog, the portal, the reader and the protocol are
                  public and permissively licensed. ELVIRA uses the
                  standards e-reader apps already support, so a library that
                  adopts it does not depend on us.
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
