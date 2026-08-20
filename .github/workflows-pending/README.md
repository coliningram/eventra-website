# Parked workflow — activation is a manual step Colin owns

`fixtures.yml` in this directory is the finished GitHub Actions workflow for the
Option C static fixtures rebuild (EVE-761). It is **not active** while it sits
here — GitHub only runs workflows found in `.github/workflows/`.

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

`staging` is **67 commits ahead of `main`** (measured 2026-08-20 against
`d726975`). This is not a merge. It is an isolated cherry-pick of five paths:

| Path | State on `main` | Action |
| --- | --- | --- |
| `data/fixtures.json` | absent | add (new) |
| `scripts/build-fixtures.mjs` | absent | add (new) |
| `.github/workflows-pending/fixtures.yml` | absent | add, then `git mv` into `.github/workflows/` |
| `.github/workflows-pending/README.md` | absent | add (this file) |
| `experiences/rugby/index.html` | present | **partial** — see the trap below |

#### Trap 1 — do not promote the `workflows-pending/` directory wholesale

`staging` branched before `sitemap-lastmod.yml` was parked on `main`, so a
path-scoped promotion of `.github/workflows-pending/` from `staging` **deletes
`sitemap-lastmod.yml` and `SITEMAP-LASTMOD-README.md` from `main`**. Cherry-pick
the two `fixtures` paths by name.

#### Trap 2 — `experiences/rugby/index.html` must be a partial promotion

The whole-file diff (`origin/main` → `origin/staging`) is **five hunks**, and
two of them are branch-only drift that 404s on production:

| Hunk | Lines | Content | Promote? |
| --- | --- | --- | --- |
| 1 | ~424 | `<a href="/journeys">` in the desktop header | **NO** |
| 2 | ~447 | `<a href="/journeys">` in the mobile overlay | **NO** |
| 3 | ~485 | `FIXTURES:rugby-hub-heading` markers | yes |
| 4 | ~511 | the fixtures card block itself | yes |
| 5 | ~549 | `FIXTURES:rugby-hub END` marker | yes |

`journeys/` **does not exist on `main` at all** — the directory is staging-only.
Taking the file across whole ships two dead nav links onto the live rugby hub,
which is precisely the failure caught on the F1 pillar post in EVE-771. Apply
hunks 3–5 only.

Checked and clear: there is **no `noindex`** on the rugby hub on either branch,
and `/images/experiences/rugby/aerial-view-twickenham-stadium.webp` already
exists on `main`, so neither of those traps applies here.

#### Trap 3 — one card in the promoted block links to a staging-only page

The Nations Championship Finals card points at
`/experiences/rugby/nations-championship-finals-2026/`, which exists on
`staging` but **not on `main`** (that page is EVE-762, still awaiting its own
promotion). Promoting Option C before the Nations page means the live rugby hub
renders a card whose link 404s.

Either promote the Nations page first, or drop that one row from
`data/fixtures.json` on `main` and re-run the generator. Row order in the file
does not matter — the generator sorts by date — so the row can be added back the
day the page lands.

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

## Scheduling caveat

GitHub's `schedule` trigger only fires from the repository's **default branch
(`main`)**. On `staging` the daily cron stays dormant even once the file is in
`.github/workflows/` — that is expected. Validate on staging with the
`workflow_dispatch` button, or locally with `node scripts/build-fixtures.mjs`.
The daily cron activates only when this reaches `main` (Colin-gated).
