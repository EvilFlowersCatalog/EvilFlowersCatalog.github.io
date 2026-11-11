---
sidebar_position: 5
title: Quickstart
description: Run the catalog and the portal locally with Docker and Node.
---

# Quickstart

This gets a catalog and the portal running on your machine. You need Docker
with Compose v2.20 or newer, and Node.js for the portal.

## 1. Start the catalog

```bash
git clone https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.git
cd EvilFlowersCatalog

# The catalog with its PostgreSQL and Redis
docker compose up -d --build django

# Languages and currencies, then your admin account
docker compose exec django python3 manage.py setup
docker compose exec django python3 manage.py createsuperuser
```

`compose.yml` publishes PostgreSQL on port 5432 and Redis on 6379. If you
already run either locally, change the host side of those `ports` mappings
first.

The catalog is now on `http://localhost:8000`:

| Path | What |
| --- | --- |
| `/admin/` | Django admin: create your first catalog here |
| `/api/v1/` | REST API |
| `/opds/v1.2/<catalog>` | OPDS 1.2 feed of one catalog |
| `/opds/v2/` | OPDS 2.0 feeds |

The repository's `compose.yml` also defines the Readium LCP server, the
lcpencrypt worker, the text and search services and a local Dataverse.
`docker compose up -d --build` starts all of them. The LCP server needs its
configuration and certificates first: follow the
[Readium LCP deployment guide](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Readium-LCP-Deployment).

## 2. Start the portal

```bash
git clone https://github.com/EvilFlowersCatalog/elvira-portal.git
cd elvira-portal
npm install
```

The portal reads its settings from `env/.env.<mode>` at build time. For
local development, edit `env/.env.development`:

```bash
ELVIRA_BASE_URL=http://localhost:8000   # your catalog
ELVIRA_CATALOG_ID=<catalog id>          # from /admin/
ELVIRA_THEME=stu                        # or fiit, or your own theme
```

Then run it:

```bash
npm run dev
```

Open the address Vite prints and sign in with the account you created.
Recent catalog versions accept browser requests only from the origins in
`CORS_ALLOWED_ORIGINS`; if the browser blocks requests to the catalog, add the
portal's address there.

For a production build, `npm run build:prod` writes a static site you can
serve from any web server.

## 3. Without Docker

The catalog uses Poetry and PostgreSQL:

```bash
python -m venv venv && source venv/bin/activate
poetry install
cp .env.example .env    # add a JWK (e.g. from mkjwk.org) and DB credentials
python manage.py migrate
python manage.py setup
python manage.py createsuperuser
python manage.py runserver

# Optional: background tasks (LCP encryption, reminders, backups)
celery -A evil_flowers_catalog worker -l info
celery -A evil_flowers_catalog beat -l info
```

Every setting is listed in the
[Settings & Enumerations](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Settings-&-Enumerations)
page of the catalog wiki.

## Next

- [Using ELVIRA](./using): add publications, connect an e-reader app, use the API.
- [Architecture](./architecture): what each component does.
- [Adopting ELVIRA](./adopting): running it for real.
