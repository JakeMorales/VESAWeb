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
  lastUpdated: Date;
}

export interface RatingCalculationResult {
  newEloRating: number;
  newGlickoRating: number;
  newGlickoDeviation: number;
  eloChange: number;
  glickoChange: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  
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
   * Process match results and calculate new ratings for all participants
   */
  processMatchResults(gameResults: TeamGameResult[]): { playerRatings: PlayerRating[]; teamRatings: TeamRating[] } {
    const playerRatings: PlayerRating[] = [];
    const teamRatings: TeamRating[] = [];
    
    // For now, return mock calculated ratings
    // In a real implementation, this would process the actual game results
    gameResults.forEach((result, index) => {
      // Calculate team rating based on placement (better placement = win against lower-placed teams)
      const placementScore = this.calculatePlacementScore(result.placement, gameResults.length);
      const baseElo = this.ELO_BASE_RATING + (index * 50); // Stagger initial ratings for demo
      
      const teamRating: TeamRating = {
        teamName: result.teamName,
        eloRating: baseElo + this.calculateEloChange(baseElo, this.ELO_BASE_RATING, placementScore),
        glickoRating: this.GLICKO_INITIAL_RATING + (placementScore * 100),
        glickoDeviation: this.GLICKO_INITIAL_DEVIATION - (index * 10),
        gamesPlayed: 1,
        wins: result.placement <= 3 ? 1 : 0,
        losses: result.placement > 10 ? 1 : 0,
        avgPlacement: result.placement,
        lastUpdated: new Date()
      };
      
      teamRatings.push(teamRating);
      
      // Calculate individual player ratings
      result.players.forEach(player => {
        const performanceScore = this.calculatePlayerPerformanceScore(player, result);
        const playerRating: PlayerRating = {
          playerName: player.playerName,
          eloRating: baseElo + Math.round(performanceScore * 50),
          glickoRating: this.GLICKO_INITIAL_RATING + Math.round(performanceScore * 75),
          glickoDeviation: this.GLICKO_INITIAL_DEVIATION - Math.round(performanceScore * 20),
          gamesPlayed: 1,
          wins: result.placement <= 5 ? 1 : 0,
          losses: result.placement > 15 ? 1 : 0,
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
    return (totalTeams - placement + 1) / totalTeams;
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
      lastUpdated: new Date()
    };
  }
}
