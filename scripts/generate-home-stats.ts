/**
 * Generates public/data/home/stats.json — precomputed, all-time platform
 * stats for the home page (league + scrims lifetime totals, the current
 * season's real division count, and a real "recent activity" feed) so the
 * home page never has to hit HuggingFace directly at runtime.
 *
 * League side walks every season/division in VESA-apex/apex-league (not
 * just the current one) and downloads every match-day file to count games,
 * unique players, and total playtime. Scrims side reuses
 * public/data/elo/ratings-current.json for player/game/session totals (no
 * need to re-derive what generate-seasonal-elo.ts already computed) and
 * only downloads scrim files itself to total playtime and find the most
 * recent sessions for the activity feed — reusing scripts/.scrim-cache/ so
 * files already fetched by `npm run generate-elo` aren't re-downloaded.
 *
 * Run with: npm run generate-home-stats
 * (run `npm run generate-elo` first so ratings-current.json is fresh)
 * Downloads are cached in scripts/.league-cache/ and scripts/.scrim-cache/
 * (both gitignored).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HF_LEAGUE_TREE_BASE = 'https://huggingface.co/api/datasets/VESA-apex/apex-league/tree/main';
const HF_LEAGUE_RESOLVE_BASE = 'https://huggingface.co/datasets/VESA-apex/apex-league/resolve/main';
const HF_SCRIMS_TREE_URL = 'https://huggingface.co/api/datasets/VESA-apex/apex-scrims/tree/main?limit=1000';
const HF_SCRIMS_RESOLVE_BASE = 'https://huggingface.co/datasets/VESA-apex/apex-scrims/resolve/main';

const LEAGUE_CACHE_DIR = path.join(__dirname, '.league-cache');
const SCRIM_CACHE_DIR = path.join(__dirname, '.scrim-cache');
const RATINGS_CURRENT_PATH = path.join(__dirname, '..', 'public', 'data', 'elo', 'ratings-current.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'home');
const DOWNLOAD_CONCURRENCY = 8;
const RECENT_ACTIVITY_LIMIT = 6;
const RECENT_SCRIM_SESSIONS = 4;

interface HFTreeEntry {
  type: string;
  path: string;
  size?: number;
}

// ── Generic HF fetch + disk cache helpers ──────────────────────────────────

async function fetchTree(url: string): Promise<HFTreeEntry[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HF tree API responded ${res.status} for ${url}`);
  return res.json() as Promise<HFTreeEntry[]>;
}

async function downloadWithCache(url: string, cacheDir: string, cacheKey: string): Promise<any> {
  const cachePath = path.join(cacheDir, cacheKey);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const text = await res.text();
  JSON.parse(text); // validate before caching
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, text, 'utf-8');
  return JSON.parse(text);
}

/** Downloads a batch of {url, cacheKey} jobs with bounded concurrency. */
async function downloadAllWithCache(
  jobs: { url: string; cacheKey: string }[],
  cacheDir: string,
  label: string
): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  let index = 0;
  let done = 0;
  async function worker(): Promise<void> {
    while (index < jobs.length) {
      const job = jobs[index++];
      try {
        results.set(job.cacheKey, await downloadWithCache(job.url, cacheDir, job.cacheKey));
      } catch (e) {
        console.warn(`  Skipping ${job.cacheKey}: ${e}`);
      }
      done++;
      if (done % 50 === 0) console.log(`  ${label}: fetched ${done}/${jobs.length}...`);
    }
  }
  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker));
  return results;
}

function isPlayoffsFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes('playoffs') || lower.includes('finals') || lower.includes('_mp');
}

/** Latest real `match_start` (unix seconds) across a file's games, as an ISO timestamp. */
function latestMatchStart(games: any[]): string | null {
  let latest = 0;
  for (const game of games ?? []) {
    if (typeof game.match_start === 'number' && game.match_start > latest) latest = game.match_start;
  }
  return latest > 0 ? new Date(latest * 1000).toISOString() : null;
}

function sumPlaytimeAndPlayers(games: any[], playerIds: Set<string>): number {
  let seconds = 0;
  for (const game of games ?? []) {
    for (const team of game.teams ?? []) {
      for (const p of team.player_stats ?? []) {
        seconds += p.survivalTime ?? 0;
        if (p.playerId != null) playerIds.add(String(p.playerId));
      }
    }
  }
  return seconds;
}

/** e.g. 41_312_000 -> "1y 3mo 24d" (player-seconds treated as a calendar span). */
function formatPlaytime(totalSeconds: number): string {
  const totalDays = totalSeconds / 86400;
  const years = Math.floor(totalDays / 365.25);
  const afterYears = totalDays - years * 365.25;
  const months = Math.floor(afterYears / 30.44);
  const days = Math.round(afterYears - months * 30.44);
  return `${years}y ${months}mo ${days}d`;
}

