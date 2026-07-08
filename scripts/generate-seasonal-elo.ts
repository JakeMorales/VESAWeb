/**
 * Generates seasonal ELO ratings from the VESA-apex/apex-scrims HuggingFace
 * dataset and writes:
 *   - public/data/elo/<season>.json      one file per season with data
 *   - public/data/elo/ratings-current.json  every player ever seen, with
 *     their last rating decayed to a *current prior* (see decayedSeed) —
 *     use this to seed/sort players who haven't scrimmed in a while.
 *
 * Seasons are chained: each season seeds from the previous one with the
 * carryover decay, so a player's history follows them and long absences
 * shrink their rating toward the mean while restoring a high K.
 *
 * Run with: npm run generate-elo
 * Downloads are cached in scripts/.scrim-cache/ (gitignored).
 *
 * Prints a condensed report per season and a full calibration report for the
 * ongoing season. Use it to sanity-check config changes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  DEFAULT_ELO_CONFIG,
  GameObservation,
  SeasonSeed,
  SessionInput,
  decayedSeed,
  runSeason,
} from '../src/app/services/elo/elo-engine.js';
import { ELO_SEASONS, EloSeason } from '../src/app/services/elo/seasons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HF_TREE_URL = 'https://huggingface.co/api/datasets/VESA-apex/apex-scrims/tree/main?limit=1000';
const HF_RESOLVE_BASE = 'https://huggingface.co/datasets/VESA-apex/apex-scrims/resolve/main';
const CACHE_DIR = path.join(__dirname, '.scrim-cache');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'elo');
const DOWNLOAD_CONCURRENCY = 8;

interface HFTreeEntry {
  type: string;
  path: string;
}

/** A player's rating history across seasons. */
interface CareerEntry {
  playerId: string;
  name: string;
  elo: number;
  effectiveGames: number;
  lastSeasonIndex: number;
  lastPlayed: string;
  careerGames: number;
  seasonsPlayed: string[];
}

// ── HuggingFace file index ────────────────────────────────────────────────────

/**
 * Full scrim file list, deduplicated by session id.
 *
 * The dataset has two kinds of duplicates (same session id under two names):
 *  - the Dec 2025 scrim_ → scrims_ uploader rename, and
 *  - older same-scheme timezone double-uploads on adjacent dates.
 * A session counted twice would distort ratings, so unlike the website (which
 * only drops the rename duplicates) we keep exactly one file per session id —
 * the lexicographically last, i.e. the scrims_ copy / the later-dated upload.
 */
async function fetchScrimFileList(): Promise<string[]> {
  const res = await fetch(HF_TREE_URL);
  if (!res.ok) throw new Error(`HF tree API responded ${res.status}`);
  const entries = (await res.json()) as HFTreeEntry[];
  if (entries.length >= 1000) {
    console.warn('WARNING: HF tree hit the 1000-entry page limit; add cursor pagination.');
  }

  const bySessionId = new Map<string, string>();
  for (const e of entries) {
    if (e.type !== 'file' || !/^scrims?_/.test(e.path) || !e.path.endsWith('.json')) continue;
    const id = e.path.match(/_id_(\d+)/)?.[1] ?? e.path;
    const existing = bySessionId.get(id);
    if (!existing || e.path > existing) bySessionId.set(id, e.path);
  }
  return Array.from(bySessionId.values()).sort();
}

