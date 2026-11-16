# elvira.digital

Website for [elvira.digital](https://elvira.digital), built with
[Docusaurus](https://docusaurus.io/). Node.js 20 or newer.

```bash
npm ci
npm start            # dev server with hot reload
npm run build        # static site in build/
```

## Content

| Path | What |
| --- | --- |
| `src/pages/` | Home, How it works, Releases, About |
| `docs/` | Documentation |
| `news/` | News and release announcements (Docusaurus blog at `/news`) |
| `src/data/ecosystem.js` | Every repository, deployments, people, partners |
| `src/data/announcements.js` | Which releases have a post in `news/` |
| `src/data/site.js` | The navigation, shared by header, mobile menu and footer |

## Design

The site has its own theme layer on Docusaurus. Colours, fonts and spacing are
tokens at the top of `src/css/custom.css` (accent: STU red `#a80331`). Fonts are
self-hosted (`src/fonts.js`): Literata for headings, IBM Plex Sans and Mono for
text and code. The header (`src/theme/Navbar/Content`), the footer
(`src/theme/Footer`) and the 404 text (`src/theme/NotFound/Content`) are the
site's own components.

## Releases

`npm run releases` fetches the releases of every public repository in the
EvilFlowersCatalog organization into `src/data/releases.json`. CI runs it before
each build, so the committed file is only a fallback. Set `GITHUB_TOKEN` to avoid
GitHub's anonymous rate limit. The process is described in `docs/releases.md`.

To announce a release, add a post to `news/` and a line to
`src/data/announcements.js`.

## Diagrams

Diagrams are PlantUML sources in `diagrams/`, drawn with the ELVIRA theme
(`diagrams/elvira.iuml`, a verbatim copy from the evilflowers-knowledge diagram
kit; do not edit it here). `npm run diagrams` renders them to
`static/diagrams/*.svg` with a local `plantuml` (`brew install plantuml`). Commit
the SVGs; the build does not need PlantUML. Use them in MDX with
`<Diagram name="<slug>" alt="…" />` from `@site/src/components/Diagram`.

## Brand images

The favicon and the social card are drawn in HTML with the site's fonts and
colours: `brand/favicon.html` and `brand/social-card.html`. To render them,
serve the repository root (`python3 -m http.server 3200`, so the pages can load
the fonts from `node_modules/`), open each page in a browser and take a
screenshot:

- `social-card.html` at 1200×630, saved as `static/img/social-card.jpg`;
- the `.icon` element of `favicon.html` at 512×512 with a transparent
  background, then with ImageMagick:

```bash
magick favicon-512.png -define icon:auto-resize=48,32,16 static/img/favicon.ico
cp favicon-512.png static/img/favicon-512.png
magick favicon-512.png -background "#a80331" -flatten -resize 180x180 static/img/apple-touch-icon.png
```

## Deploy

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`). The
site also rebuilds daily, by hand, and on a `release-published` repository
dispatch.
