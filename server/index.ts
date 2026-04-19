import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { EloAggregationService } from './elo-aggregation.service.js';
import { ScrimFileService } from './scrim-file.service.js';
import { LeagueMatchesService } from './league-matches.service.js';
import type { PlayerAggregatedStats, PerformanceMetrics } from './elo-aggregation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIM_DIR = path.join(process.cwd(), 'server', 'scrims_batch');
const PORT = process.env['PORT'] || 3001;

const app = express();
app.use(cors());
app.use(express.json());
// --- Precompute leaderboard and stats at startup ---
let cachedLeaderboard: PlayerAggregatedStats[] = [];
let cachedStats: any = {};
let cachedRatedStats: any = {};
let cachedTotal: number = 0;

function precomputeLeaderboardAndStats() {
  const fileNames = ScrimFileService.getAllScrimBatchFiles();
  const loadAllScrimBatchFilesSync = (fileNames: string[]) => fileNames.map(name => {
    const filePath = path.join(SCRIM_DIR, name);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return data;
    } catch (err) {
      return null;
    }
  }).filter(Boolean);
  const scrimObjects = loadAllScrimBatchFilesSync(fileNames);
  const scrimFileService = {
    getAllScrimBatchFiles: () => fileNames,
    loadAllScrimBatchFilesSync: () => scrimObjects,
  };
  const transformScrimJson = (json: any) => {
    if (!json || !json.stats || !Array.isArray(json.stats.games)) return {};
    const result: { [gameNumber: string]: any[] } = {};
    for (const game of json.stats.games) {
      if (!Array.isArray(game.teams)) continue;
      const teams = game.teams.map((team: any) => {
        const players = Array.isArray(team.player_stats)
          ? team.player_stats.map((ps: any) => ({
              ...ps,
              playerId: ps.playerId ?? ps.id ?? ps.name, // Prefer numeric ID, fallback to id, then name
              playerName: ps.name,
              placement: team.overall_stats?.teamPlacement,
              opponents: team.opponents || [],
              eloChange: ps.eloChange || 0,
              // Ensure per-game damageDealt is always present and numeric
              damageDealt: typeof ps.damageDealt === 'number' ? ps.damageDealt : 0
            }))
          : [];
        return {
          ...team,
          players,
          placement: team.overall_stats?.teamPlacement
        };
      });
      result[String(game.game)] = teams;
    }
    return result;
  };
  const leaderboard: PlayerAggregatedStats[] = EloAggregationService.aggregatePlayerElos(scrimFileService, transformScrimJson);
  function getStats(arr: any[], key: string) {
    const values = arr.map((x: any) => x[key]).filter((v: any): v is number => typeof v === 'number');
    if (!values.length) return {};
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    const avg = sum / values.length;
    const sorted = [...values].sort((a: number, b: number) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const std = Math.sqrt(values.reduce((a: number, b: number) => a + Math.pow(b - avg, 2), 0) / values.length);
    return { min, max, avg, median, std, count: values.length };
  }
  // Create empty stats object with the correct shape
  const emptyStats = {
    min: 0,
    max: 0,
    avg: 0,
    median: 0,
    std: 0,
    count: 0
  };

  // Get the performance metrics from the first player (where we stored them)
  const perfMetrics = leaderboard[0]?.performanceMetrics as PerformanceMetrics | undefined;

  const stats = {
    elo: getStats(leaderboard, 'finalElo'),
    gamesPlayed: getStats(leaderboard, 'totalGames'),
    kills: getStats(leaderboard, 'totalKills'),
    totalDamage: getStats(leaderboard, 'totalDamage'),
    winRate: getStats(leaderboard, 'winRate'),
    topThreeRate: getStats(leaderboard, 'topThreeRate'),
    averagePlacement: getStats(leaderboard, 'averagePlacement'),
    averageKills: getStats(leaderboard, 'averageKills'),
    averageDamage: getStats(leaderboard, 'averageDamage'),
    performanceScore: perfMetrics?.performanceScore || emptyStats
  };
  // Calculate advanced stats for ALL games played (not just paginated) using raw scrimObjects
  let totalGames = 0, totalRatedPlayers = 0, totalUnratedPlayers = 0;
  // Calculate netEloChange as the difference between actual and expected total ELO
  const INITIAL_ELO = 1500;
  const actualTotalElo = leaderboard.reduce((sum, player) => sum + (typeof player.finalElo === 'number' ? player.finalElo : 0), 0);
  const expectedTotalElo = leaderboard.length * INITIAL_ELO;
  let netEloChange = actualTotalElo - expectedTotalElo;
  const playerGameCounts: Record<string, number> = {};
  // First, count games played per playerId
  let sampleLogged = 0;
  scrimObjects.forEach((scrim: any) => {
    if (!scrim || !scrim.stats || !Array.isArray(scrim.stats.games)) return;
    scrim.stats.games.forEach((game: any) => {
      totalGames++;
      if (!Array.isArray(game.teams)) return;
      game.teams.forEach((team: any) => {
        if (Array.isArray(team.player_stats)) {
          team.player_stats.forEach((ps: any) => {
            if (ps.playerId) {
              playerGameCounts[ps.playerId] = (playerGameCounts[ps.playerId] || 0) + 1;
            }
          });
        }
      });
    });
  });
  // Now, count rated/unrated players
  Object.entries(playerGameCounts).forEach(([playerId, gamesPlayed]) => {
    if (gamesPlayed >= 18) totalRatedPlayers++;
    else totalUnratedPlayers++;
  });
  const percentRated = (totalRatedPlayers + totalUnratedPlayers) > 0 ? (totalRatedPlayers / (totalRatedPlayers + totalUnratedPlayers)) * 100 : 0;
  const percentUnrated = (totalRatedPlayers + totalUnratedPlayers) > 0 ? (totalUnratedPlayers / (totalRatedPlayers + totalUnratedPlayers)) * 100 : 0;
  const netEloPerGame = totalGames ? netEloChange / totalGames : 0;
  // ...existing code...
  cachedLeaderboard = leaderboard;
  cachedStats = stats;
  cachedRatedStats = {
    percentRated: Number(percentRated.toFixed(2)),
    percentUnrated: Number(percentUnrated.toFixed(2)),
    netEloPerGame: Number(netEloPerGame.toFixed(2)),
  };
  cachedTotal = leaderboard.length;
  // ...existing code...
}

