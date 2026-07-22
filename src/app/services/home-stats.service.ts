import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface HomeStatsSection {
  matchesPlayed: number;
  gamesPlayed: number;
  uniquePlayers: number;
  totalPlaytime: string;
}

export interface HomeLeagueStats extends HomeStatsSection {
  currentSeason: string;
  currentDivisionCount: number;
}

export interface HomeActivityItem {
  type: 'match_point_champion' | 'scrim_block';
  icon: 'trophy' | 'bolt';
  title: string;
  description: string;
  occurredAt: string;
}

/** Shape of public/data/home/stats.json written by npm run generate-home-stats. */
export interface HomeStatsFile {
  generatedAt: string;
  league: HomeLeagueStats;
  scrims: HomeStatsSection;
  totalUniquePlayers: number;
  recentActivity: HomeActivityItem[];
}

/**
 * Loads the pre-computed home-page stats (static JSON generated from the
 * HuggingFace league + scrims datasets by scripts/generate-home-stats.ts).
 * Fetched once and shared — the home page never hits HuggingFace directly.
 */
@Injectable({ providedIn: 'root' })
export class HomeStatsService {
  private stats$?: Observable<HomeStatsFile | null>;

  constructor(private http: HttpClient) {}

  getStats(): Observable<HomeStatsFile | null> {
    if (!this.stats$) {
      this.stats$ = this.http.get<HomeStatsFile>('/data/home/stats.json').pipe(
        catchError(error => {
          console.error('Error loading home stats.json:', error);
          return of(null);
        }),
        shareReplay(1)
      );
    }
    return this.stats$;
  }
}
