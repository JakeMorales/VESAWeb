import { EloCalculatorService } from './elo-calculator.service.js';

// Types and Interfaces
type ScrimFileServiceType = {
  getAllScrimBatchFiles: () => string[];
  loadAllScrimBatchFilesSync: (fileNames: string[]) => any[];
};

type MatchDayResults = { [gameNumber: string]: any[] };

interface StatSummary {
  mean: number;
  min: number;
  max: number;
  std: number;
}

interface PerformanceFactorStats {
  placement: StatSummary;
  combat: StatSummary;
  damage: StatSummary;
  support: StatSummary;
  performance: StatSummary;
}

interface MetricStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  std: number;
  count: number;
}

export interface PerformanceMetrics {
  elo: MetricStats;
  gamesPlayed: MetricStats;
  totalKills: MetricStats;
  winRate: MetricStats;
  topThreeRate: MetricStats;
  averagePlacement: MetricStats;
  averageKills: MetricStats;
  averageDamage: MetricStats;
  performanceScore: MetricStats;
}

export interface PlayerAggregatedStats {
  stats: Array<any>;
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
  performanceMetrics?: PerformanceMetrics; // New field for performance metrics
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

interface PlayerData {
  playerId: string;
  id: string;
  name: string;
}

interface GameStats {
  player_stats: Array<{
    playerId: string;
    teamPlacement?: number;
    placement?: number;
    kills?: number;
    assists?: number;
    damageDealt?: number;
    revivesGiven?: number;
    revives?: number;
  }>;
}

// Helper functions for stats
function mean(arr: number[]): number { 
  return arr.reduce((a, b) => a + b, 0) / (arr.length || 1); 
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function std(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (arr.length || 1));
}

/**
 * Utility to print full Elo calculation breakdown for selected players and games.
 * @param selectedPlayers Array of player objects with name and ID
 * @param selectedGames Array of game objects with player stats
 */
export function printEloCalculationBreakdown(selectedPlayers: PlayerData[], selectedGames: GameStats[]) {
  selectedPlayers.forEach(player => {
    console.log(`\nPlayer: ${player.name} (ID: ${player.playerId || player.id})`);
    let gamesPlayed = 0;
    selectedGames.forEach((game, idx) => {
      const stats = game.player_stats.find(p => p.playerId === player.playerId || p.playerId === player.id);
      if (!stats) return;
      gamesPlayed++;
      const placement = stats.teamPlacement ?? stats.placement ?? 0;
      const kills = stats.kills ?? 0;
      const assists = stats.assists ?? 0;
      const damage = stats.damageDealt ?? 0;
      const revives = stats.revivesGiven ?? stats.revives ?? 0;
      const opponentElo = EloCalculatorService.INITIAL_ELO;
      const playerElo = EloCalculatorService.INITIAL_ELO;
      const placementFactor = EloCalculatorService.calculateTieredPlacementScore(placement);
      const combatScore = kills + assists;
      const combatFactor = Math.min(1, combatScore / 6);
      const damageFactor = Math.min(1, damage / 1200);
      const supportFactor = Math.min(1, revives / 3);
      const perfScore = EloCalculatorService.calculatePerformanceScore(placement, kills, assists, damage, revives);
      const eloChange = EloCalculatorService.prototype.calculateEloChangeWithOpponent.call(
        EloCalculatorService,
        playerElo,
        opponentElo,
        perfScore,
        gamesPlayed
      );
      console.log(`  Game ${idx + 1}:`);
      console.log(`    Placement: ${placement} (Factor: ${placementFactor.toFixed(3)})`);
      console.log(`    Combat: Kills=${kills}, Assists=${assists}, Score=${combatScore} (Factor: ${combatFactor.toFixed(3)})`);
      console.log(`    Damage: ${damage} (Factor: ${damageFactor.toFixed(3)})`);
      console.log(`    Support: Revives=${revives} (Factor: ${supportFactor.toFixed(3)})`);
      console.log(`    Performance Score: ${perfScore.toFixed(4)}`);
      console.log(`    Elo Change: ${eloChange.toFixed(2)} (Player Elo: ${playerElo}, Opponent Elo: ${opponentElo}, Games Played: ${gamesPlayed})`);
    });
    if (gamesPlayed === 0) {
      console.log('  No games played in selected slice.');
    }
  });
}
export class EloAggregationService {
  // Utility: Analyze correlation between ELO and games played, and top-N analysis
  static analyzeEloEngagement(playerStats: Array<{ playerName: string, estimatedElo: number, totalGames: number }>, topN: number = 50) {
  if (!playerStats || playerStats.length === 0) {
  // ...existing code...
  // ...existing code...
    return;
  }
  // Filter out unrated players (e.g., < 5 games)
  const filtered = playerStats.filter(p => p.totalGames >= 5);
  const n = filtered.length;
  if (n === 0) {
  // ...existing code...
    return;
  }
  // Pearson correlation coefficient
  const meanElo = filtered.reduce((sum, p) => sum + p.estimatedElo, 0) / n;
  const meanGames = filtered.reduce((sum, p) => sum + p.totalGames, 0) / n;
  const cov = filtered.reduce((sum, p) => sum + (p.estimatedElo - meanElo) * (p.totalGames - meanGames), 0) / n;
  const stdElo = Math.sqrt(filtered.reduce((sum, p) => sum + Math.pow(p.estimatedElo - meanElo, 2), 0) / n);
  const stdGames = Math.sqrt(filtered.reduce((sum, p) => sum + Math.pow(p.totalGames - meanGames, 2), 0) / n);
  const corr = stdElo > 0 && stdGames > 0 ? cov / (stdElo * stdGames) : 0;
  // ...existing code...
  // Top-N analysis
  const sortedByElo = [...filtered].sort((a, b) => b.estimatedElo - a.estimatedElo);
  const topNPlayers = sortedByElo.slice(0, topN);
  const avgGamesTopN = topNPlayers.reduce((sum, p) => sum + p.totalGames, 0) / topNPlayers.length;
  // ...existing code...
  // Bottom-N analysis
  const bottomNPlayers = sortedByElo.slice(-topN);
  const avgGamesBottomN = bottomNPlayers.reduce((sum, p) => sum + p.totalGames, 0) / bottomNPlayers.length;
  // ...existing code...
  // Median games played for top 10% vs. bottom 10%
  const decile = Math.floor(n / 10);
  const top10 = sortedByElo.slice(0, decile);
  const bottom10 = sortedByElo.slice(-decile);
  // Use the global median function
  // ...existing code...
  // ...existing code...
}
static aggregatePlayerElos(
      scrimFileService: ScrimFileServiceType,
      loadScrimTableFromJsonObject: (json: any) => MatchDayResults
    ): PlayerAggregatedStats[] {
      const allPerformanceScores: number[] = [];
      const result: PlayerAggregatedStats[] = [];
      const fileNames = scrimFileService.getAllScrimBatchFiles();
      const sortedFileNames = [...fileNames].sort();
      const jsons = scrimFileService.loadAllScrimBatchFilesSync(sortedFileNames);
      // Print Elo calculation breakdown for all games in the first batch file for 3 selected players
      let batchTeams: Array<{ player_stats: any[] }> = [];
      if (jsons.length > 0 && jsons[0].stats && Array.isArray(jsons[0].stats.games)) {
        for (const game of jsons[0].stats.games) {
          if (!game.teams || !Array.isArray(game.teams)) continue;
          for (const team of game.teams) {
            if (team && Array.isArray(team.player_stats) && team.player_stats.length > 0) {
              batchTeams.push(team);
            }
          }
        }
      }
      if (batchTeams.length === 0) {
        console.log('[ELO DEBUG] No games with players found in first batch file.');
      } else {
        console.log(`[ELO DEBUG] Running Elo breakdown for all games in first batch file (${batchTeams.length} teams with player data)...`);
        // Collect all unique player IDs from these teams
        const playerMapForPrint = {};
        batchTeams.forEach(team => {
          team.player_stats.forEach(p => { playerMapForPrint[p.playerId] = p; });
        });
        // Select 3 players (first 3 unique IDs)
        const selectedPlayers = Object.values(playerMapForPrint).slice(0, 3) as PlayerData[];
        const typedBatchTeams = batchTeams as GameStats[];
        printEloCalculationBreakdown(selectedPlayers, typedBatchTeams);
        console.log('[ELO DEBUG] Elo breakdown complete.');
      }
  // ...existing code...
      if (jsons[0]) {
  // ...existing code...
      }
      const playerMap = new Map<string, PlayerStats>();
      const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
      let fileIdx = 0;
      for (const json of jsons) {
        if (!json) { fileIdx++; continue; }
        const matchDay = loadScrimTableFromJsonObject(json);
        if (!matchDay) { fileIdx++; continue; }
        Object.entries(matchDay).forEach(([gameNumber, teamGameResults]) => {
          if (!Array.isArray(teamGameResults)) return;
          // For each team/game, update player ELOs sequentially
          teamGameResults.forEach((team: any) => {
            if (!team.players) return;
            // Calculate average ELO for the team (for opponent comparison)
            const teamEloAvg = team.players.reduce((sum: number, ps: any) => {
              const rawName: string = ps.playerName || ps.name || '';
              const id: string = ps.playerId ?? ps.player_id ?? rawName.trim().toLowerCase();
              if (!playerMap.has(id)) {
                playerMap.set(id, { name: rawName, elo: INITIAL_ELO, games: new Set<string>(), gamesPlayed: 0, stats: [] });
              }
              return sum + playerMap.get(id)!.elo;
            }, 0) / (team.players.length || 1);
            // Update each player's ELO using EloCalculatorService
            team.players.forEach((ps: any) => {
              const rawName: string = ps.playerName || ps.name || '';
              const id: string = ps.playerId ?? ps.player_id ?? rawName.trim().toLowerCase();
              const playerStats = playerMap.get(id)!;
              // Use EloCalculatorService.calculatePerformanceScore with correct per-game damage input
              const performanceScore = EloCalculatorService.calculatePerformanceScore(
                ps.placement ?? team.placement ?? 0,
                ps.kills || 0,
                ps.assists || 0,
                ps.damageDealt || 0,
                ps.revivesGiven || ps.revives || 0
              );
              const newElo = EloCalculatorService.prototype.calculateEloChangeWithOpponent(
                playerStats.elo,
                teamEloAvg,
                performanceScore,
                playerStats.gamesPlayed
              );
              playerStats.elo += newElo;
              playerStats.stats.push({ ...ps, placement: team.placement });
              playerStats.games.add(`${fileIdx}_${gameNumber}`);
              playerStats.gamesPlayed++;
            });
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
      const aggregatedStats: PlayerAggregatedStats[] = [];
      const performanceScores: number[] = [];

      playerMap.forEach((val: PlayerStats, id: string) => {
        // No filter on games played
        const totalKills = val.stats.reduce((sum: number, s: any) => sum + (s.kills || 0), 0);
        const totalDamage = val.stats.reduce((sum: number, s: any) => sum + (s.damageDealt || 0), 0);
        const totalRevives = val.stats.reduce((sum: number, s: any) => sum + (s.revives || s.revives_given || 0), 0);
        const totalRespawns = val.stats.reduce((sum: number, s: any) => sum + (s.respawns || s.respawns_given || 0), 0);
        const totalPoints = val.stats.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
        const averageKills = totalKills / (val.stats.length || 1);
        const averageDamage = totalDamage / (val.stats.length || 1);
        const averagePlacement = val.stats.reduce((sum: number, s: any) => sum + (s.placement || 0), 0) / (val.stats.length || 1);
        const winRate = (val.stats.filter((s: any) => (s.placement || 0) === 1).length / (val.stats.length || 1)) * 100;
        const topThreeRate = (val.stats.filter((s: any) => (s.placement || 0) <= 3).length / (val.stats.length || 1)) * 100;
        
        // Collect all performance scores for this player
        val.stats.forEach((s: any) => {
          const placement = s.placement || 0;
          const kills = s.kills || 0;
          const assists = s.assists || 0;
          const damage = s.damageDealt || 0;
          const revives = s.revivesGiven || s.revives || 0;
          const perfScore = EloCalculatorService.calculatePerformanceScore(placement, kills, assists, damage, revives);
          performanceScores.push(perfScore);
        });

        aggregatedStats.push({
          stats: val.stats,
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

      // Track separate performance metrics
      const metrics = {
        elo: [] as number[],
        gamesPlayed: [] as number[],
        totalKills: [] as number[],
        winRate: [] as number[],
        topThreeRate: [] as number[],
        averagePlacement: [] as number[],
        averageKills: [] as number[],
        averageDamage: [] as number[],
        performanceScore: [] as number[]
      };

      // Collect metrics from player stats
      aggregatedStats.forEach(player => {
        metrics.elo.push(player.finalElo);
        metrics.gamesPlayed.push(player.totalGames);
        metrics.totalKills.push(player.totalKills);
        metrics.winRate.push(player.winRate);
        metrics.topThreeRate.push(player.topThreeRate);
        metrics.averagePlacement.push(player.averagePlacement);
        metrics.averageKills.push(player.averageKills);
        metrics.averageDamage.push(player.averageDamage);

        // Calculate average performance score for this player
        const playerPerfScores = player.stats.map(s => {
          const placement = s.placement || 0;
          const kills = s.kills || 0;
          const assists = s.assists || 0;
          const damage = s.damageDealt || 0;
          const revives = s.revivesGiven || s.revives || 0;
          return EloCalculatorService.calculatePerformanceScore(placement, kills, assists, damage, revives);
        });
        
        const avgPerfScore = playerPerfScores.length 
          ? playerPerfScores.reduce((a, b) => a + b, 0) / playerPerfScores.length 
          : 0;
        metrics.performanceScore.push(avgPerfScore);
      });

      // Calculate statistics for each metric
      const calculateStats = (arr: number[]) => ({
        min: arr.length ? arr.reduce((min, val) => Math.min(min, val), arr[0]) : 0,
        max: arr.length ? arr.reduce((max, val) => Math.max(max, val), arr[0]) : 0,
        avg: mean(arr),
        median: median(arr),
        std: std(arr),
        count: arr.length
      });

      const perfStats = {
        elo: calculateStats(metrics.elo),
        gamesPlayed: calculateStats(metrics.gamesPlayed),
        totalKills: calculateStats(metrics.totalKills),
        winRate: calculateStats(metrics.winRate),
        topThreeRate: calculateStats(metrics.topThreeRate),
        averagePlacement: calculateStats(metrics.averagePlacement),
        averageKills: calculateStats(metrics.averageKills),
        averageDamage: calculateStats(metrics.averageDamage),
        performanceScore: calculateStats(metrics.performanceScore)
      };
      // Add performance metrics to each player's stats
      const sortedStats = aggregatedStats.sort((a, b) => b.finalElo - a.finalElo);
      sortedStats[0].performanceMetrics = perfStats; // Add metrics to the top player's entry

      return sortedStats;
    }
  }


