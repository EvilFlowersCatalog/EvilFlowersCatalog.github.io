/**
 * A small YAML writer for the configurator's output: maps, lists and scalars, block style,
 * short scalar lists in flow style. A key starting with `#` writes its value as a comment line.
 */

const PLAIN = /^[A-Za-z_/][A-Za-z0-9_.\/-]*$/;
const RESERVED = /^(true|false|yes|no|on|off|null|y|n|~)$/i;

function scalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  const s = String(v);
  if (PLAIN.test(s) && !RESERVED.test(s)) return s;
  return JSON.stringify(s);
}

function key(k) {
  return PLAIN.test(k) && !RESERVED.test(k) ? k : JSON.stringify(k);
}

const isScalar = (v) => v === null || typeof v !== 'object';

function flowList(list) {
  if (!list.every(isScalar)) return null;
  const text = `[${list.map(scalar).join(', ')}]`;
  return text.length <= 90 ? text : null;
}

function lines(value, indent) {
  const pad = ' '.repeat(indent);
  const out = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (isScalar(item)) {
        out.push(`${pad}- ${scalar(item)}`);
        continue;
      }
      const inner = lines(item, indent + 2);
      if (inner.length === 0) {
        out.push(`${pad}- ${Array.isArray(item) ? '[]' : '{}'}`);
        continue;
      }
      out.push(`${pad}- ${inner[0].slice(indent + 2)}`, ...inner.slice(1));
    }
    return out;
  }

  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    if (k.startsWith('#')) {
      for (const line of String(v).split('\n')) out.push(`${pad}# ${line}`.trimEnd());
      continue;
    }
    if (isScalar(v)) {
      out.push(`${pad}${key(k)}: ${scalar(v)}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) out.push(`${pad}${key(k)}: []`);
      else {
        const flow = flowList(v);
        if (flow) out.push(`${pad}${key(k)}: ${flow}`);
        else out.push(`${pad}${key(k)}:`, ...lines(v, indent + 2));
      }
    } else if (Object.keys(v).length === 0) {
      out.push(`${pad}${key(k)}: {}`);
    } else {
      out.push(`${pad}${key(k)}:`, ...lines(v, indent + 2));
    }
  }
  return out;
}

export function toYaml(value) {
  return `${lines(value, 0).join('\n')}\n`;
}

/** Several documents in one stream, with a comment block on top. */
export function toYamlStream(docs, header) {
  const head = header ? `${header.split('\n').map((l) => `# ${l}`.trimEnd()).join('\n')}\n` : '';
  return head + docs.map((d) => `---\n${toYaml(d)}`).join('');
}
