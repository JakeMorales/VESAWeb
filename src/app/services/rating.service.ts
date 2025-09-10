import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PlayerStats, TeamGameResult } from '../models/match-day-results.model';
import { HttpClient } from '@angular/common/http';

export interface PlayerRating {
  playerId: string;
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

  constructor(private http: HttpClient) { }

  /**
   * Fetches the ELO leaderboard from the backend server
   */
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`/leaderboard`);
  }

}
