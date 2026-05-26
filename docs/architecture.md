---
sidebar_position: 2
title: Architecture overview
description: How the catalog, portal, viewer, workers and microservices fit together.
---

# Architecture overview

ELVIRA is a **distributed system** centered on the catalog server. Reads and
writes go through the OPDS / REST APIs; long-running work is dispatched to
Celery workers and microservices through an event broker.

## Components

### Core

| Component | Repo | Responsibility |
| --- | --- | --- |
| **Catalog server** | [`EvilFlowersCatalog`](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog) | Django app exposing OPDS 1.2, OPDS 2.0 and a REST management API. Source of truth for catalogs, entries, acquisitions, users and ACLs. |
| **Portal** | [`elvira-portal`](https://github.com/EvilFlowersCatalog/elvira-portal) | React + Vite single-page application for students and library staff. Themed per deployment. |
| **Viewer** | [`EvilFlowersViewer`](https://github.com/EvilFlowersCatalog/EvilFlowersViewer) | Embeddable PDF viewer based on pdf.js. Used in the portal and exposable as an npm package. |
| **Importer** | [`evilflowers-importer`](https://github.com/EvilFlowersCatalog/evilflowers-importer) | AI-powered metadata extraction pipeline. Sources: Kramerius, WebDAV. LLM backends: OpenAI, Ollama. |

### Workers (on the event broker)

All of these are Celery workers sitting on the same broker, consuming
events emitted by the catalog and writing results back the same way.
The catalog README calls them "asynchronous task processing" — we just
break them out per concern.

Content extraction:

- `evilflowers-text-service` — PDF text extraction
- `evilflowers-image-service` — image extraction + captioning (PaliGemma) + classification (ViT / ResNet50)
- `evilflowers-equation-service` — LaTeX equation extraction via Nougat
- `evilflowers-video-service` — Whisper large-v3 transcription
- `evilflowers-search-service` — semantic search over text-service output
- `evilflowers-analyzer-service` — cross-modal orchestrator

Document handling:

- `evilflowers-ocr-worker` — OCR (ocrmypdf) of acquisitions
- `evilflowers-lcpencrypt-worker` — Readium LCP encryption

### Contract

- `evilflowers-protocol` — canonical OpenAPI definition
- `evilflowers-protocol-python` — Pydantic v2 bindings

## Data flow

1. **Acquisition** — a PDF (or EPUB / DiViNa / W3C Audiobook) arrives via REST
   upload, importer pipeline, or admin command.
2. **Extraction** — the catalog publishes an event; the OCR worker, text /
   image / equation / video services consume what they need and write back.
3. **Indexing** — the search service picks up text-service output and indexes
   it for OPDS search / portal search.
4. **Borrow** — if `readium_enabled`, the LCP worker encrypts the
   acquisition. The catalog issues a license and exposes the borrow link via
   OPDS 2.0. Reading apps follow the link, fetch the license, decrypt
   locally.

## Visual

For a clickable rendering of the same picture — including legacy repos,
forks and the open standards — see the
**[interactive ecosystem map](/ecosystem)**.
