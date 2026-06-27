import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { MatchLoaderService } from './match-loader.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamUtilsService } from './team-utils.service';
import { DateUtilsService } from './date-utils.service';
import { NhostService, Scrim, ScrimPlayerStats } from './nhost.service';
import { MatchDayResults } from '../models/match-day-results.model';

export interface PlayerStats {
  playerName: string;
  kills: number;
  damageDealt: number;
  downs: number;
  headshots?: number;
  assists?: number;
  shots?: number;
  hits?: number;
  revives: number;
  respawns: number;
}

export interface ScrimLeaderboardData {
  players: PlayerAggregatedStats[];
  totalScrims: number;
  totalPlayers: number;
  lastUpdated: Date;
}

export interface PlayerAggregatedStats {
  playerId: string;
  playerName: string;
  displayName?: string;
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
  finalElo?: number;
}

@Injectable({ providedIn: 'root' })
export class ScrimsDataService {

  constructor(
    private matchLoaderService: MatchLoaderService,
    private playerStatsService: PlayerStatsService,
    private teamUtilsService: TeamUtilsService,
    private dateUtilsService: DateUtilsService,
    private http: HttpClient,
    private nhostService: NhostService
  ) {}

  // ======== NHOST-BASED METHODS (Games Page) ========

  /**
   * Fetch the full scrims index from Nhost, sorted by date_time_field DESC.
   * Uses paginated fetching to overcome server row limits.
   */
  getAllScrims(): Observable<Scrim[]> {
    return this.nhostService.getAllScrimsPaginated();
  }

  /**
   * Lazy-fetch player stats for a specific scrim by ID.
   */
  getScrimPlayerStatsByScrimId(scrimId: string): Observable<ScrimPlayerStats[]> {
    return this.nhostService.getScrimStats(scrimId);
  }

  // ======== HUGGINGFACE FILE-BASED METHODS (legacy) ========

  /**
   * Get a page of available scrim batch files from HuggingFace dataset
   * @param page 1-based page number
   * @param pageSize number of filenames per page
   */
  getScrimFiles(page = 1, pageSize = 10): Observable<{ files: string[]; hasMore: boolean }> {
    return this.matchLoaderService.loadScrimFilePage(page, pageSize).pipe(
      catchError((error) => {
        console.error('Error fetching scrim files page:', error);
        return of({ files: [], hasMore: false });
      }),
      shareReplay(1)
    );
  }

  /**
   * Map ScrimPlayerStats (from backend) to PlayerStats (frontend model)
   */
  private mapScrimPlayerStatsToPlayerStats(stats: any[]): PlayerStats[] {
    return this.playerStatsService.mapScrimPlayerStatsToPlayerStats(stats);
  }

  /**
   * Load a scrim table from a JSON object (from file, API, etc)
   */
  loadScrimTableFromJsonObject(json: any): MatchDayResults {
    return this.matchLoaderService.transformMatchJsonToMatchDayResults(json);
  }

  /**
   * Get aggregated leaderboard data for scrims from backend server
   */
  getScrimsLeaderboard(): Observable<ScrimLeaderboardData> {
    return this.http.get<ScrimLeaderboardData>('/leaderboard').pipe(
      catchError((error) => {
        console.error('Error fetching scrims leaderboard:', error);
        return of({
          players: [],
          totalScrims: 0,
          totalPlayers: 0,
          lastUpdated: new Date()
        });
      }),
      shareReplay(1)
    );
  }

  /**
   * Get detailed stats for a specific player (file-based stub)
   */
  getPlayerScrimHistory(playerId: string): Observable<PlayerStats[]> {
    return of([]);
  }

