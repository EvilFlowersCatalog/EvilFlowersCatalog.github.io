---
sidebar_position: 3
title: Architecture
description: The catalog, its clients, its workers and how they connect, with a component diagram.
---

import ArchitectureMap from '@site/src/components/ArchitectureMap';

# Architecture

ELVIRA has **one catalog server and everything else around it**. Clients reach
the catalog over HTTP. The catalog keeps its records in PostgreSQL and hands
slow work to workers through a Redis queue. Workers report back to the catalog
and do not call each other, with two exceptions: the lending path (the
lcpencrypt worker registers files with the LCP server) and the extraction
pipeline (the analyzer hands work to the other extraction workers).

<ArchitectureMap />

## The catalog and its interfaces

[EvilFlowersCatalog](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog)
is a Django application with Celery for background tasks. It owns every
record (catalogs, publications, files, users, loans, annotations),
and it is the only component that writes to the database. It exposes:

| Interface | Used by | What it serves |
| --- | --- | --- |
| `/api/v1` | portal, scripts, digitalizer | REST API for everything; [OpenAPI docs](https://elvira.digital/EvilFlowersCatalog/) |
| `/data/v1` | portal, reader | file downloads for the reader and apps |
| `/opds/v1.2`, `/opds/v2` | e-reader apps | catalog feeds, search, borrowing |
| `/readium/v1` | portal, e-reader apps | LCP licenses, reservations, and the License Status Document proxy |
| `/assistant/v1` | portal | the AI assistant's chats (development) |
| `/mcp/v1` | AI agents | a [Model Context Protocol](https://modelcontextprotocol.io/) server: search and curation tools |
| `/extraction/v1` | extraction workers | where workers post their results (development) |

## Components

### Core

| Component | Repository | What it does |
| --- | --- | --- |
| Catalog | [`EvilFlowersCatalog`](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog) | The server above. |
| Portal | [`elvira-portal`](https://github.com/EvilFlowersCatalog/elvira-portal) | React web app for readers and librarians. A static build: the catalog address and the theme are set at build time. |
| Reader | [`EvilFlowersViewer`](https://github.com/EvilFlowersCatalog/EvilFlowersViewer) | PDF reader on pdf.js, used inside the portal and published on npm. |
| Database | [`evilflowers-postgresql`](https://github.com/EvilFlowersCatalog/evilflowers-postgresql) | PostgreSQL 18 image with pgvector and pg_search. |

### Lending

| Component | Repository | What it does |
| --- | --- | --- |
| LCP encryption | [`evilflowers-lcpencrypt-worker`](https://github.com/EvilFlowersCatalog/evilflowers-lcpencrypt-worker) | Celery worker. Encrypts a file with Readium's lcpencrypt, registers it with the LCP server and reports the result to the catalog. |
| LCP server | [`readium-lcp-server`](https://github.com/EvilFlowersCatalog/readium-lcp-server) | Our build of the upstream Readium server. Issues licenses and status documents; only the catalog talks to it. |

### Extraction (in development)

The catalog queues one run per PDF. The analyzer finds the layout and fans
the work out; every worker posts its results to `/extraction/v1`, and the
catalog stores them next to the publication.

| Component | Repository | What it does |
| --- | --- | --- |
| Analyzer | [`evilflowers-analyzer-service`](https://github.com/EvilFlowersCatalog/evilflowers-analyzer-service) | Page layout with Docling; sends paragraphs and tables to text, figures to image, formulas to equation. |
| Text | [`evilflowers-text-service`](https://github.com/EvilFlowersCatalog/evilflowers-text-service) | Paragraphs and sentences with their positions, paragraph embeddings, tables as Markdown. Also embeds search queries. |
| Image | [`evilflowers-image-service`](https://github.com/EvilFlowersCatalog/evilflowers-image-service) | Crops figures. Generated captions are optional, off by default. |
| Equation | [`evilflowers-equation-service`](https://github.com/EvilFlowersCatalog/evilflowers-equation-service) | Crops formulas and reads them as LaTeX with a LaTeX-OCR model. |

Search is moving into the catalog: PostgreSQL full-text search, BM25 ranking
with pg_search and vector search with pgvector, in the same query as
permissions and facets. The separate
[`evilflowers-search-service`](https://github.com/EvilFlowersCatalog/evilflowers-search-service)
will be retired.

### Getting content in

| Component | Repository | What it does |
| --- | --- | --- |
| Digitalizer | [`evilflowers-books-digitalizer`](https://github.com/EvilFlowersCatalog/evilflowers-books-digitalizer) | Scans to a distribution PDF, a PDF/A-2b master and an EPUB with Slovak OCR; publishes to the catalog. [Docs](https://evilflowerscatalog.github.io/evilflowers-books-digitalizer/). |
| Protocol | [`evilflowers-protocol`](https://github.com/EvilFlowersCatalog/evilflowers-protocol) | OpenAPI definition of the catalog API. |
| Python client | [`evilflowers-protocol-python`](https://github.com/EvilFlowersCatalog/evilflowers-protocol-python) | Typed client generated from the protocol. |

## Design rules

- **Standards first.** Readers get OPDS and Readium LCP on their usual paths,
  so existing apps work without changes. See [Standards](./standards).
- **One writer.** Only the catalog writes the database. Workers get IDs and
  file paths through the queue and send results back over HTTP, so a worker
  can be replaced without a migration.
- **The core stays small.** If a feature can run as a worker, it does. A
  worker can fail, or be a student's thesis project, without taking the
  library down.
- **Multi-tenant.** One install hosts many catalogs, each with its own
  publications and permissions.

The [ecosystem page](/ecosystem) follows one publication through these
components, step by step.
