import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import {FaDownload, FaSyncAlt} from 'react-icons/fa';

// The generator lives in packages/elvira-deploy, the same code the elvira-deploy CLI runs: what
// the page shows is byte for byte what `elvira-deploy --settings elvira-deploy.json` writes.
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
} from '@site/packages/elvira-deploy/src/index.js';
import styles from './styles.module.css';

const CLI_SOURCE = 'https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.github.io/tree/main/packages/elvira-deploy';

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
  storage: {
    s3: [
      {key: 's3Host', label: 'S3 endpoint', placeholder: 'host:port'},
      {key: 's3Bucket', label: 'Bucket'},
    ],
  },
  proxy: {
    host: [
      {
        key: 'installDir',
        label: 'Installation directory',
        hint: 'Where compose.yml and .env live. nginx serves the admin assets from its static/ folder.',
      },
    ],
  },
  portal: {
    true: [{key: 'portalRoot', label: 'Portal directory', hint: 'Where the built portal (its dist/ folder) is copied.'}],
  },
  search: {
    external: [{key: 'searchUrl', label: 'Embedding service URL', hint: `Text Embeddings Inference or a compatible /embed API serving the same model.`}],
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
  {key: 'domain', label: 'Catalog domain', hint: 'Where readers and apps reach the catalog, behind your TLS proxy.'},
  {key: 'portalUrl', label: 'Portal URL', hint: 'The only browser origin the catalog accepts requests from.'},
  {key: 'contactEmail', label: 'Contact e-mail'},
];

const ROLE_ORDER = [
  ['core', 'Catalog'],
  ['data', 'Data'],
  ['worker', 'Workers'],
  ['model', 'Models'],
  ['support', 'Support'],
];

/** How each generated file is shown: tab label, highlighting, download name. */
const FILE_VIEW = {
  'compose.yml': {language: 'yaml'},
  'evilflowers.yaml': {language: 'yaml'},
  '.env': {language: 'bash'},
  'nginx/elvira.conf': {label: 'nginx', language: 'nginx', download: 'elvira.conf'},
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
                <li key={x.name} title={x.summary}>
                  <code>{x.name}</code>
                  {x.feature !== 'Catalog' && <span>{x.feature}</span>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {plan.proxy && (
        <div className={styles.serviceGroup}>
          <h3>On the host</h3>
          <ul>
            <li title="Terminates TLS, serves the admin assets and the portal, passes the rest to the catalog.">
              <code>nginx</code>
              {plan.proxy.portal && <span>with the portal</span>}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function Steps({plan, target}) {
  return (
    <ol className={styles.steps}>
      {plan.steps.map((step) => (
        <li key={step.title}>
          <h4>{step.title}</h4>
          <p>
            {step.body}{' '}
            {step.link &&
              (step.link.startsWith('/') ? (
                <Link to={step.link}>More</Link>
              ) : (
                <a href={step.link} target="_blank" rel="noopener noreferrer">
                  Guide
                </a>
              ))}
          </p>
          {step.commands?.[target] && <CodeBlock language="bash">{step.commands[target].join('\n')}</CodeBlock>}
        </li>
      ))}
    </ol>
  );
}

export default function Configurator() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [notes, setNotes] = useState([]);
  const [secrets, setSecrets] = useState({});
  const [tab, setTab] = useState(null);

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
  // NEXT-STEPS.md is the steps tab, rendered; the rest are files to copy.
  const fileNames = Object.keys(files).filter((n) => n !== 'NEXT-STEPS.md');
  const current = tab === 'steps' || fileNames.includes(tab) ? tab : fileNames[0];
  const view = FILE_VIEW[current] ?? {language: 'text'};

  const visible = (o) => appliesTo(o, settings);
  const platform = OPTIONS.filter((o) => o.group === 'platform' && visible(o));
  const features = OPTIONS.filter((o) => o.group === 'features' && visible(o));

  const saveSettings = () =>
    download('elvira-deploy.json', `${JSON.stringify({version: VERSION, settings}, null, 2)}\n`, 'application/json');

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

      <aside className={styles.output} aria-label="Generated configuration">
        <div className={styles.notes} aria-live="polite">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>

        <div className={styles.summary}>
          <p className={styles.count}>
            {plan.services.length} {plan.services.length === 1 ? 'container' : 'containers'}
            {plan.volumes.length > 0 && `, ${plan.volumes.length} ${plan.volumes.length === 1 ? 'volume' : 'volumes'}`}
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
          {[...fileNames.map((n) => [n, FILE_VIEW[n]?.label ?? n]), ['steps', 'Next steps']].map(([id, label]) => (
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
          <Steps plan={plan} target={settings.target} />
        ) : (
          <div className={styles.file}>
            <div className={styles.fileBar}>
              {current === '.env' && (
                <button type="button" onClick={refreshSecrets}>
                  <FaSyncAlt aria-hidden="true" /> New secrets
                </button>
              )}
              <button type="button" onClick={() => download(view.download ?? current, files[current])}>
                <FaDownload aria-hidden="true" /> Download {view.download ?? current}
              </button>
            </div>
            {current === '.env' && (
              <p className={styles.fileNote}>
                Secrets are generated in your browser and never sent anywhere. Download a fresh file for each
                installation.
              </p>
            )}
            {current === 'nginx/elvira.conf' && (
              <p className={styles.fileNote}>
                Save it as <code>nginx/elvira.conf</code> next to compose.yml; the next steps copy it into
                /etc/nginx/conf.d/.
              </p>
            )}
            <CodeBlock language={view.language} className={styles.code}>
              {files[current]}
            </CodeBlock>
          </div>
        )}

        <p className={styles.cli}>
          The same files from a terminal:{' '}
          <button type="button" className={styles.linkButton} onClick={saveSettings}>
            download your choices
          </button>{' '}
          and run{' '}
          <a href={CLI_SOURCE} target="_blank" rel="noopener noreferrer">
            elvira-deploy
          </a>{' '}
          (Node.js 20, no dependencies): <code>node bin/elvira-deploy.js --settings elvira-deploy.json --out elvira</code>.
          It keeps an existing .env, so running it again after a change keeps your secrets.
        </p>
      </aside>
    </div>
  );
}
