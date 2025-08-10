import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchDayResults } from '../models/match-day-results.model';

@Injectable({ providedIn: 'root' })
export class ScrimsTableLoaderService {
  constructor(private http: HttpClient) {}

  // Placement points mapping
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

  // Helper to normalize a team name consistently
  private normalizeTeamName(name: string): string {
  if (typeof name !== 'string') return name;
  // Remove any '@...' or '#...' at the end, then trailing whitespace/tabs
  return name.replace(/[@#][^\s\t]*[\s\t]*$/, '').replace(/[\t\s]+$/, '').trim();
  }

  // Transform a scrim JSON object into MatchDayResults (pure function)
  transformScrimJson(data: any): MatchDayResults {
    const matchResults: MatchDayResults = {};
    // Normalize team_name for all individualGames upfront
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
          if (players.length === 0) {
            console.error(`Team '${cleanTeamName}' in game ${game.game_number} has no players!`, team);
          }
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

  // Loads and transforms a single scrim JSON file into MatchDayResults (kept for legacy/file loading)
  loadScrimTableFromJson(filePath: string): Observable<MatchDayResults> {
    return this.http.get<any>(filePath).pipe(
      map(data => this.transformScrimJson(data))
    );
  }

  // Helper to normalize all team names in a MatchDayResults object (kept for batch loading)
  private normalizeTeamNames(matchResults: MatchDayResults): MatchDayResults {
    if (!matchResults) return matchResults;
    Object.values(matchResults).forEach((teams: any[]) => {
      teams.forEach(team => {
        if (typeof team.teamName === 'string') {
          team.teamName = this.normalizeTeamName(team.teamName);
        }
        // Also normalize player teamName if present (for nested structures)
        if (Array.isArray(team.players)) {
          team.players.forEach((player: any) => {
            if (typeof player.teamName === 'string') {
              player.teamName = this.normalizeTeamName(player.teamName);
            }
          });
        }
      });
    });
    return matchResults;
  }

  // Loads all scrim files in the batch folder and returns an array of { file, matchResults }
  loadAllScrimsFromBatch(batchFolder: string, fileNames: string[]): Observable<{ file: string, matchResults: MatchDayResults }[]> {
    const fileObservables = fileNames.map(file =>
      this.loadScrimTableFromJson(`${batchFolder}/${file}`).pipe(
        map(matchResults => ({ file, matchResults: this.normalizeTeamNames(matchResults) }))
      )
    );
    return forkJoin(fileObservables);
  }
}
