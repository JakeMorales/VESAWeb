import { Injectable } from '@angular/core';
import { Observable, of, EMPTY } from 'rxjs';
import { expand, reduce, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ScrimBatchFile, ScrimGame, ScrimTeam, PlayerStats } from '../models/scrim-batch-file.model';
import { getApexMapDisplayName } from '../models/apex-map-names';

interface HFTreeEntry {
  type: string;
  path: string;
  size: number;
  oid: string;
}

@Injectable({ providedIn: 'root' })
export class MatchLoaderService {
  private readonly HF_RESOLVE_URL = '/hf-resolve';
  private readonly HF_API_URL = '/hf-api/tree/main';
  private readonly HF_LEAGUE_RESOLVE_URL = '/hf-league-resolve';
  private readonly HF_LEAGUE_API_URL = '/hf-league-api/tree/main';

  constructor(private http: HttpClient) {}

  /**
   * Loads match data from HuggingFace dataset
   * @param filename The scrim batch file name to load
   */
  loadMatch(filename: string): Observable<any> {
    return this.http.get(`${this.HF_RESOLVE_URL}/${encodeURIComponent(filename)}`);
  }

  /**
   * Loads the list of available scrim batch files from HuggingFace dataset API
   */
  loadScrimFileList(): Observable<string[]> {
    return this.http.get<HFTreeEntry[]>(this.HF_API_URL).pipe(
      map(entries => entries
        .filter(e => e.type === 'file' && e.path.startsWith('scrim_') && e.path.endsWith('.json'))
        .map(e => e.path)
      )
    );
  }

  /**
   * Loads the list of seasons from the HuggingFace league dataset
   */
  loadLeagueSeasons(): Observable<string[]> {
    return this.http.get<HFTreeEntry[]>(this.HF_LEAGUE_API_URL).pipe(
      map(entries => entries
        .filter(e => e.type === 'directory' && e.path.startsWith('Season_'))
        .map(e => e.path)
        .sort((a, b) => {
          const numA = parseInt(a.split('_')[1]);
          const numB = parseInt(b.split('_')[1]);
          return numA - numB;
        })
      )
    );
  }

  /**
   * Loads the list of divisions for a season from the HuggingFace league dataset
   */
  loadLeagueDivisions(season: string): Observable<string[]> {
    return this.http.get<HFTreeEntry[]>(`${this.HF_LEAGUE_API_URL}/${encodeURIComponent(season)}`).pipe(
      map(entries => entries
        .filter(e => e.type === 'directory' && e.path.includes('Division_'))
        .map(e => {
          const match = e.path.match(/Division_(\d+)/);
          return match ? match[1] : '';
        })
        .filter(d => d !== '')
        .sort((a, b) => parseInt(a) - parseInt(b))
      )
    );
  }

  /**
   * Loads the list of match files for a specific season/division from HuggingFace
   */
  loadLeagueMatchFiles(season: string, division: string): Observable<string[]> {
    const path = `${encodeURIComponent(season)}/${encodeURIComponent('Division_' + division)}`;
    return this.http.get<HFTreeEntry[]>(`${this.HF_LEAGUE_API_URL}/${path}`).pipe(
      map(entries => entries
        .filter(e => e.type === 'file' && e.path.endsWith('.json'))
        .map(e => {
          // Extract just the filename from the full path
          const parts = e.path.split('/');
          return parts[parts.length - 1];
        })
        .sort((a, b) => {
          // Sort regular weeks by number first
          const weekA = parseInt(a.match(/Week_(\d+)/)?.[1] || '0');
          const weekB = parseInt(b.match(/Week_(\d+)/)?.[1] || '0');
          if (weekA !== weekB) return weekA - weekB;
          // Playoffs/Finals at end
          const aIsSpecial = a.includes('Playoffs') || a.includes('Finals');
          const bIsSpecial = b.includes('Playoffs') || b.includes('Finals');
          if (aIsSpecial && !bIsSpecial) return 1;
          if (!aIsSpecial && bIsSpecial) return -1;
          return a.localeCompare(b);
        })
      )
    );
  }

  /**
   * Loads a league match file from HuggingFace dataset
   */
  loadLeagueMatch(season: string, division: string, filename: string): Observable<any> {
    const path = `${encodeURIComponent(season)}/${encodeURIComponent('Division_' + division)}/${encodeURIComponent(filename)}`;
    return this.http.get(`${this.HF_LEAGUE_RESOLVE_URL}/${path}`);
  }

    /**
   * Transform a match JSON object (scrim or league) into MatchDayResults
   */
  transformMatchJsonToMatchDayResults(data: any): any /* MatchDayResults */ {
    // Support both shapes: { stats: { games: [] } } (local files) and { games: [] } (HuggingFace)
    const statsObj = data?.stats ?? data;
    if (!statsObj || !Array.isArray(statsObj.games)) {
      console.warn('transformMatchJsonToMatchDayResults: unexpected data shape. Keys:', Object.keys(data ?? {}));
      return {};
    }
    const matchResults: any = {};
    statsObj.games.forEach((game: ScrimGame, i: number) => {
      matchResults[i + 1] = Array.isArray(game.teams) ? game.teams.map((team: ScrimTeam) => {
        const players = Array.isArray(team.player_stats)
          ? team.player_stats.map((p: PlayerStats) => ({
              playerId: p.playerId,
              playerName: p.name,
              kills: p.kills ?? 0,
              damage: p.damageDealt ?? 0,
              downs: p.knockdowns ?? 0,
              headshots: p.headshots ?? 0,
              assists: p.assists ?? 0,
              shots: p.shots ?? 0,
              hits: p.hits ?? 0,
              revives: p.revivesGiven ?? 0,
              respawns: p.respawnsGiven ?? 0
            }))
          : [];
        return {
          gameNumber: i + 1,
          teamId: team.teamId,
          teamName: team.name,
          placement: team.overall_stats?.teamPlacement ?? 0,
          teamKills: team.overall_stats?.kills ?? 0,
          placementPoints: this.getPlacementPoints(team.overall_stats?.teamPlacement ?? 0),
          totalPoints: team.overall_stats?.score ?? 0,
          mapName: getApexMapDisplayName(game.map_name),
          players,
          isExpanded: false
        };
      }) : [];
    });
    return matchResults;
  }

  /**
   * Placement points mapping (moved from ScrimsTableLoaderService)
   */
  getPlacementPoints(placement: number): number {
    if (placement === 1) return 12;
    if (placement === 2) return 9;
    if (placement === 3) return 7;
    if (placement === 4) return 5;
    if (placement === 5) return 4;
    if (placement === 6 || placement === 7) return 3;
    if (placement >= 8 && placement <= 10) return 2;
    if (placement >= 11 && placement <= 15) return 1;
    if (placement >= 16 && placement <= 20) return 0;
    return 0;
  }

  /**
   * Helper to normalize a team name consistently (moved from ScrimsTableLoaderService)
   */
  normalizeTeamName(name: string): string {
    if (typeof name !== 'string') return name;
    // Remove any '@...' or '#...' at the end, then trailing whitespace/tabs
    return name.replace(/[@#][^\s\t]*[\s\t]*$/, '').replace(/[\t\s]+$/, '').trim();
  }
}
