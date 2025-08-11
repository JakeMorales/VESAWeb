import { Injectable } from '@angular/core';
import { PlayerStats, TeamGameResult } from '../models/match-day-results.model';
import { EloCalculatorService } from './elo-calculator.service';

export interface PlayerRating {
  playerName: string;
  eloRating: number;
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
  gamesPlayed: number;
  wins: number;
  losses: number;
  avgPlacement: number;
  avgTeamKills: number;
  avgTotalPoints: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  
  private readonly ELO_BASE_RATING = 1500;

  constructor(private eloCalculator: EloCalculatorService) { }

  /**
   * Process match results and calculate new ratings for all participants
   */
  processMatchResults(
    gameResults: TeamGameResult[],
    playerEloMap: { [playerName: string]: number } = {}
  ): { playerRatings: PlayerRating[]; teamRatings: TeamRating[] } {
    const playerRatings: PlayerRating[] = [];
    // Flatten all players in all teams for this game
    const allPlayers = gameResults.flatMap(result => result.players.map(player => ({ player, result })));
    // Use actual player Elos if available, otherwise fallback to base rating
    const playerElos = allPlayers.map(({ player }) =>
      playerEloMap[player.playerName] ?? this.ELO_BASE_RATING
    );
    // Calculate the actual average Elo for the lobby
    const gameAverageRating = playerElos.reduce((a, b) => a + b, 0) / (playerElos.length || 1);

    // Calculate raw performance scores for all players using EloCalculatorService
    const rawScores = allPlayers.map(({ player, result }) =>
      this.eloCalculator.calculatePerformanceScore(
        result.placement,
        player.kills,
        player.assists || 0,
        player.damage,
        player.revives
      )
    );
    // Normalize scores so mean is 0.5
    const normScores = EloCalculatorService.normalizePerformanceScores(rawScores);

    // Assign Elo changes using normalized scores and the actual game average rating as opponent Elo
    allPlayers.forEach(({ player, result }, idx) => {
      const playerElo = playerElos[idx];
      const normPerfScore = normScores[idx];
      const gamesPlayed = 0; // Could be tracked if needed
      const eloChange = this.eloCalculator.calculateEloChangeWithOpponent(
        playerElo,
        gameAverageRating,
        normPerfScore,
        gamesPlayed
      );
      const playerRating: PlayerRating = {
        playerName: player.playerName,
        eloRating: playerElo + eloChange,
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

    return { playerRatings, teamRatings: [] };
  }

}
