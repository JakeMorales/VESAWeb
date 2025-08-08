import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, RatingCalculationResult } from '../../services/rating.service';

@Component({
  selector: 'app-rating-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-container">
      <div class="calculator-grid">
        <!-- Elo Calculator -->
        <div class="calculator-section">
          <h3>Elo Rating Calculator</h3>
          <div class="input-group">
            <label>Player Rating:</label>
            <input type="number" [(ngModel)]="playerElo" class="rating-input">
          </div>
          <div class="input-group">
            <label>Opponent Rating:</label>
            <input type="number" [(ngModel)]="opponentElo" class="rating-input">
          </div>
          <div class="input-group">
            <label>Result:</label>
            <select [(ngModel)]="eloResult" class="result-select">
              <option value="1">Win (1.0)</option>
              <option value="0.5">Draw (0.5)</option>
              <option value="0">Loss (0.0)</option>
            </select>
          </div>
          <button (click)="calculateElo()" class="calculate-btn">Calculate Elo Change</button>
          
          <div class="result" *ngIf="eloChange !== null">
            <h4>Elo Result:</h4>
            <p>Rating Change: <span [class]="eloChange >= 0 ? 'positive' : 'negative'">{{eloChange >= 0 ? '+' : ''}}{{eloChange}}</span></p>
            <p>New Rating: <strong>{{playerElo + eloChange}}</strong></p>
          </div>
        </div>

        <!-- Glicko Calculator -->
        <div class="calculator-section">
          <h3>Glicko Rating Calculator</h3>
          <div class="input-group">
            <label>Player Rating:</label>
            <input type="number" [(ngModel)]="playerGlicko" class="rating-input">
          </div>
          <div class="input-group">
            <label>Player RD:</label>
            <input type="number" [(ngModel)]="playerRD" class="rating-input" step="0.1">
          </div>
          <div class="input-group">
            <label>Opponent Rating:</label>
            <input type="number" [(ngModel)]="opponentGlicko" class="rating-input">
          </div>
          <div class="input-group">
            <label>Opponent RD:</label>
            <input type="number" [(ngModel)]="opponentRD" class="rating-input" step="0.1">
          </div>
          <div class="input-group">
            <label>Result:</label>
            <select [(ngModel)]="glickoResult" class="result-select">
              <option value="1">Win (1.0)</option>
              <option value="0.5">Draw (0.5)</option>
              <option value="0">Loss (0.0)</option>
            </select>
          </div>
          <button (click)="calculateGlicko()" class="calculate-btn">Calculate Glicko Change</button>
          
          <div class="result" *ngIf="glickoChange !== null">
            <h4>Glicko Result:</h4>
            <p>Rating Change: <span [class]="glickoChange.newRating - playerGlicko >= 0 ? 'positive' : 'negative'">
              {{glickoChange.newRating - playerGlicko >= 0 ? '+' : ''}}{{glickoChange.newRating - playerGlicko}}
            </span></p>
            <p>New Rating: <strong>{{glickoChange.newRating}}</strong></p>
            <p>New RD: <strong>{{glickoChange.newDeviation}}</strong></p>
          </div>
        </div>
      </div>

      <!-- Quick Scenarios -->
      <div class="scenarios-section">
        <h3>Quick Test Scenarios</h3>
        <div class="scenario-buttons">
          <button (click)="loadScenario('equal')" class="scenario-btn">Equal Ratings</button>
          <button (click)="loadScenario('underdog')" class="scenario-btn">Underdog Win</button>
          <button (click)="loadScenario('favorite')" class="scenario-btn">Favorite Win</button>
          <button (click)="loadScenario('upset')" class="scenario-btn">Major Upset</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './rating-calculator.component.css'
})
export class RatingCalculatorComponent {
  
  // Elo inputs
  playerElo: number = 1500;
  opponentElo: number = 1500;
  eloResult: number = 1;
  eloChange: number | null = null;

  // Glicko inputs
  playerGlicko: number = 1500;
  playerRD: number = 350;
  opponentGlicko: number = 1500;
  opponentRD: number = 350;
  glickoResult: number = 1;
  glickoChange: { newRating: number; newDeviation: number } | null = null;

  constructor(private ratingService: RatingService) {}

  calculateElo(): void {
    this.eloChange = this.ratingService.calculateEloChange(
      this.playerElo,
      this.opponentElo,
      this.eloResult
    );
  }

  calculateGlicko(): void {
    this.glickoChange = this.ratingService.calculateGlickoChange(
      this.playerGlicko,
      this.playerRD,
      this.opponentGlicko,
      this.opponentRD,
      this.glickoResult
    );
  }

  loadScenario(scenario: string): void {
    switch (scenario) {
      case 'equal':
        this.playerElo = 1500;
        this.opponentElo = 1500;
        this.playerGlicko = 1500;
        this.opponentGlicko = 1500;
        this.playerRD = 200;
        this.opponentRD = 200;
        this.eloResult = 1;
        this.glickoResult = 1;
        break;
      case 'underdog':
        this.playerElo = 1300;
        this.opponentElo = 1700;
        this.playerGlicko = 1300;
        this.opponentGlicko = 1700;
        this.playerRD = 150;
        this.opponentRD = 150;
        this.eloResult = 1;
        this.glickoResult = 1;
        break;
      case 'favorite':
        this.playerElo = 1700;
        this.opponentElo = 1300;
        this.playerGlicko = 1700;
        this.opponentGlicko = 1300;
        this.playerRD = 150;
        this.opponentRD = 150;
        this.eloResult = 1;
        this.glickoResult = 1;
        break;
      case 'upset':
        this.playerElo = 1200;
        this.opponentElo = 1800;
        this.playerGlicko = 1200;
        this.opponentGlicko = 1800;
        this.playerRD = 100;
        this.opponentRD = 100;
        this.eloResult = 1;
        this.glickoResult = 1;
        break;
    }
    
    // Clear previous results
    this.eloChange = null;
    this.glickoChange = null;
  }
}
