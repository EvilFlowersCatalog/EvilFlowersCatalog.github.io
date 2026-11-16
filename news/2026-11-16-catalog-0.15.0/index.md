---
slug: catalog-0.15.0
title: EvilFlowersCatalog 0.15.0
authors: [jdubec]
tags: [release, catalog]
description: Search rebuilt inside PostgreSQL, ratings and reviews, lending statistics, an assistant that cites pages, and list endpoints that no longer slow down with page size.
---

[EvilFlowersCatalog 0.15.0](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/releases/tag/0.15.0)
was released on 12 November 2026. Search now runs inside the catalog's own
PostgreSQL, and the catalog can search inside its publications and answer
questions about them with page citations. After a round of load testing, the
list endpoints also run far fewer database queries.

<!-- truncate -->

This post summarises the release for the people who use and run the catalog.
The [full release notes](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/releases/tag/0.15.0)
list every change with its issue.

## For readers

- **Better search.** Full-text search with Slovak and Czech stemming, so a
  query also finds other forms of the same word. Hits are highlighted, a
  misspelled query gets a "did you mean", and a new endpoint suggests titles as
  you type (`GET /api/v1/entries/suggest`).
- **Facets with exact counts** for filtering results, in the API and in OPDS
  1.2 and 2.0 search feeds, so e-reader apps get them too.
- **Ratings and reviews** on publications, with moderation.
- **Reading history** of what you opened.
- **Category and feed titles** in English and Slovak.

## For librarians

- **Lending statistics** for the admin dashboard.
- **Branded notification e-mails**, and e-mail addresses imported from LDAP.
- **Publishing from AI agents.** The MCP server gained tools to create
  publications and upload their files, and to manage users and API keys.
- Readers can **change their own password**.
- Fixes: one-week loans can be renewed, returning a loan that was never opened
  sends its e-mail, and empty uploads are refused.

## Search by meaning, extraction and the assistant

These parts are in the release. Each works only once the service behind it is
configured.

- **Ranking by meaning.** With an embedding service configured, search combines
  word ranking (BM25) with semantic ranking. Without one, it ranks on words only.
- **Extraction** is off by default (`EVILFLOWERS_EXTRACTION_ENABLED`). The
  catalog stores paragraphs, figures and their embeddings
  produced by the [extraction workers](/docs/architecture#processing). That enables
  search inside publications (`GET /api/v1/entries/passages`), a publication's
  figures, and similar publications.
- **The assistant** answers questions from the library's passages, labels how
  strongly each passage supports the answer, and links to the pages it used. In
  the PDF reader it explains a selected passage or figure. It talks to a model
  through the Ollama API, so you can host the model yourself. Without a model
  endpoint configured, it cannot answer.
- **Titles lent with Readium LCP are never read by AI.**

## For people who run it

- **List endpoints cost the same number of queries for any page size.**
  `GET /api/v1/entries?limit=30` used to run 226 SELECTs.
- The signing key is loaded once per process instead of on every request, which
  had cost about a third of the CPU.
- Covers and thumbnails have versioned URLs, so browsers and proxies cache them
  and a repeat request answers 304 without touching storage.
- Downloads support HTTP range requests, so large files stream.
- OpenTelemetry traces, metrics and JSON logs, and optional profiling.
- Optional connection pooling, PgBouncer transaction pooling, and Celery
  settings for autoscaled workers.
- `manage.py backup` works with PostgreSQL 18 and fails loudly when the dump
  fails.

## Before you upgrade

Read the [upgrade notes](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/releases/tag/0.15.0)
at the end of the release. In short:

- PostgreSQL needs the `vector` and `pg_trgm` extensions. `pg_search` is
  optional and enables BM25 ranking. Our
  [PostgreSQL image](https://github.com/EvilFlowersCatalog/evilflowers-postgresql)
  has all three.
- CORS is no longer open to every origin. Set `CORS_ALLOWED_ORIGINS`, or rely on
  the default, which allows the origin of `EVILFLOWERS_PORTAL_URL`.
- The MCP server accepts only Bearer API keys by default. Password clients need
  `EVILFLOWERS_MCP_AUTHENTICATION_SCHEMAS=Bearer,Basic`.
- The integration with the separate search service is removed. Search runs in
  the catalog's database, and `evilflowers-search-service` is archived.
- After migrating, run `manage.py embed_entries --missing` if you configured an
  embedding service.
