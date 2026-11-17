import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import CodeBlock from '@theme/CodeBlock';
import {FaDownload, FaSyncAlt} from 'react-icons/fa';

// The generator of EvilFlowersCatalog/deploy (git submodule at packages/elvira-deploy; the site
// builds from the head of its main). Change it there, not here: the page shows exactly what
// `npm run configure` writes in that repository.
import {
  DEFAULTS,
  OPTIONS,
  VERSION,
  appliesTo,
  applyChange,
  generate,
  generateSecrets,
  isOn,
  requirementText,
} from '@site/packages/elvira-deploy/generator/src/index.js';
import styles from './styles.module.css';

const REPO = 'https://github.com/EvilFlowersCatalog/deploy';

/** Text fields shown under an option while it has a given value. */
const FIELDS = {
  target: {
    k8s: [
      {key: 'namespace', label: 'Namespace'},
      {key: 'storageClass', label: 'Storage class', placeholder: 'cluster default'},
    ],
  },
  database: {
    external: [
      {key: 'dbHost', label: 'Host'},
      {key: 'dbPort', label: 'Port'},
      {key: 'dbName', label: 'Database'},
      {key: 'dbUser', label: 'User'},
    ],
  },
  redis: {
    external: [
      {key: 'redisHost', label: 'Host'},
      {key: 'redisPort', label: 'Port'},
    ],
  },
  portal: {
    true: [{key: 'portalRoot', label: 'Portal directory', hint: 'Where the built portal is served from.'}],
  },
  search: {
    external: [{key: 'searchUrl', label: 'Embedding service URL', hint: 'Text Embeddings Inference or a compatible /embed API serving the same model.'}],
  },
  assistant: {
    bundled: [{key: 'assistantModel', label: 'Model'}],
    external: [
      {key: 'assistantEndpoint', label: 'Chat endpoint'},
      {key: 'assistantModel', label: 'Model'},
    ],
  },
  mail: {
    smtp: [
      {key: 'smtpHost', label: 'SMTP host'},
      {key: 'smtpPort', label: 'Port'},
      {key: 'smtpUser', label: 'User', placeholder: 'none'},
    ],
  },
  backup: {
    true: [
      {key: 'backupDestination', label: 'Destination', placeholder: 's3://bucket/path'},
      {key: 'backupS3Host', label: 'S3 endpoint'},
      {key: 'backupSchedule', label: 'Schedule (cron)'},
    ],
  },
  telemetry: {
    external: [{key: 'otlpEndpoint', label: 'OTLP/HTTP endpoint'}],
  },
};

const SITE_FIELDS = [
  {key: 'domain', label: 'Catalog domain', hint: 'Where readers and apps reach the catalog.'},
  {key: 'portalDomain', label: 'Portal domain', hint: 'Where the readers’ web app is served; the only browser origin the catalog accepts.'},
  {key: 'contactEmail', label: 'Contact e-mail'},
];

const ROLE_ORDER = [
  ['core', 'Catalog'],
  ['data', 'Data'],
  ['worker', 'Workers'],
  ['model', 'Models'],
  ['support', 'Support'],
];

/** The generated files worth showing for each platform, with their highlighting. */
const FILE_VIEW = {
  '.env': {language: 'bash', targets: ['compose', 'docker', 'k8s']},
  'config/nginx/catalog.conf': {label: 'nginx: catalog', language: 'nginx', targets: ['compose', 'docker']},
  'config/nginx/portal.conf': {label: 'nginx: portal', language: 'nginx', targets: ['compose', 'docker']},
  'config/k8s/kustomization.yaml': {label: 'kustomization.yaml', language: 'yaml', targets: ['k8s']},
};

function Field({field, value, onChange}) {
  const id = `cfg-${field.key}`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{field.label}</label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={field.placeholder}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onChange(field.key, e.target.value)}
      />
      {field.hint && <small>{field.hint}</small>}
    </div>
  );
}

