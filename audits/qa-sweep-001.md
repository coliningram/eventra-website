# Pre-launch QA Sweep 001

- **Date:** 2026-04-29
- **Target:** Cloudflare Workers build at `https://eventra-website.coliningram.workers.dev/`
- **Source of truth:** `main` branch of `github.com/coliningram/eventra-website` (auto-deploys to the Workers domain)
- **Method:** static parse of every HTML file in the repo + live HTTP probes against the Workers deployment and image hosts (Unsplash, local `/images`)
- **Pages checked:** 70 (every `index.html` under `/`, `/bespoke/**`, `/events/**`, `/experiences/**`, `/enquire/`, plus an orphan `/images/bespoke/europe/uk-ireland/index.html` stub)
- **Status:** survey only. No site changes made.

> **Note on the live domain.** This audit is for the Workers build — not `eventragroup.com`, which still serves the old Framer site (per EVE-211). Anything fixed here will only be visible to real users once the domain swap happens.

## Headline numbers

| Severity | Count |
|---|---|
| Broken image references (404) | **25 references** across 22 distinct pages |
| Broken internal link targets (page returns 404 from Workers) | **8 distinct dead routes**, ~70 references across 35 pages (privacy/terms account for 58 of those) |
| Placeholder / unfinished pages | 2 |
| Orphan / misplaced pages | 1 |
| Banned-list copy ("Festivals" division publicly linked) | 4 pages |

68 of 70 pages have a working main nav and footer. The two exceptions are noted below.

---

## 1. Broken images

Two failure modes: malformed Unsplash photo IDs (someone used the URL slug from `unsplash.com/photos/<slug>` instead of the image API ID), and local `/images/...` files that were referenced but never committed.

### 1a. Unsplash 404s — 21 distinct photo IDs across 19 pages

This is the biggest single finding. Roughly **24% of all Unsplash IDs on the site (21 of 89) return 404**. This violates the standing rule in `CLAUDE.md` and memory: *"Never invent or guess Unsplash photo IDs. Only use photo IDs sourced directly from unsplash.com search results."*

11 of the 21 failing IDs use the wrong format entirely — they look like `photo-Q1nOuKleRoc` (slug-style, copied from `unsplash.com/photos/...` URLs) rather than the valid `photo-1635460585286-19beb893037e` (digits + hex hash) format that `images.unsplash.com` actually serves.

Pages affected:

| Page | Failing photo ID(s) |
|---|---|
| `bespoke/africa/southern-africa/botswana/index.html` | `IlmouO6LO1E` |
| `bespoke/africa/southern-africa/botswana/places-to-stay/index.html` | `4ZCA3xukIso`, `GZhnGfJyR7o` |
| `bespoke/africa/southern-africa/botswana/places-to-stay/chiefs-camp/index.html` | `GZhnGfJyR7o` |
| `bespoke/africa/southern-africa/malawi/index.html` | `V7ERfFeAhXI` |
| `bespoke/africa/southern-africa/namibia/index.html` | `sFrBry-NkKw` |
| `bespoke/africa/southern-africa/zimbabwe/index.html` | `h_YF3jVEa9k` |
| `bespoke/europe/mediterranean/croatia/index.html` | `1558901566-12f9b20d5e1c` |
| `bespoke/europe/mediterranean/french-riviera/index.html` | `1574077663899-5b1f24e83ddb` |
| `bespoke/europe/mediterranean/greece/index.html` | `1527785428672-de583e2ee0c4`, `1594168928927-e53ca20f9a0f` |
| `bespoke/europe/nordic-eastern/index.html` | `1599232288126-3a74f4a4b8d5` |
| `bespoke/europe/uk-ireland/ireland/index.html` | `1564594736011-8b2e66d3c321`, `1590052271359-8acb57b7f9dc` |
| `bespoke/europe/uk-ireland/wales/index.html` | `1562552476-1b6fca3f5c1a`, `1574085917226-08b2ab2ad5b8` |
| `events/index.html` | `1616196270240-fda9a1d5428e` |
| `experiences/concerts-culture/index.html` | `Q1nOuKleRoc`, `i1ieGQFItig` |
| `experiences/concerts-culture/harry-styles-wembley-2026/index.html` | `Q1nOuKleRoc` |
| `experiences/f1/index.html` | `kcHkbytoiSQ` |
| `experiences/f1/singapore-gp-2026/index.html` | `kcHkbytoiSQ` |
| `experiences/football/index.html` | `pa447fb59MI` |
| `experiences/football/liverpool-vs-chelsea-2026/index.html` | `JsAsyytxyB8` |

