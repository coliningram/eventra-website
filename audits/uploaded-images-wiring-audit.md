# Uploaded Images — Wiring Audit

**Date:** 2026-05-04
**Parent issue:** EVE-281
**Audit scope:** 13 image files added by manual (non-Paperclip) commits in the last ~25 commits on main.

## Summary

- WIRED: 6 / 13
- NOT WIRED: 7 / 13

## Wired images

### `images/bespoke/europe/mediterranean/greece/mykonos-greece-harbour-village.webp`
- Intended: Mykonos card on Greece page
- References:
  - `bespoke/europe/mediterranean/greece/index.html:377`

### `images/bespoke/europe/mediterranean/greece/small-harbour-town-island-greece.webp`
- Intended: Paros / Naxos / Hydra card on Greece page
- References:
  - `bespoke/europe/mediterranean/greece/index.html:400`

### `images/bespoke/europe/mediterranean/italy/val-dorcia-tuscany-italy.webp`
- Intended: Tuscany card on Italy page
- References:
  - `bespoke/europe/mediterranean/italy/index.html:389`

### `images/bespoke/europe/mediterranean/luxury-yachts-saint-tropez-french-riviera.webp`
- Intended: Saint-Tropez card on French Riviera page
- References:
  - `bespoke/europe/mediterranean/french-riviera/index.html:402`

### `images/bespoke/europe/mediterranean/monaco-montecarlo-principality.webp`
- Intended: Monaco image on French Riviera page
- References (basename match — see Path-mismatch warning below):
  - `bespoke/europe/western-europe/france-monaco/monaco/index.html:17`
  - `bespoke/europe/western-europe/france-monaco/monaco/index.html:120`
  - `bespoke/europe/western-europe/france-monaco/monaco/index.html:426`
  - `bespoke/europe/western-europe/france-monaco/index.html:392`
- **Path-mismatch warning:** All four references resolve to `/images/bespoke/europe/western-europe/monaco/monaco-montecarlo-principality.webp` — a separate copy of the same basename living at a different path (both files exist on disk, identical 510244-byte size). The candidate file at the **mediterranean** path is not directly referenced anywhere, and the **French Riviera** Monaco card (`bespoke/europe/mediterranean/french-riviera/index.html:425`) still uses an Unsplash URL rather than either local copy. Per the audit method (basename match → WIRED) this counts as wired, but a follow-up may want to (a) wire the mediterranean copy into the French Riviera page per its commit-msg intent, or (b) remove the duplicate.

### `images/bespoke/europe/cologne-koln-germany-sunset-cologne-bridge.webp`
- Intended: Europe parent hero (already wired in `c8a0732`)
- References:
  - `bespoke/europe/index.html:310`

## Not wired images

### `images/bespoke/europe/mediterranean/greece/crete-island-mountain-greece.webp`
- Intended: Crete card on Greece page
- Original commit: `b39dd5a`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found. Greece page Crete card (`bespoke/europe/mediterranean/greece/index.html:446`) currently uses an Unsplash URL.

### `images/bespoke/europe/mediterranean/croatia/hvar-island-croatia-marina-view-of-town.webp`
- Intended: Hvar card on Croatia page
- Original commit: `ba4d75a`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found.

### `images/bespoke/europe/mediterranean/croatia/perast-montenegro-mountains.webp`
- Intended: Montenegro card on Croatia page
- Original commit: `62ef15e`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found.

### `images/bespoke/europe/mediterranean/italy/modica-town-sicily-italy.webp`
- Intended: Sicily card on Italy page
- Original commit: `caa80b9`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found.

### `images/bespoke/europe/mediterranean/french-riviera-france-luxury-yachts.webp`
- Intended: Cannes & Antibes card on French Riviera page
- Original commit: `ae77d90`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found.

### `images/bespoke/europe/mediterranean/port-of-nice-france.webp`
- Intended: Nice card on French Riviera page
- Original commit: `6b73c93`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found.

### `images/bespoke/europe/western-europe/portugal/lisbon-city-portugal-aerial-view-sunset.webp`
- Intended: Lisbon image on Portugal page
- Original commit: `85d948f`
- Status: NOT WIRED — no `<img src>`, `background-image: url(...)`, or `srcset` references found. Portugal page Lisbon card (`bespoke/europe/western-europe/spain-portugal/portugal/index.html:311`) currently uses an Unsplash URL.

## Notes

- Cologne hero (#13) was wired via EVE-279 commit `c8a0732` immediately before this audit; expected to be WIRED — confirmed.
- Audit considers `.html` and `.css` only. Image-to-image cross-references and `.md` mentions are out of scope.
- Method: bare-filename ripgrep across `**/*.html` and `**/*.css`. The Monaco entry is the only candidate where the basename match resolves to a different on-disk path than the candidate file itself; this is flagged inline in the wired section.
