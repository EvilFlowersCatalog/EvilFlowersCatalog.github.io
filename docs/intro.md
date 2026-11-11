---
sidebar_position: 1
title: Introduction
description: What ELVIRA and EvilFlowers are, what they do, who runs them, and where to go next.
---

# What ELVIRA is

**ELVIRA** is an open-source digital library platform: a catalog, a web portal
with a built-in PDF reader, Readium LCP lending, and workers that process
publications. The [Slovak University of Technology](https://www.stuba.sk/)
(STU) runs it at `elvira.stuba.sk`, where students and staff search the
university's publications, read them in the browser and borrow protected
titles. The [Catholic University in Ružomberok](https://www.ku.sk/) runs its
own instance.

**EvilFlowers** is the name of ELVIRA's catalog server,
[EvilFlowersCatalog](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog),
an [OPDS](https://opds.io/) server that started as a side project before
ELVIRA existed. It is also the name of the GitHub organization that holds all
ELVIRA code, [github.com/EvilFlowersCatalog](https://github.com/EvilFlowersCatalog),
which is why most repositories are called `evilflowers-…`.

## What it does today

- **Catalog.** Publications with their files, authors, categories and
  languages, in as many separate catalogs as you need, each with its own
  permissions.
- **Reading.** A web portal with a built-in PDF reader: full-text search inside
  a document, highlights, notes, page-range sharing and citation export.
- **Lending.** Borrow, reserve, renew and return with
  [Readium LCP](https://readium.org/lcp-specs/), in the portal or in any
  LCP-capable app.
- **Open access for apps.** Every catalog is an OPDS 1.2 and OPDS 2.0 feed, and
  everything is scriptable over a REST API documented in
  [OpenAPI](https://elvira.digital/EvilFlowersCatalog/).
- **Accounts.** Local users, LDAP, JWT sessions and long-lived API keys.
- **Research data.** Datasets published in Dataverse appear in the catalog.

In development, and public on GitHub: passage-level search, extraction of
paragraphs, figures, tables and formulas, an assistant that answers with
citations, and a pipeline for digitizing printed books. See
[What's new](./whats-new).

## The shape of it

A publication arrives, uploaded in the portal, over the API, or from the
digitalizer. The catalog stores the record in PostgreSQL and the file on disk
or in S3. Slow work goes to workers through a Redis queue: the lcpencrypt
worker encrypts titles for lending, and the extraction workers take PDFs apart.
Readers reach it all through the portal or an OPDS app. The
[architecture page](./architecture) has the component diagram.

## Where to go from here

1. **[Using ELVIRA](./using)**: for readers, e-reader apps, librarians and
   developers.
2. **[Architecture](./architecture)**: the components and how they connect.
3. **[Quickstart](./quickstart)**: a local catalog and portal with Docker.
4. **[Adopting ELVIRA](./adopting)**: what it takes to run it at your
   institution.
5. **[Standards](./standards)** and **[Reference](./reference)**: specs, the
   wiki, the OpenAPI docs and publications.

Every repository is listed on the **[Projects](/projects)** page.
