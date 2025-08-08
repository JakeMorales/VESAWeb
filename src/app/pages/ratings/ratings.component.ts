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
  testDamage = 400;   // More typical damage for average players
  testRevives = 0;    // Most games have no revives

  // Calculated Results
  calculatedRatingChange = 0;
  calculatedPerformanceScore = 0;

  // Fixed weights for battle royale rating (adjusted based on pro player analysis)
  private placementWeight = 45;  // Increased - placement is king in BR
  private combatWeight = 30;     // Increased - kills matter more than originally thought
  private damageWeight = 20;     // Increased - damage consistency is important
  private supportWeight = 5;     // Decreased - revives are less common in reality

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
    const placementFactor = (20 - this.testPlacement + 1) / 20; // Better placement = higher score
    
    // Pro average: 1.11 kills/game. Scale so 3-4 kills = very good performance for typical players
    const combatFactor = Math.min(1, this.testKills / 6); // Up to 6 kills = 100% (more realistic)
    
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

    // Calculate rating change using Elo formula
    const expectedScore = 0.5; // Neutral expectation (50%)
    const kFactor = 32;
    this.calculatedRatingChange = Math.round(kFactor * (this.calculatedPerformanceScore - expectedScore));
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
        factorValue = (20 - this.testPlacement + 1) / 20;
        weight = this.placementWeight;
        break;
      case 'combat':
        factorValue = Math.min(1, this.testKills / 6); // Updated to match new calculation
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
        this.testDamage = 1100; // Scaled down from pro levels
        this.testRevives = 2;   // More realistic
        break;
      case 'top5':
        this.testPlacement = 4;
        this.testKills = 3;     // More achievable
        this.testDamage = 800;  // Scaled appropriately  
        this.testRevives = 1;   // More realistic
        break;
      case 'mid':
        this.testPlacement = 10;
        this.testKills = 1;     // Closer to average player performance
        this.testDamage = 400;  // More typical damage
        this.testRevives = 0;   // Most games have no revives
        break;
      case 'poor':
        this.testPlacement = 18;
        this.testKills = 0;
        this.testDamage = 150;  // Minimal engagement
        this.testRevives = 0;
        break;
    }
    this.calculateRating();
  }
}
