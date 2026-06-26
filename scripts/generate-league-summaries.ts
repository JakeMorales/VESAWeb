/**
 * Generates _summary.json files for each division in the league archive.
 *
 * Each summary aggregates team standings across all weekly match files in the division,
 * producing season standings (regular weeks), Match Point finals standings, and the
 * Match Point champion with their roster.
 *
 * Output shape matches the DivisionSummary interface in src/app/services/league.service.ts.
 *
 * Run with: npm run generate-summaries
 *
 * After running, upload the generated _summary.json files to HuggingFace alongside
 * the existing weekly match files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEAGUE_DIR = path.join(__dirname, '..', 'server', 'divisions_batch');

// ── Interfaces ────────────────────────────────────────────────────────────────

interface StandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  points: number;
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

// Internal accumulator — not written to disk
interface TeamAccumulator {
  teamId: number;
  teamName: string;
  regularPoints: number;
  mpPoints: number;
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
  pointsKey: 'regularPoints' | 'mpPoints',
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

  for (const game of games) {
    for (const team of game.teams ?? []) {
      const teamId: number = team.teamId ?? team.overall_stats?.teamId;
      const teamName: string = team.name ?? team.overall_stats?.name ?? `Team ${teamId}`;
      const score: number = team.overall_stats?.score ?? 0;

      if (teamId == null) continue;

      // Collect player names from this game entry
      const players: string[] = (team.player_stats ?? [])
        .map((p: any) => p.name ?? p.playerName ?? p.player_name)
        .filter(Boolean);

      const acc = accMap.get(teamId);
      if (acc) {
        acc.teamName = teamName; // keep most recent name
        if (isMP) {
          acc.mpPoints += score;
          players.forEach(p => acc.mpPlayers.add(p));
        } else {
          acc.regularPoints += score;
        }
      } else {
        accMap.set(teamId, {
          teamId,
          teamName,
          regularPoints: isMP ? 0 : score,
          mpPoints: isMP ? score : 0,
          mpPlayers: isMP ? new Set(players) : new Set(),
        });
      }
    }
  }
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

  for (const filename of matchFiles) {
    console.log(`    Processing ${filename}...`);
    processWeekFile(path.join(divPath, filename), filename, accMap);
  }

  // Season standings: all teams ranked by regular-season points
  const seasonStandings = toRankedStandings(accMap, 'regularPoints', false);

  // MP standings: only teams that appeared in MP/playoff files (points > 0)
  const mpStandings = toRankedStandings(accMap, 'mpPoints', true);

  // Match Point champion: top MP team with their roster
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
