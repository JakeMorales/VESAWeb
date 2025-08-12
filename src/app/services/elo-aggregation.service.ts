// Interface for performance factor stats
export interface PerformanceFactorStats {
  placement: StatSummary;
  combat: StatSummary;
  damage: StatSummary;
  support: StatSummary;
  performance: StatSummary;
}

export interface StatSummary {
  mean: number;
  min: number;
  max: number;
  std: number;
}




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EloCalculatorService } from './elo-calculator.service';
import { RatingService } from './rating.service';
import { PlayerAggregatedStats } from './scrims-data.service';
import { MatchDayResults } from '../models/match-day-results.model';
import { ScrimFileService } from './scrim-file.service';

@Injectable({ providedIn: 'root' })
export class EloAggregationService {
  constructor(
    private http: HttpClient,
    private eloCalculator: EloCalculatorService,
    private scrimFileService: ScrimFileService,
    private ratingService: RatingService
  ) {}


  /**
   * Returns Elo stats for display: unrated percent, percent with >12 games, and total player count.
   */
  getEloStatsSummary(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<{
    unratedPercent: number;
    percentOver12Games: number;
    totalPlayers: number;
    unratedPlayers: number;
    over12GamesPlayers: number;
  }> {
    return this.getAllAggregatedPlayerElos(loadScrimTableFromJsonObject).pipe(
      map((players) => {
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        if (!players || players.length === 0) {
          return {
            unratedPercent: 0,
            percentOver12Games: 0,
            totalPlayers: 0,
            unratedPlayers: 0,
            over12GamesPlayers: 0
          };
        }
        const unratedPlayers = players.filter(p => p.estimatedElo === INITIAL_ELO || p.totalGames < 18);
        const playedMoreThan12 = players.filter(p => p.totalGames > 12);
        return {
          unratedPercent: (unratedPlayers.length / players.length) * 100,
          percentOver12Games: (playedMoreThan12.length / players.length) * 100,
          totalPlayers: players.length,
          unratedPlayers: unratedPlayers.length,
          over12GamesPlayers: playedMoreThan12.length
        };
      })
    );
  }

    /**
   * Calculates the average net ELO change per game across all players.
   * This is the sum of all Elo changes per game, averaged over all games.
   */
  getAvgNetEloChangePerGame(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<number> {
    // Use sequential Elo state for each player, just like getAvgEloLeakagePerGame
    return this.scrimFileService.loadAllScrimBatchFiles().pipe(
      map((jsons: any[]) => {
  let totalNetChange = 0;
  let totalGames = 0;
  let debugLogs: any[] = [];
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        // Track Elo and games played for each player across all games
        const playerState = new Map<string, { elo: number; gamesPlayed: number }>();
        let debugGames = 0;
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
                // Initialize player state if not present
                if (!playerState.has(id)) {
                  playerState.set(id, { elo: INITIAL_ELO, gamesPlayed: 0 });
                }
              });
            });
            // Snapshot of player Elos before this game
            const playerElosBefore = new Map<string, number>();
            allPlayers.forEach(p => {
              playerElosBefore.set(p.id, playerState.get(p.id)?.elo ?? INITIAL_ELO);
            });
            let netChange = 0;
            const eloChanges: {
              id: string,
              name: string,
              eloChange: number,
              perf: number,
              placement: number,
              placementFactor: number,
              kills: number,
              assists: number,
              combatFactor: number,
              damage: number,
              damageFactor: number,
              revives: number,
              supportFactor: number
            }[] = [];
            // Calculate and normalize perf scores for all players in this game
            const perfs = allPlayers.map(p => {
              const placement = p.team.placement;
              const kills = p.ps.kills || 0;
              const assists = p.ps.assists || 0;
              const damage = p.ps.damage || p.ps.damage_dealt || 0;
              const revives = p.ps.revives || p.ps.revives_given || 0;
              const placementFactor = this.eloCalculator.calculateTieredPlacementScore(placement);
              const combatScore = kills + assists;
              const combatFactor = Math.min(1, combatScore / 6);
              const damageFactor = Math.min(1, damage / 1200);
              const supportFactor = Math.min(1, revives / 3);
              return (
                (placementFactor * this.eloCalculator.getPlacementWeight() / 100) +
                (combatFactor * this.eloCalculator.getCombatWeight() / 100) +
                (damageFactor * this.eloCalculator.getDamageWeight() / 100) +
                (supportFactor * this.eloCalculator.getSupportWeight() / 100)
              );
            });
            const normPerfs = EloCalculatorService.sumNormalizePerformanceScores(perfs);
            const N = allPlayers.length;
            const expected = 1 / N;

            // Calculate Elo changes for each player using normalized perf and expected = 1/N
            allPlayers.forEach((p, idx) => {
              const state = playerState.get(p.id)!;
              const gamesPlayed = state.gamesPlayed;
              const playerElo = state.elo;
              const normPerf = normPerfs[idx];
              const placement = p.team.placement;
              const kills = p.ps.kills || 0;
              const assists = p.ps.assists || 0;
              const damage = p.ps.damage || p.ps.damage_dealt || 0;
              const revives = p.ps.revives || p.ps.revives_given || 0;
              const placementFactor = this.eloCalculator.calculateTieredPlacementScore(placement);
              const combatScore = kills + assists;
              const combatFactor = Math.min(1, combatScore / 6);
              const damageFactor = Math.min(1, damage / 1200);
              const supportFactor = Math.min(1, revives / 3);
              const perf = perfs[idx];
              const eloChange = 60 * (normPerf - expected); // K=60, expected = 1/N
              netChange += eloChange;
              eloChanges.push({
                id: p.id,
                name: p.name,
                eloChange,
                perf: normPerf,
                placement,
                placementFactor,
                kills,
                assists,
                combatFactor,
                damage,
                damageFactor,
                revives,
                supportFactor
              });
              // Update player state for next game
              playerState.set(p.id, {
                elo: playerElo + eloChange,
                gamesPlayed: gamesPlayed + 1
              });
            });
            totalNetChange += netChange;
            totalGames++;
          });
        });
        return totalGames > 0 ? totalNetChange / totalGames : 0;
      })
    );
  }

    /**
   * Calculates the average percent of unrated opponents (opponents with rating 1500 or <18 games played)
   * for all players across all scrims. Unrated = estimatedElo === 1500 OR totalGames < 18.
   * Returns an Observable<number> (average percent, 0-100).
   */
  getAvgUnratedOpponentPct(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<number> {
    // Re-aggregate all players, including those with <18 games
    return this.getAllAggregatedPlayerElos(loadScrimTableFromJsonObject).pipe(
      map((players) => {
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        if (!players || players.length === 0) return 0;
  const unratedPlayers = players.filter(p => p.estimatedElo === INITIAL_ELO || p.totalGames < 18);
  const playedMoreThan12 = players.filter(p => p.totalGames > 12);
  // Debug log: print counts and a sample of unrated players
  console.log('[ELO DEBUG] Total players:', players.length);
  console.log('[ELO DEBUG] Unrated players:', unratedPlayers.length);
  console.log('[ELO DEBUG] Sample unrated:', unratedPlayers.slice(0, 10).map(p => ({ name: p.playerName, games: p.totalGames, elo: p.estimatedElo })));
  console.log('[ELO DEBUG] Players with >12 games:', playedMoreThan12.length, `(${((playedMoreThan12.length / players.length) * 100).toFixed(2)}%)`);
  return (unratedPlayers.length / players.length) * 100;
      })
    );
  }

  // Helper: aggregate all players, no filter on games played
  getAllAggregatedPlayerElos(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<PlayerAggregatedStats[]> {
    const fileNames = (this.scrimFileService.getAllScrimBatchFiles && this.scrimFileService.getAllScrimBatchFiles()) || [];
    const sortedFileNames = [...fileNames].sort();
    const fileRequests = sortedFileNames.map(name =>
      this.scrimFileService['http'].get<any>(`assets/scrims_batch/${name}`).pipe(catchError(() => of(null)))
    );
    return forkJoin(fileRequests).pipe(
      map(jsons => {
        const playerMap = new Map<string, {
          name: string;
          elo: number;
          games: Set<string>;
          gamesPlayed: number;
          stats: any[];
        }>();
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        let fileIdx = 0;
        for (const json of jsons) {
          if (!json) { fileIdx++; continue; }
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
          if (!matchDay) { fileIdx++; continue; }
          Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
            if (!Array.isArray(teamGameResults)) return;
            const playerEloMap: { [playerName: string]: number } = {};
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const rawName = ps.playerName || ps.name || '';
                const id = rawName.trim().toLowerCase();
                if (!playerMap.has(id)) {
                  playerMap.set(id, { name: rawName, elo: INITIAL_ELO, games: new Set(), gamesPlayed: 0, stats: [] });
                }
                playerEloMap[rawName] = playerMap.get(id)!.elo;
              });
            });
            const { playerRatings } = this.ratingService.processMatchResults(teamGameResults, playerEloMap);
            playerRatings.forEach(rating => {
              const id = rating.playerName.trim().toLowerCase();
              const playerStats = playerMap.get(id)!;
              playerStats.elo = rating.eloRating;
              playerStats.games.add(`${fileIdx}_${gameNumber}`);
              playerStats.gamesPlayed++;
              const team = teamGameResults.find((t: any) => t.players.some((p: any) => (p.playerName || p.name || '').trim().toLowerCase() === id));
              const ps = team ? team.players.find((p: any) => (p.playerName || p.name || '').trim().toLowerCase() === id) : undefined;
              if (ps) {
                playerStats.stats.push({ ...ps, placement: team.placement });
              }
            });
          });
          fileIdx++;
        }
        const result: PlayerAggregatedStats[] = [];
        playerMap.forEach((val, id) => {
          // No filter on games played
          const totalKills = val.stats.reduce((sum, s) => sum + (s.kills || 0), 0);
          const totalDamage = val.stats.reduce((sum, s) => sum + (s.damage || s.damage_dealt || 0), 0);
          const totalRevives = val.stats.reduce((sum, s) => sum + (s.revives || s.revives_given || 0), 0);
          const totalRespawns = val.stats.reduce((sum, s) => sum + (s.respawns || s.respawns_given || 0), 0);
          const totalPoints = val.stats.reduce((sum, s) => sum + (s.score || 0), 0);
          const averageKills = totalKills / (val.stats.length || 1);
          const averageDamage = totalDamage / (val.stats.length || 1);
          const averagePlacement = val.stats.reduce((sum, s) => sum + (s.placement || 0), 0) / (val.stats.length || 1);
          const winRate = (val.stats.filter(s => (s.placement || 0) === 1).length / (val.stats.length || 1)) * 100;
          const topThreeRate = (val.stats.filter(s => (s.placement || 0) <= 3).length / (val.stats.length || 1)) * 100;
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
        });
        return result.sort((a, b) => b.finalElo! - a.finalElo!);
      })
    );
  }

    /**
   * Returns stats for each performance score factor and the overall performance score.
   */
  getPerformanceFactorStats(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<PerformanceFactorStats> {
    return this.scrimFileService.loadAllScrimBatchFiles().pipe(
      map((jsons: any[]) => {
        const placementArr: number[] = [];
        const combatArr: number[] = [];
        const damageArr: number[] = [];
        const supportArr: number[] = [];
  const perfArr: number[] = [];
  const normPerfArr: number[] = [];
        jsons.forEach(json => {
          if (!json) return;
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
            if (!matchDay) return; 
          Object.values(matchDay).forEach((teamGameResults: any) => {
            if (!Array.isArray(teamGameResults)) return;
            // Collect all player perf scores for this game
            const gamePerfScores: number[] = [];
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const placement = team.placement;
                const kills = ps.kills || 0;
                const assists = ps.assists || 0;
                const damage = ps.damage || ps.damage_dealt || 0;
                const revives = ps.revives || ps.revives_given || 0;
                // Factor calculations (copied from EloCalculatorService)
                const placementFactor = this.eloCalculator.calculateTieredPlacementScore(placement);
                const combatScore = kills + assists;
                const combatFactor = Math.min(1, combatScore / 6);
                const damageFactor = Math.min(1, damage / 1200);
                const supportFactor = Math.min(1, revives / 3);
                const perf = (
                  (placementFactor * this.eloCalculator.getPlacementWeight() / 100) +
                  (combatFactor * this.eloCalculator.getCombatWeight() / 100) +
                  (damageFactor * this.eloCalculator.getDamageWeight() / 100) +
                  (supportFactor * this.eloCalculator.getSupportWeight() / 100)
                );
                placementArr.push(placementFactor);
                combatArr.push(combatFactor);
                damageArr.push(damageFactor);
                supportArr.push(supportFactor);
                perfArr.push(perf);
                gamePerfScores.push(perf);
              });
            });
            // Normalize this game's perf scores and add to normPerfArr
            if (gamePerfScores.length > 0) {
              const normScores = EloCalculatorService.sumNormalizePerformanceScores(gamePerfScores);
              normPerfArr.push(...normScores);
            }
          });
        });
        function stats(arr: number[]) {
          const n = arr.length;
          if (n === 0) return { mean: 0, min: 0, max: 0, std: 0 };
          const mean = arr.reduce((a, b) => a + b, 0) / n;
          const min = Math.min(...arr);
          const max = Math.max(...arr);
          const std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
          return { mean, min, max, std };
        }
        return {
          placement: stats(placementArr),
          combat: stats(combatArr),
          damage: stats(damageArr),
          support: stats(supportArr),
          performance: stats(normPerfArr) // Use normalized per-game perf scores for summary
        };
      })
    );
  }

  

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
   * Loads all scrim batch JSON files from assets, aggregates ELOs for each player,
   * and returns those with >= 18 games played.
   */
  getAggregatedPlayerElosFromScrimFiles(loadScrimTableFromJsonObject: (json: any) => MatchDayResults): Observable<PlayerAggregatedStats[]> {
    // Get the list of files in chronological order (by filename)
    const fileNames = (this.scrimFileService.getAllScrimBatchFiles && this.scrimFileService.getAllScrimBatchFiles()) || [];
    const sortedFileNames = [...fileNames].sort();
    // Load all files in order
    const fileRequests = sortedFileNames.map(name =>
      this.scrimFileService['http'].get<any>(`assets/scrims_batch/${name}`).pipe(catchError(() => of(null)))
    );
    return forkJoin(fileRequests).pipe(
      map(jsons => {
        const playerMap = new Map<string, {
          name: string;
          elo: number;
          games: Set<string>;
          gamesPlayed: number;
          stats: any[];
        }>();
        const INITIAL_ELO = EloCalculatorService.INITIAL_ELO || 1500;
        let fileIdx = 0;
        for (const json of jsons) {
          if (!json) { fileIdx++; continue; }
          const matchDay: MatchDayResults = loadScrimTableFromJsonObject(json);
          if (!matchDay) { fileIdx++; continue; }
          Object.entries(matchDay).forEach(([gameNumber, teamGameResults]: [string, any]) => {
            if (!Array.isArray(teamGameResults)) return;
            // Build playerEloMap for this game (use current Elo from playerMap)
            const playerEloMap: { [playerName: string]: number } = {};
            teamGameResults.forEach((team: any) => {
              if (!team.players) return;
              team.players.forEach((ps: any) => {
                const rawName = ps.playerName || ps.name || '';
                const id = rawName.trim().toLowerCase();
                if (!playerMap.has(id)) {
                  playerMap.set(id, { name: rawName, elo: INITIAL_ELO, games: new Set(), gamesPlayed: 0, stats: [] });
                }
                playerEloMap[rawName] = playerMap.get(id)!.elo;
              });
            });
            // Use RatingService to process Elo changes for this game
            const { playerRatings } = this.ratingService.processMatchResults(teamGameResults, playerEloMap);
            // Update playerMap with new Elos and stats
            playerRatings.forEach(rating => {
              const id = rating.playerName.trim().toLowerCase();
              const playerStats = playerMap.get(id)!;
              playerStats.elo = rating.eloRating;
              playerStats.games.add(`${fileIdx}_${gameNumber}`);
              playerStats.gamesPlayed++;
              // Find the player's stats in the teamGameResults
              const team = teamGameResults.find((t: any) => t.players.some((p: any) => (p.playerName || p.name || '').trim().toLowerCase() === id));
              const ps = team ? team.players.find((p: any) => (p.playerName || p.name || '').trim().toLowerCase() === id) : undefined;
              if (ps) {
                playerStats.stats.push({ ...ps, placement: team.placement });
              }
            });
          });
          fileIdx++;
        }
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
