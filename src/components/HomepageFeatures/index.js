import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Read',
    Svg: require('@site/static/img/read.svg').default,
    description: (
      <>
        We have created an open-source PDF reader on top of pdf.js called <code>EvilFlowersViewer</code> for easy
        document browsing with basic tools for taking notes, exporting citations and document sharing.
      </>
    ),
  },
  {
    title: 'Organize',
    Svg: require('@site/static/img/organize.svg').default,
    description: (
      <>
        You can easily organize your document be creating multiple catalogs with RBAC which is configurable using web
        interface or REST API.
      </>
    ),
  },
  {
    title: 'Distribute',
    Svg: require('@site/static/img/distribute.svg').default,
    description: (
      <>
        Our projects are designed to be interopable and support many different communication protocols such as OPDS,
        REST API, OAI and Z39.50 (currently in progress). We support also multiple storage backends for easy deployment.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