function Fields({option, settings, onField}) {
  const fields = FIELDS[option.key]?.[String(settings[option.key])];
  if (!fields) return null;
  return (
    <div className={styles.fields}>
      {fields.map((f) => (
        <Field key={f.key} field={f} value={settings[f.key]} onChange={onField} />
      ))}
    </div>
  );
}

function Choices({option, value, onChange}) {
  return (
    <div className={styles.choices} role="radiogroup" aria-label={option.label}>
      {option.choices.map((c) => (
        <label key={c.value} className={clsx(styles.choice, value === c.value && styles.choiceOn)}>
          <input
            type="radio"
            name={`cfg-${option.key}`}
            value={c.value}
            checked={value === c.value}
            onChange={() => onChange(option.key, c.value)}
          />
          <span className={styles.choiceLabel}>{c.label}</span>
          {c.hint && <span className={styles.choiceHint}>{c.hint}</span>}
        </label>
      ))}
    </div>
  );
}

function PlatformOption({option, settings, onChange, onField}) {
  return (
    <fieldset className={styles.group}>
      <legend>{option.label}</legend>
      <Choices option={option} value={settings[option.key]} onChange={onChange} />
      <Fields option={option} settings={settings} onField={onField} />
    </fieldset>
  );
}

function FeatureOption({option, settings, onChange, onField}) {
  const on = isOn(settings, option);
  const needs = requirementText(option);
  const boolean = typeof option.off === 'boolean';
  return (
    <div className={clsx(styles.feature, on && styles.featureOn)}>
      {boolean ? (
        <label className={styles.featureHead}>
          <input type="checkbox" checked={on} onChange={(e) => onChange(option.key, e.target.checked)} />
          <span className={styles.featureTitle}>{option.label}</span>
        </label>
      ) : (
        <div className={styles.featureHead}>
          <span className={styles.featureTitle}>{option.label}</span>
        </div>
      )}
      <p className={styles.featureText}>{option.description}</p>
      {needs && <p className={styles.needs}>Needs {needs}</p>}
      {!boolean && <Choices option={option} value={settings[option.key]} onChange={onChange} />}
      <Fields option={option} settings={settings} onField={onField} />
    </div>
  );
}

