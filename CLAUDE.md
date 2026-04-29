# Eventra Website - Agent Rules

## Deployment

- The site deploys to Cloudflare Workers from the `main` branch.
- Push all changes to `main`. Do NOT use the `cloudflare/workers-autoconfig` branch.

## HTML Rules

- NEVER nest `<a>` tags inside another `<a>` tag. This is invalid HTML and breaks cards in the browser. If a destination card (`<a class="dest-card">`) needs to reference another page in its description text, use plain text or a `<span>` — never an inline `<a>` link.
- All destination cards (`dest-card`) must link to their actual destination page, NOT to `/enquire`. For example, a Mediterranean card on the Europe page must link to `/bespoke/europe/mediterranean`. The only links to `/enquire` should be the nav CTA button and the "Design Your Journey" CTA sections.

## CSS Rules

- Every `.dest-card-body` must have `z-index: 2` so text appears above the overlay.
- Do not use `aspect-ratio` on `.dest-cards-row .dest-card` — use `min-height` instead to prevent text clipping.

## Image Rules

- **Uploaded images are locked.** Every file already committed under `/images/` must stay exactly as it is — do not swap, replace, "improve," or reposition any uploaded image without Colin's explicit permission per task. This applies to all agents (Web Developer, Content Writer, CEO). Treat the uploaded image set as immutable. (EVE-214)
- When using Unsplash images, always verify the URL returns a real image by checking the photo ID exists before using it in any page. Never invent or guess Unsplash photo IDs. Only use photo IDs sourced directly from unsplash.com search results.
- **Broken Unsplash IDs flagged by audits are not auto-fixed.** Do not regenerate or replace failing Unsplash photo IDs from new Unsplash searches. Leave the broken references in place — Colin uploads replacement local images manually and dispatches a separate task for wiring them in. (EVE-214)

## Task Completion

- CRITICAL: Every single task must end with a git push to github.com/coliningram/eventra-website main branch. Never mark a task complete without confirming the commit hash. If you cannot push, report the exact error. Never save to memory instead of pushing.

## Hosting Decisions

- `eventragroup.com` stays on Framer until the new build is explicitly ready to migrate. Do NOT flag this in audits or recommend migration unless the board has explicitly decided we're ready. (EVE-212)

## Existing Pages

These pages exist and must be linked to (not `/enquire`):

- `/bespoke/europe/western-europe`
- `/bespoke/europe/mediterranean`
- `/bespoke/europe/uk-ireland`
- `/bespoke/europe/nordic-eastern`
- `/bespoke/africa/southern-africa`
- `/bespoke/africa/east-africa`
- `/bespoke/africa/north-africa`
