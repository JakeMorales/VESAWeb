import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { MatchLoaderService } from './match-loader.service';
import { EloAggregationService } from './elo-aggregation.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamUtilsService } from './team-utils.service';
import { DateUtilsService } from './date-utils.service';
// TODO: Create LeagueMatchTableLoaderService or reuse existing loader if possible
// import { LeagueMatchTableLoaderService } from './league-match-table-loader.service';

// Import or define interfaces as needed
// import { MatchDayResults } from '../models/match-day-results.model';
// import { PlayerStats } from '../models/player-stats.model';

@Injectable({ providedIn: 'root' })
export class LeagueMatchDataService {
  constructor(
  private matchLoaderService: MatchLoaderService,
    // private leagueMatchTableLoader: LeagueMatchTableLoaderService, // TODO: implement or reuse
    private playerStatsService: PlayerStatsService,
    private teamUtilsService: TeamUtilsService,
    private dateUtilsService: DateUtilsService,
    private eloAggregationService: EloAggregationService
  ) {}

  /**
   * Fetch league match data from API and transform to MatchDayResults
   */
  /**
   * Loads league match data using MatchLoaderService (from file for now)
   * @param matchId The filename of the match JSON file
   */
  // For now, hardcode a list of available match files (in production, fetch from API or directory)
  private availableMatchFiles: string[] = [
    'scrim_2024_07_03_id_7058.json',
    'scrim_2024_07_03_id_7059.json',
    // ...add more as needed
  ];

  /**
   * Loads league match data using MatchLoaderService (from file for now)
   * If no matchId is provided, picks the first available match file.
   */
  getLeagueMatchResults(matchId?: string): Observable<any /* MatchDayResults */> {
    // Only use matchId if it matches a real file name
    const fileToLoad = matchId && this.availableMatchFiles.includes(matchId)
      ? matchId
      : this.availableMatchFiles[0];
    return this.matchLoaderService.loadMatch(fileToLoad).pipe(
      map(json => this.matchLoaderService.transformMatchJsonToMatchDayResults(json)),
      catchError((error) => {
        console.error('Error loading league match data:', error);
        return of({});
      })
    );
  }

  // Add more methods as needed, following the scrims data service pattern
}
