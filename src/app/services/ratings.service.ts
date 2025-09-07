import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<any> {
    return this.http.get('/leaderboard');
  }
}