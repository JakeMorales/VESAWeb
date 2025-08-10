import { Injectable } from '@angular/core';
import { NhostClient } from '@nhost/nhost-js';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Define interfaces for our database tables
export interface Player {
  id: string;
  discord_id?: string;
  display_name?: string;
  elo?: number;
  overstat_id?: string;
}

export interface Scrim {
  id: string;
  active?: boolean;
  date_time_field?: string;
  discord_channel?: string;
  overstat_link?: string;
  skill?: string;
}

export interface ScrimPlayerStats {
  id: string;
  scrim_id: string;
  player_id: string;
  name?: string;
  kills?: number;
  damage_dealt?: number;
  damage_taken?: number;
  knockdowns?: number;
  assists?: number;
  revives_given?: number;
  respawns_given?: number;
  score?: number;
  survival_time?: number;
  games_played?: number;
  characters?: string;
  grenades_thrown?: number;
  tacticals_used?: number;
  ultimates_used?: number;
  // Relations
  player?: Player;
  scrim?: Scrim;
}

export interface ScrimSignup {
  id: string;
  scrim_id: string;
  date_time?: string;
  team_name: string;
  player_one_id?: string;
  player_two_id?: string;
  player_three_id?: string;
  signup_player_id: string;
  combined_elo?: number;
  created_at?: string;
  // Relations for populated data
  player_one?: Player;
  player_two?: Player;
  player_three?: Player;
  signup_player?: Player;
  scrim?: Scrim;
}

@Injectable({
  providedIn: 'root'
})
export class NhostService {
  private nhost: NhostClient;

  constructor() {
    this.nhost = new NhostClient({
      subdomain: 'bsgzgiiagytbnyqsvebl',
      region: 'us-east-1'
    });
  }

  /**
   * Get all players using pagination
   */
  getPlayers(): Observable<Player[]> {
    return this.getAllPlayersPaginated();
  }

  /**
   * Fetch all players using pagination to overcome server limits
   */
  private getAllPlayersPaginated(): Observable<Player[]> {
    const batchSize = 10; // Server limit appears to be 10
    const allPlayers: Player[] = [];

    const fetchBatch = (offset: number): Promise<Player[]> => {
      const query = `
        query GetPlayersBatch($offset: Int!, $limit: Int!) {
          players(offset: $offset, limit: $limit) {
            id
            discord_id
            display_name
            elo
            overstat_id
          }
        }
      `;

      return this.nhost.graphql.request(query, { offset, limit: batchSize }).then((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.players;
      });
    };

    const fetchAllBatches = async (): Promise<Player[]> => {
      let offset = 0;
      let hasMore = true;
      
      while (hasMore) {
        const batch = await fetchBatch(offset);
        allPlayers.push(...batch);
        
        // If we got fewer than batchSize, we've reached the end
        hasMore = batch.length === batchSize;
        offset += batchSize;
        
        // Safety check to prevent infinite loops
        if (offset > 3000) {
          console.warn('Stopped fetching players at offset 3000 to prevent infinite loop');
          break;
        }
      }
      
      console.log(`Fetched ${allPlayers.length} total players from database`);
      return allPlayers;
    };

    return from(fetchAllBatches()).pipe(
      catchError((error) => {
        console.error('Error fetching all players:', error);
        throw error;
      })
    );
  }

