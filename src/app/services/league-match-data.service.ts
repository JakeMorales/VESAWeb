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
import { MatchDayResults, TeamGameResult } from '../models/match-day-results.model';

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
   * Gets the match results for a specific league match.
   * @param matchId Encoded as Season_14~{division}~{filename}
   */
  getLeagueMatchResults(matchId: string): Observable<MatchDayResults | null> {
    const parts = matchId.split('~');
    if (parts.length !== 3) {
      console.error('Invalid match ID format (expected season~division~filename):', matchId);
      return of(null);
    }
    const [season, division, filename] = parts;

    return this.leagueService.getMatchDay(season, division, filename).pipe(
      map(matchDay => {
        if (!matchDay) return null;
        const results: MatchDayResults = {};
        matchDay.stats.games.forEach(game => {
          results[game.game] = [...game.teams]
            .sort((a, b) => (a.overall_stats?.teamPlacement ?? 99) - (b.overall_stats?.teamPlacement ?? 99))
            .map(team => {
              const placement = team.overall_stats?.teamPlacement ?? 0;
              const totalPoints = team.overall_stats?.score ?? 0;
              const teamKills = team.overall_stats?.kills
                ?? team.player_stats.reduce((s, p) => s + (p.kills || 0), 0);
              const placementPoints = totalPoints - teamKills;
              return {
                gameNumber: game.game,
                teamName: team.name || team.overall_stats?.name || '',
                placement,
                teamKills,
                placementPoints,
                totalPoints,
                mapName: game.mapName || '',
                players: team.player_stats.map(p => ({
                  playerName: p.playerName || p.name || p.player_name || '',
                  kills: p.kills || 0,
                  damage: p.damageDealt || p.damage_dealt || 0,
                  downs: p.knockdowns || 0,
                  headshots: p.headshots || 0,
                  assists: p.assists || 0,
                  revives: p.revivesGiven || p.revives_given || p.revives || 0,
                  respawns: 0
                }))
              } as TeamGameResult;
            });
        });
        return results;
      }),
      catchError(err => {
        console.error('Error loading match results:', err);
        return of(null);
      })
    );
  }

  // Add more methods as needed, following the scrims data service pattern
}
