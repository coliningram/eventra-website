# Pending workflow — `sitemap-lastmod.yml` (EVE-768)

Finished GitHub Actions workflow that maintains `<lastmod>` in `sitemap.xml`.
It is **not active** while it sits here. GitHub only runs workflows found in
`.github/workflows/`.

Same reason as `fixtures.yml` (EVE-761): the deploy PAT carries `repo` but not
`workflow` scope, and the scope check is enforced at the git-tree layer, so no
API route writes to `.github/workflows/`. A sibling directory pushes normally.

## To activate

```sh
git mv .github/workflows-pending/sitemap-lastmod.yml .github/workflows/sitemap-lastmod.yml
git rm .github/workflows-pending/SITEMAP-LASTMOD-README.md
git commit -m "EVE-768 Activate sitemap lastmod workflow"
git push
```

The YAML is byte-identical to the intended final file. The `git mv` is all that
is needed, no edits.

**This one must live on `main`.** Its trigger is `push` to `main` and it reads
`main`'s own page files. Parked here on `main` for that reason, unlike
`fixtures.yml`, which is parked on `staging` and whose generator
(`scripts/build-fixtures.mjs`) and data (`data/fixtures.json`) are also
staging-only. Moving `fixtures.yml` to `main` before those two files reach
`main` would give a workflow that fails on every run. Sequencing note for the
"move both in one session" plan.

## Loop protection (the EVE-768 board question)

The design commits back to the same branch it triggers on, so the loop has to be
closed deliberately. Three layers, in order of what actually does the work:

1. **`paths:` filter — the real guard.** The workflow only triggers on
   `**/index.html`. The bot's commit stages `sitemap.xml` and nothing else, so
   the commit it makes cannot match its own trigger. The loop is closed at the
   event layer, before a runner is ever allocated.
2. **Actor guard.** `if: github.actor != 'github-actions[bot]'` on the job. A
   second line of defence if the paths filter is ever widened.
3. **No-op guard.** The commit step runs `git diff --quiet -- sitemap.xml` and
   exits 0 without committing when the file is byte-identical. No empty
   commits, so a push that stamps a date already equal to today produces
   nothing at all.

**No `[skip ci]`, deliberately.** The sitemap commit has to reach Cloudflare's
build or the updated file never deploys. Workers Builds ignores `[skip ci]`
today, but Cloudflare Pages already honours it and it is an open request for
Workers (`cloudflare/workers-sdk#11061`). Including the flag would silently stop
sitemap updates from going live the day that lands. Layer 1 already closes the
loop without it.

## Page-only dates

The board rule is that shared chrome must not reset every date. A sitemap that
stamps all 73 URLs with today on one nav tweak teaches Google to ignore the
field. Enforcement:

- Only URLs whose own `index.html` changed in the push are stamped.
- A commit whose message contains `[chrome]` is skipped entirely. That is how a
  deliberate sitewide sweep declares itself. Use it on nav, footer, favicon,
  canonical, and sitewide CSS sweeps.
- `MAX_URLS = 20`. A push that would stamp more than 20 URLs **fails the run**
  rather than mass-stamping. A sweep that forgot the `[chrome]` marker is loud,
  not silent. GitHub emails the repo owner on failure, the same fail-safe signal
  `fixtures.yml` relies on.

## Other failure behaviour

- **Page changed but its URL is not in `sitemap.xml`:** the run fails and names
  the URL. A new page missing from the sitemap is a real SEO gap, so it should
  block rather than pass quietly. The workflow never adds URLs on its own.
- **`EXCLUDE_PREFIXES`** carries `/experiences/concerts-culture/`, which is
  disallowed in production `robots.txt` and deliberately absent from the
  sitemap. Touching those pages neither fails the run nor adds them. Board
  decision, 2026-08-17.
- **Force-push or unreachable `github.event.before`:** falls back to the tip
  commit rather than erroring.
- **Merge commits** contribute no files under `git show --name-only`, so they
  stamp nothing. Deletions are filtered out with `--diff-filter=d`.

## Verified before parking

Run against the real repo history on 2026-08-17, using the script extracted
verbatim from the YAML:

| Case | Input | Result |
| --- | --- | --- |
| Real single-page edit | `fa55482^..fa55482` (cricket note) | date already current, no write, exit 0 |
| Sitewide sweep | `8b7ad88^..8b7ad88` (75 HTML files) | `FAIL: 72 URLs would be stamped, cap is 20`, exit 1 |
| Concerts-only edit | `cb3d611^..cb3d611` | excluded, no failure, no write, exit 0 |
| `[chrome]` + real edit in one push | synthetic 2-commit range | `[chrome]` commit skipped, sibling commit stamped, 1 line changed |
| New page absent from sitemap | synthetic | `FAIL: … not in sitemap.xml`, names the URL, exit 1 |

YAML parses clean under `yaml.safe_load`.
