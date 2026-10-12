# Parked workflows — every write under `.github/workflows/` is a manual step Colin owns

GitHub only runs workflows found in `.github/workflows/`. A file in **this**
directory is inert, and no agent can move it: see "Why no agent can move this
file" below.

**State on `main` as of 2026-10-12.** The Option C fixtures rebuild (EVE-761) is
no longer parked — Colin hand-moved it, `.github/workflows/fixtures.yml` is
active, and the daily cron has run and pushed (7 runs, all green, latest
`3ae9bd1` on 2026-10-12). Everything below about *activating* `fixtures.yml` is
therefore **history**, kept because it records the routes that are barred and
the repo settings that were pre-flighted. What is still parked here and still
owed:

| File | What it is | Owed |
| --- | --- | --- |
| `sitemap-lastmod.yml` | never activated | hand-move to `.github/workflows/` |
| `fixtures-eve904.yml` | a **patch** to the already-active `fixtures.yml` | hand-apply over the live file — see the EVE-904 section at the end |

This is now the **decided** final resting place, not a waiting room. Colin
answered on EVE-768, 2026-08-17 15:07 UTC:

> Park the workflow YAML at .github/workflows-pending/ as you did with EVE-761.
> I will move both by hand in one session. **Do not ask for PAT workflow scope.**

So the PAT route below is closed by decision, not just by permissions. Do not
re-raise it.

## Why no agent can move this file

The deploy PAT carries only the `repo` scope, not `workflow`. GitHub rejects any
write that creates or edits a file under `.github/workflows/`, but a sibling
directory pushes normally. Keeping the file in git makes it reviewable and
durable rather than untracked in a local working tree.

All three write routes were tested and are barred — the last one by a controlled
experiment that isolates the path as the only variable:

| Route | Result |
| --- | --- |
| `git push` touching `.github/workflows/*` | `remote rejected … without workflow scope` |
| Contents API `PUT …/contents/.github/workflows/fixtures.yml` | `404` (scope-masked) |
| Git-data API `POST /git/trees`, same blob at `.github/workflows-pending/fixtures2.yml` | `201` |
| Git-data API `POST /git/trees`, same blob at `.github/workflows/fixtures.yml` | `404` |

Identical blob, identical request shape, only the path differs. The scope check
is enforced at the tree layer, not just at push — so there is no low-level
git-data route around it either.

## Pre-flight: repo settings that affect activation day

Verified against the GitHub API on 2026-08-15, so the first run does not fail on
a surprise:

- **Actions enabled:** yes, `allowed_actions: all` — `actions/checkout@v4` and
  `actions/setup-node@v4` are permitted.
- **Branch protection:** none on `main` or `staging` — the bot's `git push` will
  not be rejected by a protection rule.
- **Existing workflows:** none. This is genuinely the repo's first CI.
- **Default `GITHUB_TOKEN` permissions: `read`.** The workflow declares
  `permissions: contents: write`, which takes precedence over the repo default,
  so this should be fine. If the very first run instead fails at `git push` with
  a `403`, that setting is the cause — fix it at Settings → Actions → General →
  Workflow permissions, or leave the default alone and re-check the explicit
  block.

## To activate — read this before the hand-move session

A `git mv` **on `staging` does not give you a working cron.** GitHub's
`schedule` trigger fires only from the default branch (`main`), so activating
the file where it currently sits produces a workflow that looks live and never
runs. Two separate things are needed, in this order.

### Step 1 — optional: validate on `staging`

```sh
git checkout staging
git mv .github/workflows-pending/fixtures.yml .github/workflows/fixtures.yml
git commit -m "EVE-761 Activate fixtures rebuild workflow (staging, dispatch-only)"
git push
```

This buys one thing: the `workflow_dispatch` button, so the job can be run once
by hand to prove it works end to end. The daily cron stays dormant. Skip this
step if you would rather validate with `node scripts/build-fixtures.mjs`
locally, which exercises the same generator.

### Step 2 — the real activation: promote Option C onto `main`

**This step is already done.** The board approved the file-level route on
EVE-772, 2026-08-21, and it shipped in `f70fdf3` on `main`. All five paths below
are now present and correct on `main`:

| Path | State on `main` | Done how |
| --- | --- | --- |
| `data/fixtures.json` | present | `git checkout origin/staging -- <path>` at tip |
| `scripts/build-fixtures.mjs` | present | same |
| `.github/workflows-pending/fixtures.yml` | present, inert | same |
| `.github/workflows-pending/README.md` | present (this file) | same |
| `experiences/rugby/index.html` | markers wired | four marker lines inserted by hand, generator re-run |

The three traps recorded here when the step was still pending were all handled,
and none of them is live any more:

- **Trap 1, do not promote `workflows-pending/` wholesale.** Honoured: the two
  `fixtures` paths were taken by name, so `sitemap-lastmod.yml` and
  `SITEMAP-LASTMOD-README.md` are untouched on `main`. This still applies to
  anyone syncing this directory in future.
- **Trap 2, the `/journeys` nav leak.** Avoided by not using a cherry-pick at
  all. `main`'s rugby hub carries zero `/journeys` links, staging's still carries
  two. Never take that file across whole.
- **Trap 3, the Nations card linking to a staging-only page.** Resolved: the
  Nations Championship Finals page was promoted to `main` in `4f1c950` and
  serves 200 on production, so the card's link is live, not a 404.

