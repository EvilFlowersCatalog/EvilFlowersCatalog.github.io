---
sidebar_position: 4
title: Adopting ELVIRA
description: What it takes to run ELVIRA at your own library or faculty.
---

# Adopting ELVIRA

ELVIRA already runs at more than one institution, and it&rsquo;s built to travel.
This page is the honest version of &ldquo;could we run this?&rdquo; — what you get,
what you need, and where the edges are.

## Who it&rsquo;s a good fit for

- A **university or faculty library** that wants its publications searchable and
  readable in the browser, without buying into a closed platform.
- Anyone who needs **standards-based lending** — OPDS catalogs and Readium LCP —
  so existing e-readers work out of the box.
- Teams comfortable running **containers** and a bit of Python. This is
  research-grade open source, not shrink-wrapped software.

## What you get, out of the box

- A multi-tenant **catalog** — one install can host several libraries, each with
  its own entries, permissions and theme.
- OPDS **1.2 and 2.0** feeds, so [reading apps just work](./standards#reading-apps-that-just-work).
- The **portal** and the embedded **reader**, themable to your institution.
- The **worker fleet** — text extraction, OCR, figure captioning, equation and
  video processing, semantic search — added as you need them.
- Optional **Readium LCP** lending. (Official EdRLab certification is in
  progress; see the [status report](./status-2026).)

## What you&rsquo;ll need to bring

- **Infrastructure.** Somewhere to run containers, a database and the broker.
  The AI workers want a GPU to be comfortable; the core catalog does not.
- **Identity.** The portal expects university SSO; wire it to your provider.
- **A theme.** The portal is one codebase themed per deployment — add yours
  alongside `fiit` and `ku`.
- **Content.** Import from Kramerius / WebDAV, or upload over the REST API.

## How to start

1. Stand up a local catalog with the [Quickstart](./quickstart) — it&rsquo;s a
   few Docker commands.
2. Read the [Architecture overview](./architecture) so the moving parts make
   sense before you scale any of them out.
3. When you&rsquo;re ready to talk specifics — theming, SSO, LCP, a real
   deployment — open a
   [discussion](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions)
   or [get in touch](/about). We&rsquo;d genuinely like to hear from you.

## The catch, stated plainly

ELVIRA is developed by students and researchers and moves at that pace. The core
is in daily production and dependable; the AI services are newer and evolve
release to release. Adopt the core with confidence, and treat the worker fleet
as capable, active research you can grow into.
