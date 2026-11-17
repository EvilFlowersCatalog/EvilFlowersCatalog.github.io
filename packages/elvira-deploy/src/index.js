/**
 * elvira-deploy: settings in, an installation directory out.
 *
 * `generate(settings, secrets)` returns every file of the installation as a path → content map
 * (the same tree the CLI writes and the web configurator offers for download), plus the plan
 * the files were written from, the steps after the first start and the warnings.
 */
import {DEFAULTS} from './data.js';
import {normalize} from './resolve.js';
import {buildPlan} from './plan.js';
import {renderCompose, renderK8s, renderEnv} from './render.js';
import {renderNginx} from './nginx.js';

export * from './data.js';
export {applyChange, isOn, normalize, requirementText} from './resolve.js';
export {buildPlan, CATALOG_COMMANDS} from './plan.js';
export {renderCompose, renderK8s, renderEnv} from './render.js';
export {renderNginx} from './nginx.js';
export {generateSecrets, randomString, rsaJwk} from './secrets.js';
export {VERSION, GENERATOR} from './version.js';

/** The file a reader edits by hand next to the generated ones: what to do, in order. */
function renderSteps(plan, target) {
  const out = ['# Next steps', ''];
  plan.steps.forEach((step, i) => {
    out.push(`## ${i + 1}. ${step.title}`, '', step.body, '');
    if (step.link) out.push(`More: ${step.link.startsWith('/') ? `https://elvira.digital${step.link}` : step.link}`, '');
    const commands = step.commands?.[target];
    if (commands?.length) out.push('```sh', ...commands, '```', '');
  });
  if (plan.warnings.length) {
    out.push('## Before you start', '');
    for (const w of plan.warnings) out.push(`- ${w}`);
    out.push('');
  }
  return out.join('\n');
}

/**
 * Builds the installation. `settings` is resolved against the defaults first, so a partial
 * object (a CLI settings file) gives the same result as the same choices on the page.
 */
export function generate(partial = {}, secrets = {}, {resolved = false} = {}) {
  const {settings, notes} = resolved ? {settings: partial, notes: []} : normalize(partial, DEFAULTS);
  const plan = buildPlan(settings, secrets);
  const k8s = settings.target === 'k8s';
  const files = {};
  if (k8s) files['evilflowers.yaml'] = renderK8s(settings, plan);
  else files['compose.yml'] = renderCompose(settings, plan);
  files['.env'] = renderEnv(settings, plan);
  const nginx = renderNginx(settings, plan);
  if (nginx) files['nginx/elvira.conf'] = nginx;
  files['NEXT-STEPS.md'] = renderSteps(plan, settings.target);
  return {settings, notes, plan, files};
}
