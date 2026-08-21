#!/usr/bin/env node
/*
 * build-fixtures.mjs — static fixtures-rebuild mechanism (EVE-761, Option C).
 *
 * Reads data/fixtures.json (single source of truth) and rewrites the block
 * between `<!-- FIXTURES:<id> START -->` and `<!-- FIXTURES:<id> END -->`
 * markers in each registered target page from the data.
 *
 * Behaviour:
 *  - Filter: keep rows whose `date` (ISO "YYYY-MM-DD") is today (UTC) or later;
 *    drop past fixtures. Rows with `date: null` always render (like the ticker).
 *  - Sort ascending by date; undated rows sort last (stable).
 *  - Output is REAL static HTML — no JS execution required to read the dates.
 *    (This is the whole point: GPTBot / ClaudeBot / PerplexityBot / CCBot must
 *    read the fixtures without running scripts.)
 *  - No-op cleanly: if a rendered block is unchanged, the file is left untouched
 *    (no write, no empty commit).
 *  - A list may declare additional marker-wired regions in `extras` (e.g. a
 *    section heading whose wording states the fixture count). These are rendered
 *    from the same selected rows so hand-written prose cannot drift out of sync
 *    with the cards when a fixture drops off.
 *  - Zero-row guard: a list that selects NO rows aborts the run before writing
 *    anything. See ZERO-ROW GUARD below for why this is a hard failure.
 *
 * Adding a new list later (e.g. homepage ticker, Nations page) is just: add its
 * rows under a new key in data/fixtures.json, add a marker pair to the target
 * page, and register it in LISTS below with its own row renderer.
 *
 * Usage:
 *   node scripts/build-fixtures.mjs          # rewrite files in place
 *   node scripts/build-fixtures.mjs --check  # exit 1 if any file would change (CI/dry-run)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_FILE = join(ROOT, 'data', 'fixtures.json');

const CHECK_ONLY = process.argv.includes('--check');

// Today in UTC as YYYY-MM-DD. String comparison is valid for ISO dates.
const TODAY = new Date().toISOString().slice(0, 10);

// ---- Renderers ------------------------------------------------------------

// rugby-hub: event-card markup as it exists in experiences/rugby/index.html.
// Reproduces the committed markup byte-for-byte (classes, indentation, entity
// forms, committed image src/alt). Image paths are referenced verbatim from the
// data — never swapped, replaced, or added (image-lock rule).
function renderRugbyHubCard(row) {
  const lines = [];
  lines.push(`        <!-- ${row.comment} -->`);
  lines.push(`        <a href="${row.href}" class="event-card">`);
  lines.push(`          <div class="event-card-image">`);
  if (row.imageComment) {
    lines.push(`            <!-- ${row.imageComment} -->`);
  }
  lines.push(`            <img`);
  lines.push(`              src="${row.imgSrc}"`);
  lines.push(`              alt="${row.imgAlt}"`);
  lines.push(`              loading="lazy"`);
  lines.push(`            >`);
  lines.push(`            <div class="event-date-badge">${row.badge}</div>`);
  lines.push(`          </div>`);
  lines.push(`          <div class="event-card-body">`);
  lines.push(`            <p class="event-category">${row.category}</p>`);
  lines.push(`            <h3 class="event-title">${row.title}</h3>`);
  lines.push(`            <p class="event-venue">${row.venue}</p>`);
  lines.push(`            <p class="event-teaser">${row.teaser}</p>`);
  lines.push(`            <span class="btn btn-primary btn-sm">${row.cta}</span>`);
  lines.push(`          </div>`);
  lines.push(`        </a>`);
  return lines.join('\n');
}

// Number words, so the generated heading keeps the page's editorial voice
// ("Three rugby experiences.") rather than switching to a numeral.
const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
];

function numberWord(n) {
  return NUMBER_WORDS[n] ?? String(n);
}

// rugby-hub heading: the section title states how many experiences are listed.
// It is generated from the same selected rows as the cards, because the date
// filter changes that count whenever a fixture drops off the page.
// Singular matters here: the filter genuinely reaches one row (once the Nations
// Finals date passes in Nov 2026, Australia 2027 is the only fixture left for
// ~10 months), and "One rugby experiences." would sit on the live page for all
// of it.
function renderRugbyHubHeading(rows) {
  const noun = rows.length === 1 ? 'experience' : 'experiences';
  return `<h2 class="section-title">${numberWord(rows.length)} rugby ${noun}.</h2>`;
}

// ---- Registry -------------------------------------------------------------
// One entry per marker-wired list. `indent` is the leading whitespace used for
// the generated-by comment and the END marker line so the block sits neatly in
// its container.
const LISTS = [
  {
    id: 'rugby-hub',
    file: join(ROOT, 'experiences', 'rugby', 'index.html'),
    indent: '        ',
    render: renderRugbyHubCard,
    // Marker-wired regions outside the card block that are derived from the
    // same rows. `inline: true` means the replacement sits between the markers
    // on one line, with no added newlines or indentation.
    extras: [
      { id: 'rugby-hub-heading', render: renderRugbyHubHeading, inline: true },
    ],
  },
];

// ---- Engine ---------------------------------------------------------------

function selectRows(rows) {
  const kept = rows.filter((r) => r.date == null || r.date >= TODAY);
  // Stable ascending sort by date; undated (null) rows sort last.
  return kept
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const da = a.r.date == null ? '9999-12-31' : a.r.date;
      const db = b.r.date == null ? '9999-12-31' : b.r.date;
      if (da < db) return -1;
      if (da > db) return 1;
      return a.i - b.i;
    })
    .map((x) => x.r);
}

function buildBlock(list, rows) {
  const cards = rows.map(list.render).join('\n\n');
  const genComment =
    `${list.indent}<!-- Auto-generated from /data/fixtures.json by scripts/build-fixtures.mjs. Do not hand-edit cards between the FIXTURES markers. -->`;
  // Leading newline after START marker, generated-by note, blank line, cards,
  // blank line, then indent so the END marker keeps its own indentation.
  return `\n${genComment}\n\n${cards}\n\n${list.indent}`;
}

// Replace whatever sits between the START/END markers for `markerId`.
function replaceRegion(src, markerId, file, replacement) {
  const startMarker = `<!-- FIXTURES:${markerId} START -->`;
  const endMarker = `<!-- FIXTURES:${markerId} END -->`;

  const startIdx = src.indexOf(startMarker);
  const endIdx = src.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers for "${markerId}" not found in ${file} (need ${startMarker} … ${endMarker})`
    );
  }
  if (endIdx < startIdx) {
    throw new Error(`END marker precedes START marker for "${markerId}" in ${file}`);
  }

  return src.slice(0, startIdx + startMarker.length) + replacement + src.slice(endIdx);
}

function processList(list, data) {
  const rows = data[list.id];
  if (!Array.isArray(rows)) {
    throw new Error(`No rows for list "${list.id}" in ${DATA_FILE}`);
  }
  const src = readFileSync(list.file, 'utf8');
  const selected = selectRows(rows);

  // ---- ZERO-ROW GUARD ----
  // Every row has passed its date, so the block would render as an empty grid.
  // Abort BEFORE writing: publishing an empty "N rugby experiences" section is
  // worse than not rebuilding at all, and it would happen silently — no error,
  // no failure email — which is the exact failure mode this mechanism exists to
  // prevent. Failing here surfaces it through the workflow's documented signal
  // (GitHub emails the repo owner on workflow failure) while the page keeps its
  // last-good content. Fix by adding the next season's fixtures to
  // data/fixtures.json.
  if (selected.length === 0) {
    throw new Error(
      `List "${list.id}" selected 0 of ${rows.length} rows — every fixture is in the past ` +
        `(today is ${TODAY} UTC). Refusing to publish an empty block in ${list.file}. ` +
        `Add upcoming fixtures to ${DATA_FILE}.`
    );
  }

  let next = replaceRegion(src, list.id, list.file, buildBlock(list, selected));

  for (const extra of list.extras ?? []) {
    const rendered = extra.render(selected);
    next = replaceRegion(
      next,
      extra.id,
      list.file,
      extra.inline ? rendered : `\n${list.indent}${rendered}\n${list.indent}`
    );
  }

  if (next === src) {
    return { id: list.id, file: list.file, changed: false, count: selected.length };
  }
  if (!CHECK_ONLY) {
    writeFileSync(list.file, next, 'utf8');
  }
  return { id: list.id, file: list.file, changed: true, count: selected.length };
}

function main() {
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  let anyChanged = false;
  for (const list of LISTS) {
    const res = processList(list, data);
    anyChanged = anyChanged || res.changed;
    const state = res.changed ? (CHECK_ONLY ? 'WOULD CHANGE' : 'updated') : 'unchanged';
    console.log(`[fixtures] ${res.id}: ${state} (${res.count} rows) -> ${res.file}`);
  }
  if (CHECK_ONLY && anyChanged) {
    console.error('[fixtures] --check: files are out of date; run: node scripts/build-fixtures.mjs');
    process.exit(1);
  }
}

main();
