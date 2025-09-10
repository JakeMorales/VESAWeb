import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  constructor(private http: HttpClient) {}

  getLeaderboard(offset: number = 0, limit: number = 25, playerName?: string): Observable<any> {
    const params: any = { offset: offset.toString(), limit: limit.toString() };
    if (playerName && playerName.trim()) {
      params.playerName = playerName.trim();
    }
    const query = new URLSearchParams(params).toString();
    return this.http.get(`http://localhost:3001/leaderboard?${query}`);
  }
}