function fileDate(filename: string): string {
  const m = filename.match(/(\d{4})_(\d{2})_(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

function fileSessionId(filename: string): string {
  return filename.match(/_id_(\d+)/)?.[1] ?? filename;
}

async function downloadWithCache(filename: string): Promise<any> {
  const cachePath = path.join(CACHE_DIR, filename);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  const res = await fetch(`${HF_RESOLVE_BASE}/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`Failed to download ${filename}: ${res.status}`);
  const text = await res.text();
  JSON.parse(text); // validate before caching
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath, text, 'utf-8');
  return JSON.parse(text);
}

async function downloadAll(filenames: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  let index = 0;
  let done = 0;
  async function worker(): Promise<void> {
    while (index < filenames.length) {
      const f = filenames[index++];
      try {
        results.set(f, await downloadWithCache(f));
      } catch (e) {
        console.warn(`  Skipping ${f}: ${e}`);
      }
      done++;
      if (done % 100 === 0) console.log(`  fetched ${done}/${filenames.length}...`);
    }
  }
  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker));
  return results;
}

// ── Transform HF scrim JSON → engine input ────────────────────────────────────

function toSessionInput(filename: string, json: any): SessionInput | null {
  // Both shapes exist: { stats: { games: [] } } and { games: [] }
  const games: any[] = json?.stats?.games ?? json?.games;
  if (!Array.isArray(games)) {
    console.warn(`  Skipping ${filename}: unexpected shape (keys: ${Object.keys(json ?? {}).join(', ')})`);
    return null;
  }
  return {
    sessionId: fileSessionId(filename),
    date: fileDate(filename),
    games: games.map(game => ({
      players: (game.teams ?? []).flatMap((team: any) =>
        (team.player_stats ?? []).map((p: any) => ({
          playerId: String(p.playerId),
          name: p.name ?? '',
          placement: p.teamPlacement ?? team.overall_stats?.teamPlacement ?? 0,
          kills: p.kills ?? 0,
          assists: p.assists ?? 0,
          damage: p.damageDealt ?? 0,
          revives: p.revivesGiven ?? 0,
        }))
      ),
    })),
  };
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
}

function std(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map(v => (v - m) ** 2)));
}

function skewness(arr: number[]): number {
  const m = mean(arr);
  const s = std(arr) || 1;
  return mean(arr.map(v => ((v - m) / s) ** 3));
}

function excessKurtosis(arr: number[]): number {
  const m = mean(arr);
  const s = std(arr) || 1;
  return mean(arr.map(v => ((v - m) / s) ** 4)) - 3;
}

function pearson(xs: number[], ys: number[]): number {
  const mx = mean(xs);
  const my = mean(ys);
  const cov = mean(xs.map((x, i) => (x - mx) * (ys[i] - my)));
  const sx = std(xs);
  const sy = std(ys);
  return sx > 0 && sy > 0 ? cov / (sx * sy) : 0;
}

function histogram(values: number[], bucketSize: number): void {
  if (!values.length) return;
  const buckets = new Map<number, number>();
  for (const v of values) {
    const b = Math.floor(v / bucketSize) * bucketSize;
    buckets.set(b, (buckets.get(b) ?? 0) + 1);
  }
  const maxCount = Math.max(...buckets.values());
  const keys = Array.from(buckets.keys()).sort((a, b) => a - b);
  for (const k of keys) {
    const count = buckets.get(k)!;
    const bar = '█'.repeat(Math.max(1, Math.round((count / maxCount) * 50)));
    console.log(`  ${String(k).padStart(6)}–${String(k + bucketSize - 1).padEnd(6)} ${bar} ${count}`);
  }
}

function printCalibration(observations: GameObservation[], matureGames: number): void {
  const mature = observations.filter(o => o.gamesBefore >= matureGames);
  const buckets = new Map<number, { expected: number[]; actual: number[] }>();
  for (const o of mature) {
    const b = Math.min(9, Math.floor(o.expected * 10));
    if (!buckets.has(b)) buckets.set(b, { expected: [], actual: [] });
    buckets.get(b)!.expected.push(o.expected);
    buckets.get(b)!.actual.push(o.outcome);
  }
  console.log(`\n  Expectation calibration (players with ≥${matureGames} season games; ${mature.length} observations):`);
  console.log('  expected-bucket   n      mean expected   mean actual   gap');
  for (const b of Array.from(buckets.keys()).sort((a, c) => a - c)) {
    const { expected, actual } = buckets.get(b)!;
    const me = mean(expected);
    const ma = mean(actual);
    console.log(
      `  ${(b / 10).toFixed(1)}–${((b + 1) / 10).toFixed(1)}         ${String(expected.length).padStart(6)}   ${me.toFixed(3)}           ${ma.toFixed(3)}         ${(ma - me >= 0 ? '+' : '')}${(ma - me).toFixed(3)}`
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Fetching scrim file index from HuggingFace...');
  const allFiles = await fetchScrimFileList();
  console.log(`${allFiles.length} unique scrim sessions in dataset.`);

  const config = DEFAULT_ELO_CONFIG;
  const career = new Map<string, CareerEntry>();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let lastSeasonWithData = -1;
  let allTimeGames = 0;
  let allTimeSessions = 0;

  for (let i = 0; i < ELO_SEASONS.length; i++) {
    const season = ELO_SEASONS[i];
    const inWindow = allFiles.filter(f => {
      const d = fileDate(f);
      return d >= season.start && (season.end === null || d <= season.end);
    });

    console.log(`\n=== ${season.label} (${season.start} → ${season.end ?? 'ongoing'}) — ${inWindow.length} sessions ===`);
    if (!inWindow.length) continue;
    lastSeasonWithData = i;

    const jsons = await downloadAll(inWindow);
    const sessions: SessionInput[] = [];
    for (const filename of inWindow) {
      if (!jsons.has(filename)) continue;
      const session = toSessionInput(filename, jsons.get(filename));
      if (session) sessions.push(session);
    }

    // Seed this season from each player's career, decayed by seasons away
    const seeds = new Map<string, SeasonSeed>();
    for (const [pid, c] of career) {
      seeds.set(pid, decayedSeed(c.elo, c.effectiveGames, i - c.lastSeasonIndex, config));
    }

    const observations: GameObservation[] = [];
    const verbose = season.end === null;
    const result = runSeason(sessions, config, seeds, o => observations.push(o));
    allTimeGames += result.gamesProcessed;
    allTimeSessions += result.sessionsProcessed;

    // Update careers
    for (const p of result.players) {
      const prev = career.get(p.playerId);
      career.set(p.playerId, {
        playerId: p.playerId,
        name: p.name,
        elo: p.elo,
        effectiveGames: p.effectiveGames,
        lastSeasonIndex: i,
        lastPlayed: p.lastPlayed,
        careerGames: (prev?.careerGames ?? 0) + p.gamesPlayed,
        seasonsPlayed: [...(prev?.seasonsPlayed ?? []), season.key],
      });
    }

    const rated = result.players.filter(p => !p.provisional);
    const elos = rated.map(p => p.elo);

    console.log(`Processed ${result.gamesProcessed} games (${result.gamesSkipped} skipped) across ${result.sessionsProcessed} sessions.`);
    console.log(`${result.players.length} players; ${rated.length} rated. ` +
      `Rated elo: mean ${mean(elos).toFixed(1)}, std ${std(elos).toFixed(1)}, ` +
      `skew ${skewness(elos).toFixed(2)}, ex-kurtosis ${excessKurtosis(elos).toFixed(2)}, ` +
      `grind corr ${pearson(elos, rated.map(p => p.gamesPlayed)).toFixed(3)}`);
    console.log(`Top 3: ${rated.slice(0, 3).map(p => `${p.name} ${p.elo.toFixed(0)}`).join(', ')}`);

    if (verbose) {
      console.log('\n  Rated ELO distribution:');
      histogram(elos, 50);
      printCalibration(observations, config.provisionalGames);
      console.log('\n  Top 10 rated players:');
      rated.slice(0, 10).forEach((p, idx) => {
        console.log(`  ${String(idx + 1).padStart(2)}. ${p.name.padEnd(24)} ${p.elo.toFixed(0).padStart(5)}  (${p.gamesPlayed} games, seed ${p.seedElo.toFixed(0)}, peak ${p.peakElo.toFixed(0)})`);
      });
    }

    const output = {
      season: season.key,
      label: season.label,
      window: { start: season.start, end: season.end },
      generatedAt: new Date().toISOString(),
      config,
      gamesProcessed: result.gamesProcessed,
      sessionsProcessed: result.sessionsProcessed,
      players: result.players,
    };
    const outputPath = path.join(OUTPUT_DIR, `${season.key}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Written: ${outputPath}`);
  }

  // ── Current priors for every player ever seen ────────────────────────────
  const current = Array.from(career.values())
    .map(c => {
      const seasonsAway = lastSeasonWithData - c.lastSeasonIndex;
      const prior = seasonsAway === 0
        ? { elo: c.elo, effectiveGames: c.effectiveGames }
        : decayedSeed(c.elo, c.effectiveGames, seasonsAway, config);
      return {
        playerId: c.playerId,
        name: c.name,
        priorElo: Math.round(prior.elo * 100) / 100,
        priorEffectiveGames: Math.round(prior.effectiveGames * 100) / 100,
        lastElo: c.elo,
        lastPlayed: c.lastPlayed,
        lastSeason: ELO_SEASONS[c.lastSeasonIndex].key,
        seasonsAway,
        careerGames: c.careerGames,
        seasonsPlayed: c.seasonsPlayed,
      };
    })
    .sort((a, b) => b.priorElo - a.priorElo);

  const currentPath = path.join(OUTPUT_DIR, 'ratings-current.json');
  fs.writeFileSync(currentPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    asOfSeason: ELO_SEASONS[lastSeasonWithData]?.key ?? null,
    config: DEFAULT_ELO_CONFIG,
    note: 'priorElo = last rating decayed toward 1500 by ratingCarryover^seasonsAway; use for seeding/sorting inactive players.',
    totals: {
      players: current.length,
      games: allTimeGames,
      sessions: allTimeSessions,
    },
    players: current,
  }, null, 2), 'utf-8');
  console.log(`\nWritten: ${currentPath} (${current.length} players, all-time)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
