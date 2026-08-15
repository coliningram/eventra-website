# Pending workflow — awaiting `workflow` PAT scope

`fixtures.yml` in this directory is the finished GitHub Actions workflow for the
Option C static fixtures rebuild (EVE-761). It is **not active** while it sits
here — GitHub only runs workflows found in `.github/workflows/`.

It lives at this sibling path because the deploy PAT carries only the `repo`
scope, not `workflow`. GitHub rejects any push (and any contents-API write) that
creates or edits a file under `.github/workflows/`, but a sibling directory
pushes normally. Keeping the file in git makes it reviewable and durable rather
than untracked in a local working tree.

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

## Scheduling caveat

GitHub's `schedule` trigger only fires from the repository's **default branch
(`main`)**. On `staging` the daily cron stays dormant even once the file is in
`.github/workflows/` — that is expected. Validate on staging with the
`workflow_dispatch` button, or locally with `node scripts/build-fixtures.mjs`.
The daily cron activates only when this reaches `main` (Colin-gated).