// Precompute on startup
precomputeLeaderboardAndStats();

app.use(cors());
// All imports now use ES module syntax

// GET /leaderboard returns aggregated ELO leaderboard
app.get('/leaderboard', async (req: any, res: any) => {
// GET /player/:playerId returns aggregated stats for a single player
app.get('/player/:playerId', (req: any, res: any) => {
  const playerId = req.params.playerId;
  if (!playerId) {
    res.status(400).json({ error: 'Missing playerId' });
    return;
  }
  // Find player in cachedLeaderboard (match as string or number)
  const player = cachedLeaderboard.find(p => String(p.playerId) === String(playerId));
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }
  res.json(player);
});
  // Pagination: offset and limit from query params
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 25;
  
  // Filter out players with less than 18 games and apply name search if provided
  let filteredLeaderboard = cachedLeaderboard.filter(player => 
    player.totalGames >= 18 // Only show players with 18+ games
  );

  const playerNameQuery = typeof req.query.playerName === 'string' ? req.query.playerName.trim().toLowerCase() : '';
  if (playerNameQuery) {
    filteredLeaderboard = filteredLeaderboard.filter(player =>
      typeof player.playerName === 'string' && player.playerName.toLowerCase().includes(playerNameQuery)
    );
  }

  // Sort by final ELO in descending order
  filteredLeaderboard.sort((a, b) => b.finalElo - a.finalElo);
  
  const paginated = filteredLeaderboard.slice(offset, offset + limit);
  try {
    res.json({
      total: filteredLeaderboard.length,
      offset,
      limit,
      data: paginated,
      stats: cachedStats,
      ratedStats: cachedRatedStats
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// GET /scrims returns a list of available scrim batch files
app.get('/scrims', (req: any, res: any) => {
  try {
    // Use static method directly
    const files = ScrimFileService.getAllScrimBatchFiles();
    res.json(files);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// GET /scrims/:filename returns the contents of a specific scrim batch file
app.get('/scrims/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(SCRIM_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    res.type('application/json').send(fileContents);
    return;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
    return;
  }
});

// League match endpoints
app.get('/league/seasons', (req: any, res: any) => {
  try {
    const seasons = LeagueMatchesService.getSeasons();
    res.json(seasons);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/league/seasons/:season/divisions', (req: any, res: any) => {
  try {
    const { season } = req.params;
    const divisions = LeagueMatchesService.getDivisions(season);
    res.json(divisions);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/league/seasons/:season/divisions/:division/matches', (req: any, res: any) => {
  try {
    const { season, division } = req.params;
    const matches = LeagueMatchesService.getDivisionMatches(season, division);
    res.json(matches);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/league/seasons/:season/divisions/:division/matches/:filename', (req: any, res: any) => {
  try {
    const { season, division, filename } = req.params;
    const matchDay = LeagueMatchesService.getMatchDay(season, division, filename);
    if (!matchDay) {
      res.status(404).json({ error: 'Match day not found' });
      return;
    }
    res.json(matchDay);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

app.listen(PORT, () => {
  // ...existing code...
});
