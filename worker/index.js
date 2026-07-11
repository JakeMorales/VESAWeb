/**
 * VESAWeb production Worker.
 *
 * Serves the Angular static build (via the ASSETS binding, configured in
 * wrangler.jsonc with single-page-application fallback) and proxies the
 * external API routes that proxy.conf.json only covers in local dev.
 * See issue #9.
 */

const HF_ROUTES = {
  '/hf-api': 'https://huggingface.co/api/datasets/VESA-apex/apex-scrims',
  '/hf-resolve': 'https://huggingface.co/datasets/VESA-apex/apex-scrims/raw/main',
  '/hf-league-api': 'https://huggingface.co/api/datasets/VESA-apex/apex-league',
  '/hf-league-resolve': 'https://huggingface.co/datasets/VESA-apex/apex-league/raw/main',
};

const DISCORD_PREFIX = '/discord-api';
const DISCORD_TARGET = 'https://discord.com/api';

// Edge-cache TTL for HuggingFace responses, to stay under upstream rate limits.
const HF_CACHE_TTL_SECONDS = 300;

function matchPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const hfPrefix = Object.keys(HF_ROUTES).find((p) => matchPrefix(url.pathname, p));
    if (hfPrefix) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 });
      }
      const target = HF_ROUTES[hfPrefix] + url.pathname.slice(hfPrefix.length) + url.search;
      return fetch(target, {
        method: request.method,
        cf: { cacheEverything: true, cacheTtl: HF_CACHE_TTL_SECONDS },
      });
    }

    if (matchPrefix(url.pathname, DISCORD_PREFIX)) {
      const target = DISCORD_TARGET + url.pathname.slice(DISCORD_PREFIX.length) + url.search;
      const headers = new Headers();
      const contentType = request.headers.get('Content-Type');
      if (contentType) {
        headers.set('Content-Type', contentType);
      }
      if (env.DISCORD_BOT_TOKEN) {
        headers.set('Authorization', `Bot ${env.DISCORD_BOT_TOKEN}`);
      }
      return fetch(target, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      });
    }

    // Everything else is a static asset or an Angular route (SPA fallback).
    return env.ASSETS.fetch(request);
  },
};
