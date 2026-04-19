/**
 * Generates _summary.json files for each division in the league archive.
 *
 * Each summary aggregates team standings across all weekly match files in the division,
 * computing total season points and per-week breakdowns.
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

interface TeamWeekResult {
  week: string;         // filename, e.g. "S4_D1_Week_1.json"
  label: string;        // display label, e.g. "Week 1"
  points: number;       // sum of overall_stats.score across all games in this file
  gamesPlayed: number;  // number of games this team appeared in this week
  isPlayoffs: boolean;
}

interface LeagueStanding {
  teamId: number;
  teamName: string;
  totalPoints: number;    // sum of points across all regular-season weeks
  playoffPoints: number;  // sum of points from playoff/finals weeks
  gamesPlayed: number;    // total games across all weeks
  weeks: TeamWeekResult[];
}

interface DivisionSummary {
  season: string;
  division: string;
  generatedAt: string;
  teams: LeagueStanding[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function labelFromFilename(filename: string): string {
  // e.g. S4_D1_Week_1.json → "Week 1"
  // e.g. S4_D1_Week_MP.json → "Midseason Playoffs"
  // e.g. S9_D1_Playoffs_1.json → "Playoffs 1"
  // e.g. S9_D1_Finals.json → "Finals"
  const base = filename.replace('.json', '');

  const weekMatch = base.match(/Week_(\d+)$/i);
  if (weekMatch) return `Week ${weekMatch[1]}`;

  if (/Week_MP/i.test(base)) return 'Midseason Playoffs';
  if (/Finals/i.test(base)) return 'Finals';

  const playoffsMatch = base.match(/Playoffs_(\d+)/i);
  if (playoffsMatch) return `Playoffs ${playoffsMatch[1]}`;
  if (/Playoffs/i.test(base)) return 'Playoffs';

  // Fallback: return last underscore-separated token
  const parts = base.split('_');
  return parts[parts.length - 1];
}

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

// ── Core aggregation ──────────────────────────────────────────────────────────

function processWeekFile(
  filePath: string,
  filename: string,
  standingsMap: Map<number, LeagueStanding>
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

  const playoffs = isPlayoffsFile(filename);
  const label = labelFromFilename(filename);

  // Aggregate per-team scores within this file (across all games)
  const weekTeamScores = new Map<number, { teamName: string; points: number; gamesPlayed: number }>();

  for (const game of games) {
    for (const team of game.teams ?? []) {
      const teamId: number = team.teamId ?? team.overall_stats?.teamId;
      const teamName: string = team.name ?? team.overall_stats?.name ?? `Team ${teamId}`;
      const score: number = team.overall_stats?.score ?? 0;

      if (teamId == null) continue;

      const existing = weekTeamScores.get(teamId);
      if (existing) {
        existing.points += score;
        existing.gamesPlayed += 1;
      } else {
        weekTeamScores.set(teamId, { teamName, points: score, gamesPlayed: 1 });
      }
    }
  }

  // Merge week results into the season standings map
  for (const [teamId, weekData] of weekTeamScores) {
    const weekResult: TeamWeekResult = {
      week: filename,
      label,
      points: weekData.points,
      gamesPlayed: weekData.gamesPlayed,
      isPlayoffs: playoffs
    };

    const standing = standingsMap.get(teamId);
    if (standing) {
      standing.weeks.push(weekResult);
      standing.gamesPlayed += weekData.gamesPlayed;
      if (playoffs) {
        standing.playoffPoints += weekData.points;
      } else {
        standing.totalPoints += weekData.points;
      }
      // Keep most recently seen team name (handles renames)
      standing.teamName = weekData.teamName;
    } else {
      standingsMap.set(teamId, {
        teamId,
        teamName: weekData.teamName,
        totalPoints: playoffs ? 0 : weekData.points,
        playoffPoints: playoffs ? weekData.points : 0,
        gamesPlayed: weekData.gamesPlayed,
        weeks: [weekResult]
      });
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

  const standingsMap = new Map<number, LeagueStanding>();

  for (const filename of matchFiles) {
    console.log(`    Processing ${filename}...`);
    processWeekFile(path.join(divPath, filename), filename, standingsMap);
  }

  // Sort teams by total points (regular season) descending, then playoff points
  const teams = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.playoffPoints - a.playoffPoints;
  });

  const summary: DivisionSummary = {
    season,
    division,
    generatedAt: new Date().toISOString(),
    teams
  };

  const outputPath = path.join(divPath, '_summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`  ✓ Written: ${outputPath}`);
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
