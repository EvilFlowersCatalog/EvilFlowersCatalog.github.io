---
sidebar_position: 5
title: Quickstart
description: Spin up a local instance of the catalog with Docker.
---

# Quickstart

The catalog ships a working `docker-compose.yml` you can use as the base for
a local environment. The container is published as
[`ghcr.io/evilflowerscatalog/evilflowerscatalog`](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/pkgs/container/evilflowerscatalog).

## Boot the catalog

```bash
git clone https://github.com/EvilFlowersCatalog/EvilFlowersCatalog.git
cd EvilFlowersCatalog
docker compose up -d

# Import currencies and languages, set up scheduled jobs.
docker compose exec django python manage.py setup

# Create the first superuser.
docker compose exec django python manage.py createsuperuser
```

The catalog is now reachable on `http://localhost:8000`. The OPDS 1.2 feed
lives at `/opds/v1.2/:catalog`, OPDS 2.0 at `/opds/v2/`, and the REST API
under `/api/v1/`.

## From source (with Poetry)

```bash
python -m venv venv && source venv/bin/activate
poetry install
cp .env.example .env  # configure a JWK and credentials
python manage.py migrate
python manage.py setup
python manage.py createsuperuser
python manage.py runserver
```

Generate the JWK via [mkjwk.org](https://mkjwk.org/) and keep it private.

## Adding the portal

The student / staff UI lives in
[`elvira-portal`](https://github.com/EvilFlowersCatalog/elvira-portal).
Point its `ELVIRA_BASE_URL` at the catalog you just booted, pick a theme
(`fiit`, `ku`, …), and `npm run start`.

## Next steps

- Read the [Architecture overview](./architecture).
- Browse the [Standards](./standards) page to see what to expect from each
  endpoint.
- For DRM-enabled borrowing, follow the
  [Wiki: Readium LCP Integration](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Readium-LCP-Integration).
