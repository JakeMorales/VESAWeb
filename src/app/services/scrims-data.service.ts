import { NhostService } from './nhost.service';
import { ScrimsTableLoaderService } from './scrims-table-loader.service';
import { EloAggregationService } from './elo-aggregation.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamUtilsService } from './team-utils.service';
import { DateUtilsService } from './date-utils.service';
import { ScrimFileService } from './scrim-file.service';


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


@Injectable({
  providedIn: 'root'
})
export class ScrimsDataService {

  /**
   * Calculates the average ELO leakage per game across all scrims.
   * ELO leakage = sum of all rating gains minus all rating losses (should be close to zero if system is balanced).
   * Returns Observable<number> (average leakage per game).
   */

  /**
   * Calculates the actual average Elo gain and loss per game across all scrims.
   * Returns Observable<{ avgGain: number, avgLoss: number }>
   */
  getAvgEloGainLossPerGame(): Observable<{ avgGain: number, avgLoss: number }> {
    return this.eloAggregationService.getAvgEloGainLossPerGame(
      (json: any) => this.loadScrimTableFromJsonObject(json)
    );
  }

  getAvgEloLeakagePerGame(): Observable<number> {
    return this.eloAggregationService.getAvgEloLeakagePerGame(
      (json: any) => this.loadScrimTableFromJsonObject(json)
    );
  }