function download(name, text, type = 'text/plain') {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Services({plan}) {
  return (
    <div className={styles.services}>
      {ROLE_ORDER.map(([role, title]) => {
        const list = plan.services.filter((x) => x.role === role);
        if (list.length === 0) return null;
        return (
          <div key={role} className={styles.serviceGroup}>
            <h3>{title}</h3>
            <ul>
              {list.map((x) => (
                <li key={x.name}>
                  <code>{x.name}</code>
                  {x.feature !== 'Catalog' && <span>{x.feature}</span>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Steps({plan, settingsJson}) {
  return (
    <ol className={styles.steps}>
      <li>
        <h4>Make your copy of the deploy repository</h4>
        <p>
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            EvilFlowersCatalog/deploy
          </a>{' '}
          holds every container, the Kubernetes components, nginx sites and an Ansible playbook. Use it as a
          template, put the elvira.json you download here into it, and fill in .env (Node.js 20):
        </p>
        <CodeBlock language="bash">{`git clone ${REPO}.git elvira && cd elvira\n# elvira.json from this page goes here\nnpm run configure`}</CodeBlock>
        <details>
          <summary>elvira.json</summary>
          <CodeBlock language="json">{settingsJson}</CodeBlock>
        </details>
      </li>
      {plan.steps.map((step) => (
        <li key={step.title}>
          <h4>{step.title}</h4>
          <p>{step.body}</p>
          {step.commands?.length > 0 && <CodeBlock language="bash">{step.commands.join('\n')}</CodeBlock>}
        </li>
      ))}
    </ol>
  );
}

export default function Configurator() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [notes, setNotes] = useState([]);
  const [secrets, setSecrets] = useState({});
  const [tab, setTab] = useState('steps');

  const refreshSecrets = () => {
    generateSecrets()
      .then(setSecrets)
      .catch(() => setSecrets({}));
  };
  useEffect(refreshSecrets, []);

  const change = (key, value) => {
    const result = applyChange(settings, key, value);
    setSettings(result.settings);
    setNotes(result.notes);
  };
  const field = (key, value) => setSettings((s) => ({...s, [key]: value}));

  const {plan, files} = useMemo(() => generate(settings, secrets, {resolved: true}), [settings, secrets]);
  // elvira.json keeps only what differs from the defaults, as `npm run configure` writes it.
  const settingsJson = useMemo(
    () => `${JSON.stringify(Object.fromEntries(Object.entries(settings).filter(([k, v]) => DEFAULTS[k] !== v)), null, 2)}\n`,
    [settings],
  );
  const fileNames = Object.keys(FILE_VIEW).filter((n) => n in files && FILE_VIEW[n].targets.includes(settings.target));
  const current = tab === 'steps' || fileNames.includes(tab) ? tab : 'steps';
  const view = FILE_VIEW[current];

  const visible = (o) => appliesTo(o, settings);
  const platform = OPTIONS.filter((o) => o.group === 'platform' && visible(o));
  const features = OPTIONS.filter((o) => o.group === 'features' && visible(o));

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <section className={styles.section}>
          <h2>Platform</h2>
          {platform.map((o) => (
            <PlatformOption key={o.key} option={o} settings={settings} onChange={change} onField={field} />
          ))}
        </section>

        <section className={styles.section}>
          <h2>Addresses</h2>
          <div className={styles.fields}>
            {SITE_FIELDS.map((f) => (
              <Field key={f.key} field={f} value={settings[f.key]} onChange={field} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Features</h2>
          <p className={styles.sectionNote}>
            The catalog alone serves the REST API, OPDS feeds, the web reader&apos;s files, word search and the
            MCP server. Everything below is optional.
          </p>
          {features.map((o) => (
            <FeatureOption key={o.key} option={o} settings={settings} onChange={change} onField={field} />
          ))}
        </section>
      </form>

      <aside className={styles.output} aria-label="Your installation">
        <div className={styles.notes} aria-live="polite">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>

        <div className={styles.summary}>
          <p className={styles.count}>
            {plan.services.length} {plan.services.length === 1 ? 'container' : 'containers'}
            {plan.profiles.length > 0 && (
              <>
                {' · profiles '}
                <code>{plan.profiles.join(',')}</code>
              </>
            )}
          </p>
          <Services plan={plan} />
        </div>

        {plan.warnings.length > 0 && (
          <ul className={styles.warnings}>
            {plan.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        <div className={styles.tabs} role="tablist" aria-label="Files">
          {[['steps', 'How to run it'], ...fileNames.map((n) => [n, FILE_VIEW[n].label ?? n])].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={current === id}
              className={clsx(styles.tab, current === id && styles.tabOn)}
              onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {current === 'steps' ? (
          <>
            <div className={styles.fileBar}>
              <button type="button" onClick={() => download('elvira.json', settingsJson, 'application/json')}>
                <FaDownload aria-hidden="true" /> Download elvira.json
              </button>
            </div>
            <Steps plan={plan} settingsJson={settingsJson} />
          </>
        ) : (
          <div className={styles.file}>
            <div className={styles.fileBar}>
              {current === '.env' && (
                <button type="button" onClick={refreshSecrets}>
                  <FaSyncAlt aria-hidden="true" /> New secrets
                </button>
              )}
              <button type="button" onClick={() => download(current.split('/').pop(), files[current])}>
                <FaDownload aria-hidden="true" /> Download {current.split('/').pop()}
              </button>
            </div>
            <p className={styles.fileNote}>
              {current === '.env'
                ? 'Secrets are made in your browser and never sent anywhere. npm run configure writes the same file with secrets of its own.'
                : `npm run configure writes this as ${current} in your copy of the repository.`}
            </p>
            <CodeBlock language={view.language} className={styles.code}>
              {files[current]}
            </CodeBlock>
          </div>
        )}

        <p className={styles.cli}>
          Generated by{' '}
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            elvira-deploy {VERSION}
          </a>
          , the same code as <code>npm run configure</code>.
        </p>
      </aside>
    </div>
  );
}