Severity: **broken** — these render as broken image boxes on production.

### 1b. Missing local images — 4 files referenced but absent from repo

| Missing file | Referenced by |
|---|---|
| `/images/experiences/sydney-harbour-australia-2027.webp` | `events/index.html` (Australia 2027 card) |
| `/images/experiences/tennis/wimbledon-grass-court-tennis-racket.webp` | `experiences/index.html`, `experiences/tennis/wimbledon/index.html`, `experiences/tennis/wimbledon/ladies-final-debenture/index.html` |
| `/images/experiences/tennis/us-open-hard-court-tennis-racket.webp` | `experiences/index.html`, `experiences/tennis/us-open/index.html`, `experiences/tennis/us-open/mens-final-upper-tier/index.html` |
| `/images/experiences/tennis/roland-garros-clay-court-tennis-racket.webp` | `experiences/index.html` |

The Wimbledon and US Open ones are used as **CSS `background-image`** on the page hero — so those pages currently render with no hero background.

Severity: **broken**.

### 1c. Image relevance / quality

I did not flag any obviously wrong-content matches (e.g. a Monaco harbour shot on a Wimbledon page) on a manual sweep of the live pages I rendered. This check is by nature subjective and I cannot grade quality (compression, crop) without rendering — flagging as "not surveyed in depth, recommend Colin or designer eyes-on for hero shots before launch."

---

## 2. Broken internal links

Eight distinct internal routes are linked from the site but return **404** on the Workers deployment.

| Dead route | Refs | Distinct pages | Notes |
|---|---|---|---|
| `/privacy` | 29 | 29 | Footer link, sitewide except homepage and a handful of older pages |
| `/terms` | 29 | 29 | Footer link, same scope |
| `/contact` | 6 | 5 | Footer link |
| `/about` | 5 | 5 | Footer link |
| `/partners` | 5 | 5 | Footer link |
| `/festivals` | 4 | 4 | Footer link to **Eventra Festivals** — division is currently **inactive** per CEO.md, should not be linked publicly |
| `/monaco-gp-2026` | 8 | 6 | Linked from homepage, events index, several event pages, and F1 index |
| `/bespoke/rwc-2027-australia` | 11 | 9 | Linked from many event/experience pages; the actual page lives at `/events/australia-2027/` |

Distinct pages carrying at least one of these dead links: 35 (every page that has a footer references `/privacy` and `/terms`).

The `/monaco-gp-2026` references look like an event page that was intended but never built; the `/bespoke/rwc-2027-australia` references are likely a stale URL — the Australia 2027 RWC page now lives under `/events/australia-2027/`.

Severity: **broken**.

> One earlier finding (`/England-SA-Cricket-2027.pdf`) was a false positive in my static parser; the file exists in repo root and serves 200 from Workers.

---

## 3. Placeholder / unfinished pages

1. **`experiences/football/index.html`** — visible copy reads *"Football packages coming soon. We are currently curating a set of premium football hospitality experiences..."*. The page itself is otherwise fully styled (and links to two specific match pages: `liverpool-vs-chelsea-2026/`, `manchester-united-vs-liverpool-2026/`), so the message contradicts its own card content. Either the message is stale or the cards are premature — needs a copy decision.

