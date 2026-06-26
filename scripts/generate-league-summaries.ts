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
  teamId: number;
  teamName: string;
  leaguePoints: number;
  mpLeaguePoints: number;
  matchDaysPlayed: number;
  gameWins: number;
  totalKills: number;
  mpPlayers: Set<string>;
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
  accumulators: Map<number, TeamAccumulator>,
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

function processWeekFile(
  filePath: string,
  filename: string,
  accMap: Map<number, TeamAccumulator>
): void {
  let data: any;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    console.warn(`  Skipping unparseable file: ${filename}`);
    return;
  }

  const games: any[] = data?.stats?.games ?? [];
  if (!games.length) {
    console.warn(`  No games found in: ${filename}`);
    return;
  }

  const isMP = isPlayoffsFile(filename);

  // Step 1: aggregate in-game score, kills, and individual game wins per team
  const matchDayTotals = new Map<number, {
    teamId: number;
    teamName: string;
    inGameScore: number;
    kills: number;
    gameWins: number;
    players: Set<string>;
  }>();

  for (const game of games) {
    for (const team of game.teams ?? []) {
      const teamId: number = team.teamId ?? team.overall_stats?.teamId;
      const teamName: string = team.name ?? team.overall_stats?.name ?? `Team ${teamId}`;
      const score: number = team.overall_stats?.score ?? 0;
      const kills: number = team.overall_stats?.kills ?? 0;
      const gamePlacement: number = team.overall_stats?.teamPlacement ?? 0;

      if (teamId == null) continue;

      const players: string[] = (team.player_stats ?? [])
        .map((p: any) => p.name ?? p.playerName ?? p.player_name)
        .filter(Boolean);

      if (matchDayTotals.has(teamId)) {
        const t = matchDayTotals.get(teamId)!;
        t.teamName = teamName;
        t.inGameScore += score;
        t.kills += kills;
        if (gamePlacement === 1) t.gameWins++;
        players.forEach(p => t.players.add(p));
      } else {
        matchDayTotals.set(teamId, {
          teamId, teamName, inGameScore: score, kills,
          gameWins: gamePlacement === 1 ? 1 : 0,
          players: new Set(players),
        });
      }
    }
  }

  // Step 2: rank teams by in-game score to determine match-day placement
  const ranked = Array.from(matchDayTotals.values())
    .sort((a, b) => b.inGameScore - a.inGameScore);

  // Step 3: award VESA league points and update season accumulators
  ranked.forEach((team, index) => {
    const placement = index + 1;
    const leaguePoints = getLeaguePoints(placement);

    const acc = accMap.get(team.teamId);
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
      accMap.set(team.teamId, {
        teamId: team.teamId,
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

  const accMap = new Map<number, TeamAccumulator>();
  const weeklyRankSnapshots: Map<number, number>[] = [];

  for (const filename of matchFiles) {
    console.log(`    Processing ${filename}...`);
    processWeekFile(path.join(divPath, filename), filename, accMap);

    if (!isPlayoffsFile(filename)) {
      const snap = new Map<number, number>();
      toRankedStandings(accMap, 'leaguePoints', false).forEach(e => snap.set(e.teamId, e.rank));
      weeklyRankSnapshots.push(snap);
    }
  }

  const seasonStandings = toRankedStandings(accMap, 'leaguePoints', false);

  // Compute week-over-week trend from the last two snapshots
  const lastSnap = weeklyRankSnapshots.at(-1);
  const prevSnap = weeklyRankSnapshots.at(-2) ?? null;
  for (const entry of seasonStandings) {
    const last = lastSnap?.get(entry.teamId);
    const prev = prevSnap?.get(entry.teamId);
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
    const champId = mpStandings[0].teamId;
    const champAcc = accMap.get(champId)!;
    matchPointChampion = {
      teamId: champId,
      teamName: champAcc.teamName,
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
