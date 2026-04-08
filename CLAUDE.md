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

## Existing Pages

These pages exist and must be linked to (not `/enquire`):

- `/bespoke/europe/western-europe`
- `/bespoke/europe/mediterranean`
- `/bespoke/europe/uk-ireland`
- `/bespoke/europe/nordic-eastern`
- `/bespoke/africa/southern-africa`
- `/bespoke/africa/east-africa`
- `/bespoke/africa/north-africa`