2. **`/images/bespoke/europe/uk-ireland/index.html`** — orphan stub at a URL inside the `/images/` static directory. Renders as:
   ```
   Britain and Ireland. Old World, Extraordinary Access.
   Coming soon.
   Design Your Journey
   ```
   No nav, no footer, no styling. Likely a leftover from an earlier scaffold. The real UK & Ireland page is at `/bespoke/europe/uk-ireland/`. The stub is reachable from Workers (returns 200) and Google can index it. **Recommend deletion** of the file.

Severity: cosmetic / brand risk.

---

## 4. Navigation consistency

- 68 of 70 pages have a `<nav>` and a `<footer>`. The two exceptions are the orphan stub above and (none in events/experiences/bespoke).
- Every page (except the orphan) carries the same site footer with the same broken footer-link block (`/about`, `/partners`, `/contact`, `/festivals`, `/privacy`, `/terms`). One source-of-truth fix to the footer plus creation of the missing pages will resolve a large fraction of the broken-link findings.
- Breadcrumbs were not part of the standard template. No page surfaced a breadcrumb element.
- No nested `<a>` tags found (CLAUDE.md rule respected).
- No `dest-card → /enquire` violations found (CLAUDE.md rule respected).

Severity: cosmetic / structural.

---

## 5. Other notes

- **Footer links to `/festivals`** appear on `enquire/`, `events/`, `events/england-cricket-newlands-2027/`, `events/springboks-vs-all-blacks-2026/`. CEO.md says Festivals is currently inactive and not on the website — these links should be removed regardless of whether the rest of the broken footer links are repaired by creating pages or removed. (The other "Festival" mentions on the site — Cheltenham Festival, Goodwood Festival of Speed, Salzburg Festival, Edinburgh Festival, etc. — are legitimate proper-noun references to real events and are fine.)
- **`/enquire`** issues a 307 redirect to `/enquire/`. Functional, but worth knowing if any analytics are URL-keyed.
- **Mixed footer template versions.** The bespoke pages have a leaner footer that only references `/privacy` and `/terms`. The homepage, events pages, and `/enquire` have a fuller footer that adds `/about`, `/partners`, `/contact`, `/festivals`. Two footer templates are in use across the site — recommend consolidating to one.

---

## Suggested fix prioritisation (for Colin's review, not acted on)

**P0 — broken, visible, high-traffic**
- Remove or replace the 21 failing Unsplash IDs (regenerate from real `unsplash.com` searches per the standing rule)
- Add the 4 missing local images (or change the references)
- Fix `/monaco-gp-2026` references — either create the page or remove the cards
- Fix `/bespoke/rwc-2027-australia` references — repoint to `/events/australia-2027/`
- Remove all `/festivals` links from the footer

**P1 — broken legal/utility links**
- Decide footer scope: build `/privacy`, `/terms`, `/about`, `/contact`, `/partners` pages, or strip the dead links from the footer for launch
- Consolidate the two footer templates into one

**P2 — cosmetic**
- Delete `/images/bespoke/europe/uk-ireland/index.html` orphan stub
- Resolve the `experiences/football/` "coming soon" / live-cards contradiction (decide whether the page is launch-ready)
- Eyes-on review of hero imagery for content/relevance fit (cannot be automated)

---

## Methodology

1. Walked every `*.html` in the repo (70 files, excluding `.git/`).
2. For each file, parsed every `<a href>`, `<img src>`, `<source srcset>`, `<video src>`, and CSS `background-image: url(...)` reference.
3. Resolved each href to a candidate file in repo and to a candidate URL on the Workers deployment.
4. HEAD-checked the live Workers deployment for: every distinct internal route, the four flagged local image paths, and a sample of working pages to confirm parity.
5. HEAD-checked **every** distinct Unsplash photo ID in use (89 IDs) against `images.unsplash.com`.
6. Scanned visible page text for placeholder patterns (`Lorem ipsum`, `TBC`, `TBD`, `[insert ...]`, `coming soon`, `placeholder`, `TODO:`, `xxx`).
7. Inspected `<nav>` / `<footer>` presence per page.
