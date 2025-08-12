import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ScrimFileService } from './scrim-file.service';

@Injectable({ providedIn: 'root' })
export class MatchLoaderService {
  constructor(private scrimFileService: ScrimFileService) {}

  /**
   * Loads match data. For now, loads a scrim JSON file. In the future, will call the Nhost API.
   * @param matchId The ID of the match to load
   */
  loadMatch(matchId: string): Observable<any> {
    // For now, delegate to ScrimFileService
    return this.scrimFileService.loadScrimFile(matchId);
  }

  /**
   * Placeholder for loading a match from Nhost (to be implemented when API is ready)
   */
  loadMatchFromNhost(matchId: string): Observable<any> {
    // TODO: Implement actual API call to Nhost when available
    return of(null);
  }

    /**
   * Transform a match JSON object (scrim or league) into MatchDayResults
   */
  transformMatchJsonToMatchDayResults(data: any): any /* MatchDayResults */ {
    if (!data) {
      return {};
    }
    const matchResults: any = {};
    // Normalize team_name for all individualGames upfront (handle missing property)
    const individualGames = Array.isArray(data.individual_games)
      ? data.individual_games.map((p: any) => {
          const normalized = this.normalizeTeamName(p.team_name);
          return {
            ...p,
            team_name: normalized
          };
        })
      : [];
    if (Array.isArray(data.games)) {
      data.games.forEach((game: any, i: number) => {
        matchResults[i + 1] = Array.isArray(game.teams) ? game.teams.map((team: any) => {
          const cleanTeamName = this.normalizeTeamName(team.team_name);
          let players = individualGames
            .filter((p: any) => {
              // Normalize both sides: strip trailing '@#' and tabs
              const normTeam = this.normalizeTeamName(team.team_name);
              const normPlayer = this.normalizeTeamName(p.team_name);
              const isSameGame = p.game_number === game.game_number;
              const isSameTeam = normPlayer === normTeam;
              return isSameGame && isSameTeam;
            })
            .map((p: any) => ({
              playerName: p.player_name,
              kills: p.kills ?? 0,
              damage: p.damage_dealt ?? 0,
              downs: p.knockdowns ?? 0,
              headshots: p.headshots ?? 0,
              assists: p.assists ?? 0,
              shots: p.shots ?? 0,
              hits: p.hits ?? 0,
              revives: p.revives ?? 0,
              respawns: p.respawns ?? 0
            }));
          // if (players.length === 0) {
          //   // Team has no players, skip or handle as needed
          // }
          return {
            gameNumber: game.game_number,
            teamName: cleanTeamName,
            placement: team.placement,
            teamKills: team.kills,
            placementPoints: this.getPlacementPoints(team.placement),
            totalPoints: team.score,
            mapName: game.map_name,
            players,
            isExpanded: false
          };
        }) : [];
      });
    }
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
