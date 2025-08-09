import { Injectable } from '@angular/core';
import { PlayerStats, TeamGameResult } from '../components/match/match-day-table.component';

export interface PlayerRating {
  playerName: string;
  eloRating: number;
  glickoRating: number;
  glickoDeviation: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  avgPlacement: number;
  avgKills: number;
  avgDamage: number;
  avgRevives: number;
  avgRespawns: number;
  lastUpdated: Date;
}

export interface TeamRating {
  teamName: string;
  eloRating: number;
  glickoRating: number;
  glickoDeviation: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  avgPlacement: number;
  avgTeamKills: number;
  avgTotalPoints: number;
  lastUpdated: Date;
}

export interface BattleRoyalePerformanceFactors {
  placementFactor: number;      // Based on final placement (1-20)
  combatFactor: number;         // Kills + assists weighted
  damageFactor: number;         // Damage dealt normalized
  supportFactor: number;        // Revives + respawns
  opponentStrengthFactor: number; // Average rating of eliminated opponents
  consistencyFactor: number;    // Based on performance variance
}

export interface RatingCalculationResult {
  newEloRating: number;
  newGlickoRating: number;
  newGlickoDeviation: number;
  eloChange: number;
  glickoChange: number;
  performanceBreakdown: BattleRoyalePerformanceFactors;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  
  // Battle Royale specific constants (balanced weight distribution)
  private readonly BR_TEAMS_COUNT = 20;
  private readonly BR_PLACEMENT_WEIGHT = 0.50;   // 50% from placement (primary factor)
  private readonly BR_COMBAT_WEIGHT = 0.30;      // 30% from kills/combat
  private readonly BR_DAMAGE_WEIGHT = 0.15;      // 15% from damage
  private readonly BR_SUPPORT_WEIGHT = 0.05;     // 5% from team support
  
  // Elo constants
  private readonly ELO_K_FACTOR = 32;
  private readonly ELO_BASE_RATING = 1500;
  
  // Glicko constants  
  private readonly GLICKO_INITIAL_RATING = 1500;
  private readonly GLICKO_INITIAL_DEVIATION = 350;
  private readonly GLICKO_C = 15.8; // Controls rating deviation increase over time
  private readonly GLICKO_Q = Math.log(10) / 400;

  constructor() { }

