import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ScrimBatchFile, ScrimGame, ScrimTeam, PlayerStats } from '../models/scrim-batch-file.model';

@Injectable({ providedIn: 'root' })
export class MatchLoaderService {
  constructor(private http: HttpClient) {}

  /**
   * Loads match data from backend server using scrim batch file name
   * @param filename The scrim batch file name to load
   */
  loadMatch(filename: string): Observable<any> {
    return this.http.get(`http://localhost:3001/scrims/${filename}`);
  }

  /**
   * Loads the list of available scrim batch files from backend server
   */
  loadScrimFileList(): Observable<string[]> {
    return this.http.get<string[]>(`/scrims`);
  }

    /**
   * Transform a match JSON object (scrim or league) into MatchDayResults
   */
  transformMatchJsonToMatchDayResults(data: ScrimBatchFile): any /* MatchDayResults */ {
    if (!data || !data.stats || !Array.isArray(data.stats.games)) {
      return {};
    }
    const matchResults: any = {};
    data.stats.games.forEach((game: ScrimGame, i: number) => {
      matchResults[i + 1] = Array.isArray(game.teams) ? game.teams.map((team: ScrimTeam) => {
        // Use player_stats from new model, ensure playerId is present
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
          teamId: team.teamId,
          teamName: team.name,
          placement: team.overall_stats.teamPlacement,
          teamKills: team.overall_stats.kills,
          placementPoints: this.getPlacementPoints(team.overall_stats.teamPlacement),
          totalPoints: team.overall_stats.score,
          mapName: game.map_name,
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
