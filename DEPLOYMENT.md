# Deployment

VESAWeb is deployed as a single **Cloudflare Worker** that serves the Angular
static build and proxies external API calls (see `wrangler.jsonc` and
`worker/index.js`). Production domain: **https://vesa.gg**.

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

## How deploys happen

Cloudflare **Workers Builds** is connected to this GitHub repo:

- Push to `main` → production deploy to vesa.gg.
- PR branches → preview URL posted on the PR (no production impact).

### One-time setup (Cloudflare dashboard)

1. **Clean up DNS first**: in the vesa.gg zone → DNS, delete any placeholder
   A/CNAME records on `vesa.gg` (apex) and `www`. The Worker's custom domains
   create their own records and the deploy fails if conflicting records exist.
   (Cloudflare is the authoritative DNS, so proxied records update near-instantly;
   low TTLs only matter for unproxied records you manage manually.)
2. **Workers & Pages → Create → Import a repository**, select `VESAWeb`.
   - Build command: `npm ci && npm run build`
   - Deploy command: `npx wrangler deploy`
   - Everything else (name, assets dir, custom domains) comes from `wrangler.jsonc`.
3. **Secrets**: on the `vesaweb` Worker → Settings → Variables and Secrets, add
   `DISCORD_BOT_TOKEN` (used by the `/discord-api` proxy for avatar lookups).
   Without it the proxy still runs, just unauthenticated. Never commit the token.
4. After the first deploy, confirm **vesa.gg** and **www.vesa.gg** appear under
   the Worker's Domains & Routes with active certificates.

## Local deploys / debugging

Wrangler 4 requires **Node 22+** (the repo currently targets Node 20 for
Angular; both work with Angular 18). With Node 22 installed:

```sh
npm run build
npx wrangler dev      # serve the production build + proxy locally
npx wrangler deploy   # manual production deploy (normally not needed)
```

## Related follow-ups

- Nhost dashboard: add `https://vesa.gg` to the allowed redirect URLs before
  enabling Discord OAuth (#11).
- The dev `/discord-api` proxy in `proxy.conf.json` does not attach the bot
  token, so authenticated Discord endpoints only work in production.
