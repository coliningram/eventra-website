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

function processList(list, data) {
  const rows = data[list.id];
  if (!Array.isArray(rows)) {
    throw new Error(`No rows for list "${list.id}" in ${DATA_FILE}`);
  }
  const startMarker = `<!-- FIXTURES:${list.id} START -->`;
  const endMarker = `<!-- FIXTURES:${list.id} END -->`;
  const src = readFileSync(list.file, 'utf8');

  const startIdx = src.indexOf(startMarker);
  const endIdx = src.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers for "${list.id}" not found in ${list.file} (need ${startMarker} … ${endMarker})`
    );
  }
  if (endIdx < startIdx) {
    throw new Error(`END marker precedes START marker for "${list.id}" in ${list.file}`);
  }

  const selected = selectRows(rows);
  const block = buildBlock(list, selected);

  const before = src.slice(0, startIdx + startMarker.length);
  const after = src.slice(endIdx);
  const next = before + block + after;

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
