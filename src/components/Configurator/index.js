import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import {FaDownload, FaSyncAlt} from 'react-icons/fa';

import {DEFAULTS, OPTIONS} from '../../data/deployment.js';
import {applyChange, isOn, requirementText} from './resolve.js';
import {buildPlan} from './plan.js';
import {renderCompose, renderK8s, renderEnv} from './render.js';
import {generateSecrets} from './secrets.js';
import styles from './styles.module.css';

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

function download(name, text) {
  const blob = new Blob([text], {type: 'text/plain'});
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
  const [tab, setTab] = useState('config');

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

  const plan = useMemo(() => buildPlan(settings, secrets), [settings, secrets]);
  const files = useMemo(() => {
    const k8s = settings.target === 'k8s';
    return {
      config: k8s
        ? {name: 'evilflowers.yaml', language: 'yaml', text: renderK8s(settings, plan)}
        : {name: 'compose.yml', language: 'yaml', text: renderCompose(settings, plan)},
      env: {name: '.env', language: 'bash', text: renderEnv(settings, plan)},
    };
  }, [settings, plan]);

  const platform = OPTIONS.filter((o) => o.group === 'platform');
  const features = OPTIONS.filter((o) => o.group === 'features');
  const current = files[tab];

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
          {[
            ['config', files.config.name],
            ['env', '.env'],
            ['steps', 'Next steps'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={clsx(styles.tab, tab === id && styles.tabOn)}
              onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'steps' ? (
          <Steps plan={plan} target={settings.target} />
        ) : (
          <div className={styles.file}>
            <div className={styles.fileBar}>
              {tab === 'env' && (
                <button type="button" onClick={refreshSecrets}>
                  <FaSyncAlt aria-hidden="true" /> New secrets
                </button>
              )}
              <button type="button" onClick={() => download(current.name, current.text)}>
                <FaDownload aria-hidden="true" /> Download {current.name}
              </button>
            </div>
            {tab === 'env' && (
              <p className={styles.fileNote}>
                Secrets are generated in your browser and never sent anywhere. Download a fresh file for each
                installation.
              </p>
            )}
            <CodeBlock language={current.language} className={styles.code}>
              {current.text}
            </CodeBlock>
          </div>
        )}
      </aside>
    </div>
  );
}
