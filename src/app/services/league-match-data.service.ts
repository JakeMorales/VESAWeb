import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { MatchLoaderService } from './match-loader.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamUtilsService } from './team-utils.service';
import { DateUtilsService } from './date-utils.service';
import { LeagueService, LeagueMatchDay } from './league.service';
// TODO: Create LeagueMatchTableLoaderService or reuse existing loader if possible
// import { LeagueMatchTableLoaderService } from './league-match-table-loader.service';

// Import required interfaces
import { MatchDayResults } from '../models/match-day-results.model';

@Injectable({ providedIn: 'root' })
export class LeagueMatchDataService {
  constructor(
    private matchLoaderService: MatchLoaderService,
    private playerStatsService: PlayerStatsService,
    private teamUtilsService: TeamUtilsService,
    private dateUtilsService: DateUtilsService,
    private leagueService: LeagueService
  ) {}

  /**
   * Fetch league match data from API and transform to MatchDayResults
   */
  /**
   * Gets all available seasons
   */
  getAvailableSeasons(): Observable<string[]> {
    return this.leagueService.getSeasons();
  }

  /**
   * Gets all divisions for a season
   */
  getDivisions(season: string): Observable<string[]> {
    return this.leagueService.getDivisions(season);
  }

  /**
   * Gets all match file names for a specific division
   */
  getMatchFiles(season: string, division: string): Observable<string[]> {
    return this.leagueService.getMatchFiles(season, division);
  }

  /**
   * Gets a specific match day result
   */
  getMatchDayResult(season: string, division: string, filename: string): Observable<LeagueMatchDay | null> {
    return this.leagueService.getMatchDay(season, division, filename).pipe(
      catchError(err => {
        console.error('Error loading match day:', err);
        return of(null);
      })
    );
  }

  /**
   * Gets the match results for a specific league match
   * @param matchId The ID of the match (format: [season]_[division]_[week])
   */
  getLeagueMatchResults(matchId: string): Observable<MatchDayResults | null> {
    // Parse matchId to get season, division, and week
    const [season, division, week] = matchId.split('_');
    if (!season || !division || !week) {
      console.error('Invalid match ID format:', matchId);
      return of(null);
    }

    return this.leagueService.getMatchDay(season, division, week).pipe(
      map(matchDay => {
        if (!matchDay) return null;

        // Convert LeagueMatchDay to MatchDayResults
        return {
          id: matchId,
          season: matchDay.season,
          division: matchDay.division,
          week: matchDay.week,
          isPlayoffs: matchDay.isPlayoffs,
          date: new Date().toISOString(), // TODO: Add actual date to the model
          games: matchDay.stats.games.map(game => ({
            gameNumber: game.game,
            teams: game.teams.map(team => ({
              placement: team.overall_stats?.teamPlacement || 0,
              name: `Team ${team.overall_stats?.teamPlacement || 'Unknown'}`,
              players: team.player_stats.map(player => ({
                name: player.playerName,
                kills: player.kills || 0,
                assists: player.assists || 0,
                damage: player.damageDealt || 0,
                revives: player.revivesGiven || player.revives || 0
              }))
            }))
          }))
        };
      }),
      catchError(err => {
        console.error('Error loading match results:', err);
        return of(null);
      })
    );
  }

  // Add more methods as needed, following the scrims data service pattern
}
