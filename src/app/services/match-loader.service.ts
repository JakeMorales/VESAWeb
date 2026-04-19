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
   * Load a single page of scrim batch filenames from HuggingFace dataset API.
   * Returns filenames sorted newest-first and a hasMore flag indicating if another page likely exists.
   */
  loadScrimFilePage(page: number, pageSize: number): Observable<{ files: string[]; hasMore: boolean }> {
    const offset = Math.max(0, (page - 1) * pageSize);
    const url = `${this.HF_API_URL}?limit=${pageSize}&offset=${offset}`;
    return this.http.get<HFTreeEntry[]>(url).pipe(
      map(entries => {
        const files = entries
          .filter(e => e.type === 'file' && e.path.startsWith('scrim_') && e.path.endsWith('.json'))
          .map(e => e.path)
          .sort((a, b) => {
            const dateFrom = (s: string) => {
              const m = s.match(/(\d{4}_\d{2}_\d{2})/);
              return m ? m[1].replace(/_/g, '-') : '';
            };
            const da = dateFrom(a);
            const db = dateFrom(b);
            if (!da && !db) return a.localeCompare(b);
            if (!da) return 1;
            if (!db) return -1;
            return db.localeCompare(da); // newest first
          });
        const hasMore = entries.length >= pageSize;
        return { files, hasMore };
      })
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
        .filter(e => e.type === 'file' && e.path.endsWith('.json') && !e.path.startsWith('_') && !e.path.includes('/_'))
        .map(e => {
          // Extract just the filename from the full path
          const parts = e.path.split('/');
          return parts[parts.length - 1];
        })
        .filter(name => !name.startsWith('_'))
        .sort((a, b) => {
          // Prefer numeric Week_N files in ascending order; push non-numbered files
          // (MP / Playoffs / Finals etc.) to the end.
          const matchA = a.match(/Week_(\d+)/i);
          const matchB = b.match(/Week_(\d+)/i);
          const numA = matchA ? parseInt(matchA[1], 10) : 999;
          const numB = matchB ? parseInt(matchB[1], 10) : 999;
          if (numA !== numB) return numA - numB;
          return a.localeCompare(b);
        })
      )
    );
  }

  /**
   * Loads a league match file from HuggingFace dataset
   */
  loadLeagueMatch(season: string, division: string, filename: string): Observable<any> {
    const filePath = `${encodeURIComponent(season)}/${encodeURIComponent('Division_' + division)}/${encodeURIComponent(filename)}`;
    return this.http.get(`${this.HF_LEAGUE_RESOLVE_URL}/${filePath}`);
  }

  /**
   * Loads the pre-computed _summary.json for a season/division from HuggingFace
   */
  loadLeagueDivisionSummary(season: string, division: string): Observable<any> {
    const filePath = `${encodeURIComponent(season)}/${encodeURIComponent('Division_' + division)}/_summary.json`;
    return this.http.get(`${this.HF_LEAGUE_RESOLVE_URL}/${filePath}`);
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
          teamName: this.normalizeTeamName(team.name),
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
    // Remove any trailing tokens that start with @ or # (e.g. "Team @123 #abc")
    // This removes one or more occurrences of optional space + @/#token at the end.
    const cleaned = name.replace(/(?:\s*[@#]\S+)+$/g, '');
    return cleaned.replace(/\s+$/g, '').trim();
  }
}
