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

const LEAGUE_SIGNUP_PATH = '/api/league-signup';
// Team Name, Scheduling, Comp Exp, Returning Players, 7 cols x 3 players, Additional Comments.
const LEAGUE_SIGNUP_COLUMNS = 26;

function matchPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Signs a Google service-account JWT and exchanges it for an OAuth2 access
 * token, entirely with Web Crypto — no `googleapis`/`google-auth-library`
 * (Node-only, doesn't run in the Workers runtime).
 */
async function getGoogleAccessToken(serviceAccountKeyJson, scope) {
  const key = JSON.parse(serviceAccountKeyJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: key.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claims))}`;

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(key.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

/**
 * Appends one row to the league signup sheet's "Discord Submittals" tab,
 * in the same column order the scrim-bot's `/league-signup` command writes
 * (see docs in DEPLOYMENT.md). The service-account key never reaches the
 * browser — it's a Worker secret only.
 */
async function handleLeagueSignup(request, env) {
  if (!env.GOOGLE_SERVICE_ACCOUNT_KEY || !env.LEAGUE_SIGNUP_SHEET_ID) {
    return jsonResponse({ success: false, error: 'League signup is not configured on this environment' }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!Array.isArray(payload.row) || payload.row.length !== LEAGUE_SIGNUP_COLUMNS) {
    return jsonResponse(
      { success: false, error: `Expected ${LEAGUE_SIGNUP_COLUMNS} row values, got ${Array.isArray(payload.row) ? payload.row.length : typeof payload.row}` },
      400,
    );
  }

  try {
    const accessToken = await getGoogleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_KEY, 'https://www.googleapis.com/auth/spreadsheets');
    const tab = env.LEAGUE_SIGNUP_SHEET_TAB || 'Discord Submittals';
    const range = encodeURIComponent(`${tab}!A1`);
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.LEAGUE_SIGNUP_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const row = [new Date().toISOString(), ...payload.row];
    const sheetsResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });
    const sheetsData = await sheetsResponse.json();
    if (!sheetsResponse.ok) {
      console.error('Sheets append failed', sheetsData);
      return jsonResponse({ success: false, error: 'Failed to write signup to sheet' }, 502);
    }
    return jsonResponse({ success: true });
  } catch (err) {
    console.error('League signup error', err);
    return jsonResponse({ success: false, error: 'Internal error' }, 500);
  }
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

    if (url.pathname === LEAGUE_SIGNUP_PATH) {
      if (request.method !== 'POST') {
        return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
      }
      return handleLeagueSignup(request, env);
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