// ── League: walk every season/division ──────────────────────────────────────

interface ChampionActivity {
  season: string;
  division: string;
  teamName: string;
  players: string[];
  occurredAt: string;
}

async function processLeague() {
  console.log('Fetching league season list...');
  const top = await fetchTree(HF_LEAGUE_TREE_BASE);
  const seasons = top
    .filter(e => e.type === 'directory' && /^Season_\d+$/.test(e.path))
    .map(e => e.path)
    .sort((a, b) => parseInt(a.split('_')[1], 10) - parseInt(b.split('_')[1], 10));
  console.log(`${seasons.length} league seasons: ${seasons.join(', ')}`);

  const currentSeason = seasons[seasons.length - 1];
  let currentDivisionCount = 0;

  let matchesPlayed = 0;
  let gamesPlayed = 0;
  let survivalSeconds = 0;
  const playerIds = new Set<string>();
  const champions: ChampionActivity[] = [];

  for (const season of seasons) {
    const seasonEntries = await fetchTree(`${HF_LEAGUE_TREE_BASE}/${encodeURIComponent(season)}`);
    const divisions = seasonEntries
      .filter(e => e.type === 'directory' && /Division_\d+$/.test(e.path))
      .map(e => e.path.split('/').pop()!)
      .sort((a, b) => parseInt(a.replace('Division_', ''), 10) - parseInt(b.replace('Division_', ''), 10));

    if (season === currentSeason) currentDivisionCount = divisions.length;
    console.log(`\n${season} — ${divisions.length} division(s)`);

    for (const divDir of divisions) {
      const divPath = `${season}/${divDir}`;
      const divEntries = await fetchTree(`${HF_LEAGUE_TREE_BASE}/${encodeURIComponent(divPath)}`);
      const matchFiles = divEntries
        .filter(e => e.type === 'file' && e.path.endsWith('.json') && !e.path.includes('_summary'))
        .map(e => e.path.split('/').pop()!);

      const jobs = matchFiles.map(filename => ({
        url: `${HF_LEAGUE_RESOLVE_BASE}/${encodeURIComponent(divPath)}/${encodeURIComponent(filename)}`,
        cacheKey: `${season}_${divDir}_${filename}`,
      }));
      const files = await downloadAllWithCache(jobs, LEAGUE_CACHE_DIR, divPath);

      // The MP/Playoffs file's own game telemetry (match_start) is the real
      // time the champion was decided — far more accurate than the
      // _summary.json's generatedAt, which just reflects whenever that
      // summary file was last (re)computed and can cluster many divisions'
      // "champion crowned" moments onto the same regeneration run.
      let mpOccurredAt: string | null = null;

      for (const [cacheKey, json] of files) {
        const games = json?.stats?.games ?? json?.games;
        if (!Array.isArray(games)) continue;
        matchesPlayed++;
        gamesPlayed += games.length;
        survivalSeconds += sumPlaytimeAndPlayers(games, playerIds);
        if (isPlayoffsFile(cacheKey)) {
          mpOccurredAt = latestMatchStart(games) ?? mpOccurredAt;
        }
      }
      console.log(`  ${divDir}: ${files.size} match-day file(s) processed`);

      // Small precomputed summary — cheap fetch, gives us the real match point
      // champion (name/roster) without re-deriving standings ourselves.
      if (divEntries.some(e => e.path.endsWith('_summary.json'))) {
        try {
          const summary = await downloadWithCache(
            `${HF_LEAGUE_RESOLVE_BASE}/${encodeURIComponent(divPath)}/_summary.json`,
            LEAGUE_CACHE_DIR,
            `${season}_${divDir}_summary.json`
          );
          if (summary?.matchPointChampion) {
            champions.push({
              season,
              division: divDir.replace('Division_', ''),
              teamName: summary.matchPointChampion.teamName,
              players: summary.matchPointChampion.players ?? [],
              occurredAt: mpOccurredAt ?? summary.generatedAt ?? new Date(0).toISOString(),
            });
          }
        } catch (e) {
          console.warn(`  Skipping summary for ${divPath}: ${e}`);
        }
      }
    }
  }

  return { currentSeason, currentDivisionCount, matchesPlayed, gamesPlayed, playerIds, survivalSeconds, champions };
}

// ── Scrims: reuse ratings-current.json totals + local cache for playtime ────