  /**
   * Get all stats for a specific scrim (file-based)
   */
  getScrimResults(scrimId: string): Observable<PlayerStats[]> {
    return this.matchLoaderService.loadMatch(scrimId).pipe(
      map(json => {
        const matchDayResults = this.loadScrimTableFromJsonObject(json);
        if (!matchDayResults) return [];
        const allPlayerStats: PlayerStats[] = [];
        Object.values(matchDayResults).forEach((teamResults: any) => {
          teamResults.forEach((team: any) => {
            if (Array.isArray(team.players)) {
              allPlayerStats.push(...team.players);
            }
          });
        });
        return allPlayerStats;
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Loads scrim match data using MatchLoaderService (from file)
   * @param matchId The filename of the scrim JSON file
   */
  getScrimMatchResults(matchId: string): Observable<MatchDayResults> {
    return this.matchLoaderService.loadMatch(matchId).pipe(
      map(json => this.loadScrimTableFromJsonObject(json)),
      catchError((error) => {
        console.error('Error loading scrim match data:', error);
        return of({} as MatchDayResults);
      })
    );
  }

  /**
   * Transform player stats to MatchDayResults with team tracking
   */
  private transformToMatchDayResultsWithTeams(playerStats: PlayerStats[], scrimSignups: any[], scrimId: number): MatchDayResults {
    return this.teamUtilsService.transformToMatchDayResultsWithTeams(playerStats, scrimSignups, scrimId);
  }

  /**
   * Transform ScrimPlayerStats to MatchDayResults format
   */
  private transformToMatchDayResults(playerStats: PlayerStats[], scrimId: number): MatchDayResults {
    return this.teamUtilsService.transformToMatchDayResults(playerStats, scrimId);
  }

  /**
   * Group players by actual teams using scrim signup data
   */
  private groupPlayersByActualTeams(playerStats: PlayerStats[], scrimSignups: any[]) {
    return this.teamUtilsService.groupPlayersByActualTeams(playerStats, scrimSignups);
  }

  /**
   * Group players by teams based on score (fallback when no team data available)
   */
  private groupPlayersByTeams(playerStats: PlayerStats[]) {
    return this.teamUtilsService.groupPlayersByTeams(playerStats);
  }

  /**
   * Get placement points based on standard BR scoring
   */
  private getPlacementPoints(placement: number): number {
    return this.teamUtilsService.getPlacementPoints(placement);
  }

  /**
   * Format scrim date for display
   */
  private formatScrimDate(dateString: string): string {
    return this.dateUtilsService.formatScrimDate(dateString);
  }

  /**
   * Extract maps from scrim data (placeholder)
   */
  private extractMapsFromScrim(scrim: any): string[] {
    if (scrim.skill) {
      return [`${scrim.skill} Level Match`];
    }
    if (scrim.discord_channel) {
      return [scrim.discord_channel];
    }
    if (scrim.id) {
      const maps = ['World\'s Edge', 'Kings Canyon', 'Olympus', 'Storm Point'];
      const randomMap = maps[parseInt(scrim.id) % maps.length];
      return [randomMap];
    }
    return [];
  }

  /**
   * Get team information for a player in a specific scrim (not supported with file-only data)
   */
  getPlayerTeamInScrim(playerId: string, scrimId: string): Observable<{
    teamName: string;
    teammates: any[];
    role: 'player' | 'captain';
  } | null> {
    return of(null);
  }

  /**
   * Get all teams for a specific scrim with player details (not supported with file-only data)
   */
  getScrimTeams(scrimId: string): Observable<{
    teamName: string;
    players: any[];
    captain: any;
    combinedElo?: number;
  }[]> {
    return of([]);
  }

  /**
   * Get player's team history across all scrims (not supported with file-only data)
   */
  getPlayerTeamHistory(playerId: string): Observable<{
    scrimId: string;
    teamName: string;
    date: string;
    role: 'player' | 'captain';
  }[]> {
    return of([]);
  }

  /**
   * Enhanced player stats with team information (not supported with file-only data)
   */
  getPlayerStatsWithTeams(playerId: string): Observable<{
    stats: PlayerStats[];
    teams: {
      scrimId: string;
      teamName: string;
      role: 'player' | 'captain';
    }[];
  }> {
    return of({ stats: [], teams: [] });
  }
}
