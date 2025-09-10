import { Injectable } from '@angular/core';
import { PlayerStats, PlayerAggregatedStats } from './scrims-data.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerStatsService {
  /**
   * Map ScrimPlayerStats (from backend) to PlayerStats (frontend model)
   */
  mapScrimPlayerStatsToPlayerStats(stats: any[]): PlayerStats[] {
    return stats.map(s => ({
      playerName: s.playerName || s.name || 'Unknown Player',
      kills: s.kills || 0,
      damageDealt: s.damageDealt || s.damage || s.damage_dealt || 0,
      downs: s.downs || s.knockdowns || 0,
      assists: s.assists || 0,
      revives: s.revives || s.revives_given || 0,
      respawns: s.respawns || s.respawns_given || 0
    }));
  }

  /**
   * Aggregate player stats from individual scrim performances
   */
  aggregatePlayerStats(playerStats: PlayerStats[]): PlayerAggregatedStats[] {
    const playerMap = new Map<string, {
      playerId: string;
      playerName: string;
      displayName?: string;
      games: PlayerStats[];
    }>();

    playerStats.forEach(stat => {
      const key = stat.playerName || 'Unknown Player';
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          playerId: key,
          playerName: key,
          displayName: key,
          games: []
        });
      }
      playerMap.get(key)!.games.push(stat);
    });

    return Array.from(playerMap.values()).map(playerData => {
      const games = playerData.games;
      const totalGames = games.length;
      if (totalGames === 0) {
        return this.createEmptyPlayerStats(playerData.playerId, playerData.playerName, playerData.displayName);
      }
      const totalKills = games.reduce((sum, game) => sum + (game.kills || 0), 0);
  const totalDamage = games.reduce((sum, game) => sum + (game.damageDealt || 0), 0);
      const totalRevives = games.reduce((sum, game) => sum + (game.revives || 0), 0);
      const totalRespawns = games.reduce((sum, game) => sum + (game.respawns || 0), 0);
      const totalPoints = 0;
      const averageKills = totalKills / totalGames;
      const averageDamage = totalDamage / totalGames;
      const averagePlacement = 0;
      const winRate = 0;
      const topThreeRate = 0;
      const estimatedElo = this.calculateEstimatedElo(averagePlacement, averageKills, averageDamage, winRate);
      return {
        playerId: playerData.playerId,
        playerName: playerData.playerName,
        displayName: playerData.displayName,
        totalGames,
        totalKills,
        totalDamage,
        totalRevives,
        totalRespawns,
        totalPoints,
        averageKills: Math.round(averageKills * 100) / 100,
        averageDamage: Math.round(averageDamage),
        averagePlacement: Math.round(averagePlacement * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        topThreeRate: Math.round(topThreeRate * 100) / 100,
        estimatedElo: Math.round(estimatedElo)
      };
    });
  }

  /**
   * Create empty player stats structure
   */
  createEmptyPlayerStats(playerId: string, playerName: string, displayName?: string): PlayerAggregatedStats {
    return {
      playerId,
      playerName,
      displayName,
      totalGames: 0,
      totalKills: 0,
      totalDamage: 0,
      totalRevives: 0,
      totalRespawns: 0,
      totalPoints: 0,
      averageKills: 0,
      averageDamage: 0,
      averagePlacement: 20,
      winRate: 0,
      topThreeRate: 0,
      estimatedElo: 1500
    };
  }

  /**
   * Calculate estimated ELO based on performance metrics
   */
  calculateEstimatedElo(avgPlacement: number, avgKills: number, avgDamage: number, winRate: number): number {
    let elo = 1500;
    const placementFactor = (21 - avgPlacement) * 15;
    elo += placementFactor;
    const killsFactor = avgKills * 25;
    elo += killsFactor;
  const damageFactor = (avgDamage / 100) * 2;
    elo += damageFactor;
    const winRateFactor = winRate * 10;
    elo += winRateFactor;
    return Math.max(800, Math.min(3000, elo));
  }

  /**
   * Calculate badges based on player performance
   */
  calculateBadges(stats: PlayerAggregatedStats): string[] {
    const badges: string[] = [];
    if (stats.winRate >= 20) badges.push('Champion');
    if (stats.averageKills >= 8) badges.push('High Killer');
    if (stats.averageKills >= 5) badges.push('Sharpshooter');
    if (stats.totalGames >= 50) badges.push('Veteran');
    if (stats.totalGames >= 20) badges.push('Consistent');
    if (stats.winRate >= 10) badges.push('Elite');
    if (stats.topThreeRate >= 40) badges.push('Clutch Master');
    if (stats.averagePlacement <= 8) badges.push('Tactical');
    if (stats.totalRevives / stats.totalGames >= 2) badges.push('Team Player');
    if (stats.averageDamage >= 2000) badges.push('Aggressive');
    return badges.slice(0, 3);
  }
}
