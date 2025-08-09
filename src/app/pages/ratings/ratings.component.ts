import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent implements OnInit {

  // Test Scenario Values (adjusted to realistic expectations based on pro data)
  testPlacement = 10;
  testKills = 1;      // More realistic starting point
  testAssists = 1;    // Average assists per game
  testDamage = 400;   // More typical damage for average players
  testRevives = 0;    // Most games have no revives

  // Calculated Results
  calculatedRatingChange = 0;
  calculatedPerformanceScore = 0;

  // Fixed weights for battle royale rating (placement reduced to 50%)
  private placementWeight = 50;  // Decreased from 55% to 50%
  private combatWeight = 30;     // Increased from 28% to 30%
  private damageWeight = 15;     // Increased from 12% to 15%
  private supportWeight = 5;     // Unchanged - revives are less common in reality

  constructor() { }

  ngOnInit(): void {
    this.calculateRating();
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
    // Calculate normalized factors (0-1) - adjusted based on pro player benchmarks
    // Use tier-based placement scoring that matches actual tournament point distribution
    const placementFactor = this.calculateTieredPlacementScore(this.testPlacement);
    
    // Pro average: 1.11 kills/game, 1.67 assists/game. Combine for combat score
    // Count kills and assists equally (both = 1.0 value)
    const combatScore = this.testKills + this.testAssists;
    const combatFactor = Math.min(1, combatScore / 6); // Up to 6 combat score = 100% (more realistic)
    
    // Pro average: 510 damage/game. Scale so 800-1000 = very good for typical players  
    const damageFactor = Math.min(1, this.testDamage / 1200); // Up to 1200 damage = 100% (more realistic)
    
    // Pro average: 0.22 revives/game. Most games will have 0-2 revives realistically
    const supportFactor = Math.min(1, this.testRevives / 3); // Up to 3 revives = 100% (more realistic)

    // Calculate weighted performance score with adjusted weights
    this.calculatedPerformanceScore = (
      (placementFactor * this.placementWeight / 100) +
      (combatFactor * this.combatWeight / 100) +
      (damageFactor * this.damageWeight / 100) +
      (supportFactor * this.supportWeight / 100)
    );

    // Calculate rating change using Elo formula with adjustments for Battle Royale
    const expectedScore = 0.2827; // Recalibrated for zero inflation with 20th place = 0%
    const kFactor = 35; // Balanced K-factor for +25/-10 range with zero inflation
    this.calculatedRatingChange = Math.round(kFactor * (this.calculatedPerformanceScore - expectedScore));
  }

  // Explicit placement scoring - adjusted to be less harsh for top half
  private calculateTieredPlacementScore(placement: number): number {
    // Adjusted values to make 10th place = -10 Elo (less harsh for top half)
    switch (placement) {
      case 1: return 1.00;   // 100% - 50% weight = 50.0% contribution
      case 2: return 0.85;   // 85% - 50% weight = 42.5% contribution  
      case 3: return 0.75;   // 75% - 50% weight = 37.5% contribution  
      case 4: return 0.65;   // 65% - 50% weight = 32.5% contribution  
      case 5: return 0.55;   // 55% - 50% weight = 27.5% contribution  
      case 6: return 0.45;   // 45% - 50% weight = 22.5% contribution  
      case 7: return 0.35;   // 35% - 50% weight = 17.5% contribution  
      case 8: return 0.28;   // 28% - 50% weight = 14.0% contribution   
      case 9: return 0.24;   // 24% - 50% weight = 12.0% contribution   
      case 10: return 0.20;  // 20% - 50% weight = 10.0% contribution = -10 Elo
      case 11: return 0.12;  // 12% - 50% weight = 6.0% contribution    
      case 12: return 0.10;  // 10% - 50% weight = 5.0% contribution    
      case 13: return 0.08;  // 8% - 50% weight = 4.0% contribution    
      case 14: return 0.07;  // 7% - 50% weight = 3.5% contribution    
      case 15: return 0.06;  // 6% - 50% weight = 3.0% contribution    
      case 16: return 0.05;  // 5% - 50% weight = 2.5% contribution   
      case 17: return 0.04;  // 4% - 50% weight = 2.0% contribution   
      case 18: return 0.03;  // 3% - 50% weight = 1.5% contribution - Less harsh
      case 19: return 0.02;  // 2% - 50% weight = 1.0% contribution - Less harsh
      case 20: return 0.0;   // 0% - 50% weight = 0.0% contribution - Dead last punishment
      default: return 0.0;
    }
  }

  getRatingChangeClass(): string {
    if (this.calculatedRatingChange > 0) return 'positive';
    if (this.calculatedRatingChange < 0) return 'negative';
    return 'neutral';
  }

  getFactorContribution(factor: string): number {
    let factorValue = 0;
    let weight = 0;
    
    switch (factor) {
      case 'placement':
        factorValue = this.calculateTieredPlacementScore(this.testPlacement);
        weight = this.placementWeight;
        break;
      case 'combat':
        const combatScore = this.testKills + this.testAssists;
        factorValue = Math.min(1, combatScore / 6); // Updated to match new calculation
        weight = this.combatWeight;
        break;
      case 'damage':
        factorValue = Math.min(1, this.testDamage / 1200); // Updated to match new calculation
        weight = this.damageWeight;
        break;
      case 'support':
        factorValue = Math.min(1, this.testRevives / 3); // Updated to match new calculation
        weight = this.supportWeight;
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
}
