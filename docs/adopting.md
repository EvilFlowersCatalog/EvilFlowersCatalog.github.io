---
sidebar_position: 6
title: Adopting ELVIRA
description: What it takes to run ELVIRA at your own library or faculty.
---

# Adopting ELVIRA

ELVIRA runs at two universities on two separate installs. This page covers
what you get, what you need to bring, and where the limits are.

You can run it entirely on your own. If you would rather have help, the team
supports faculties and universities setting it up.

## Who it fits

- A **university or faculty library** that wants its publications searchable
  and readable in the browser, on its own servers.
- Anyone who needs **standards-based lending**, so readers can use OPDS apps
  and Readium LCP.
- Teams comfortable running **containers** and some Python. Researchers and
  students build ELVIRA, and you run and update it yourself.

## What you get

- A multi-tenant **catalog**: one install, many catalogs, each with its own
  publications and permissions.
- OPDS **1.2 and 2.0** feeds, so [reading apps work](./standards#reading-apps).
- The **portal** and its **reader**, themed for your institution.
- **Readium LCP** lending, if you want it.
- A **REST API** and an **MCP server** for scripts and AI agents.
- Optional workers that you add as needed: **extraction** (paragraphs,
  figures, tables, formulas), **passage search** and the **assistant**. These
  are still in development.

## What you need

- **Servers.** Somewhere to run containers, PostgreSQL (our
  [image](https://github.com/EvilFlowersCatalog/evilflowers-postgresql)
  includes pgvector) and Redis. Files go on a local disk or any S3-compatible
  store. The core catalog is light; the extraction workers need much more CPU
  and memory.
- **Accounts.** Local users, or connect your LDAP directory.
- **A theme.** The portal is one codebase with a theme per institution. Add
  yours next to the existing ones.
- **Content.** Upload in the portal or over the API, import from Dataverse,
  or digitize printed books with the digitalizer.
- **For LCP lending:** a Readium LCP provider certificate. STU is going
  through EDRLab certification now.

## How to start

1. Run a local catalog and portal with the [Quickstart](./quickstart).
2. Read the [Architecture](./architecture) so you know which pieces you need.
3. When you want to talk about theming, accounts, LCP or a real deployment,
   open a
   [discussion](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions)
   or [write to us](/about).

## Limits

ELVIRA is built by students and researchers, and it moves at that pace. The
catalog, portal and lending have run in production for years. The extraction
workers, passage search and the assistant are newer and still change from
release to release. The REST API is still being extended, so pin a release if
you build on it.
