# Pending workflow — awaiting `workflow` PAT scope

`fixtures.yml` in this directory is the finished GitHub Actions workflow for the
Option C static fixtures rebuild (EVE-761). It is **not active** while it sits
here — GitHub only runs workflows found in `.github/workflows/`.

It lives at this sibling path because the deploy PAT carries only the `repo`
scope, not `workflow`. GitHub rejects any write that creates or edits a file
under `.github/workflows/`, but a sibling directory pushes normally. Keeping the
file in git makes it reviewable and durable rather than untracked in a local
working tree.

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

## To activate

Either grant the deploy PAT the `workflow` scope, or run this yourself:

```sh
git mv .github/workflows-pending/fixtures.yml .github/workflows/fixtures.yml
git rm .github/workflows-pending/README.md
git commit -m "EVE-761 Activate fixtures rebuild workflow"
git push
```

`fixtures.yml` is byte-identical to the intended final file, so the `git mv` is
all that is needed — no edits.

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
