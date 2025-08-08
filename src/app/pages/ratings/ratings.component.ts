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

  // Test Scenario Values
  testPlacement = 10;
  testKills = 3;
  testDamage = 1200;
  testRevives = 1;

  // Calculated Results
  calculatedRatingChange = 0;
  calculatedPerformanceScore = 0;

  // Fixed weights for battle royale rating
  private placementWeight = 40;
  private combatWeight = 25;
  private damageWeight = 15;
  private supportWeight = 10;

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
    // Calculate normalized factors (0-1)
    const placementFactor = (20 - this.testPlacement + 1) / 20; // Better placement = higher score
    const combatFactor = Math.min(1, this.testKills / 15); // Up to 15 kills = 100%
    const damageFactor = Math.min(1, this.testDamage / 3000); // Up to 3000 damage = 100%
    const supportFactor = Math.min(1, this.testRevives / 8); // Up to 8 revives = 100%

    // Calculate weighted performance score with fixed weights
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
        factorValue = Math.min(1, this.testKills / 15);
        weight = this.combatWeight;
        break;
      case 'damage':
        factorValue = Math.min(1, this.testDamage / 3000);
        weight = this.damageWeight;
        break;
      case 'support':
        factorValue = Math.min(1, this.testRevives / 8);
        weight = this.supportWeight;
        break;
    }
    
    return factorValue * weight;
  }

  loadScenario(scenario: string): void {
    switch (scenario) {
      case 'winner':
        this.testPlacement = 1;
        this.testKills = 12;
        this.testDamage = 2800;
        this.testRevives = 3;
        break;
      case 'top5':
        this.testPlacement = 4;
        this.testKills = 7;
        this.testDamage = 2100;
        this.testRevives = 2;
        break;
      case 'mid':
        this.testPlacement = 10;
        this.testKills = 3;
        this.testDamage = 1200;
        this.testRevives = 1;
        break;
      case 'poor':
        this.testPlacement = 18;
        this.testKills = 0;
        this.testDamage = 400;
        this.testRevives = 0;
        break;
    }
    this.calculateRating();
  }
}
