# elvira-deploy

Generates an ELVIRA installation from a handful of choices: `compose.yml` or Kubernetes
manifests, a `.env` with fresh secrets, an nginx file for the catalog and the portal, and
`NEXT-STEPS.md`. The configurator at <https://elvira.digital/deploy> runs this same code in the
browser, so the page and the CLI always write the same files.

No dependencies; Node.js 20 or newer.

```sh
node bin/elvira-deploy.js --out ./elvira                    # defaults
node bin/elvira-deploy.js --set channel=develop --set search=bundled --out ./elvira
node bin/elvira-deploy.js --settings elvira-deploy.json --out ./elvira   # choices saved on the page
node bin/elvira-deploy.js --defaults                        # every setting and its default
```

An existing `.env` is kept unless you pass `--force`, so running it again after a change keeps
your secrets. Every run also writes `elvira-deploy.json`, the settings it used.

## What it writes

| File | When |
|---|---|
| `compose.yml` | Docker Compose |
| `evilflowers.yaml` | Kubernetes |
| `.env` | Always: secrets, read by Compose or loaded as a Secret |
| `nginx/elvira.conf` | Compose with nginx on the host (default) |
| `NEXT-STEPS.md` | Always |

### nginx

One file for `/etc/nginx/conf.d/`. It listens on port 80 only; `certbot --nginx` adds TLS and
the redirect. The catalog runs on loopback (`127.0.0.1:8000`) behind it.

- `Host $host` and `X-Forwarded-Proto` reach the catalog, which builds its https links from them.
- 500 MB uploads, timeouts above gunicorn's 240 s.
- `/static/`: on the stable channel the catalog collects the admin assets into `./static` at
  every start and nginx serves them; the development images serve them themselves (WhiteNoise).
- `/data/v1/` is never cached at the proxy: downloads are per reader.
- `/assistant/v1/` and `/mcp/v1` stream without buffering.
- With the portal on, a second server serves the built elvira-portal as a single-page app, hashed
  chunks cached for a year and everything else revalidated.

## Using it as a library

```js
import {generate, generateSecrets} from './src/index.js';

const {files, plan, settings} = generate({channel: 'develop', lending: true}, await generateSecrets());
// files: {'compose.yml': '…', '.env': '…', 'nginx/elvira.conf': '…', 'NEXT-STEPS.md': '…'}
```

`generate` resolves the settings against the defaults and the options' requirements first (OCR
switches the channel to develop, and so on); `plan` holds the services, volumes and warnings.

## Tests

```sh
npm test                    # unit tests, no tools needed
npm run test:integration    # docker compose config, nginx -t, kubeconform over test/matrix.js
```

## Keeping it current

`SOURCES.md` lists where each value comes from. When the catalog, a worker or the portal
changes what it reads, update `src/data.js` / `src/plan.js` and that file, then bump the version
in `package.json` and `src/version.js`.
