import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../services/rating.service';
import { MockMatchData } from '../../services/mock-data';

export interface RatingHistoryPoint {
  date: Date;
  elo: number;
  glicko: number;
}

@Component({
  selector: 'app-rating-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rating-history-container">
      <div class="controls">
        <div class="player-select">
          <label>Select Player:</label>
          <select [(ngModel)]="selectedPlayer" (change)="loadPlayerHistory()" class="player-select-dropdown">
            <option value="">Select a player</option>
            <option *ngFor="let player of availablePlayers" [value]="player">
              {{player}}
            </option>
          </select>
        </div>
        <button (click)="generateMockHistory()" class="generate-btn" [disabled]="!selectedPlayer">
          Generate Mock History
        </button>
      </div>

      <div class="history-content" *ngIf="selectedPlayer && ratingHistory.length > 0">
        <div class="current-stats">
          <h3>{{selectedPlayer}} - Current Stats</h3>
          <div class="stat-cards">
            <div class="stat-card">
              <h4>Current Elo</h4>
              <p class="rating-value">{{getCurrentElo()}}</p>
            </div>
            <div class="stat-card">
              <h4>Current Glicko</h4>
              <p class="rating-value">{{getCurrentGlicko()}}</p>
            </div>
            <div class="stat-card">
              <h4>30-Day Change (Elo)</h4>
              <p class="rating-change" [class]="getEloChangeClass()">{{getEloChange()}}</p>
            </div>
            <div class="stat-card">
              <h4>30-Day Change (Glicko)</h4>
              <p class="rating-change" [class]="getGlickoChangeClass()">{{getGlickoChange()}}</p>
            </div>
          </div>
        </div>

        <!-- Simple Chart Visualization -->
        <div class="chart-container">
          <h3>Rating History (Last 30 Days)</h3>
          <div class="chart-wrapper">
            <div class="chart" #chartContainer>
              <!-- Elo Line Chart -->
              <div class="chart-section">
                <h4>Elo Rating</h4>
                <div class="line-chart elo-chart">
                  <svg width="100%" height="200" viewBox="0 0 800 200">
                    <!-- Grid lines -->
                    <defs>
                      <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    <!-- Elo line -->
                    <polyline
                      [attr.points]="getEloPoints()"
                      fill="none"
                      stroke="#3498db"
                      stroke-width="2"/>
                    
                    <!-- Data points -->
                    <circle
                      *ngFor="let point of ratingHistory; let i = index"
                      [attr.cx]="getXPosition(i)"
                      [attr.cy]="getEloYPosition(point.elo)"
                      r="3"
                      fill="#3498db"/>
                  </svg>
                </div>
              </div>

              <!-- Glicko Line Chart -->
              <div class="chart-section">
                <h4>Glicko Rating</h4>
                <div class="line-chart glicko-chart">
                  <svg width="100%" height="200" viewBox="0 0 800 200">
                    <!-- Grid lines -->
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    <!-- Glicko line -->
                    <polyline
                      [attr.points]="getGlickoPoints()"
                      fill="none"
                      stroke="#e74c3c"
                      stroke-width="2"/>
                    
                    <!-- Data points -->
                    <circle
                      *ngFor="let point of ratingHistory; let i = index"
                      [attr.cx]="getXPosition(i)"
                      [attr.cy]="getGlickoYPosition(point.glicko)"
                      r="3"
                      fill="#e74c3c"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="history-table-container">
          <h3>Detailed History</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Elo Rating</th>
                <th>Elo Change</th>
                <th>Glicko Rating</th>
                <th>Glicko Change</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let point of ratingHistory; let i = index">
                <td>{{formatDate(point.date)}}</td>
                <td class="rating-value">{{point.elo}}</td>
                <td class="rating-change" [class]="getChangeClass(getEloChangeForDay(i))">
                  {{getEloChangeForDay(i)}}
                </td>
                <td class="rating-value">{{point.glicko}}</td>
                <td class="rating-change" [class]="getChangeClass(getGlickoChangeForDay(i))">
                  {{getGlickoChangeForDay(i)}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="no-data" *ngIf="selectedPlayer && ratingHistory.length === 0">
        <p>No rating history available for {{selectedPlayer}}. Click "Generate Mock History" to create sample data.</p>
      </div>

      <div class="instructions" *ngIf="!selectedPlayer">
        <p>Select a player to view their rating history and track performance over time.</p>
      </div>
    </div>
  `,
  styleUrl: './rating-history.component.css'
})
export class RatingHistoryComponent implements OnInit {
  
  selectedPlayer: string = '';
  availablePlayers: string[] = [];
  ratingHistory: RatingHistoryPoint[] = [];

  constructor(private ratingService: RatingService) { }

  ngOnInit(): void {
    this.loadAvailablePlayers();
  }

  loadAvailablePlayers(): void {
    // Get all unique player names from mock data
    const matchData = MockMatchData.getMatchDayResults();
    const allGameResults = Object.values(matchData).flat();
    const playerNames = new Set<string>();
    
    allGameResults.forEach(result => {
      result.players.forEach(player => {
        playerNames.add(player.playerName);
      });
    });
    
    this.availablePlayers = Array.from(playerNames).sort();
  }

  loadPlayerHistory(): void {
    if (!this.selectedPlayer) {
      this.ratingHistory = [];
      return;
    }
    
    // For now, we'll just clear the history - user needs to generate mock data
    this.ratingHistory = [];
  }

  generateMockHistory(): void {
    if (!this.selectedPlayer) return;
    
    this.ratingHistory = this.ratingService.generateMockRatingHistory(this.selectedPlayer);
  }

  getCurrentElo(): number {
    if (this.ratingHistory.length === 0) return 0;
    return this.ratingHistory[this.ratingHistory.length - 1].elo;
  }

  getCurrentGlicko(): number {
    if (this.ratingHistory.length === 0) return 0;
    return this.ratingHistory[this.ratingHistory.length - 1].glicko;
  }

  getEloChange(): string {
    if (this.ratingHistory.length < 2) return '0';
    const first = this.ratingHistory[0].elo;
    const last = this.ratingHistory[this.ratingHistory.length - 1].elo;
    const change = last - first;
    return change >= 0 ? `+${change}` : `${change}`;
  }

  getGlickoChange(): string {
    if (this.ratingHistory.length < 2) return '0';
    const first = this.ratingHistory[0].glicko;
    const last = this.ratingHistory[this.ratingHistory.length - 1].glicko;
    const change = last - first;
    return change >= 0 ? `+${change}` : `${change}`;
  }

  getEloChangeClass(): string {
    const change = this.getEloChange();
    if (change.startsWith('+')) return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  }

  getGlickoChangeClass(): string {
    const change = this.getGlickoChange();
    if (change.startsWith('+')) return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  // Chart helper methods
  getXPosition(index: number): number {
    const chartWidth = 800;
    const padding = 40;
    const usableWidth = chartWidth - (padding * 2);
    return padding + (index / Math.max(1, this.ratingHistory.length - 1)) * usableWidth;
  }

  getEloYPosition(elo: number): number {
    if (this.ratingHistory.length === 0) return 100;
    const minElo = Math.min(...this.ratingHistory.map(p => p.elo));
    const maxElo = Math.max(...this.ratingHistory.map(p => p.elo));
    const range = maxElo - minElo || 1;
    const chartHeight = 200;
    const padding = 20;
    const usableHeight = chartHeight - (padding * 2);
    
    return chartHeight - padding - ((elo - minElo) / range) * usableHeight;
  }

  getGlickoYPosition(glicko: number): number {
    if (this.ratingHistory.length === 0) return 100;
    const minGlicko = Math.min(...this.ratingHistory.map(p => p.glicko));
    const maxGlicko = Math.max(...this.ratingHistory.map(p => p.glicko));
    const range = maxGlicko - minGlicko || 1;
    const chartHeight = 200;
    const padding = 20;
    const usableHeight = chartHeight - (padding * 2);
    
    return chartHeight - padding - ((glicko - minGlicko) / range) * usableHeight;
  }

  getEloPoints(): string {
    return this.ratingHistory.map((point, index) => 
      `${this.getXPosition(index)},${this.getEloYPosition(point.elo)}`
    ).join(' ');
  }

  getGlickoPoints(): string {
    return this.ratingHistory.map((point, index) => 
      `${this.getXPosition(index)},${this.getGlickoYPosition(point.glicko)}`
    ).join(' ');
  }

  getEloChangeForDay(index: number): string {
    if (index === 0) return '0';
    const prev = this.ratingHistory[index - 1].elo;
    const curr = this.ratingHistory[index].elo;
    const change = curr - prev;
    return change >= 0 ? `+${change}` : `${change}`;
  }

  getGlickoChangeForDay(index: number): string {
    if (index === 0) return '0';
    const prev = this.ratingHistory[index - 1].glicko;
    const curr = this.ratingHistory[index].glicko;
    const change = curr - prev;
    return change >= 0 ? `+${change}` : `${change}`;
  }

  getChangeClass(change: string): string {
    if (change.startsWith('+')) return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  }
}
