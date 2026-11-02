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
4. **Secrets**: on **each** Worker → Settings → Variables and Secrets, add:
   - `DISCORD_BOT_TOKEN` (used by the `/discord-api` proxy for avatar lookups).
     Without it the proxy still runs, just unauthenticated.
   - `GOOGLE_SERVICE_ACCOUNT_KEY` — see "League signup → Google Sheet" below.
     Without it, `/api/league-signup` returns a 503 and the signup form shows
     an error instead of silently losing data.

   Never commit either value.
5. After the first deploys, confirm **dev.vesa.gg** (on `vesaweb-dev`) and
   **vesa.gg** + **www.vesa.gg** (on `vesaweb`) appear under each Worker's
   Domains & Routes with active certificates.

## League signup → Google Sheet

`/api/league-signup` (`worker/index.js`) appends a row to the "Discord
Submittals" tab of the league signup sheet, in the exact column order the
Discord bot's `/league-signup` command uses — see
`src/app/services/league-signup.service.ts` for the row-building code. This
exists because the bot's Nhost `league_seasons` gating row isn't set up yet;
until it is, the website is the only working signup path, so it writes
straight to the sheet the bot would have used instead of going through an
intermediary (Discord webhook, Apps Script, etc.) that could lose or
desync data. The service-account credential lives only in the Worker secret
— it never reaches the browser.

**One-time GCP setup** (do this once; the same service account can be reused
if the sheet ever needs to change):

1. In a Google Cloud project (new or existing), enable the **Google Sheets
   API** (APIs & Services → Library).
2. **IAM & Admin → Service Accounts → Create Service Account.** Name it
   something like `vesaweb-league-signup`. No project roles needed — it only
   needs access to the one sheet, granted in the next step.
3. On the new service account, **Keys → Add Key → Create new key → JSON**.
   Download it — this is the only copy of the private key.
4. Open the signup sheet, click **Share**, and share it with the service
   account's `client_email` (from the JSON) as **Editor**.
5. On **both** Cloudflare Workers (`vesaweb` and `vesaweb-dev`) → Settings →
   Variables and Secrets, add `GOOGLE_SERVICE_ACCOUNT_KEY` with the **entire
   contents of the downloaded JSON file** as the value (not just the
   private key — the Worker reads `client_email` and `private_key` out of it).
6. `LEAGUE_SIGNUP_SHEET_ID` and `LEAGUE_SIGNUP_SHEET_TAB` are already set as
   non-secret `vars` in `wrangler.jsonc`. Only change them if the target
   sheet or tab name changes.

**Optional hardening** (not required for launch, worth doing after): add a
Cloudflare **Rate Limiting Rule** (Security → WAF) on `POST /api/league-signup`
— e.g. 5 requests/minute per IP — to blunt spam without any code changes,
since the endpoint has no other abuse protection.

## Local deploys / debugging

Wrangler 4 requires **Node 22+** (the repo currently targets Node 20 for
Angular; both work with Angular 18). With Node 22 installed:

```sh
npm run build
npx wrangler dev                 # serve the production build + proxy locally
npx wrangler deploy --env dev    # manual deploy to dev.vesa.gg (normally not needed)
npx wrangler deploy              # manual deploy to PROD vesa.gg (avoid; promote via release branch)
```

`/api/league-signup` only exists inside the Worker — unlike the HF/Discord
routes, `proxy.conf.json` has no external upstream to forward it to for plain
`ng serve` local dev. To test the signup form locally, run `wrangler dev`
(needs Node 22 and `GOOGLE_SERVICE_ACCOUNT_KEY` set via `wrangler secret put`
or a local `.dev.vars` file) instead of `ng serve`.

## Related follow-ups

- Nhost dashboard: add `https://vesa.gg` to the allowed redirect URLs before
  enabling Discord OAuth (#11).
- The dev `/discord-api` proxy in `proxy.conf.json` does not attach the bot
  token, so authenticated Discord endpoints only work in production.
