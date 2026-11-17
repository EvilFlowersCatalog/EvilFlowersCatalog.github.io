# Where the generator's values come from

Every value `elvira-deploy` writes was read from one of the sources below. When a source
changes, update `src/data.js` or `src/plan.js`, add the change to this file, and bump
`version` in `package.json` and `src/version.js`. Last full check: 2026-11-17.

## EvilFlowersCatalog (`master` = stable channel, `develop` = development channel)

| What | Where | Used for |
|---|---|---|
| Environment variable names | `evil_flowers_catalog/settings/base.py` | Every catalog `env` in `plan.js` |
| `SECURE_PROXY_SSL_HEADER`, WhiteNoise (develop only) | `settings/production.py` | nginx sends `X-Forwarded-Proto` |
| `PublicSchemeMiddleware` | `apps/api/middleware/public_scheme.py` | nginx sends `Host $host`; https links depend on it |
| `STATIC_ROOT = BASE_DIR/static`, empty `static/` in the image | `settings/base.py`, `.dockerignore` | Stable: `./static` bind mount + `collectstatic` |
| `collectstatic` at build, WhiteNoise middleware | `Dockerfile` (develop) | Develop: nginx passes `/static/` on |
| No `/media/` outside `DEBUG`; files go through `get_storage()` at `/data/v1/` | `urls.py`, `apps/core/models` | No `/media/` location |
| Gunicorn `timeout = 240`, `bind`, workers | `conf/gunicorn.conf.py` | Proxy timeouts 300 s |
| `DATA_UPLOAD_MAX_MEMORY_SIZE` 100 MB, MCP upload 200 MB | `settings/base.py` | `client_max_body_size 500m` |
| `text/event-stream` with `X-Accel-Buffering` | `apps/assistant/views.py` | Unbuffered `/assistant/v1/`, `/mcp/v1` |
| Startup: migrate, setup, entry_defaults, supervisord | `conf/entrypoint.sh`, `conf/supervisor.conf` | `CATALOG_COMMANDS`, single-container start |
| `EVILFLOWERS_STATUS_SUPERVISOR` (develop only) | `settings/base.py` | Split web keeps its health check on develop |
| `EVILFLOWERS_MAINTENANCE_QUEUE` default `evilflowers.catalog.maintenance` | `settings/base.py` | Set to `celery` so the one worker runs backups |

## Workers and images

| What | Where |
|---|---|
| Queues, commands, mounts, env of lcpencrypt, ocr, analyzer, image, equation, text | The reference Kubernetes deployment |
| Image tags (`:develop` for extraction, `:master` for OCR, which has the outcome file since efc2599) | Same, and each service's `master` history |
| PostgreSQL 18 data under `/var/lib/postgresql` (not `…/data`) | The official `postgres:18` entrypoint; the volume mounts there |

## Reverse proxy and portal

| What | Where |
|---|---|
| Proxy headers, 300 s timeouts, 500 MB uploads, no `proxy_cache` on `/data/v1/` | The reference installation's nginx vhosts |
| SPA caching: hashed chunks immutable, the rest `no-cache`, keyed on status | Same |
| `dist/`, chunks in `dist/assets/` named `name-<8 char hash>.ext`, `ELVIRA_*` build env | elvira-portal `vite.config.ts`, `README.md` |
