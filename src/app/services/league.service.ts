import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { MatchLoaderService } from './match-loader.service';
import { getApexMapDisplayName, APEX_MAP_NAMES } from '../models/apex-map-names';

export interface LeagueMatch {
  game: number;
  teams: LeagueTeam[];
}

export interface LeagueTeam {
  name?: string;
  player_stats: PlayerStats[];
  overall_stats?: TeamStats;
}

export interface PlayerStats {
  playerId?: string | number;
  playerName: string;
  teamName?: string;        // player's team name from the data
  kills: number;
  assists: number;
  damageDealt: number;
  revivesGiven?: number;
  revives?: number;
}

export interface TeamStats {
    teamPlacement: number;
    name?: string;          // matches overall_stats.name in the data
    teamName?: string;      // legacy support
}

export interface StandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  points: number;
}

export interface MatchPointChampion {
  teamId: number;
  teamName: string;
  players: string[];
}

export interface DivisionSummary {
  season: string;
  division: string;
  generatedAt: string;
  seasonStandings: StandingEntry[];
  matchPointFinalsStandings: StandingEntry[];
  matchPointChampion: MatchPointChampion | null;
}

export interface LeagueMatchDay {
  season: string;
  division: string;
  week: string | number;
  isPlayoffs: boolean;
  stats: {
    games: Array<{
      game: number;
      mapName?: string;
      teams: Array<{
        name?: string;
        player_stats: Array<{
          playerId?: string | number;
          name?: string;
          playerName?: string;
          player_name?: string;
          teamName?: string;
          kills: number;
          assists: number;
          damageDealt: number;
          damage_dealt?: number;
          revivesGiven?: number;
          revives_given?: number;
          revives?: number;
        }>;
        overall_stats?: {
          teamPlacement: number;
          name?: string;
          teamName?: string;
        };
      }>;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private seasonsCache$?: Observable<string[]>;
  private divisionsCache = new Map<string, Observable<string[]>>();
  private matchFilesCache = new Map<string, Observable<string[]>>();
  private summaryCache = new Map<string, Observable<DivisionSummary | null>>();

  constructor(
    private http: HttpClient,
    private matchLoaderService: MatchLoaderService
  ) {}

  getSeasons(): Observable<string[]> {
    if (!this.seasonsCache$) {
      this.seasonsCache$ = this.matchLoaderService.loadLeagueSeasons().pipe(
        catchError(err => {
          console.error('Error loading league seasons from HuggingFace:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.seasonsCache$;
  }

  getDivisions(season: string): Observable<string[]> {
    if (!this.divisionsCache.has(season)) {
      const divisions$ = this.matchLoaderService.loadLeagueDivisions(season).pipe(
        catchError(err => {
          console.error(`Error loading divisions for ${season}:`, err);
          return of([]);
        }),
        shareReplay(1)
      );
      this.divisionsCache.set(season, divisions$);
    }
    return this.divisionsCache.get(season)!;
  }

  getMatchFiles(season: string, division: string): Observable<string[]> {
    const key = `${season}_${division}`;
    if (!this.matchFilesCache.has(key)) {
      const files$ = this.matchLoaderService.loadLeagueMatchFiles(season, division).pipe(
        catchError(err => {
          console.error(`Error loading match files for ${season} Division ${division}:`, err);
          return of([]);
        }),
        shareReplay(1)
      );
      this.matchFilesCache.set(key, files$);
    }
    return this.matchFilesCache.get(key)!;
  }

  getDivisionSummary(season: string, division: string): Observable<DivisionSummary | null> {
    const key = `${season}_${division}`;
    if (!this.summaryCache.has(key)) {
      const summary$ = this.matchLoaderService.loadLeagueDivisionSummary(season, division).pipe(
        map((raw: any) => raw ? this.normalizeSummary(raw) : null),
        catchError(() => of(null)),
        shareReplay(1)
      );
      this.summaryCache.set(key, summary$);
    }
    return this.summaryCache.get(key)!;
  }

  private normalizeSummary(raw: any): DivisionSummary {
    const normalize = (name: string) => this.matchLoaderService.normalizeTeamName(name);
    return {
      season: raw.season,
      division: raw.division,
      generatedAt: raw.generatedAt,
      seasonStandings: (raw.seasonStandings || []).map((e: any) => ({
        ...e,
        teamName: normalize(e.teamName)
      })),
      matchPointFinalsStandings: (raw.matchPointFinalsStandings || []).map((e: any) => ({
        ...e,
        teamName: normalize(e.teamName)
      })),
      matchPointChampion: raw.matchPointChampion ? {
        ...raw.matchPointChampion,
        teamName: normalize(raw.matchPointChampion.teamName)
      } : null
    };
  }

  getMatchDay(season: string, division: string, filename: string): Observable<LeagueMatchDay | null> {
    return this.matchLoaderService.loadLeagueMatch(season, division, filename).pipe(
      map(data => this.transformToLeagueMatchDay(data, season, division, filename)),
      catchError(err => {
        console.error(`Error loading match day ${filename}:`, err);
        return of(null);
      })
    );
  }

  private transformToLeagueMatchDay(data: any, season: string, division: string, filename: string): LeagueMatchDay {
    const statsObj = data?.stats ?? data;
    const weekMatch = filename.match(/Week_(\d+)|Playoffs_(\d+)|Finals/i);
    const week = weekMatch ? weekMatch[0] : filename.replace('.json', '');
    const isPlayoffs = week.toLowerCase().includes('playoffs') || week.toLowerCase().includes('finals');

    return {
      season,
      division,
      week,
      isPlayoffs,
      stats: {
        games: (statsObj?.games || []).map((game: any, i: number) => ({
          game: game.game ?? i + 1,
          mapName: game.map_name ? getApexMapDisplayName(game.map_name) : (() => {
            // If the game is missing an explicit map_name, try to infer from the filename
            // by checking for any known internal map keys contained in the filename.
            const lowerFile = filename.toLowerCase();
            for (const key of Object.keys(APEX_MAP_NAMES)) {
              if (lowerFile.includes(key.toLowerCase())) return APEX_MAP_NAMES[key];
            }
            return undefined;
          })(),
          teams: (game.teams || []).map((team: any) => {
            const teamName = this.matchLoaderService.normalizeTeamName(
              team.name || team.overall_stats?.name || ''
            );
            return {
              name: teamName,
              player_stats: (team.player_stats || team.players || []).map((player: any) => ({
                playerId: player.playerId?.toString() || player.player_id?.toString(),
                name: player.name,
                playerName: player.name || player.playerName || player.player_name || '',
                teamName: player.teamName || teamName,
                kills: player.kills || 0,
                assists: player.assists || 0,
                damageDealt: player.damageDealt || player.damage_dealt || 0,
                revivesGiven: player.revivesGiven || player.revives_given || 0,
                revives: player.revives
              })),
              overall_stats: team.overall_stats ? {
                teamPlacement: team.overall_stats.teamPlacement,
                name: teamName,
                teamName: teamName
              } : undefined
            };
          })
        }))
      }
    };
  }
}
