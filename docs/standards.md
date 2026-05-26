---
sidebar_position: 3
title: Standards
description: Every specification the platform implements and where the catalog mounts them.
---

# Standards

ELVIRA aims to be a **standards-first** OPDS + Readium implementation. The
catalog mounts every supported spec on a well-known prefix so off-the-shelf
clients work without bespoke integration.

| Standard | Mount point | Notes |
| --- | --- | --- |
| [OPDS 1.2](https://specs.opds.io/opds-1.2) | `/opds/v1.2/:catalog` | Atom catalog with search descriptor; popular / new / shelf feeds. |
| [OPDS 2.0](https://drafts.opds.io/opds-2.0) | `/opds/v2/` | JSON catalog with manifests, paginated browsing, borrow / renew / return. 50/page default, 100 max. |
| [Readium LCP](https://readium.org/lcp-specs/) | borrow link in OPDS 2.0 | AES-256-CBC encryption via the `lcpencrypt` worker. |
| [Readium LSD](https://readium.org/lcp-specs/releases/lsd/latest) | proxied through catalog | License status — revoke, renew, return. |
| [Readium Web Pub Manifest](https://readium.org/webpub-manifest/) | OPDS 2.0 manifests | JSON manifest format shared via OPDS 2.0. |
| [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) | every error response | Problem Details for HTTP APIs. |
| [RFC 7617](https://datatracker.ietf.org/doc/html/rfc7617) | HTTP Basic auth | Advertised via OPDS Authentication Document. |
| [RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750) | HTTP Bearer auth | JWT and short-lived access tokens. |
| [RFC 5005](https://datatracker.ietf.org/doc/html/rfc5005) | feed paging | OPDS 1.2 — in progress. |

## Reading apps that just work

- **Thorium Reader** — see the
  [setup guide](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/wiki/Thorium-Reader-Setup-Guide)
  on the wiki.
- **Aldiko Next** — works out of the box with OPDS 2.0 + LCP borrowing.
- Any OPDS 1.2 reader (Calibre, Marvin, etc.) sees the legacy feed.

## What we don't implement

These were listed historically and have **no implementation** today:

- **Z39.50** — never implemented. Removed from product copy.
- **OAI-PMH** — never implemented. Removed from product copy.

If either of these matters for your deployment, please open a
[discussion](https://github.com/EvilFlowersCatalog/EvilFlowersCatalog/discussions).
