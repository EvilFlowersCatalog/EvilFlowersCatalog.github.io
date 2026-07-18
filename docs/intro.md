---
sidebar_position: 1
title: Introduction
description: A quick orientation to ELVIRA — what it is, who runs it, and where to go next.
---

# What ELVIRA is

**ELVIRA** is an open digital library for universities. At its centre is an
[OPDS](https://opds.io/) publication catalog; around it sit a web portal, an
in-browser PDF reader, and a fleet of workers that read every publication so
it can be searched across languages, borrowed with open DRM, and — soon —
answered questions about.

It started in 2020 as a lockdown stopgap and is now the real thing: it runs
across the whole [Slovak University of Technology](https://www.stuba.sk/) at
`elvira.stuba.sk`, and a second, re-themed instance runs at the
[Catholic University in Ružomberok](https://www.ku.sk/). Every part of it is
developed as open source at [FIIT STU](https://www.fiit.stuba.sk/), the home
faculty, and defended as student thesis work year after year.

:::note These docs are the on-ramp
They&rsquo;re deliberately short — enough to understand the shape of the
system and get a local instance running. The authoritative references are the
[wiki](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki) and the
[auto-generated OpenAPI](https://elvira.digital/EvilFlowersCatalog/).
:::

## The shape of it, in one paragraph

A publication arrives (uploaded, or imported from Kramerius / WebDAV). The
catalog publishes a job; independent workers extract its text, OCR its scans,
caption its figures, rebuild its equations and transcribe its video. The
search service indexes the result so a Slovak query can find an English
passage. If a title needs protecting, an LCP worker encrypts it for lending.
The catalog serves all of it over OPDS; the portal and the embedded reader are
what a student actually sees. The [ecosystem map](/ecosystem) walks through the
same journey, step by step.

## Where to go from here

1. **[Architecture overview](./architecture)** — the catalog, portal, viewer
   and workers, and how a document flows between them.
2. **[Standards](./standards)** — every spec ELVIRA implements and where the
   catalog mounts it, so off-the-shelf readers just work.
3. **[Quickstart](./quickstart)** — a local instance with Docker in a few
   commands.
4. **[Reference](./reference)** — the wiki, OpenAPI, protocol and publications.

Prefer to browse than to read? Every repository worth showing is on the
**[Projects](/projects)** page, grouped by what it does.