  /**
   * Calculate Elo rating change based on game result
   */
  calculateEloChange(playerRating: number, opponentRating: number, result: number): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return Math.round(this.ELO_K_FACTOR * (result - expectedScore));
  }

  /**
   * Calculate Glicko rating change
   */
  calculateGlickoChange(
    rating: number, 
    deviation: number, 
    opponentRating: number, 
    opponentDeviation: number, 
    result: number
  ): { newRating: number; newDeviation: number } {
    
    const g = (rd: number) => 1 / Math.sqrt(1 + 3 * Math.pow(this.GLICKO_Q * rd / Math.PI, 2));
    const E = (r: number, rj: number, rdj: number) => 1 / (1 + Math.pow(10, -g(rdj) * (r - rj) / 400));
    
    const gRd = g(opponentDeviation);
    const expectedScore = E(rating, opponentRating, opponentDeviation);
    
    const d2 = 1 / (Math.pow(this.GLICKO_Q, 2) * Math.pow(gRd, 2) * expectedScore * (1 - expectedScore));
    
    const newRating = rating + (this.GLICKO_Q / (1 / Math.pow(deviation, 2) + 1 / d2)) * gRd * (result - expectedScore);
    const newDeviation = Math.sqrt(1 / (1 / Math.pow(deviation, 2) + 1 / d2));
    
    return {
      newRating: Math.round(newRating),
      newDeviation: Math.round(newDeviation * 100) / 100
    };
  }

  /**
   * Calculate battle royale performance factors for rating adjustment
   */
  private calculateBattleRoyalePerformance(
    player: PlayerStats, 
    teamResult: TeamGameResult, 
    allResults: TeamGameResult[]
  ): BattleRoyalePerformanceFactors {
    
    // 1. Placement Factor (45% weight) - Higher placement = better score
    const placementFactor = this.calculatePlacementScore(teamResult.placement, this.BR_TEAMS_COUNT);
    
    // 2. Combat Factor (32.5% weight) - Kills and assists (more realistic expectations)
    // Pro players average ~1.1 kills + 1.67 assists per game
    // Weight: kills = 1.0, assists = 1.0 (assists count the same as kills)
    const combatScore = player.kills + (player.assists || 0);
    const realisticMaxCombat = 8; // Pro-level combined score ~2.8, so 8 is very good for typical players
    const combatFactor = Math.min(1.0, combatScore / realisticMaxCombat);
    
    // 3. Damage Factor (20% weight) - Consistent damage output (more realistic expectations)
    // Use a reasonable max based on typical player performance rather than game max  
    const realisticMaxDamage = 1200; // Pro players average ~510, so 1200 is very good for typical players
    const damageFactor = Math.min(1.0, player.damage / realisticMaxDamage);
    
    // 4. Support Factor (5% weight) - Team play (revives/respawns) - more realistic expectations
    const maxSupportActions = 3; // Pro players average ~0.22 revives, so 3 is very good for typical players
    const supportFactor = Math.min(1.0, (player.revives + player.respawns) / maxSupportActions);
    
    // 5. Opponent Strength Factor (10% weight) - Quality of competition
    // For now, base this on average placement of opponents (teams placed below you)
    const betterTeams = allResults.filter(r => r.placement < teamResult.placement).length;
    const opponentStrengthFactor = betterTeams / (this.BR_TEAMS_COUNT - 1);
    
    // 6. Consistency Factor - Bonus for well-rounded performance
    const factors = [placementFactor, combatFactor, damageFactor, supportFactor];
    const avgFactor = factors.reduce((a, b) => a + b) / factors.length;
    const variance = factors.reduce((sum, f) => sum + Math.pow(f - avgFactor, 2), 0) / factors.length;
    const consistencyFactor = Math.max(0, 1 - variance); // Less variance = higher consistency
    
    return {
      placementFactor,
      combatFactor,
      damageFactor,
      supportFactor,
      opponentStrengthFactor,
      consistencyFactor
    };
  }

  /**
   * Calculate battle royale Elo change based on comprehensive performance
   */
  calculateBattleRoyaleEloChange(
    currentRating: number,
    performance: BattleRoyalePerformanceFactors,
    gameAverageRating: number = this.ELO_BASE_RATING
  ): number {
    // Calculate overall performance score (weights sum to 100%)
    const performanceScore = 
      (performance.placementFactor * this.BR_PLACEMENT_WEIGHT) +
      (performance.combatFactor * this.BR_COMBAT_WEIGHT) +
      (performance.damageFactor * this.BR_DAMAGE_WEIGHT) +
      (performance.supportFactor * this.BR_SUPPORT_WEIGHT);
    
    // Add consistency bonus (up to 10% bonus) and opponent strength consideration
    const opponentStrengthBonus = performance.opponentStrengthFactor * 0.1;
    const finalScore = Math.min(1.0, performanceScore + (performance.consistencyFactor * 0.1) + opponentStrengthBonus);
    
    // Expected score based on current rating vs game average (adjusted for BR)
    const baseExpectedScore = 1 / (1 + Math.pow(10, (gameAverageRating - currentRating) / 400));
    const adjustedExpectedScore = Math.max(0.2827, baseExpectedScore); // Recalibrated for zero inflation

    // K-factor adjustment based on game context (battle royale has more variance)
    const brKFactor = this.ELO_K_FACTOR * 1.09; // 9% higher K-factor for BR (35 total)
    
    return Math.round(brKFactor * (finalScore - adjustedExpectedScore));
  }

  /**
   * Process match results and calculate new ratings for all participants
   */
  processMatchResults(gameResults: TeamGameResult[]): { playerRatings: PlayerRating[]; teamRatings: TeamRating[] } {
    const playerRatings: PlayerRating[] = [];
    const teamRatings: TeamRating[] = [];
    
    // Calculate game-wide statistics for normalization
    const gameAverageRating = this.ELO_BASE_RATING; // In real implementation, use actual average
    
    gameResults.forEach((result, index) => {
      // Calculate team performance metrics
      const teamCombatScore = result.teamKills / Math.max(...gameResults.map(r => r.teamKills));
      const teamPlacementScore = this.calculatePlacementScore(result.placement, this.BR_TEAMS_COUNT);
      
      // Team rating calculation
      const teamEloChange = this.calculateBattleRoyaleEloChange(
        this.ELO_BASE_RATING + (index * 25), // Staggered base ratings for demo
        {
          placementFactor: teamPlacementScore,
          combatFactor: teamCombatScore,
          damageFactor: teamCombatScore, // Use combat as proxy for team damage
          supportFactor: 0.5, // Neutral team support score
          opponentStrengthFactor: 0.5, // Neutral opponent strength
          consistencyFactor: 0.7 // Good consistency
        },
        gameAverageRating
      );
      
      const teamRating: TeamRating = {
        teamName: result.teamName,
        eloRating: this.ELO_BASE_RATING + teamEloChange,
        glickoRating: this.GLICKO_INITIAL_RATING + Math.round(teamEloChange * 1.5),
        glickoDeviation: Math.max(30, this.GLICKO_INITIAL_DEVIATION - (teamEloChange / 10)),
        gamesPlayed: 1,
        wins: result.placement <= 3 ? 1 : 0,
        losses: result.placement > 15 ? 1 : 0,
        avgPlacement: result.placement,
        avgTeamKills: result.teamKills,
        avgTotalPoints: result.totalPoints,
        lastUpdated: new Date()
      };
      
      teamRatings.push(teamRating);
      
      // Calculate individual player ratings
      result.players.forEach(player => {
        const performance = this.calculateBattleRoyalePerformance(player, result, gameResults);
        const playerEloChange = this.calculateBattleRoyaleEloChange(
          this.ELO_BASE_RATING + (index * 20), // Staggered base ratings
          performance,
          gameAverageRating
        );
        
        const playerRating: PlayerRating = {
          playerName: player.playerName,
          eloRating: this.ELO_BASE_RATING + playerEloChange,
          glickoRating: this.GLICKO_INITIAL_RATING + Math.round(playerEloChange * 1.5),
          glickoDeviation: Math.max(30, this.GLICKO_INITIAL_DEVIATION - (playerEloChange / 8)),
          gamesPlayed: 1,
          wins: result.placement <= 5 ? 1 : 0,
          losses: result.placement > 15 ? 1 : 0,
          avgPlacement: result.placement,
          avgKills: player.kills,
          avgDamage: player.damage,
          avgRevives: player.revives,
          avgRespawns: player.respawns,
          lastUpdated: new Date()
        };
        
        playerRatings.push(playerRating);
      });
    });
    
    return { playerRatings, teamRatings };
  }

  /**
   * Calculate placement score (0 to 1) based on team placement
   */
  private calculatePlacementScore(placement: number, totalTeams: number): number {
    // Explicit placement scoring - clear values we can verify
    switch (placement) {
      case 1: return 1.00;   // 100%
      case 2: return 0.80;   // 80%  
      case 3: return 0.65;   // 65%
      case 4: return 0.50;   // 50%
      case 5: return 0.35;   // 35%
      case 6: return 0.25;   // 25%
      case 7: return 0.20;   // 20%
      case 8: return 0.16;   // 16%
      case 9: return 0.13;   // 13%
      case 10: return 0.10;  // 10%
      case 11: return 0.08;  // 8%
      case 12: return 0.06;  // 6%
      case 13: return 0.05;  // 5%
      case 14: return 0.04;  // 4%
      case 15: return 0.03;  // 3%
      case 16: return 0.02;  // 2%
      case 17: return 0.015; // 1.5%
      case 18: return 0.01;  // 1%
      case 19: return 0.005; // 0.5%
      case 20: return 0.0;   // 0%
      default: return 0.0;
    }
  }

  /**
   * Calculate player performance score based on individual stats
   */
  private calculatePlayerPerformanceScore(player: PlayerStats, teamResult: TeamGameResult): number {
    const killScore = player.kills / 10; // Normalize kills (assuming max ~10 kills per game)
    const damageScore = player.damage / 2000; // Normalize damage (assuming max ~2000 damage)
    const teamScore = this.calculatePlacementScore(teamResult.placement, 20); // Assume 20 teams
    
    return (killScore * 0.3 + damageScore * 0.3 + teamScore * 0.4);
  }

  /**
   * Generate mock historical rating data for visualization
   */
  generateMockRatingHistory(playerName: string): { date: Date; elo: number; glicko: number }[] {
    const history = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    
    let currentElo = this.ELO_BASE_RATING;
    let currentGlicko = this.GLICKO_INITIAL_RATING;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate random rating changes
      const eloChange = (Math.random() - 0.5) * 50;
      const glickoChange = (Math.random() - 0.5) * 75;
      
      currentElo += eloChange;
      currentGlicko += glickoChange;
      
      history.push({
        date: date,
        elo: Math.round(currentElo),
        glicko: Math.round(currentGlicko)
      });
    }
    
    return history;
  }

  /**
   * Get initial ratings for a new player/team
   */
  getInitialPlayerRating(playerName: string): PlayerRating {
    return {
      playerName,
      eloRating: this.ELO_BASE_RATING,
      glickoRating: this.GLICKO_INITIAL_RATING,
      glickoDeviation: this.GLICKO_INITIAL_DEVIATION,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      avgPlacement: 0,
      avgKills: 0,
      avgDamage: 0,
      avgRevives: 0,
      avgRespawns: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Get initial ratings for a new team
   */
  getInitialTeamRating(teamName: string): TeamRating {
    return {
      teamName,
      eloRating: this.ELO_BASE_RATING,
      glickoRating: this.GLICKO_INITIAL_RATING,
      glickoDeviation: this.GLICKO_INITIAL_DEVIATION,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      avgPlacement: 0,
      avgTeamKills: 0,
      avgTotalPoints: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate detailed rating result with performance breakdown
   */
  calculateDetailedRating(
    player: PlayerStats,
    teamResult: TeamGameResult,
    allResults: TeamGameResult[],
    currentRating: number = this.ELO_BASE_RATING
  ): RatingCalculationResult {
    const performance = this.calculateBattleRoyalePerformance(player, teamResult, allResults);
    const eloChange = this.calculateBattleRoyaleEloChange(currentRating, performance);
    
    // Simplified Glicko calculation for this example
    const glickoChange = Math.round(eloChange * 1.2);
    
    return {
      newEloRating: currentRating + eloChange,
      newGlickoRating: this.GLICKO_INITIAL_RATING + glickoChange,
      newGlickoDeviation: Math.max(30, this.GLICKO_INITIAL_DEVIATION - Math.abs(eloChange) / 10),
      eloChange,
      glickoChange,
      performanceBreakdown: performance
    };
  }
}
