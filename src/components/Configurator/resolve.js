import {OPTIONS, optionLabel, choiceLabel} from '../../data/deployment.js';

export function isOn(settings, option) {
  return option.off !== undefined && settings[option.key] !== option.off;
}

function satisfied(settings, req) {
  if ('value' in req) return settings[req.key] === req.value;
  return settings[req.key] !== req.not;
}

/**
 * Applies one change and keeps every requirement satisfied. When an option that is on needs
 * something the reader just changed away from, the option turns off; otherwise the requirement
 * is switched on. Returns the new settings and one sentence per automatic change.
 */
export function applyChange(settings, key, value) {
  const next = {...settings, [key]: value};
  const notes = [];

  for (let round = 0; round < 10; round++) {
    let changed = false;
    for (const option of OPTIONS) {
      if (!option.requires || !isOn(next, option)) continue;
      for (const req of option.requires) {
        if (satisfied(next, req)) continue;
        changed = true;
        if (req.key === key) {
          next[option.key] = option.off;
          const need = 'value' in req ? `set to ${choiceLabel(req.key, req.value)}` : 'switched on';
          notes.push(`${optionLabel(option.key)} turned off: it needs ${optionLabel(req.key)} ${need}.`);
          break;
        }
        const target = 'value' in req ? req.value : req.set;
        next[req.key] = target;
        notes.push(`${optionLabel(req.key)} set to ${choiceLabel(req.key, target)}: ${optionLabel(option.key)} needs it.`);
      }
    }
    if (!changed) break;
  }

  return {settings: next, notes};
}

/** Requirements of an option, as text for its card. */
export function requirementText(option) {
  if (!option.requires) return null;
  return option.requires
    .map((r) => ('value' in r ? `${optionLabel(r.key)}: ${choiceLabel(r.key, r.value)}` : optionLabel(r.key)))
    .join(' · ');
}