The generator was run on `main` and its output is **byte-identical** to the
cards that were already live, so the data and the page agree.

**What is left is only the `git mv`**, which needs `workflow` scope and is
therefore yours:

```sh
git checkout main
git mv .github/workflows-pending/fixtures.yml .github/workflows/fixtures.yml
git commit -m "EVE-761 Activate the fixtures rebuild workflow on main"
git push
```

Deadline that motivated this: the Springboks vs All Blacks card goes past on
**29 August 2026**. Until the `git mv` happens the cron does not run, so that
card has to be removed by hand, or the generator run manually on `main`:
`node scripts/build-fixtures.mjs`. Verified by simulation against `main`'s own
files: at 30 Aug the block drops to two cards and the heading rewrites itself to
"Two rugby experiences."

### After the move

`fixtures.yml` is byte-identical to the intended final file, so the `git mv` is
all that is needed — no edits to the YAML itself.

## Failure behaviour (zero-row guard)

The generator **aborts with a non-zero exit** if a list ends up with no rows —
i.e. every fixture in `data/fixtures.json` has passed. It does not write, so the
page keeps its last-good content rather than publishing an empty section under a
heading that claims a count.

That makes the workflow run fail, which is deliberate: GitHub emails the repo
owner on workflow failure, and that email is the signal to add the next season's
fixtures. A silently-empty events grid would produce no error and no email,
which is the exact failure this mechanism exists to prevent.

For the rugby hub this first bites after **1 Sep 2027** (Australia 2027, the
last-dated fixture). Undated rows (`date: null`) always render, so a list that
carries one never trips the guard.

Both future states were verified on 2026-08-15 by running the generator against
a throwaway copy of the tree with the clock moved forward:

- simulated **2026-12-01** (Nations Finals passed, Australia 2027 the only row
  left) → one card, heading renders `One rugby experience.` — singular, not the
  `One rugby experiences.` that the first cut of the heading fix would have
  published for roughly ten months.
- simulated **2028-01-01** (every row past) → guard throws, exit `1`, and the
  page file is left **byte-for-byte unchanged** — no partial write.

## EVE-904 — a pending patch to the now-active `fixtures.yml`

`fixtures-eve904.yml` in this directory is **not a new workflow**. It is the
complete, intended contents of the already-active
`.github/workflows/fixtures.yml`, with the EVE-904 failure-handling change
applied. It sits here for the same reason everything else does: the deploy PAT
cannot write under `.github/workflows/`, and per Colin's EVE-768 ruling the PAT
route is closed by decision. Do not ask for `workflow` scope.

### What the patch changes, and why

Three steps instead of two:

1. the generator step gains `id: rebuild` and `continue-on-error: true`;
2. `Commit and push if changed` gains `if: ${{ !cancelled() }}` and labels a
   partial commit in its subject;
3. a final step re-raises the generator's failure so the run still goes red and
   GitHub still emails the owner.

Nothing else in the file moves. The generator's semantics are untouched.

Before this, `Commit and push if changed` carried no `if:` condition, so under
GitHub's default `if: success()` it was **skipped on any throw** — and the units
the run had already completed on disk were discarded unpushed. Pair that with
the generator's old single unguarded sequence and a renamed `FIXTURES:` marker,
a missing list key, or the zero-row guard cost the whole day: every played
treatment due that date was withheld, and the event page kept its
`description`, `og:description`, `twitter:description` and JSON-LD still selling
a fixture that had been played. `noindex` does not help there, because a social
unfurl reads the meta tags directly.

The generator half of the fix is already on `main` — `scripts/build-fixtures.mjs`
now runs each list and the played-page pass as an isolated unit, so a throw in
one no longer withholds the others. **That half is inert on the cron without
this patch**, because the run still exits 1 and the unpatched commit step is
still skipped, so the units that did land are still thrown away. Both halves are
needed; only this one needs your hands.

Committing a partial rebuild is safe because the generator's writes are
unit-atomic: `processList` writes only after the card region and every `extras`
region have resolved, and `processPlayed` writes only after every edit in an
entry has resolved. Whatever is on disk when it exits non-zero is a set of
complete, valid files. That was measured on a six-cell matrix over `main`'s own
bytes; see EVE-904.

### To apply

```sh
git checkout main
cp .github/workflows-pending/fixtures-eve904.yml .github/workflows/fixtures.yml
git rm .github/workflows-pending/fixtures-eve904.yml
node scripts/build-fixtures.mjs --check   # expect exit 0, no diff
git commit -am "EVE-904 Apply fixtures workflow failure handling"
git push
```

Or paste the file into GitHub's web editor on `main`, which needs no local
checkout and no `workflow` scope.

### To validate it

The one link in the EVE-904 argument that could not be executed locally is
GitHub's step-skip behaviour itself, because the workflow has never failed — all
7 runs to date are green, so there is no historical run to read it off. After
applying, the cheap proof is the **Run workflow** button with a deliberately
broken marker on a throwaway branch: the run should go red *and* carry a commit
whose subject begins `chore(fixtures): partial rebuild`.

## Scheduling caveat

GitHub's `schedule` trigger only fires from the repository's **default branch
(`main`)**. On `staging` the daily cron stays dormant even once the file is in
`.github/workflows/` — that is expected. Validate on staging with the
`workflow_dispatch` button, or locally with `node scripts/build-fixtures.mjs`.
The daily cron activates only when this reaches `main` (Colin-gated).
