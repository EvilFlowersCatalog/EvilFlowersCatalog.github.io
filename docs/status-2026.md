---
sidebar_position: 10
title: Status report (2026-05-25)
description: Project status snapshot for AI multimodal processing in the ELVIRA digital library.
---

# Status report — 2026-05-25

> *Original Slovak report:*
> [`Sprava_stav_prac_ELVIRA_2026-05-25.docx`](/docs/Sprava_stav_prac_ELVIRA_2026-05-25.docx)
> · Ing. Jakub Dubec, FIIT STU · 25 May 2026

This page is an English condensation of the most recent status report on
the research line **"AI processing of multimodal data for the ELVIRA
digital library"**. The Slovak original is the authoritative source.

## Scope

The work extends ELVIRA — a multi-tenant OPDS publication catalog
developed as open source at FIIT STU — with automated content processing.
The end-to-end pipeline now runs from PDF ingest through extraction,
semantic indexing and multilingual search to a conversational AI
assistant and Readium LCP–protected lending.

## Architecture

Two layers:

- **Catalog core.** Monolithic application holding metadata, accounts,
  permissions and loans.
- **Worker fleet.** Specialised microservices for text and structure
  extraction, equation recognition, semantic search and analytics.
  Scalable independently; new AI capabilities can be added without
  touching the catalog.

Users reach the system through the web portal and the embedded PDF
viewer (with annotation support), or through standard e-reader protocols
(OPDS 1.2; OPDS 2.0 in preparation). The full stack is publicly available
under [github.com/EvilFlowersCatalog](https://github.com/EvilFlowersCatalog).

## Delivered capabilities

### Automated content extraction

Text (including full Slovak diacritics), tables, figures and
mathematical formulas are extracted automatically. The system detects
whether a PDF is born-digital or scanned and routes it to direct
extraction or to OCR accordingly — covering both new publications and
the legacy digitised collection.

### Structural decomposition

Content is processed at the level of pages, paragraphs and sentences,
not as monolithic text. The same principle applies to images, formulas
and tables. This unlocks sentence- and figure-level deep links and
citation precision in search results.

### Semantic and multilingual search

Extracted content is embedded with modern multilingual language models
into a vector database. A Slovak query returns relevant passages from
English, Czech and German literature alongside Slovak hits. Classical
full-text search runs in parallel; the combined result blends keyword
recall with semantic precision.

### AI assistant over library content

A working AI assistant is deployed in the development environment. It
uses the semantic search backend and returns answers grounded in
specific source passages with inline citations. Production rollout to
the academic community follows internal testing.

### Readium LCP–protected lending

ELVIRA implements the Readium LCP open standard end to end — license
issuance, return, renewal. **Official EdRLab certification is in
progress**, which will unlock work with commercial publisher titles.

### Dataverse integration

The catalog is wired to a Dataverse instance. Datasets published into
public Dataverse storage automatically appear in the catalog, improving
discoverability of STU research outputs.

## Deployment status

| Environment                         | Status                |
| ----------------------------------- | --------------------- |
| `elvira.fiit.stuba.sk` (FIIT STU)   | Production            |
| `elvira.stuba.sk` (STU-wide)        | Production            |
| `elvira.digital` (project home)     | Public project site   |
| AI microservices                    | Internal dev → staged rollout to production |

## Publications and theses

### Student theses (FIIT STU)

- **Kubis** — *Cross-Lingual Citations Verification Using Multilingual
  Transformer Models.* Contributes to ELVIRA's semantic layer.
- **Zrutta** — *YoGaDoc: Graph-Based Caption-of Relationship Prediction
  for Semantic Indexing of Scientific Documents.* Auto-assigns captions
  to figures in scientific documents.

### Peer-reviewed publications

Indexed in IEEE Xplore:

- [Document 11198952](https://ieeexplore.ieee.org/abstract/document/11198952)
- [Document 11282599](https://ieeexplore.ieee.org/abstract/document/11282599)
- [Document 11484114](https://ieeexplore.ieee.org/abstract/document/11484114)

## Next steps

1. Complete official **Readium LCP certification** with EdRLab.
2. Promote AI microservices from development to production.
3. Open the AI assistant to the wider academic community.
4. Publish a consolidated paper on the integrated pipeline.

## Contact

[Ing. Jakub Dubec](mailto:jakub.dubec@stuba.sk) — Faculty of Informatics
and Information Technologies, Slovak University of Technology in
Bratislava.
