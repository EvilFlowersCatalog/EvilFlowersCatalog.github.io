---
sidebar_position: 2
title: Architecture overview
description: How the catalog, portal, viewer, workers and microservices fit together.
---

# Architecture overview

ELVIRA is a **distributed system with a small, boring core**. That&rsquo;s the
whole design idea: keep the catalog simple and dependable, and push everything
expensive — OCR, captioning, embeddings, encryption — out to independent
workers on a job queue. A new capability becomes a new service, not a change to
the thing holding the entire library.

It has a practical upside too: each worker can be a student team&rsquo;s project,
built and defended on its own, without risking the catalog everyone depends on.

## The pieces

### Core

| Component | Repo | What it does |
| --- | --- | --- |
| **Catalog** | [`EvilFlowersCatalog`](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog) | Django app and the source of truth — catalogs, entries, acquisitions, users, ACLs. Serves OPDS 1.2, OPDS 2.0 and a REST management API. Multi-tenant: one install hosts many libraries. |
| **Portal** | [`elvira-portal`](https://github.com/EvilFlowersCatalog/elvira-portal) | React + Vite app for students and staff. One codebase, themed per deployment (`fiit`, `ku`, …). University SSO, shelves, search. |
| **Viewer** | [`EvilFlowersViewer`](https://github.com/EvilFlowersCatalog/EvilFlowersViewer) | Embeddable PDF reader on pdf.js. In-document search, annotations, page-range sharing, citation export. Also published on npm. |
| **Importer** | [`evilflowers-importer`](https://github.com/EvilFlowersCatalog/evilflowers-importer) | Pulls publications from Kramerius and WebDAV and uses an LLM (OpenAI or Ollama) to fill missing metadata. Emits JSON the catalog ingests. |

### Workers

Every worker is a Celery consumer on the same broker. The catalog emits an
event when a publication arrives; workers pick up what concerns them and write
their results back the same way. None of them is on the request path — the
catalog stays responsive whether or not the fleet is busy.

| Worker | Repo | Job |
| --- | --- | --- |
| **Analyzer** | [`evilflowers-analyzer-service`](https://github.com/EvilFlowersCatalog/evilflowers-analyzer-service) | Orchestrates the rest — routes a new publication to the right services and aggregates results. |
| **Text** | [`evilflowers-text-service`](https://github.com/EvilFlowersCatalog/evilflowers-text-service) | Extracts text (with full Slovak diacritics) from born-digital PDFs. |
| **OCR** | [`evilflowers-ocr-worker`](https://github.com/EvilFlowersCatalog/evilflowers-ocr-worker) | Adds a searchable text layer to scans, via `ocrmypdf`. |
| **Image** | [`evilflowers-image-service`](https://github.com/EvilFlowersCatalog/evilflowers-image-service) | Extracts figures, captions them (PaliGemma) and classifies them (ViT / ResNet50). |
| **Equation** | [`evilflowers-equation-service`](https://github.com/EvilFlowersCatalog/evilflowers-equation-service) | Reconstructs mathematical formulas as LaTeX, via Nougat. |
| **Video** | [`evilflowers-video-service`](https://github.com/EvilFlowersCatalog/evilflowers-video-service) | Transcribes audio from video publications (Whisper large-v3), aligned to timestamps. |
| **Search** | [`evilflowers-search-service`](https://github.com/EvilFlowersCatalog/evilflowers-search-service) | Embeds extracted text into a vector index and serves semantic search behind the catalog. |
| **LCP encrypt** | [`evilflowers-lcpencrypt-worker`](https://github.com/EvilFlowersCatalog/evilflowers-lcpencrypt-worker) | Encrypts titles for lending (AES-256-CBC) via Readium `lcpencrypt`. |

### Contract

- [`evilflowers-protocol`](https://github.com/EvilFlowersCatalog/evilflowers-protocol) — one OpenAPI 3.1 definition of how catalog, portal, importer and third-party clients talk.
- [`evilflowers-protocol-python`](https://github.com/EvilFlowersCatalog/evilflowers-protocol-python) — the Python client and Pydantic v2 models generated from it.

## How a document flows through

1. **Acquisition.** A PDF (or EPUB, DiViNa, W3C Audiobook) arrives — REST
   upload, the importer pipeline, or an admin command.
2. **Extraction.** The catalog publishes an event. The analyzer decides whether
   the file is born-digital or scanned and routes it to the text service or the
   OCR worker; image, equation and video services take what they need. Everyone
   writes results back to the catalog.
3. **Indexing.** The search service picks up the extracted text, embeds it, and
   makes it searchable — semantic and classic full-text, side by side.
4. **Protection (optional).** If `readium_enabled`, the LCP worker encrypts the
   acquisition. The catalog issues a license and advertises the borrow link over
   OPDS 2.0; reading apps follow it, fetch the license and decrypt locally.
5. **Delivery.** The portal and the embedded viewer read everything back through
   OPDS and the REST API. To the student it&rsquo;s one thing: a library that
   opens in a tab.

## Design principles

- **Standards first.** Everything a reader needs is mounted on a well-known
  OPDS / Readium prefix, so off-the-shelf apps work without bespoke glue. See
  [Standards](./standards).
- **Multi-tenant by default.** One deployment hosts many catalogs, each with its
  own entries, ACLs and theme — that&rsquo;s how the same install serves a whole
  university and a second one re-themed.
- **The core does less on purpose.** If a feature can live in a worker, it does.

## See it move

For a step-by-step, clickable version of the flow above — with links straight
to each repository — see the **[ecosystem map](/ecosystem)**.
