// Utility: Analyze correlation between ELO and games played, and top-N analysis
// ...existing code...
function analyzeEloEngagement(playerStats: Array<{ playerName: string, estimatedElo: number, totalGames: number }>, topN: number = 50) {
  if (!playerStats || playerStats.length === 0) {
    console.log('No player stats to analyze.');
    return;
  }
  // Filter out unrated players (e.g., < 5 games)
  const filtered = playerStats.filter(p => p.totalGames >= 5);
  const n = filtered.length;
  if (n === 0) {
    console.log('No rated players to analyze.');
    return;
  }
  // Pearson correlation coefficient
  const meanElo = filtered.reduce((sum, p) => sum + p.estimatedElo, 0) / n;
  const meanGames = filtered.reduce((sum, p) => sum + p.totalGames, 0) / n;
  const cov = filtered.reduce((sum, p) => sum + (p.estimatedElo - meanElo) * (p.totalGames - meanGames), 0) / n;
  const stdElo = Math.sqrt(filtered.reduce((sum, p) => sum + Math.pow(p.estimatedElo - meanElo, 2), 0) / n);
  const stdGames = Math.sqrt(filtered.reduce((sum, p) => sum + Math.pow(p.totalGames - meanGames, 2), 0) / n);
  const corr = stdElo > 0 && stdGames > 0 ? cov / (stdElo * stdGames) : 0;
  console.log(`ELO vs. Games Played correlation (Pearson r): ${corr.toFixed(3)}`);
  // Top-N analysis
  const sortedByElo = [...filtered].sort((a, b) => b.estimatedElo - a.estimatedElo);
  const topNPlayers = sortedByElo.slice(0, topN);
  const avgGamesTopN = topNPlayers.reduce((sum, p) => sum + p.totalGames, 0) / topNPlayers.length;
  console.log(`Top ${topN} ELO players average games played: ${avgGamesTopN.toFixed(1)}`);
  // Bottom-N analysis
  const bottomNPlayers = sortedByElo.slice(-topN);
  const avgGamesBottomN = bottomNPlayers.reduce((sum, p) => sum + p.totalGames, 0) / bottomNPlayers.length;
  console.log(`Bottom ${topN} ELO players average games played: ${avgGamesBottomN.toFixed(1)}`);
  // Median games played for top 10% vs. bottom 10%
  const decile = Math.floor(n / 10);
  const top10 = sortedByElo.slice(0, decile);
  const bottom10 = sortedByElo.slice(-decile);
  const median = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };
  console.log(`Median games played (top 10% ELO): ${median(top10.map(p => p.totalGames))}`);
  console.log(`Median games played (bottom 10% ELO): ${median(bottom10.map(p => p.totalGames))}`);
}
// Interface for performance factor stats
// CommonJS: Interface for performance factor stats
// (TypeScript interfaces are for type checking only)
// Remove export for CommonJS compatibility
interface PerformanceFactorStats {
  placement: StatSummary;
  combat: StatSummary;
  damage: StatSummary;
  support: StatSummary;
  performance: StatSummary;
}

interface StatSummary {
  mean: number;
  min: number;
  max: number;
  std: number;
}




// Node.js backend aggregation functions for ELO and player stats
const { EloCalculatorService } = require('./elo-calculator.service');
const { RatingService } = require('./rating.service');
const { PlayerAggregatedStats } = require('./scrims-data.service');
const { MatchDayResults } = require('../models/match-day-results.model');
// Removed duplicate import: ScrimFileService is only referenced for type definition below

// Helper: aggregate all players, no filter on games played

// Use local interfaces for types
// ScrimFileServiceType is used for type checking only
// If you need to use ScrimFileService, require it in the actual usage context
type ScrimFileServiceType = {
  getAllScrimBatchFiles: () => string[];
  loadAllScrimBatchFilesSync: (fileNames: string[]) => any[];
};

type MatchDayResults = { [gameNumber: string]: any[] };

interface PlayerAggregatedStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  totalKills: number;
  totalDamage: number;
  totalRevives: number;
  totalRespawns: number;
  totalPoints: number;
  averageKills: number;
  averageDamage: number;
  averagePlacement: number;
  winRate: number;
  topThreeRate: number;
  estimatedElo: number;
  finalElo: number;
}

interface PlayerStats {
  name: string;
  elo: number;
  games: Set<string>;
  gamesPlayed: number;
  stats: Array<any>;
}

interface Rating {
  playerId?: string;
  playerName: string;
  eloRating: number;
}

