import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { NhostService, ScrimPlayerStats, Player, Scrim, ScrimSignup } from './nhost.service';
import { ScrimPlayer } from '../components/scrims-leaderboard/scrims-leaderboard.component';
// import { ScrimSession } from '../components/games/scrim-session.component';
import { MatchDayResults, TeamGameResult, PlayerStats } from '../models/match-day-results.model';
import { ScrimsTableLoaderService } from './scrims-table-loader.service';

export interface ScrimLeaderboardData {
  players: ScrimPlayer[];
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
}

interface EnhancedScrimPlayerStats extends ScrimPlayerStats {
  enhancedPlayerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScrimsDataService {
  constructor(
    private nhostService: NhostService,
    private scrimsTableLoader: ScrimsTableLoaderService
  ) {}

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

        const aggregatedData = this.aggregatePlayerStats(enhancedPlayerStats);
        const leaderboardPlayers = this.transformToScrimPlayers(aggregatedData);
        
        return {
          players: leaderboardPlayers,
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
  getPlayerScrimHistory(playerId: string): Observable<ScrimPlayerStats[]> {
    return this.nhostService.getPlayerStats(playerId);
  }

  /**
   * Get all stats for a specific scrim
   */
  getScrimResults(scrimId: string): Observable<ScrimPlayerStats[]> {
    return this.nhostService.getScrimStats(scrimId);
  }

  /**
   * Aggregate player stats from individual scrim performances
   */
  private aggregatePlayerStats(playerStats: EnhancedScrimPlayerStats[]): PlayerAggregatedStats[] {
    const playerMap = new Map<string, {
      playerId: string;
      playerName: string;
      displayName?: string;
      games: EnhancedScrimPlayerStats[];
    }>();

    // Group stats by player
    playerStats.forEach(stat => {
      if (!playerMap.has(stat.player_id)) {
        playerMap.set(stat.player_id, {
          playerId: stat.player_id,
          playerName: stat.enhancedPlayerName || stat.name || 'Unknown Player',
          displayName: stat.enhancedPlayerName || stat.name,
          games: []
        });
      }
      playerMap.get(stat.player_id)!.games.push(stat);
    });

    // Calculate aggregated stats for each player
    return Array.from(playerMap.values()).map(playerData => {
      const games = playerData.games;
      const totalGames = games.length;
      
      if (totalGames === 0) {
        return this.createEmptyPlayerStats(playerData.playerId, playerData.playerName, playerData.displayName);
      }

      const totalKills = games.reduce((sum, game) => sum + (game.kills || 0), 0);
      const totalDamage = games.reduce((sum, game) => sum + (game.damage_dealt || 0), 0);
      const totalRevives = games.reduce((sum, game) => sum + (game.revives_given || 0), 0);
      const totalRespawns = games.reduce((sum, game) => sum + (game.respawns_given || 0), 0);
      const totalPoints = games.reduce((sum, game) => sum + (game.score || 0), 0);
      
      const averageKills = totalKills / totalGames;
      const averageDamage = totalDamage / totalGames;
      
      // Since there's no placement field, we'll estimate based on score
      // Higher score = better placement (lower number)
      const averageScore = totalPoints / totalGames;
      // Estimate placement based on score (this is a rough approximation)
      const averagePlacement = Math.max(1, Math.min(20, 21 - (averageScore / 10)));
      
      // Calculate win rate based on top scores (rough approximation)
      const topScores = games.filter(game => (game.score || 0) > averageScore * 1.5).length;
      const winRate = (topScores / totalGames) * 100;
      
      // Calculate top 3 rate based on score performance
      const goodScores = games.filter(game => (game.score || 0) > averageScore).length;
      const topThreeRate = (goodScores / totalGames) * 100;
      
      // Estimate ELO based on performance metrics
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
   * Transform aggregated player stats to ScrimPlayer format for the leaderboard
   */
  private transformToScrimPlayers(aggregatedStats: PlayerAggregatedStats[]): ScrimPlayer[] {
    // Sort by estimated ELO descending
    const sortedStats = aggregatedStats.sort((a, b) => b.estimatedElo - a.estimatedElo);
    
    return sortedStats.map((stats, index) => ({
      rank: index + 1,
      name: stats.displayName || stats.playerName,
      elo: stats.estimatedElo,
      eloChange: 0, // TODO: Calculate based on recent performance
      gamesPlayed: stats.totalGames,
      totalKills: stats.totalKills,
      averageKills: stats.averageKills,
      averageDamage: stats.averageDamage,
      winRate: stats.winRate,
      isLeaguePlayer: false, // TODO: Determine based on player data
      division: undefined, // TODO: Map if player is in league
      divisionRank: undefined,
      badges: this.calculateBadges(stats)
    }));
  }

  /**
   * Calculate badges based on player performance
   */
  private calculateBadges(stats: PlayerAggregatedStats): string[] {
    const badges: string[] = [];

    // Performance-based badges
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

    // Limit to 3 most relevant badges
    return badges.slice(0, 3);
  }

  /**
   * Calculate estimated ELO based on performance metrics
   */
  private calculateEstimatedElo(avgPlacement: number, avgKills: number, avgDamage: number, winRate: number): number {
    // Base ELO
    let elo = 1500;
    
    // Placement factor (lower placement = higher ELO)
    const placementFactor = (21 - avgPlacement) * 15;
    elo += placementFactor;
    
    // Kills factor
    const killsFactor = avgKills * 25;
    elo += killsFactor;
    
    // Damage factor (normalized)
    const damageFactor = (avgDamage / 100) * 2;
    elo += damageFactor;
    
    // Win rate factor
    const winRateFactor = winRate * 10;
    elo += winRateFactor;
    
    // Ensure ELO is within reasonable bounds
    return Math.max(800, Math.min(3000, elo));
  }

  /**
   * Create empty player stats structure
   */
  private createEmptyPlayerStats(playerId: string, playerName: string, displayName?: string): PlayerAggregatedStats {
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

        return this.transformToMatchDayResultsWithTeams(enhancedPlayerStats, scrimSignups, scrimId);
      }),
      catchError((error) => {
        console.error('Error fetching scrim match results:', error);
        return of({});
      })
    );
  }

  /**
   * Transform player stats to MatchDayResults with team tracking
   */
  private transformToMatchDayResultsWithTeams(
    playerStats: EnhancedScrimPlayerStats[], 
    scrimSignups: ScrimSignup[], 
    scrimId: number
  ): MatchDayResults {
    if (!playerStats || playerStats.length === 0) {
      return {};
    }

    console.log('Transforming match results with teams:', { playerStats, scrimSignups });

    // Group players by teams using scrim signup data
    const teams = this.groupPlayersByActualTeams(playerStats, scrimSignups);
    
    const teamResults: TeamGameResult[] = teams.map((team, index) => ({
      gameNumber: 1, // Scrims are typically single games
      teamName: team.teamName,
      placement: team.placement,
      teamKills: team.totalKills,
      placementPoints: this.getPlacementPoints(team.placement),
      totalPoints: this.getPlacementPoints(team.placement) + Math.floor(team.totalKills / 3), // Kill points
      mapName: 'Scrim Map', // TODO: Extract from scrim data if available
      players: team.players.map(player => ({
        playerName: player.enhancedPlayerName || player.name || 'Unknown',
        kills: player.kills || 0,
        damage: player.damage_dealt || 0,
        downs: player.knockdowns || 0,
        revives: player.revives_given || 0,
        respawns: player.respawns_given || 0
      })),
      isExpanded: false
    }));

    return {
      1: teamResults // Single game
    };
  }



  /**
   * Transform ScrimPlayerStats to MatchDayResults format
   */
  private transformToMatchDayResults(playerStats: EnhancedScrimPlayerStats[], scrimId: number): MatchDayResults {
    if (!playerStats || playerStats.length === 0) {
      return {};
    }

    // For scrims, we'll treat each scrim as a single "game"
    // Group players by their team/placement and create team results
    const teams = this.groupPlayersByTeams(playerStats);
    
    const teamResults: TeamGameResult[] = teams.map((team, index) => ({
      gameNumber: 1, // Scrims are typically single games
      teamName: team.teamName,
      placement: team.placement,
      teamKills: team.totalKills,
      placementPoints: this.getPlacementPoints(team.placement),
      totalPoints: this.getPlacementPoints(team.placement) + Math.floor(team.totalKills / 3), // Kill points
      mapName: 'Scrim Map', // TODO: Extract from scrim data if available
      players: team.players.map(player => ({
        playerName: player.enhancedPlayerName || player.name || 'Unknown',
        kills: player.kills || 0,
        damage: player.damage_dealt || 0,
        downs: player.knockdowns || 0,
        revives: player.revives_given || 0,
        respawns: player.respawns_given || 0
      })),
      isExpanded: false
    }));

    return {
      1: teamResults // Single game
    };
  }

  /**
   * Group players by actual teams using scrim signup data
   */
  private groupPlayersByActualTeams(
    playerStats: EnhancedScrimPlayerStats[], 
    scrimSignups: ScrimSignup[]
  ): Array<{
    teamName: string;
    placement: number;
    totalKills: number;
    players: EnhancedScrimPlayerStats[];
  }> {
    console.log('Grouping players by actual teams...', { playerStats, scrimSignups });

    if (!scrimSignups || scrimSignups.length === 0) {
      console.log('No scrim signups found, falling back to individual players');
      return this.groupPlayersByTeams(playerStats);
    }

    // Create a map of player ID to team
    const playerTeamMap = new Map<string, ScrimSignup>();
    
    scrimSignups.forEach(signup => {
      // Each signup represents a team with multiple players
      if (signup.signup_player_id) playerTeamMap.set(signup.signup_player_id, signup);
      if (signup.player_one_id) playerTeamMap.set(signup.player_one_id, signup);
      if (signup.player_two_id) playerTeamMap.set(signup.player_two_id, signup);
      if (signup.player_three_id) playerTeamMap.set(signup.player_three_id, signup);
    });

    // Group player stats by team
    const teamGroups = new Map<string, {
      signup: ScrimSignup;
      players: EnhancedScrimPlayerStats[];
    }>();

    playerStats.forEach(stat => {
      const teamSignup = playerTeamMap.get(stat.player_id);
      if (teamSignup) {
        const teamKey = `${teamSignup.team_name}_${teamSignup.id}`;
        if (!teamGroups.has(teamKey)) {
          teamGroups.set(teamKey, {
            signup: teamSignup,
            players: []
          });
        }
        teamGroups.get(teamKey)!.players.push(stat);
      } else {
        // Player not in any team, create individual "team"
        const individualTeamKey = `Individual_${stat.player_id}`;
        teamGroups.set(individualTeamKey, {
          signup: {
            id: '',
            team_name: stat.enhancedPlayerName || 'Unknown Player',
            signup_player_id: stat.player_id,
            player_one_id: undefined,
            player_two_id: undefined,
            player_three_id: undefined,
            scrim_id: '',
            created_at: new Date().toISOString()
          },
          players: [stat]
        });
      }
    });

    // Convert to expected format and calculate team stats
    const teams = Array.from(teamGroups.values()).map(group => {
      const totalKills = group.players.reduce((sum, player) => sum + (player.kills || 0), 0);
      const avgScore = group.players.reduce((sum, player) => sum + (player.score || 0), 0) / group.players.length;
      
      return {
        teamName: group.signup.team_name || 'Unknown Team',
        placement: 1, // Will be calculated based on team performance
        totalKills,
        avgScore,
        players: group.players
      };
    });

    // Sort teams by average score and assign placements
    teams.sort((a, b) => b.avgScore - a.avgScore);
    teams.forEach((team, index) => {
      team.placement = index + 1;
    });

    console.log('Grouped teams:', teams);
    return teams;
  }

  /**
   * Group players by teams based on score (fallback when no team data available)
   */
  private groupPlayersByTeams(playerStats: EnhancedScrimPlayerStats[]): Array<{
    teamName: string;
    placement: number;
    totalKills: number;
    players: EnhancedScrimPlayerStats[];
  }> {
    // For now, treat each player as their own "team" since we don't have team grouping
    // Sort by score instead of placement since placement field doesn't exist
    
    return playerStats
      .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by score descending
      .map((player, index) => ({
        teamName: player.enhancedPlayerName || player.name || `Player ${index + 1}`,
        placement: index + 1, // Use rank based on score as placement
        totalKills: player.kills || 0,
        players: [player]
      }));
  }

  /**
   * Get placement points based on standard BR scoring
   */
  private getPlacementPoints(placement: number): number {
    const points: { [key: number]: number } = {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
    };
    return points[placement] || 0;
  }

  /**
   * Format scrim date for display
   */
  private formatScrimDate(dateString: string): string {
    if (!dateString) {
      return 'Unknown Date';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown Date';
    }
  }

  /**
   * Format scrim time for display
   */
  private formatScrimTime(dateString: string): string {
    if (!dateString) {
      return '8:00 PM';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '8:00 PM';
      }
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '8:00 PM';
    }
  }

  /**
   * Extract maps from scrim data (placeholder for now)
   */
  private extractMapsFromScrim(scrim: Scrim): string[] {
    // Check if we have any map info in the available fields
    if (scrim.skill) {
      // Use skill level as a placeholder map indicator
      return [`${scrim.skill} Level Match`];
    }
    
    if (scrim.discord_channel) {
      // Use discord channel as map indicator if available
      return [scrim.discord_channel];
    }
    
    // Generate varied placeholder maps for now
    const maps = ['World\'s Edge', 'Kings Canyon', 'Olympus', 'Storm Point'];
    const randomMap = maps[parseInt(scrim.id) % maps.length];
    return [randomMap];
  }

  /**
   * Get team information for a player in a specific scrim
   */
  getPlayerTeamInScrim(playerId: string, scrimId: string): Observable<{
    teamName: string;
    teammates: Player[];
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
              teammates: [] as Player[], // Would need additional query to populate
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
    players: Player[];
    captain: Player;
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
    players: Player[];
    captain: Player;
    combinedElo?: number;
  }[]> {
    console.log('Using fallback method for scrim teams:', scrimId);
    
    return forkJoin({
      signups: this.nhostService.getScrimSignupsByScrimId(scrimId),
      players: this.nhostService.getPlayers()
    }).pipe(
      map(({ signups, players }) => {
        console.log('Fallback data - signups:', signups.length, 'players:', players.length);
        
        // Create player lookup map
        const playerMap = new Map<string, Player>();
        players.forEach(player => {
          playerMap.set(player.id, player);
        });
        
        // Convert signups to team format
        return signups.map(signup => {
          const teamPlayers: Player[] = [];
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
            captain: captain || { id: '', display_name: 'Unknown Captain' } as Player,
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
    stats: ScrimPlayerStats[];
    teams: {
      scrimId: string;
      teamName: string;
      role: 'player' | 'captain';
    }[];
  }> {
    return forkJoin({
      stats: this.nhostService.getPlayerStats(playerId),
      teams: this.getPlayerTeamHistory(playerId)
    });
  }
}
