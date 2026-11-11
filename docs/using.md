---
sidebar_position: 2
title: Using ELVIRA
description: How readers, e-reader apps, librarians and developers use ELVIRA.
---

# Using ELVIRA

## Readers

At STU, go to [elvira.stuba.sk](https://elvira.stuba.sk) and sign in with
your university account.

- **Find a title.** Search by title, author or subject, then narrow the list
  by language, category, year or availability.
- **Read it.** Open a publication to read it in the browser. Search inside the
  text, jump between pages with the thumbnails, highlight passages and add
  notes. The reader remembers where you stopped.
- **Cite it.** Copy a citation as BibTeX, BibLaTeX or RIS, or share a link to a
  page range.
- **Borrow it.** Some titles are lent with DRM. Borrow one, read it, and renew
  or return it from your loans page. If every copy is out, reserve it and you
  get an e-mail when it is your turn.
- **Keep it.** Put publications on your shelf to find them again later.

The portal is in Slovak and English.

## Reading apps

Every catalog is also an OPDS feed, so you can browse and borrow from an
e-reader app instead of the browser.

1. Install [Thorium Reader](https://thorium.edrlab.org/) or another app that
   reads OPDS (Thorium also handles LCP loans).
2. Add a feed with your instance's catalog address:
   `https://<catalog server>/opds/v2/` for OPDS 2.0, or
   `https://<catalog server>/opds/v1.2/<catalog>` for older apps.
3. Sign in with your library account when the app asks.

The catalog wiki has a step-by-step
[Thorium setup guide](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Thorium-Reader-Setup-Guide).

## Librarians

- **Add publications** in the portal: create an entry, fill in the metadata
  and upload the file.
- **Organise them** with categories and feeds (curated lists such as "New
  this semester"). A catalog's permissions decide who sees and manages what.
- **Lend with DRM.** Mark a title for LCP and set how many copies can be out
  at once. The catalog encrypts it in the background, then handles loans,
  renewals, returns and the waiting list.
- **Bring in research data.** Datasets published in a connected
  [Dataverse](https://dataverse.org/) appear in the catalog with their
  metadata and files.
- **Digitize printed books** with the
  [books digitalizer](https://evilflowerscatalog.github.io/evilflowers-books-digitalizer/),
  which publishes finished books straight into a catalog.

## Developers

- **REST API.** Everything the portal does goes through `/api/v1`. The
  [OpenAPI documentation](https://elvira.digital/EvilFlowersCatalog/) lists
  every endpoint. Get a session token from `/api/v1/token`, or create a
  long-lived API key for scripts.
- **Python.** [`evilflowers-protocol-python`](https://github.com/EvilFlowersCatalog/evilflowers-protocol-python)
  is a typed client generated from the
  [protocol](https://github.com/EvilFlowersCatalog/evilflowers-protocol).
- **AI agents.** The catalog runs a
  [Model Context Protocol](https://modelcontextprotocol.io/) server at
  `/mcp/v1`. Connect any MCP client with an API key to search the library, add
  publications and organise feeds and categories, within the key's
  permissions. See the
  [MCP guide](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Model-Context-Protocol).
- **The reader** is an npm package,
  [`@evilflowers/evilflowersviewer`](https://www.npmjs.com/package/@evilflowers/evilflowersviewer),
  if you want it in your own app.
