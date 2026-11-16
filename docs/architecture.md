---
sidebar_position: 3
title: Architecture
description: The catalog's interfaces, how work moves through the workers, and the rules the components follow.
---

import Diagram from '@site/src/components/Diagram';

# Architecture

ELVIRA has **one catalog server and everything else around it**. Clients reach
the catalog over HTTP. The catalog keeps its records in PostgreSQL and hands
slow work to workers through a Redis queue. Workers report back to the catalog
and do not call each other, with two exceptions: the lending path (the
lcpencrypt worker registers files with the LCP server) and the extraction
pipeline (the analyzer hands work to the other extraction workers).

The component map and every repository are on
[How it works](/how-it-works). This page covers the interfaces and the flow of
work between them.

<Diagram
  name="sequence-publication-journey"
  alt="Sequence diagram: a librarian uploads a PDF to EvilFlowersCatalog. If OCR is enabled, the catalog sends an OCR task to ocr-service. If the title is lent with Readium LCP, the catalog sends an encryption task to lcpencrypt-worker, which registers the file with the Readium LCP server. If extraction is enabled, the extraction workers post paragraphs, figures and formulas back to the catalog. A reader borrows through /readium/v1 and the catalog asks the LCP server for a license."
/>

## The catalog and its interfaces

[EvilFlowersCatalog](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog)
is a Django application with Celery for background tasks. It owns every
record (catalogs, publications, files, users, loans, annotations), and it is
the only component that writes to the database. It exposes:

| Interface | Used by | What it serves |
| --- | --- | --- |
| `/api/v1` | portal, scripts, Calibre plugin, digitalizer | REST API for everything; [OpenAPI docs](https://elvira.digital/EvilFlowersCatalog/) |
| `/data/v1` | portal, reader | file downloads for the reader and apps |
| `/opds/v1.2`, `/opds/v2` | e-reader apps | catalog feeds, search, borrowing |
| `/readium/v1` | portal, e-reader apps | LCP licenses, reservations, and the License Status Document proxy |
| `/assistant/v1` | portal, reader | the assistant's chats and explanations |
| `/mcp/v1` | AI agents | a [Model Context Protocol](https://modelcontextprotocol.io/) server: search, reading and curation tools |
| `/extraction/v1` | extraction workers | where workers post their results |

## Search

Search runs in the catalog's own PostgreSQL: full-text search with Slovak and
Czech stemming, BM25 ranking with pg_search, and vector search with pgvector,
all in the same query as permissions and facets. Query and paragraph
embeddings come from an embedding service the catalog is pointed at; without
one, search ranks on words only.

## Processing

The catalog sends work to these workers when it is configured to. It queues
one extraction run per PDF. The analyzer finds the layout and fans the work
out; every worker posts its results to `/extraction/v1`, and the catalog stores
them next to the publication. Titles lent with Readium LCP are never read by
AI.

| Worker | What it does |
| --- | --- |
| OCR | Adds a text layer to scanned PDFs as a new file and keeps the original. Tesseract by default, RapidOCR as an option. |
| Analyzer | Page layout with Docling; sends paragraphs and tables to text, figures to image, formulas to equation. |
| Text | Paragraphs and sentences with their positions, paragraph embeddings, tables as Markdown. |
| Image | Crops figures. Generated captions are optional. |
| Equation | Crops formulas and reads them as LaTeX with a LaTeX-OCR model. |

Every worker is built on
[evilflowers-worker](https://github.com/EvilFlowersCatalog/evilflowers-worker),
which holds the message contract with the catalog, delivery and shutdown rules
and telemetry.

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