  /**
   * Calculates min, max, mean, and stdDev of performance scores for all players across all scrims.
   * Returns { min, max, mean, stdDev } (all numbers, or null if no data).
   */
  /**
   * Calculates min, max, mean, and stdDev of performance scores for all players across all scrims.
   * Returns Observable<{ min, max, mean, stdDev }> (all numbers, or null if no data).
   */
  getPerfScoreStats(): import('rxjs').Observable<{ min: number | null, max: number | null, mean: number | null, stdDev: number | null }> {
  const fileNames = this.scrimFileService.getAllScrimBatchFiles();
        const fileRequests = fileNames.map(name =>
          this.http.get<any>(`assets/scrims_batch/${name}`).pipe(catchError(() => of(null)))
        );
    return forkJoin(fileRequests).pipe(
      map(jsons => {
        const perfScores: number[] = [];
        jsons.forEach(json => {
          if (!json) return;
          const matchDay: MatchDayResults = this.loadScrimTableFromJsonObject(json);
          if (!matchDay) return;
          Object.values(matchDay).forEach((teamGameResults: any) => {
            if (!Array.isArray(teamGameResults)) return;
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                // Use the EloCalculatorService to calculate performance score
                const perf = this.eloCalculator.calculatePerformanceScore(
                  team.placement,
                  ps.kills || 0,
                  ps.assists || 0,
                  ps.damage || ps.damage_dealt || 0,
                  ps.revives || ps.revives_given || 0
                );
                perfScores.push(perf);
              });
            });
          });
        });
        if (!perfScores.length) {
          return { min: null, max: null, mean: null, stdDev: null };
        }
        const min = Math.min(...perfScores);
        const max = Math.max(...perfScores);
        const mean = perfScores.reduce((a, b) => a + b, 0) / perfScores.length;
        const variance = perfScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / perfScores.length;
        const stdDev = Math.sqrt(variance);
        return { min, max, mean, stdDev };
      })
    );
  }
  /**
   * Calculates the average percent of unrated opponents (opponents with rating 1500 or <18 games played)
   * for all players across all scrims. Unrated = estimatedElo === 1500 OR totalGames < 18.
   * Returns an Observable<number> (average percent, 0-100).
   */
  getAvgUnratedOpponentPct(): Observable<number> {
    // Use the aggregated player stats from scrim files
  return this.getAggregatedPlayerElosFromScrimFiles().pipe(
      map((players: PlayerAggregatedStats[]) => {
        if (!players || players.length === 0) return of(0);

        // Build a lookup for all players by id for quick access
        const playerMap = new Map<string, PlayerAggregatedStats>();
        players.forEach(p => playerMap.set(p.playerId, p));

        // For each player, find their opponents in each game and count unrated opponents
        // We'll need to re-parse the scrim files to get per-game opponents
        // (This is not super efficient, but works for this batch calculation)
  const fileNames = this.scrimFileService.getAllScrimBatchFiles();

        // We'll need HttpClient for this, but it's already injected
        // We'll use forkJoin to load all files again
        const fileRequests = fileNames.map(name =>
          this.http.get<any>(`assets/scrims_batch/${name}`).pipe(catchError(() => of(null)))
        );

        // Return an Observable<number> after all files are loaded
        return forkJoin(fileRequests).pipe(
          map(jsons => {
            let totalOpponentCount = 0;
            let totalUnratedOpponentCount = 0;

            jsons.forEach((json, fileIdx) => {
              if (!json) return;
              const matchDay: MatchDayResults = this.loadScrimTableFromJsonObject(json);
              if (!matchDay) return;
              Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
                if (!Array.isArray(teamGameResults)) return;
                // Collect all players in this game
                const allPlayers = teamGameResults.flatMap((team: any) => team.players.map((ps: any) => {
                  const rawName = ps.playerName || ps.name || '';
                  return rawName.trim().toLowerCase();
                }));
                // For each team, for each player, count unrated opponents
                teamGameResults.forEach((team: any) => {
                  team.players.forEach((ps: any) => {
                    const playerId = (ps.playerName || ps.name || '').trim().toLowerCase();
                    // Opponents = all players not on this team
                    const opponents = allPlayers.filter(id => !team.players.some((p: any) => (p.playerName || p.name || '').trim().toLowerCase() === id));
                    opponents.forEach(oppId => {
                      totalOpponentCount++;
                      const oppStats = playerMap.get(oppId);
                      if (!oppStats || oppStats.estimatedElo === 1500 || oppStats.totalGames < 18) {
                        totalUnratedOpponentCount++;
                      }
                    });
                  });
                });
              });
            });
            if (totalOpponentCount === 0) return 0;
            return (totalUnratedOpponentCount / totalOpponentCount) * 100;
          }),
          // Always return Observable<number>
          // If totalOpponentCount === 0, return of(0)
          mergeMap(val => typeof val === 'number' ? of(val) : val)
        );
      }),
      // Flatten the nested Observable<number> to Observable<number>
      // (switchMap is not imported, so use mergeMap)
      // Import mergeMap at the top if not present
      // @ts-ignore
      mergeMap((obs: Observable<number>) => obs)
    );
  }
  constructor(
    private nhostService: NhostService,
    private scrimsTableLoader: ScrimsTableLoaderService,
    private http: HttpClient,
    private eloCalculator: EloCalculatorService,
    private eloAggregationService: EloAggregationService,
    private playerStatsService: PlayerStatsService,
    private teamUtilsService: TeamUtilsService,
    private dateUtilsService: DateUtilsService,
    private scrimFileService: ScrimFileService
  ) {}
  /**
   * Map ScrimPlayerStats (from backend) to PlayerStats (frontend model)
   */
  private mapScrimPlayerStatsToPlayerStats(stats: any[]): PlayerStats[] {
    return this.playerStatsService.mapScrimPlayerStatsToPlayerStats(stats);
  }

  /**
   * Loads all scrim batch JSON files from assets, aggregates ELOs for each player,
   * and returns those with >= 18 games played.
   */
  getAggregatedPlayerElosFromScrimFiles(): Observable<PlayerAggregatedStats[]> {
    return this.eloAggregationService.getAggregatedPlayerElosFromScrimFiles(
      (json: any) => this.loadScrimTableFromJsonObject(json)
    );
  }

  /**
   * Load a scrim table from a JSON object (from file, API, etc)
   */
  loadScrimTableFromJsonObject(json: any): MatchDayResults {
    return this.scrimsTableLoader.transformScrimJson(json);
  }

  /**
   * Get aggregated leaderboard data for scrims
   */
  getScrimsLeaderboard(): Observable<ScrimLeaderboardData> {
    return forkJoin({
      playerStats: this.nhostService.getScrimPlayerStatsWithDetails(),
      players: this.nhostService.getPlayers(),
      scrims: this.nhostService.getScrims()
    }).pipe(
      map(({ playerStats, players, scrims }) => {
        // Create a player lookup map
        const playerLookup = new Map<string, string>();
        players.forEach(player => {
          playerLookup.set(player.id, player.display_name || `Player ${player.id.slice(0, 8)}`);
        });

        // Enhance player stats with real player names
        const enhancedPlayerStats = playerStats.map(stat => ({
          ...stat,
          enhancedPlayerName: playerLookup.get(stat.player_id) || stat.name || 'Unknown Player'
        }));

  // Map enhancedPlayerStats to PlayerStats before aggregation
  const mappedPlayerStats = this.mapScrimPlayerStatsToPlayerStats(enhancedPlayerStats);
  const aggregatedData = this.aggregatePlayerStats(mappedPlayerStats);
        // Use PlayerAggregatedStats directly for leaderboard
        return {
          players: aggregatedData,
          totalScrims: scrims.length,
          totalPlayers: players.length,
          lastUpdated: new Date()
        };
      }),
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
   * Get detailed stats for a specific player
   */

  getPlayerScrimHistory(playerId: string): Observable<PlayerStats[]> {
    return this.nhostService.getPlayerStats(playerId).pipe(
      map(stats => this.mapScrimPlayerStatsToPlayerStats(stats))
    );
  }

  /**
   * Get all stats for a specific scrim
   */

  getScrimResults(scrimId: string): Observable<PlayerStats[]> {
    return this.nhostService.getScrimStats(scrimId).pipe(
      map(stats => this.mapScrimPlayerStatsToPlayerStats(stats))
    );
  }

  /**
   * Aggregate player stats from individual scrim performances
   */
  private aggregatePlayerStats(playerStats: PlayerStats[]): PlayerAggregatedStats[] {
    return this.playerStatsService.aggregatePlayerStats(playerStats);
  }

  /**
   * Transform aggregated player stats to ScrimPlayer format for the leaderboard
   */
  // private transformToScrimPlayers removed: ScrimPlayer type does not exist. Use PlayerAggregatedStats directly for leaderboard.

  /**
   * Calculate badges based on player performance
   */
  private calculateBadges(stats: PlayerAggregatedStats): string[] {
    return this.playerStatsService.calculateBadges(stats);
  }

  /**
   * Calculate estimated ELO based on performance metrics
   */
  private calculateEstimatedElo(avgPlacement: number, avgKills: number, avgDamage: number, winRate: number): number {
    return this.playerStatsService.calculateEstimatedElo(avgPlacement, avgKills, avgDamage, winRate);
  }

  /**
   * Create empty player stats structure
   */
  private createEmptyPlayerStats(playerId: string, playerName: string, displayName?: string): PlayerAggregatedStats {
    return this.playerStatsService.createEmptyPlayerStats(playerId, playerName, displayName);
  }

  // ======== SCRIMS HISTORY METHODS (for Games Page) ========



  /**
   * Get match day results for a specific scrim session
   */
  getScrimMatchResults(scrimId: number): Observable<MatchDayResults> {
    return forkJoin({
      playerStats: this.nhostService.getScrimStats(scrimId.toString()),
      players: this.nhostService.getPlayers(),
      scrimSignups: this.nhostService.getScrimSignupsByScrimId(scrimId.toString())
    }).pipe(
      map(({ playerStats, players, scrimSignups }) => {
        // Create a player lookup map
        const playerLookup = new Map<string, string>();
        players.forEach(player => {
          playerLookup.set(player.id, player.display_name || `Player ${player.id.slice(0, 8)}`);
        });

        // Enhance player stats with real player names
        const enhancedPlayerStats = playerStats.map(stat => ({
          ...stat,
          enhancedPlayerName: playerLookup.get(stat.player_id) || stat.name || 'Unknown Player'
        }));

  // Team transformation not supported for PlayerStats-only data
  return {} as MatchDayResults;
      }),
      catchError((error) => {
        console.error('Error fetching scrim match results:', error);
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
   * Extract maps from scrim data (placeholder for now)
   */
  private extractMapsFromScrim(scrim: any): string[] {
    // Check if we have any map info in the available fields
    if (scrim.skill) {
      // Use skill level as a placeholder map indicator
      return [`${scrim.skill} Level Match`];
    }
    if (scrim.discord_channel) {
      // Use discord channel as map indicator if available
      return [scrim.discord_channel];
    }
    if (scrim.id) {
      // Generate varied placeholder maps for now
      const maps = ['World\'s Edge', 'Kings Canyon', 'Olympus', 'Storm Point'];
      const randomMap = maps[parseInt(scrim.id) % maps.length];
      return [randomMap];
    }
    // Fallback: return empty array if no map info is available
    return [];
  }

  /**
   * Get team information for a player in a specific scrim
   */
  getPlayerTeamInScrim(playerId: string, scrimId: string): Observable<{
    teamName: string;
  teammates: any[];
    role: 'player' | 'captain';
  } | null> {
    return this.nhostService.getScrimSignupsByScrimId(scrimId).pipe(
      map(signups => {
        for (const signup of signups) {
          // Check if player is on this team
          const isPlayerOne = signup.player_one_id === playerId;
          const isPlayerTwo = signup.player_two_id === playerId;
          const isPlayerThree = signup.player_three_id === playerId;
          const isCaptain = signup.signup_player_id === playerId;

          if (isPlayerOne || isPlayerTwo || isPlayerThree || isCaptain) {
            // This is the player's team - we need to get teammate details
            // For now, return basic info (you'd need to join with players table for full details)
            return {
              teamName: signup.team_name,
              teammates: [] as any[], // Would need additional query to populate
              role: (isCaptain ? 'captain' : 'player') as 'player' | 'captain'
            };
          }
        }
        return null; // Player not found in this scrim
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Get all teams for a specific scrim with player details
   */
  getScrimTeams(scrimId: string): Observable<{
    teamName: string;
  players: any[];
  captain: any;
    combinedElo?: number;
  }[]> {
    console.log('getScrimTeams called with scrimId:', scrimId, 'Type:', typeof scrimId);
    
    // First try the advanced method with populated players
    return this.nhostService.getScrimTeamsWithPlayers(scrimId).pipe(
      map(teams => {
        console.log('getScrimTeamsWithPlayers returned:', teams);
        if (teams && teams.length > 0) {
          return teams.map(team => ({
            teamName: team.team_name,
            players: [team.player_one, team.player_two, team.player_three].filter(p => p),
            captain: team.signup_player,
            combinedElo: team.combined_elo
          }));
        }
        throw new Error('No teams returned from getScrimTeamsWithPlayers');
      }),
      catchError(error => {
        console.error('Error with getScrimTeamsWithPlayers, trying fallback:', error);
        
        // Fallback: Use the simpler method and manually populate player data
        return this.getScrimTeamsFallback(scrimId);
      })
    );
  }

  /**
   * Fallback method to get scrim teams using basic signup data
   */
  private getScrimTeamsFallback(scrimId: string): Observable<{
    teamName: string;
  players: any[];
  captain: any;
    combinedElo?: number;
  }[]> {
    console.log('Using fallback method for scrim teams:', scrimId);
    
    return forkJoin({
      signups: this.nhostService.getScrimSignupsByScrimId(scrimId),
      players: this.nhostService.getPlayers()
    }).pipe(
      map(({ signups, players }: { signups: any[]; players: any[] }) => {
        console.log('Fallback data - signups:', signups.length, 'players:', players.length);
        // Create player lookup map
        const playerMap = new Map<string, any>();
        players.forEach(player => {
          playerMap.set(player.id, player);
        });
        // Convert signups to team format
        return signups.map((signup: any) => {
          const teamPlayers: any[] = [];
          const captain = playerMap.get(signup.signup_player_id);
          // Add team members
          if (signup.player_one_id && playerMap.has(signup.player_one_id)) {
            teamPlayers.push(playerMap.get(signup.player_one_id)!);
          }
          if (signup.player_two_id && playerMap.has(signup.player_two_id)) {
            teamPlayers.push(playerMap.get(signup.player_two_id)!);
          }
          if (signup.player_three_id && playerMap.has(signup.player_three_id)) {
            teamPlayers.push(playerMap.get(signup.player_three_id)!);
          }
          // Add captain if not already in team
          if (captain && !teamPlayers.find(p => p.id === captain.id)) {
            teamPlayers.push(captain);
          }
          return {
            teamName: signup.team_name,
            players: teamPlayers,
            captain: captain || { id: '', display_name: 'Unknown Captain' } as any,
            combinedElo: signup.combined_elo
          };
        });
      }),
      catchError(error => {
        console.error('Error in fallback method:', error);
        return of([]);
      })
    );
  }

  /**
   * Get player's team history across all scrims
   */
  getPlayerTeamHistory(playerId: string): Observable<{
    scrimId: string;
    teamName: string;
    date: string;
    role: 'player' | 'captain';
  }[]> {
    return this.nhostService.getPlayerTeams(playerId).pipe(
      map(teams => teams.map(team => ({
        scrimId: team.scrim_id,
        teamName: team.team_name,
        date: team.date_time || team.created_at || new Date().toISOString(),
        role: (team.signup_player_id === playerId ? 'captain' : 'player') as 'player' | 'captain'
      }))),
      catchError(error => {
        console.error('Error fetching player team history:', error);
        return of([]);
      })
    );
  }

  /**
   * Enhanced player stats with team information
   */
  getPlayerStatsWithTeams(playerId: string): Observable<{
  stats: PlayerStats[];
    teams: {
      scrimId: string;
      teamName: string;
      role: 'player' | 'captain';
    }[];
  }> {
    return forkJoin({
      stats: this.nhostService.getPlayerStats(playerId),
      teams: this.getPlayerTeamHistory(playerId)
    }).pipe(
      map(({ stats, teams }) => ({
        stats: this.mapScrimPlayerStatsToPlayerStats(stats),
        teams
      }))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';
import { EloCalculatorService } from './elo-calculator.service';
import { MatchDayResults } from '../models/match-day-results.model';

export interface PlayerStats {
  playerName: string;
  kills: number;
  damage: number;
  downs: number;
  headshots?: number;
  assists?: number;
  shots?: number;
  hits?: number;
  revives: number;
  respawns: number;
}

