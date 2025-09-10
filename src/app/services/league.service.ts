import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface LeagueMatchDay {
  season: string;
  division: string;
  week: string | number;
  isPlayoffs: boolean;
  stats: {
    games: Array<{
      game: number;
      teams: Array<{
        player_stats: Array<{
          playerId?: string | number;
          playerName: string;
          kills: number;
          assists: number;
          damageDealt: number;
          revivesGiven?: number;
          revives?: number;
        }>;
        overall_stats?: {
          teamPlacement: number;
        };
      }>;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  getSeasons(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/league/seasons`);
  }

  getDivisions(season: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/league/seasons/${season}/divisions`);
  }

  getDivisionMatches(season: string, division: string): Observable<LeagueMatchDay[]> {
    return this.http.get<LeagueMatchDay[]>(`${this.baseUrl}/league/seasons/${season}/divisions/${division}/matches`);
  }

  getMatchDay(season: string, division: string, filename: string): Observable<LeagueMatchDay | null> {
    return this.http.get<LeagueMatchDay>(`${this.baseUrl}/league/seasons/${season}/divisions/${division}/matches/${filename}`);
  }
}