  /**
   * Get all scrims
   */
  getScrims(): Observable<Scrim[]> {
    const query = `
      query GetScrims {
        scrims {
          id
          active
          date_time_field
          discord_channel
          overstat_link
          skill
        }
      }
    `;

    return from(this.nhost.graphql.request(query)).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrims;
      }),
      catchError((error) => {
        console.error('Error fetching scrims:', error);
        throw error;
      })
    );
  }

  /**
   * Get all scrim player stats
   */
  getScrimPlayerStats(): Observable<ScrimPlayerStats[]> {
    const query = `
      query GetScrimPlayerStats {
        scrim_player_stats {
          id
          scrim_id
          player_id
          name
          kills
          damage_dealt
          damage_taken
          knockdowns
          assists
          revives_given
          respawns_given
          score
          survival_time
          games_played
          characters
          grenades_thrown
          tacticals_used
          ultimates_used
        }
      }
    `;

    return from(this.nhost.graphql.request(query)).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_player_stats;
      }),
      catchError((error) => {
        console.error('Error fetching scrim player stats:', error);
        throw error;
      })
    );
  }

  /**
   * Get scrim player stats with player and scrim details
   */
  getScrimPlayerStatsWithDetails(): Observable<ScrimPlayerStats[]> {
    // Query all scrim player stats without limit
    const query = `
      query GetScrimPlayerStatsWithDetails {
        scrim_player_stats {
          id
          scrim_id
          player_id
          name
          kills
          damage_dealt
          damage_taken
          knockdowns
          assists
          revives_given
          respawns_given
          score
          survival_time
          games_played
          characters
        }
      }
    `;

    return from(this.nhost.graphql.request(query)).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_player_stats;
      }),
      catchError((error) => {
        console.error('Error fetching scrim player stats with details:', error);
        throw error;
      })
    );
  }

  /**
   * Get stats for a specific scrim
   */
  getScrimStats(scrimId: string): Observable<ScrimPlayerStats[]> {
    const query = `
      query GetScrimStats($scrimId: uuid!) {
        scrim_player_stats(where: {scrim_id: {_eq: $scrimId}}) {
          id
          scrim_id
          player_id
          name
          kills
          damage_dealt
          damage_taken
          knockdowns
          assists
          revives_given
          respawns_given
          score
          survival_time
          games_played
          characters
          grenades_thrown
          tacticals_used
          ultimates_used
        }
      }
    `;

    return from(this.nhost.graphql.request(query, { scrimId })).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_player_stats;
      }),
      catchError((error) => {
        console.error('Error fetching scrim stats:', error);
        throw error;
      })
    );
  }

  /**
   * Get stats for a specific player
   */
  getPlayerStats(playerId: string): Observable<ScrimPlayerStats[]> {
    const query = `
      query GetPlayerStats($playerId: uuid!) {
        scrim_player_stats(where: {player_id: {_eq: $playerId}}) {
          id
          scrim_id
          player_id
          name
          kills
          damage_dealt
          damage_taken
          knockdowns
          assists
          revives_given
          respawns_given
          score
          survival_time
          games_played
          characters
          player {
            id
            discord_id
            display_name
            elo
          }
          scrim {
            id
            active
            date_time_field
            discord_channel
            overstat_link
            skill
          }
        }
      }
    `;

    return from(this.nhost.graphql.request(query, { playerId })).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_player_stats;
      }),
      catchError((error) => {
        console.error('Error fetching player stats:', error);
        throw error;
      })
    );
  }

  /**
   * Get aggregated player stats for leaderboards
   */
  getPlayerLeaderboardStats(): Observable<any[]> {
    const query = `
      query GetPlayerLeaderboardStats {
        scrim_player_stats_aggregate {
          nodes {
            player_id
            player {
              username
              display_name
            }
          }
        }
        scrim_player_stats(distinct_on: player_id) {
          player_id
          player {
            username
            display_name
          }
        }
      }
    `;

    return from(this.nhost.graphql.request(query)).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_player_stats;
      }),
      catchError((error) => {
        console.error('Error fetching player leaderboard stats:', error);
        throw error;
      })
    );
  }

  /**
   * Get all scrim signups (teams)
   */
  getScrimSignups(): Observable<ScrimSignup[]> {
    const query = `
      query GetScrimSignups {
        scrim_signups {
          id
          scrim_id
          date_time
          team_name
          player_one_id
          player_two_id
          player_three_id
          signup_player_id
          combined_elo
        }
      }
    `;

    return from(this.nhost.graphql.request(query)).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_signups;
      }),
      catchError((error) => {
        console.error('Error fetching scrim signups:', error);
        throw error;
      })
    );
  }

  /**
   * Get scrim signups for a specific scrim
   */
  getScrimSignupsByScrimId(scrimId: string): Observable<ScrimSignup[]> {
    const query = `
      query GetScrimSignupsByScrimId($scrimId: uuid!) {
        scrim_signups(where: { scrim_id: { _eq: $scrimId } }) {
          id
          scrim_id
          date_time
          team_name
          player_one_id
          player_two_id
          player_three_id
          signup_player_id
          combined_elo
        }
      }
    `;

    return from(this.nhost.graphql.request(query, { scrimId })).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_signups;
      }),
      catchError((error) => {
        console.error('Error fetching scrim signups for scrim:', error);
        throw error;
      })
    );
  }

  /**
   * Get teams that a specific player participated in
   */
  getPlayerTeams(playerId: string): Observable<ScrimSignup[]> {
    const query = `
      query GetPlayerTeams($playerId: uuid!) {
        scrim_signups(where: { 
          _or: [
            { player_one_id: { _eq: $playerId } },
            { player_two_id: { _eq: $playerId } },
            { player_three_id: { _eq: $playerId } },
            { signup_player_id: { _eq: $playerId } }
          ]
        }) {
          id
          scrim_id
          date_time
          team_name
          player_one_id
          player_two_id
          player_three_id
          signup_player_id
          combined_elo
        }
      }
    `;

    return from(this.nhost.graphql.request(query, { playerId })).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_signups;
      }),
      catchError((error) => {
        console.error('Error fetching player teams:', error);
        throw error;
      })
    );
  }

  /**
   * Get team composition for a specific scrim with player details
   */
  getScrimTeamsWithPlayers(scrimId: string): Observable<any[]> {
    const query = `
      query GetScrimTeamsWithPlayers($scrimId: uuid!) {
        scrim_signups(where: { scrim_id: { _eq: $scrimId } }) {
          id
          team_name
          date_time
          combined_elo
          player_one: playerByPlayerOneId {
            id
            display_name
            discord_id
            elo
            overstat_id
          }
          player_two: playerByPlayerTwoId {
            id
            display_name
            discord_id
            elo
            overstat_id
          }
          player_three: playerByPlayerThreeId {
            id
            display_name
            discord_id
            elo
            overstat_id
          }
          signup_player: playerBySignupPlayerId {
            id
            display_name
            discord_id
            elo
            overstat_id
          }
        }
      }
    `;

    return from(this.nhost.graphql.request(query, { scrimId })).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.scrim_signups;
      }),
      catchError((error) => {
        console.error('Error fetching scrim teams with players:', error);
        throw error;
      })
    );
  }
}