function fileDate(filename: string): string {
  const m = filename.match(/(\d{4})_(\d{2})_(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

function fileSessionId(filename: string): string {
  return filename.match(/_id_(\d+)/)?.[1] ?? filename;
}

async function fetchScrimFileList(): Promise<string[]> {
  const res = await fetch(HF_SCRIMS_TREE_URL);
  if (!res.ok) throw new Error(`HF scrims tree API responded ${res.status}`);
  const entries = (await res.json()) as HFTreeEntry[];
  const bySessionId = new Map<string, string>();
  for (const e of entries) {
    if (e.type !== 'file' || !/^scrims?_/.test(e.path) || !e.path.endsWith('.json')) continue;
    const id = fileSessionId(e.path);
    const existing = bySessionId.get(id);
    if (!existing || e.path > existing) bySessionId.set(id, e.path);
  }
  return Array.from(bySessionId.values()).sort();
}

interface ScrimSessionActivity {
  file: string;
  occurredAt: string;
  eventId: string;
  gamesPlayed: number;
}

async function processScrims() {
  const ratingsCurrent = JSON.parse(fs.readFileSync(RATINGS_CURRENT_PATH, 'utf-8'));
  const matchesPlayed: number = ratingsCurrent.totals.sessions;
  const gamesPlayed: number = ratingsCurrent.totals.games;
  const playerIds = new Set<string>(ratingsCurrent.players.map((p: any) => String(p.playerId)));

  console.log('\nFetching scrim file index for playtime + recent activity...');
  const files = await fetchScrimFileList();
  console.log(`${files.length} unique scrim sessions.`);

  const jobs = files.map(filename => ({
    url: `${HF_SCRIMS_RESOLVE_BASE}/${encodeURIComponent(filename)}`,
    cacheKey: filename,
  }));
  const downloaded = await downloadAllWithCache(jobs, SCRIM_CACHE_DIR, 'scrims');

  let survivalSeconds = 0;
  const sessions: ScrimSessionActivity[] = [];
  for (const [filename, json] of downloaded) {
    const games = json?.stats?.games ?? json?.games;
    if (!Array.isArray(games)) continue;
    const dummyPlayerIds = new Set<string>(); // already counted via ratings-current.json
    survivalSeconds += sumPlaytimeAndPlayers(games, dummyPlayerIds);
    // Real game telemetry beats the filename's upload date, which is always
    // the day AFTER the evening session it was uploaded for.
    const occurredAt = latestMatchStart(games) ?? `${fileDate(filename)}T00:00:00Z`;
    sessions.push({
      file: filename,
      occurredAt,
      eventId: json?.eventId ?? json?.stats?.eventId ?? '',
      gamesPlayed: games.length,
    });
  }
  sessions.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.file.localeCompare(a.file));

  return {
    matchesPlayed,
    gamesPlayed,
    playerIds,
    survivalSeconds,
    recentSessions: sessions.slice(0, RECENT_SCRIM_SESSIONS),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const league = await processLeague();
  const scrims = await processScrims();

  const totalUniquePlayers = new Set([...league.playerIds, ...scrims.playerIds]).size;

  const activity = [
    ...league.champions.map(c => ({
      type: 'match_point_champion' as const,
      icon: 'trophy' as const,
      title: 'Match Point Champion Crowned',
      description: `${c.teamName} (${c.players.join(', ')}) won ${c.season.replace('_', ' ')} Division ${c.division}`,
      occurredAt: c.occurredAt,
    })),
    ...scrims.recentSessions.map(s => ({
      type: 'scrim_block' as const,
      icon: 'bolt' as const,
      title: 'Scrim Block Completed',
      description: `${s.gamesPlayed} game${s.gamesPlayed === 1 ? '' : 's'} played${s.eventId ? ` — ${s.eventId}` : ''}`,
      occurredAt: s.occurredAt,
    })),
  ]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, RECENT_ACTIVITY_LIMIT);

  const output = {
    generatedAt: new Date().toISOString(),
    league: {
      currentSeason: league.currentSeason,
      currentDivisionCount: league.currentDivisionCount,
      matchesPlayed: league.matchesPlayed,
      gamesPlayed: league.gamesPlayed,
      uniquePlayers: league.playerIds.size,
      totalPlaytime: formatPlaytime(league.survivalSeconds),
    },
    scrims: {
      matchesPlayed: scrims.matchesPlayed,
      gamesPlayed: scrims.gamesPlayed,
      uniquePlayers: scrims.playerIds.size,
      totalPlaytime: formatPlaytime(scrims.survivalSeconds),
    },
    totalUniquePlayers,
    recentActivity: activity,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, 'stats.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\nLeague: ${league.currentSeason}, ${league.currentDivisionCount} divisions, ` +
    `${league.matchesPlayed} match-days, ${league.gamesPlayed} games, ${league.playerIds.size} unique players.`);
  console.log(`Scrims: ${scrims.matchesPlayed} sessions, ${scrims.gamesPlayed} games, ${scrims.playerIds.size} unique players.`);
  console.log(`Combined unique players (deduped): ${totalUniquePlayers}`);
  console.log(`Recent activity: ${activity.length} item(s).`);
  console.log(`\nWritten: ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
