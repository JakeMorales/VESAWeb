import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ScrimPlayer } from '../components/scrims-leaderboard/scrims-leaderboard.component';
import { ScrimStats } from '../components/scrims/scrims-hero.component';
import { PlayerSeasonResult } from './elo/elo-engine';
import { ELO_SEASONS } from './elo/seasons';

/** Shape of public/data/elo/<season>.json written by npm run generate-elo. */
export interface SeasonEloFile {
  season: string;
  label: string;
  window: { start: string; end: string | null };
  generatedAt: string;
  gamesProcessed: number;
  sessionsProcessed: number;
  players: PlayerSeasonResult[];
}

/** Shape of public/data/elo/ratings-current.json (all-time career priors). */
export interface CurrentRatingsFile {
  generatedAt: string;
  asOfSeason: string | null;
  totals: { players: number; games: number; sessions: number };
  players: {
    playerId: string;
    name: string;
    priorElo: number;
    lastPlayed: string;
    lastSeason: string;
    seasonsAway: number;
    careerGames: number;
  }[];
}

/**
 * Loads the pre-computed seasonal ELO ratings (static JSON generated from the
 * HuggingFace scrim dataset by scripts/generate-seasonal-elo.ts).
 */
@Injectable({ providedIn: 'root' })
export class EloDataService {
  private seasonCache = new Map<string, Observable<SeasonEloFile | null>>();

  constructor(private http: HttpClient) {}

  /** Key of the current (ongoing) season. */
  get currentSeasonKey(): string {
    return ELO_SEASONS[ELO_SEASONS.length - 1].key;
  }

  getSeason(seasonKey: string = this.currentSeasonKey): Observable<SeasonEloFile | null> {
    if (!this.seasonCache.has(seasonKey)) {
      this.seasonCache.set(
        seasonKey,
        this.http.get<SeasonEloFile>(`/data/elo/${seasonKey}.json`).pipe(
          catchError(error => {
            console.error(`Error loading ELO data for ${seasonKey}:`, error);
            return of(null);
          }),
          shareReplay(1)
        )
      );
    }
    return this.seasonCache.get(seasonKey)!;
  }

  /** Top rated (non-provisional) players mapped for the scrims leaderboard. */
  getLeaderboard(count = 10, seasonKey?: string): Observable<ScrimPlayer[]> {
    return this.getSeason(seasonKey).pipe(
      map(season => {
        if (!season) return [];
        return season.players
          .filter(p => !p.provisional)
          .slice(0, count)
          .map((p, i) => this.toScrimPlayer(p, i + 1));
      })
    );
  }

  private currentRatings$?: Observable<CurrentRatingsFile | null>;

  /** All-time career priors + all-time totals (ratings-current.json). */
  getCurrentRatings(): Observable<CurrentRatingsFile | null> {
    if (!this.currentRatings$) {
      this.currentRatings$ = this.http.get<CurrentRatingsFile>('/data/elo/ratings-current.json').pipe(
        catchError(error => {
          console.error('Error loading ratings-current.json:', error);
          return of(null);
        }),
        shareReplay(1)
      );
    }
    return this.currentRatings$;
  }

  /**
   * Hero-strip stats: all-time totals (every scrim since data collection
   * began in 2024), with average/highest elo from the current season.
   */
  getScrimStats(): Observable<ScrimStats | null> {
    return combineLatest([this.getCurrentRatings(), this.getSeason()]).pipe(
      map(([allTime, season]) => {
        if (!allTime) return null;
        const weekAgo = new Date(new Date(allTime.generatedAt).getTime() - 7 * 24 * 3600 * 1000)
          .toISOString()
          .slice(0, 10);
        const rated = season?.players.filter(p => !p.provisional) ?? [];
        return {
          totalPlayers: allTime.totals.players,
          activeThisWeek: allTime.players.filter(p => p.lastPlayed >= weekAgo).length,
          totalGames: allTime.totals.games,
          totalMatches: allTime.totals.sessions,
          averageElo: Math.round(rated.reduce((s, p) => s + p.elo, 0) / (rated.length || 1)),
          highestElo: Math.round(rated[0]?.elo ?? 0),
        };
      })
    );
  }

  private toScrimPlayer(p: PlayerSeasonResult, rank: number): ScrimPlayer {
    const games = p.gamesPlayed || 1;
    return {
      rank,
      name: p.name,
      elo: Math.round(p.elo),
      eloChange: Math.round(p.lastSessionDelta),
      gamesPlayed: p.gamesPlayed,
      totalKills: p.totalKills,
      averageKills: Math.round((p.totalKills / games) * 10) / 10,
      averageDamage: Math.round(p.totalDamage / games),
      winRate: Math.round((p.wins / games) * 1000) / 10,
      isLeaguePlayer: false, // league linkage not wired up yet
      badges: this.badgesFor(p),
    };
  }

  /** Badges derived from real season stats (styling exists in the grid). */
  private badgesFor(p: PlayerSeasonResult): string[] {
    const badges: string[] = [];
    const games = p.gamesPlayed || 1;
    if (p.totalKills / games >= 2) badges.push('High Killer');
    if (p.gamesPlayed >= 50) badges.push('Veteran');
    if (p.seedElo <= 1520 && p.elo >= 1700) badges.push('Rising Star');
    if (p.wins / games >= 0.15) badges.push('Champion');
    return badges;
  }
}
