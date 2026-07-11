# Deployment

VESAWeb is deployed as a **Cloudflare Worker** that serves the Angular
static build and proxies external API calls (see `wrangler.jsonc` and
`worker/index.js`), in two environments: **https://dev.vesa.gg** (dev) and
**https://vesa.gg** (prod).

## Architecture

- `ng build` outputs the SPA to `dist/angular-app/browser`.
- The Worker serves those files via the assets binding, with
  single-page-application fallback so deep links to Angular routes work.
- Requests to `/hf-api`, `/hf-resolve`, `/hf-league-api`, `/hf-league-resolve`,
  and `/discord-api` are proxied by the Worker (in dev, `proxy.conf.json`
  handles the same routes). HuggingFace responses are edge-cached for 5 minutes.
- Nhost (auth/db) is called directly from the browser — no proxy involved.

> **Transitional:** the HuggingFace proxy routes exist only until the Nhost
> migration (#39) makes Nhost the primary data source. When that lands, delete
> the HF entries from `worker/index.js` and `proxy.conf.json`.

## Environments and branch flow

| Environment | Worker | Domain | Deploys from |
|---|---|---|---|
| dev | `vesaweb-dev` | dev.vesa.gg | `main` (every merge) |
| prod | `vesaweb` | vesa.gg, www.vesa.gg | `release` (manual promotion) |

- **Feature branches are local-only** (`npm start`). Nothing deploys until the
  branch merges to `main`.
- **Merge to `main`** → Workers Builds auto-deploys to **dev.vesa.gg**.
- **Promote to prod** by fast-forwarding `release` to `main`:

  ```sh
  git checkout release
  git merge --ff-only main
  git push
  ```

  The push triggers the prod build → **vesa.gg**. Nothing else ever deploys
  to prod, and `--ff-only` guarantees `release` never diverges from `main`.

### One-time setup (Cloudflare dashboard)

1. **Clean up DNS first**: in the vesa.gg zone → DNS, delete any placeholder
   A/CNAME records on `vesa.gg` (apex) and `www`. The Workers' custom domains
   create their own records and the deploy fails if conflicting records exist.
   (Cloudflare is the authoritative DNS, so proxied records update near-instantly;
   low TTLs only matter for unproxied records you manage manually.)
2. **Create the `release` branch** from the commit considered prod-ready:
   `git checkout -b release main && git push -u origin release`. Consider a
   GitHub branch protection rule restricting who can push to it.
3. **Connect the repo twice** under Compute (Workers) → Create → Import a
   repository — once per environment:
   - Worker **`vesaweb-dev`** — production branch `main`,
     build command `npm ci && npm run build`,
     deploy command `npx wrangler deploy --env dev`.
   - Worker **`vesaweb`** — production branch `release`,
     build command `npm ci && npm run build`,
     deploy command `npx wrangler deploy`.
   - Disable non-production branch builds on both (feature branches are local-only).
   - Everything else (assets dir, custom domains) comes from `wrangler.jsonc`.
4. **Secrets**: on **each** Worker → Settings → Variables and Secrets, add
   `DISCORD_BOT_TOKEN` (used by the `/discord-api` proxy for avatar lookups).
   Without it the proxy still runs, just unauthenticated. Never commit the token.
5. After the first deploys, confirm **dev.vesa.gg** (on `vesaweb-dev`) and
   **vesa.gg** + **www.vesa.gg** (on `vesaweb`) appear under each Worker's
   Domains & Routes with active certificates.

## Local deploys / debugging

Wrangler 4 requires **Node 22+** (the repo currently targets Node 20 for
Angular; both work with Angular 18). With Node 22 installed:

```sh
npm run build
npx wrangler dev                 # serve the production build + proxy locally
npx wrangler deploy --env dev    # manual deploy to dev.vesa.gg (normally not needed)
npx wrangler deploy              # manual deploy to PROD vesa.gg (avoid; promote via release branch)
```

## Related follow-ups

- Nhost dashboard: add `https://vesa.gg` to the allowed redirect URLs before
  enabling Discord OAuth (#11).
- The dev `/discord-api` proxy in `proxy.conf.json` does not attach the bot
  token, so authenticated Discord endpoints only work in production.
