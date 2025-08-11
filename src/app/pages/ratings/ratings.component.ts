import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerAggregatedStats, ScrimsDataService } from '../../services/scrims-data.service';
import { EloCalculatorService } from '../../services/elo-calculator.service';
import { EloAggregationService } from '../../services/elo-aggregation.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent implements OnInit {
  avgExpectedEloChange: number | null = null;
  // Max theoretical stats for scenario
  maxEloGain = 0;
  maxEloLoss = 0;
  maxPlacementEloGain = 0;
  maxCombatEloGain = 0;
  maxDamageEloGain = 0;
  maxSupportEloGain = 0;
  // Leaderboard data
  playerEloLeaderboard: (PlayerAggregatedStats & { finalElo?: number })[] = [];
  loadingLeaderboard = true;
  leaderboardError = '';

  // Elo stats
  eloMin: number | null = null;
  eloMax: number | null = null;
  eloMean: number | null = null;
  eloStdDev: number | null = null;
  avgUnratedOpponentPct: number | null = null;
  perfScoreStats: { min: number | null, max: number | null, mean: number | null, stdDev: number | null } = { min: null, max: null, mean: null, stdDev: null };

  // Elo leakage stat
  avgEloLeakagePerGame: number | null = null;

  // Avg Elo gain/loss per game
  avgEloGainPerGame: number | null = null;
  avgEloLossPerGame: number | null = null;

  // Avg net Elo change per game
  avgNetEloChangePerGame: number | null = null;

  // Test Scenario Values (adjusted to realistic expectations based on pro data)
  testPlacement = 10;
  testKills = 1;      // More realistic starting point
  testAssists = 1;    // Average assists per game
  testDamage = 400;   // More typical damage for average players
  testRevives = 0;    // Most games have no revives

  // Calculated Results
  calculatedRatingChange = 0;
  calculatedPerformanceScore = 0;
  // Scenario Elo parameters
  scenarioPlayerElo = 1500;
  scenarioAvgOpponentElo = 1500;
  scenarioGamesPlayed = 20;


  constructor(
    private eloAggregationService: EloAggregationService,
    private scrimsDataService: ScrimsDataService,
    public eloCalculator: EloCalculatorService
  ) { }

  ngOnInit(): void {
    this.calculateRating();
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    this.leaderboardError = '';
    this.eloAggregationService.getAggregatedPlayerElosFromScrimFiles(
      (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
    ).subscribe({
      next: (data) => {
        this.playerEloLeaderboard = data;
        this.calculateEloStats();
        // Subscribe to getAvgUnratedOpponentPct and set value when emitted
        this.eloAggregationService.getAvgUnratedOpponentPct(
          (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
        ).subscribe(pct => {
          this.avgUnratedOpponentPct = pct;
        });
        this.eloAggregationService.getPerformanceFactorStats(
          (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
        ).subscribe(stats => {
          // If you want just the overall performance score stats:
          if (stats && stats.performance) {
            this.perfScoreStats = {
              min: stats.performance.min,
              max: stats.performance.max,
              mean: stats.performance.mean,
              stdDev: stats.performance.std // 'std' in StatSummary, not 'stdDev'
            };
          } else {
            this.perfScoreStats = { min: null, max: null, mean: null, stdDev: null };
          }
        });
        this.eloAggregationService.getAvgEloLeakagePerGame(
          (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
        ).subscribe(val => {
          this.avgEloLeakagePerGame = val;
        });
        this.eloAggregationService.getAvgEloGainLossPerGame(
          (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
        ).subscribe(result => {
          this.avgEloGainPerGame = result.avgGain;
          this.avgEloLossPerGame = result.avgLoss;
        });
        this.eloAggregationService.getAvgNetEloChangePerGame(
          (json: any) => this.scrimsDataService.loadScrimTableFromJsonObject(json)
        ).subscribe(val => {
          this.avgNetEloChangePerGame = val;
        });
        this.loadingLeaderboard = false;
      },
      error: (err) => {
        this.leaderboardError = 'Failed to load leaderboard.';
        this.loadingLeaderboard = false;
      }
    });
  }

  calculateEloStats(): void {
    if (!this.playerEloLeaderboard.length) {
      this.eloMin = this.eloMax = this.eloMean = this.eloStdDev = null;
      return;
    }
  const elos = this.playerEloLeaderboard.map(p => (p.finalElo !== undefined ? p.finalElo : p.estimatedElo));
    this.eloMin = Math.min(...elos);
    this.eloMax = Math.max(...elos);
    const sum = elos.reduce((a, b) => a + b, 0);
    this.eloMean = sum / elos.length;
    const variance = elos.reduce((acc, val) => acc + Math.pow(val - this.eloMean!, 2), 0) / elos.length;
    this.eloStdDev = Math.sqrt(variance);
  }

  updateTestValue(type: string, event: any): void {
    const value = parseInt(event.target.value);
    
    switch (type) {
      case 'placement':
        this.testPlacement = value;
        break;
      case 'kills':
        this.testKills = value;
        break;
      case 'assists':
        this.testAssists = value;
        break;
      case 'damage':
        this.testDamage = value;
        break;
      case 'revives':
        this.testRevives = value;
        break;
    }
    
    this.calculateRating();
  }

  calculateRating(): void {
    this.calculatedPerformanceScore = this.eloCalculator.calculatePerformanceScore(
      this.testPlacement,
      this.testKills,
      this.testAssists,
      this.testDamage,
      this.testRevives
    );
    // Use the real Elo calculation for scenarios
    this.calculatedRatingChange = this.eloCalculator.calculateEloChangeWithOpponent(
      this.scenarioPlayerElo,
      this.scenarioAvgOpponentElo,
      this.calculatedPerformanceScore,
      this.scenarioGamesPlayed
    );
      // If max gain and loss are the same (in magnitude), show average expected Elo gain/loss for a fair match
      if (Math.abs(this.maxEloGain) === Math.abs(this.maxEloLoss)) {
        // For a fair match: player Elo = opponent Elo, performance = 0.5, k = 65 (new player)
        const fairElo = 1500;
        const fairK = 65;
        const fairExpected = 1 / (1 + Math.pow(10, (fairElo - fairElo) / 400)); // = 0.5
        this.avgExpectedEloChange = Math.round(fairK * (0.5 - fairExpected));
      } else {
        this.avgExpectedEloChange = null;
      }

  // Calculate max theoretical Elo gain (perfect performance, lowest player Elo, highest opponent Elo, lowest games played)
  const minPlayerElo = 800;
  const maxOpponentElo = 2200;
  const minGamesPlayed = 0;
  const maxPerformance = 1;
  const k = minGamesPlayed < 18 ? 65 : 45;
  const expectedScoreMax = 1 / (1 + Math.pow(10, (maxOpponentElo - minPlayerElo) / 400));
  this.maxEloGain = Math.round(k * (maxPerformance - expectedScoreMax));

  // Max theoretical Elo loss: worst performance, highest player Elo, lowest opponent Elo
  const maxPlayerElo = 2200;
  const minOpponentElo = 800;
  const expectedScoreMin = 1 / (1 + Math.pow(10, (minOpponentElo - maxPlayerElo) / 400));
  this.maxEloLoss = Math.round(k * (0 - expectedScoreMin));

  // Max Elo gain for each weighting category (holding others at 0)
  // Placement
  const maxPlacementScore = this.eloCalculator.calculatePerformanceScore(1, 0, 0, 0, 0);
  this.maxPlacementEloGain = Math.round(k * (maxPlacementScore - expectedScoreMax));
  // Combat
  const maxCombatScore = this.eloCalculator.calculatePerformanceScore(20, 6, 0, 0, 0);
  this.maxCombatEloGain = Math.round(k * (maxCombatScore - expectedScoreMax));
  // Damage
  const maxDamageScore = this.eloCalculator.calculatePerformanceScore(20, 0, 0, 1200, 0);
  this.maxDamageEloGain = Math.round(k * (maxDamageScore - expectedScoreMax));
  // Support
  const maxSupportScore = this.eloCalculator.calculatePerformanceScore(20, 0, 0, 0, 3);
  this.maxSupportEloGain = Math.round(k * (maxSupportScore - expectedScoreMax));
  }

  // Use EloCalculatorService for placement score
  private calculateTieredPlacementScore(placement: number): number {
    return this.eloCalculator.calculateTieredPlacementScore(placement);
  }

  getRatingChangeClass(): string {
    if (this.calculatedRatingChange > 0) return 'positive';
    if (this.calculatedRatingChange < 0) return 'negative';
    return 'neutral';
  }

  getFactorContribution(factor: string): number {
    // Use the same weights as EloCalculatorService
    let factorValue = 0;
    let weight = 0;
    switch (factor) {
      case 'placement':
        factorValue = this.eloCalculator.calculateTieredPlacementScore(this.testPlacement);
        weight = 50;
        break;
      case 'combat':
        const combatScore = this.testKills + this.testAssists;
        factorValue = Math.min(1, combatScore / 6);
        weight = 30;
        break;
      case 'damage':
        factorValue = Math.min(1, this.testDamage / 1200);
        weight = 15;
        break;
      case 'support':
        weight = 5;
        break;
    }
    return factorValue * weight;
  }

  loadScenario(scenario: string): void {
    switch (scenario) {
      case 'winner':
        this.testPlacement = 1;
        this.testKills = 5;    // More realistic for typical players
        this.testAssists = 3;  // Good teamwork in winning game
        this.testDamage = 1100; // Scaled down from pro levels
        this.testRevives = 2;   // More realistic
        break;
      case 'top5':
        this.testPlacement = 4;
        this.testKills = 3;     // More achievable
        this.testAssists = 2;   // Solid assists
        this.testDamage = 800;  // Scaled appropriately  
        this.testRevives = 1;   // More realistic
        break;
      case 'mid':
        this.testPlacement = 10;
        this.testKills = 1;     // Closer to average player performance
        this.testAssists = 1;   // Average assist participation
        this.testDamage = 400;  // More typical damage
        this.testRevives = 0;   // Most games have no revives
        break;
      case 'poor':
        this.testPlacement = 18;
        this.testKills = 0;
        this.testAssists = 0;   // No combat participation
        this.testDamage = 150;  // Minimal engagement
        this.testRevives = 0;
        break;
    }
    this.calculateRating();
  }

  updateScenarioValue(type: string, event: any): void {
    const value = parseInt(event.target.value);
    switch (type) {
      case 'playerElo':
        this.scenarioPlayerElo = value;
        break;
      case 'avgOpponentElo':
        this.scenarioAvgOpponentElo = value;
        break;
      case 'gamesPlayed':
        this.scenarioGamesPlayed = value;
        break;
    }
    this.calculateRating();
  }
}