// Only one definition of getAllAggregatedPlayerElos
function getAllAggregatedPlayerElos(
  scrimFileService: ScrimFileServiceType,
  loadScrimTableFromJsonObject: (json: any) => MatchDayResults
): PlayerAggregatedStats[] {
  const fileNames = scrimFileService.getAllScrimBatchFiles();
  const sortedFileNames = [...fileNames].sort();
  const jsons = scrimFileService.loadAllScrimBatchFilesSync(sortedFileNames);
  const playerMap = new Map<string, PlayerStats>();
  const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
  let fileIdx = 0;
  for (const json of jsons) {
    if (!json) { fileIdx++; continue; }
    const matchDay = loadScrimTableFromJsonObject(json);
    if (!matchDay) { fileIdx++; continue; }
    Object.entries(matchDay).forEach(([gameNumber, teamGameResults]) => {
      if (!Array.isArray(teamGameResults)) return;
      const playerEloMap: { [id: string]: number } = {};
      teamGameResults.forEach((team: any) => {
        if (!team.players) return;
        team.players.forEach((ps: any) => {
          const rawName: string = ps.playerName || ps.name || '';
          const id: string = ps.player_id ? ps.player_id : rawName.trim().toLowerCase();
          if (!playerMap.has(id)) {
            playerMap.set(id, { name: rawName, elo: INITIAL_ELO, games: new Set<string>(), gamesPlayed: 0, stats: [] });
          }
          playerEloMap[id] = playerMap.get(id)!.elo;
        });
      });
      const { playerRatings }: { playerRatings: Rating[] } = RatingService.processMatchResults(teamGameResults, playerEloMap);
      playerRatings.forEach((rating: Rating) => {
        const id: string = rating.playerId ? rating.playerId : rating.playerName.trim().toLowerCase();
        const playerStats = playerMap.get(id)!;
        playerStats.elo = rating.eloRating;
        playerStats.games.add(`${fileIdx}_${gameNumber}`);
        playerStats.gamesPlayed++;
        const team = teamGameResults.find((t: any) => t.players.some((p: any) => {
          const pid: string = p.player_id ? p.player_id : (p.playerName || p.name || '').trim().toLowerCase();
          return pid === id;
        }));
        const ps = team ? team.players.find((p: any) => {
          const pid: string = p.player_id ? p.player_id : (p.playerName || p.name || '').trim().toLowerCase();
          return pid === id;
        }) : undefined;
        if (ps) {
          playerStats.stats.push({ ...ps, placement: team.placement });
        }
      });
    });
    fileIdx++;
  }
  // --- ELO Pool Rebalancing ---
  const playerCount = playerMap.size;
  const expectedTotalElo = playerCount * INITIAL_ELO;
  const actualTotalElo = Array.from(playerMap.values()).reduce((sum, p) => sum + p.elo, 0);
  const eloDiff = expectedTotalElo - actualTotalElo;
  if (Math.abs(eloDiff) > 1e-6 && playerCount > 0) {
    const correction = eloDiff / playerCount;
    playerMap.forEach((val) => {
      val.elo += correction;
    });
  }
  const result: PlayerAggregatedStats[] = [];
  playerMap.forEach((val: PlayerStats, id: string) => {
    // No filter on games played
    const totalKills = val.stats.reduce((sum: number, s: any) => sum + (s.kills || 0), 0);
    const totalDamage = val.stats.reduce((sum: number, s: any) => sum + (s.damage || s.damage_dealt || 0), 0);
    const totalRevives = val.stats.reduce((sum: number, s: any) => sum + (s.revives || s.revives_given || 0), 0);
    const totalRespawns = val.stats.reduce((sum: number, s: any) => sum + (s.respawns || s.respawns_given || 0), 0);
    const totalPoints = val.stats.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const averageKills = totalKills / (val.stats.length || 1);
    const averageDamage = totalDamage / (val.stats.length || 1);
    const averagePlacement = val.stats.reduce((sum: number, s: any) => sum + (s.placement || 0), 0) / (val.stats.length || 1);
    const winRate = (val.stats.filter((s: any) => (s.placement || 0) === 1).length / (val.stats.length || 1)) * 100;
    const topThreeRate = (val.stats.filter((s: any) => (s.placement || 0) <= 3).length / (val.stats.length || 1)) * 100;
    result.push({
      playerId: id,
      playerName: val.name,
      totalGames: val.games.size,
      totalKills,
      totalDamage,
      totalRevives,
      totalRespawns,
      totalPoints,
      averageKills,
      averageDamage,
      averagePlacement,
      winRate,
      topThreeRate,
      estimatedElo: val.elo,
      finalElo: val.elo
    });
  });
  return result.sort((a, b) => b.finalElo - a.finalElo);
}

module.exports = {
  getAllAggregatedPlayerElos,
  analyzeEloEngagement,
  // Add other aggregation/stat functions here as needed
};
