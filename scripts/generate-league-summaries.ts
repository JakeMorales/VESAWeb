/**
 * Generates _summary.json files for each division in the league archive.
 *
 * Points are awarded based on each team's match-day finishing position:
 * 1st: 25 | 2nd: 21 | 3rd: 18 | 4th: 16 | 5th: 15 | 6th-8th: 14-12 |
 * 9th-20th: 11 down to 0
 *
 * Run with: npm run generate-summaries
 * Then upload the generated _summary.json files to HuggingFace.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEAGUE_DIR = path.join(__dirname, '..', 'server', 'divisions_batch');

const LEAGUE_PLACEMENT_POINTS: Record<number, number> = {
  1: 25, 2: 21, 3: 18, 4: 16, 5: 15, 6: 14, 7: 13, 8: 12,
  9: 11, 10: 10, 11: 9, 12: 8, 13: 7, 14: 6, 15: 5,
  16: 4, 17: 3, 18: 2, 19: 1, 20: 0,
};

function getLeaguePoints(placement: number): number {
  return LEAGUE_PLACEMENT_POINTS[placement] ?? 0;
}

// ── Interfaces ────────────────────────────────────────────────────────────────

interface StandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  points: number;
  wins: number;
  matchDaysPlayed: number;
  kills: number;
  trend: 'up' | 'down' | 'same';
  trendDelta: number;
}

interface MatchPointChampion {
  teamId: number;
  teamName: string;
  players: string[];
}

interface DivisionSummary {
  season: string;
  division: string;
  generatedAt: string;
  seasonStandings: StandingEntry[];
  matchPointFinalsStandings: StandingEntry[];
  matchPointChampion: MatchPointChampion | null;
}

interface TeamAccumulator {
  teamId: number;       // synthetic sequential id — stable within one summary run
  teamName: string;
  leaguePoints: number;
  mpLeaguePoints: number;
  matchDaysPlayed: number;
  gameWins: number;
  totalKills: number;
  mpPlayers: Set<string>;
}

// Overstat teamIds are match-scoped and not stable across weeks.
// We key accumulators by normalized team name instead.
function normalizeTeamName(name: string): string {
  return name.replace(/(?:\s*[@#]\S+)+$/g, '').trim().toLowerCase();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPlayoffsFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes('playoffs') || lower.includes('finals') || lower.includes('_mp');
}

function sortMatchFiles(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const weekA = parseInt(a.match(/Week_(\d+)/i)?.[1] ?? '0');
    const weekB = parseInt(b.match(/Week_(\d+)/i)?.[1] ?? '0');
    if (weekA !== weekB) return weekA - weekB;
    const aSpecial = isPlayoffsFile(a);
    const bSpecial = isPlayoffsFile(b);
    if (aSpecial && !bSpecial) return 1;
    if (!aSpecial && bSpecial) return -1;
    return a.localeCompare(b);
  });
}

function toRankedStandings(
  accumulators: Map<string, TeamAccumulator>,
  pointsKey: 'leaguePoints' | 'mpLeaguePoints',
  onlyWithPoints: boolean
): StandingEntry[] {
  let entries = Array.from(accumulators.values());
  if (onlyWithPoints) {
    entries = entries.filter(e => e[pointsKey] > 0);
  }
  return entries
    .sort((a, b) => b[pointsKey] - a[pointsKey])
    .map((e, i) => ({
      rank: i + 1,
      teamId: e.teamId,
      teamName: e.teamName,
      points: e[pointsKey],
      wins: pointsKey === 'leaguePoints' ? e.gameWins : 0,
      matchDaysPlayed: e.matchDaysPlayed,
      kills: e.totalKills,
      trend: 'same' as const,
      trendDelta: 0,
    }));
}

// ── Core aggregation ──────────────────────────────────────────────────────────

let nextSyntheticId = 1;

function resetSyntheticIds(): void { nextSyntheticId = 1; }

// Returns the set of normalized team-name keys that appeared in this file.
function processWeekFile(
  filePath: string,
  filename: string,
  accMap: Map<string, TeamAccumulator>
): Set<string> {
  let data: any;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    console.warn(`  Skipping unparseable file: ${filename}`);
    return new Set();
  }

  const games: any[] = data?.stats?.games ?? [];
  if (!games.length) {
    console.warn(`  No games found in: ${filename}`);
    return new Set();
  }

  const isMP = isPlayoffsFile(filename);

  // Step 1: aggregate in-game score, kills, and individual game wins per team.
  // Key by normalized name — Overstat teamIds are match-scoped and not stable across weeks.
  const matchDayTotals = new Map<string, {
    teamName: string;
    inGameScore: number;
    kills: number;
    gameWins: number;
    players: Set<string>;
  }>();

  for (const game of games) {
    for (const team of game.teams ?? []) {
      const teamName: string = team.name ?? team.overall_stats?.name ?? '';
      if (!teamName) continue;

      const key = normalizeTeamName(teamName);
      const score: number = team.overall_stats?.score ?? 0;
      const kills: number = team.overall_stats?.kills ?? 0;
      const gamePlacement: number = team.overall_stats?.teamPlacement ?? 0;

      const players: string[] = (team.player_stats ?? [])
        .map((p: any) => p.name ?? p.playerName ?? p.player_name)
        .filter(Boolean);

      if (matchDayTotals.has(key)) {
        const t = matchDayTotals.get(key)!;
        t.teamName = teamName;
        t.inGameScore += score;
        t.kills += kills;
        if (gamePlacement === 1) t.gameWins++;
        players.forEach(p => t.players.add(p));
      } else {
        matchDayTotals.set(key, {
          teamName, inGameScore: score, kills,
          gameWins: gamePlacement === 1 ? 1 : 0,
          players: new Set(players),
        });
      }
    }
  }

  // Step 2: rank teams by in-game score to determine match-day placement
  const ranked = Array.from(matchDayTotals.entries())
    .sort((a, b) => b[1].inGameScore - a[1].inGameScore);

  // Step 3: award VESA league points and update season accumulators
  ranked.forEach(([key, team], index) => {
    const placement = index + 1;
    const leaguePoints = getLeaguePoints(placement);

    const acc = accMap.get(key);
    if (acc) {
      acc.teamName = team.teamName;
      acc.totalKills += team.kills;
      if (isMP) {
        acc.mpLeaguePoints += leaguePoints;
        team.players.forEach(p => acc.mpPlayers.add(p));
      } else {
        acc.leaguePoints += leaguePoints;
        acc.matchDaysPlayed++;
        acc.gameWins += team.gameWins;
      }
    } else {
      accMap.set(key, {
        teamId: nextSyntheticId++,
        teamName: team.teamName,
        leaguePoints: isMP ? 0 : leaguePoints,
        mpLeaguePoints: isMP ? leaguePoints : 0,
        matchDaysPlayed: isMP ? 0 : 1,
        gameWins: isMP ? 0 : team.gameWins,
        totalKills: team.kills,
        mpPlayers: isMP ? new Set(team.players) : new Set(),
      });
    }
  });

  return new Set(matchDayTotals.keys());
}

function generateDivisionSummary(
  seasonDir: string,
  season: string,
  divisionDir: string,
  division: string
): void {
  const divPath = path.join(seasonDir, divisionDir);
  const allFiles = fs.readdirSync(divPath).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  const matchFiles = sortMatchFiles(allFiles);

  if (!matchFiles.length) {
    console.log(`  No match files found, skipping.`);
    return;
  }

  resetSyntheticIds();
  const accMap = new Map<string, TeamAccumulator>();
  const weeklyRankSnapshots: Map<string, number>[] = [];
  let activeTeamKeys = new Set<string>(); // teams from the most recent regular week

  for (const filename of matchFiles) {
    console.log(`    Processing ${filename}...`);
    const seenKeys = processWeekFile(path.join(divPath, filename), filename, accMap);

    if (!isPlayoffsFile(filename)) {
      if (seenKeys.size > 0) activeTeamKeys = seenKeys;
      const snap = new Map<string, number>();
      toRankedStandings(accMap, 'leaguePoints', false).forEach(e => snap.set(normalizeTeamName(e.teamName), e.rank));
      weeklyRankSnapshots.push(snap);
    }
  }

  // Only include teams that were active in the most recent regular week (max 20).
  // Teams that dropped, transferred, or were only present in earlier weeks are excluded.
  const allStandings = toRankedStandings(accMap, 'leaguePoints', false);
  const seasonStandings = allStandings
    .filter(e => activeTeamKeys.size === 0 || activeTeamKeys.has(normalizeTeamName(e.teamName)))
    .slice(0, 20)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  // Compute week-over-week trend from the last two snapshots
  const lastSnap = weeklyRankSnapshots[weeklyRankSnapshots.length - 1];
  const prevSnap = weeklyRankSnapshots[weeklyRankSnapshots.length - 2] ?? null;
  for (const entry of seasonStandings) {
    const key = normalizeTeamName(entry.teamName);
    const last = lastSnap?.get(key);
    const prev = prevSnap?.get(key);
    if (prev == null || last == null || prev === last) {
      entry.trend = 'same';
      entry.trendDelta = 0;
    } else {
      const delta = prev - last; // positive = rank number went down = moved up the table
      entry.trend = delta > 0 ? 'up' : 'down';
      entry.trendDelta = Math.abs(delta);
    }
  }

  const mpStandings = toRankedStandings(accMap, 'mpLeaguePoints', true);

  let matchPointChampion: MatchPointChampion | null = null;
  if (mpStandings.length > 0) {
    const champ = mpStandings[0];
    const champAcc = accMap.get(normalizeTeamName(champ.teamName))!;
    matchPointChampion = {
      teamId: champ.teamId,
      teamName: champ.teamName,
      players: Array.from(champAcc.mpPlayers).sort(),
    };
  }

  const summary: DivisionSummary = {
    season,
    division,
    generatedAt: new Date().toISOString(),
    seasonStandings,
    matchPointFinalsStandings: mpStandings,
    matchPointChampion,
  };

  const outputPath = path.join(divPath, '_summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`  Written: ${outputPath}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  if (!fs.existsSync(LEAGUE_DIR)) {
    console.error(`League directory not found: ${LEAGUE_DIR}`);
    process.exit(1);
  }

  const seasons = fs.readdirSync(LEAGUE_DIR)
    .filter(d => d.startsWith('Season_') && fs.statSync(path.join(LEAGUE_DIR, d)).isDirectory())
    .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));

  console.log(`Found ${seasons.length} seasons.`);

  for (const season of seasons) {
    const seasonPath = path.join(LEAGUE_DIR, season);
    const divisions = fs.readdirSync(seasonPath)
      .filter(d => d.startsWith('Division_') && fs.statSync(path.join(seasonPath, d)).isDirectory())
      .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));

    console.log(`\n${season} — ${divisions.length} division(s)`);

    for (const div of divisions) {
      const divNum = div.replace('Division_', '');
      console.log(`  Division ${divNum}:`);
      generateDivisionSummary(seasonPath, season, div, divNum);
    }
  }

  console.log('\nDone. Upload the generated _summary.json files to HuggingFace.');
}

main();
