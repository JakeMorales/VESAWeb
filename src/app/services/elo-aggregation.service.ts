
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EloCalculatorService } from './elo-calculator.service';
import { PlayerAggregatedStats } from './scrims-data.service';
import { MatchDayResults } from '../models/match-day-results.model';
import { ScrimFileService } from './scrim-file.service';

@Injectable({ providedIn: 'root' })
export class EloAggregationService {
  constructor(
    private http: HttpClient,
    private eloCalculator: EloCalculatorService,
    private scrimFileService: ScrimFileService
  ) {}

  /**
   * Calculates the average ELO gain/loss per game across all players.
   */
  getAvgEloGainLossPerGame(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<{ avgGain: number, avgLoss: number }> {
    return this.scrimFileService.loadAllScrimBatchFiles().pipe(
      map((jsons: any[]) => {
        let totalGain = 0;
        let totalLoss = 0;
        let gainCount = 0;
        let lossCount = 0;
        let totalGames = 0;
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        jsons.forEach((json) => {
          if (!json) return;
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
          if (!matchDay) return;
          Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
            if (!Array.isArray(teamGameResults)) return;
            const allPlayers: { id: string, name: string, team: any, ps: any }[] = [];
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const rawName = ps.playerName || ps.name || '';
                const id = rawName.trim().toLowerCase();
                allPlayers.push({ id, name: rawName, team, ps });
              });
            });
            const playerElosBefore = new Map<string, number>();
            allPlayers.forEach(p => {
              playerElosBefore.set(p.id, INITIAL_ELO);
            });
            allPlayers.forEach(p => {
              const gamesPlayed = 0;
              const opponentElos = allPlayers.filter(x => x.id !== p.id).map(x => playerElosBefore.get(x.id) ?? INITIAL_ELO);
              const avgOpponentElo = opponentElos.length ? (opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length) : INITIAL_ELO;
              const perf = this.eloCalculator.calculatePerformanceScore(
                p.team.placement,
                p.ps.kills || 0,
                p.ps.assists || 0,
                p.ps.damage || p.ps.damage_dealt || 0,
                p.ps.revives || p.ps.revives_given || 0
              );
              const eloChange = this.eloCalculator.calculateEloChangeWithOpponent(
                INITIAL_ELO,
                avgOpponentElo,
                perf,
                gamesPlayed
              );
              if (eloChange > 0) {
                totalGain += eloChange;
                gainCount++;
              } else if (eloChange < 0) {
                totalLoss += eloChange;
                lossCount++;
              }
            });
            totalGames++;
          });
        });
        return {
          avgGain: gainCount > 0 ? totalGain / gainCount : 0,
          avgLoss: lossCount > 0 ? totalLoss / lossCount : 0
        };
      })
    );
  }

  /**
   * Calculates the average ELO leakage per game (sum of all ELO changes per game).
   */
  getAvgEloLeakagePerGame(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<number> {
    return this.scrimFileService.loadAllScrimBatchFiles().pipe(
      map((jsons: any[]) => {
        let totalLeakage = 0;
        let totalGames = 0;
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        jsons.forEach((json) => {
          if (!json) return;
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
          if (!matchDay) return;
          Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
            if (!Array.isArray(teamGameResults)) return;
            const allPlayers: { id: string, name: string, team: any, ps: any }[] = [];
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const rawName = ps.playerName || ps.name || '';
                const id = rawName.trim().toLowerCase();
                allPlayers.push({ id, name: rawName, team, ps });
              });
            });
            const playerElosBefore = new Map<string, number>();
            allPlayers.forEach(p => {
              playerElosBefore.set(p.id, INITIAL_ELO);
            });
            let totalProvisionalChange = 0;
            allPlayers.forEach(p => {
              const gamesPlayed = 0;
              const opponentElos = allPlayers.filter(x => x.id !== p.id).map(x => playerElosBefore.get(x.id) ?? INITIAL_ELO);
              const avgOpponentElo = opponentElos.length ? (opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length) : INITIAL_ELO;
              const perf = this.eloCalculator.calculatePerformanceScore(
                p.team.placement,
                p.ps.kills || 0,
                p.ps.assists || 0,
                p.ps.damage || p.ps.damage_dealt || 0,
                p.ps.revives || p.ps.revives_given || 0
              );
              const eloChange = this.eloCalculator.calculateEloChangeWithOpponent(
                INITIAL_ELO,
                avgOpponentElo,
                perf,
                gamesPlayed
              );
              totalProvisionalChange += eloChange;
            });
            totalGames++;
            totalLeakage += totalProvisionalChange;
          });
        });
        return totalGames > 0 ? totalLeakage / totalGames : 0;
      })
    );
  }

  /**
   * Loads all scrim batch JSON files from assets, aggregates ELOs for each player,
   * and returns those with >= 18 games played.
   */
  getAggregatedPlayerElosFromScrimFiles(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<PlayerAggregatedStats[]> {
    return this.scrimFileService.loadAllScrimBatchFiles().pipe(
      map(jsons => {
        const playerMap = new Map<string, {
          name: string;
          elo: number;
          games: Set<string>;
          gamesPlayed: number;
          stats: any[];
        }>();
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        jsons.forEach((json, fileIdx) => {
          if (!json) return;
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
          if (!matchDay) return;
          Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
            if (!Array.isArray(teamGameResults)) return;
            const allPlayers: { id: string, name: string, team: any, ps: any }[] = [];
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const rawName = ps.playerName || ps.name || '';
                const id = rawName.trim().toLowerCase();
                allPlayers.push({ id, name: rawName, team, ps });
                if (!playerMap.has(id)) {
                  playerMap.set(id, { name: rawName, elo: INITIAL_ELO, games: new Set(), gamesPlayed: 0, stats: [] });
                }
              });
            });
            const playerElosBefore = new Map<string, number>();
            allPlayers.forEach(p => {
              playerElosBefore.set(p.id, playerMap.get(p.id)!.elo);
            });
            const provisionalEloChanges = new Map<string, number>();
            let totalProvisionalChange = 0;
            allPlayers.forEach(p => {
              const playerStats = playerMap.get(p.id)!;
              const gamesPlayed = playerStats.gamesPlayed;
              const opponentElos = allPlayers.filter(x => x.id !== p.id).map(x => playerElosBefore.get(x.id) ?? INITIAL_ELO);
              const avgOpponentElo = opponentElos.length ? (opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length) : INITIAL_ELO;
              const perf = this.eloCalculator.calculatePerformanceScore(
                p.team.placement,
                p.ps.kills || 0,
                p.ps.assists || 0,
                p.ps.damage || p.ps.damage_dealt || 0,
                p.ps.revives || p.ps.revives_given || 0
              );
              const eloChange = this.eloCalculator.calculateEloChangeWithOpponent(
                playerStats.elo,
                avgOpponentElo,
                perf,
                gamesPlayed
              );
              provisionalEloChanges.set(p.id, eloChange);
              totalProvisionalChange += eloChange;
            });
            const numPlayers = allPlayers.length;
            const meanChange = totalProvisionalChange / numPlayers;
            const playerEloChanges = new Map<string, number>();
            allPlayers.forEach(p => {
              const normalizedChange = provisionalEloChanges.get(p.id)! - meanChange;
              playerEloChanges.set(p.id, normalizedChange);
            });
            allPlayers.forEach(p => {
              const playerStats = playerMap.get(p.id)!;
              playerStats.elo += playerEloChanges.get(p.id)!;
              playerStats.games.add(`${fileIdx}_${gameNumber}`);
              playerStats.gamesPlayed++;
              playerStats.stats.push({ ...p.ps, placement: p.team.placement });
            });
          });
        });
        const result: PlayerAggregatedStats[] = [];
        playerMap.forEach((val, id) => {
          if (val.games.size >= 18) {
            const totalKills = val.stats.reduce((sum, s) => sum + (s.kills || 0), 0);
            const totalDamage = val.stats.reduce((sum, s) => sum + (s.damage || s.damage_dealt || 0), 0);
            const totalRevives = val.stats.reduce((sum, s) => sum + (s.revives || s.revives_given || 0), 0);
            const totalRespawns = val.stats.reduce((sum, s) => sum + (s.respawns || s.respawns_given || 0), 0);
            const totalPoints = val.stats.reduce((sum, s) => sum + (s.score || 0), 0);
            const averageKills = totalKills / val.stats.length;
            const averageDamage = totalDamage / val.stats.length;
            const averagePlacement = val.stats.reduce((sum, s) => sum + (s.placement || 0), 0) / val.stats.length;
            const winRate = (val.stats.filter(s => (s.placement || 0) === 1).length / val.stats.length) * 100;
            const topThreeRate = (val.stats.filter(s => (s.placement || 0) <= 3).length / val.stats.length) * 100;
            result.push({
              playerId: id,
              playerName: val.name,
              totalGames: val.games.size,
              totalKills,
              totalDamage,
              totalRevives,
              totalRespawns,
              totalPoints,
              averageKills,
              averageDamage,
              averagePlacement,
              winRate,
              topThreeRate,
              estimatedElo: val.elo,
              finalElo: val.elo
            });
          }
        });
        return result.sort((a, b) => b.finalElo! - a.finalElo!);
      })
    );
  }
}
