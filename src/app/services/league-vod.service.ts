import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

/**
 * Shape of public/data/league/vods.json, maintained by league admins:
 * season -> division number -> match-day key -> Twitch VOD URL.
 * Match-day keys are "week1".."week6" and "finals".
 * See public/data/league/README.md for editing instructions.
 */
export type LeagueVodConfig = Record<string, Record<string, Record<string, string>>>;

/**
 * Derives the vods.json key for a match-day results file, using the same
 * filename conventions as the division page ("Week_5" / playoffs markers).
 */
export function matchDayVodKey(filename: string): string | null {
  if (/playoffs|finals|_mp/i.test(filename)) return 'finals';
  const week = filename.match(/Week_(\d+)/i);
  return week ? `week${parseInt(week[1], 10)}` : null;
}

@Injectable({ providedIn: 'root' })
export class LeagueVodService {
  private config$?: Observable<LeagueVodConfig>;

  constructor(private http: HttpClient) {}

  private getConfig(): Observable<LeagueVodConfig> {
    if (!this.config$) {
      this.config$ = this.http.get<LeagueVodConfig>('/data/league/vods.json').pipe(
        catchError(err => {
          console.error('Error loading league VOD config:', err);
          return of({} as LeagueVodConfig);
        }),
        shareReplay(1)
      );
    }
    return this.config$;
  }

  /** VOD URL assigned to a match day, or null if the admins haven't set one. */
  getVodUrl(season: string, division: string, filename: string): Observable<string | null> {
    const key = matchDayVodKey(filename);
    if (!key) return of(null);
    return this.getConfig().pipe(
      map(config => config[season]?.[division]?.[key] ?? null)
    );
  }
}
