import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, PlayerRating } from '../../services/rating.service';
import { MockMatchData } from '../../services/mock-data';

@Component({
  selector: 'app-player-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="player-ratings-container">
      <div class="controls">
        <button (click)="calculateRatings()" class="refresh-btn">
          Recalculate from Mock Data
        </button>
        <div class="sort-controls">
          <label>Sort by:</label>
          <select [(ngModel)]="sortBy" (change)="sortPlayers()" class="sort-select">
            <option value="elo">Elo Rating</option>
            <option value="glicko">Glicko Rating</option>
            <option value="games">Games Played</option>
            <option value="name">Player Name</option>
          </select>
        </div>
      </div>

      <div class="ratings-table-container">
        <table class="ratings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player Name</th>
              <th>Elo Rating</th>
              <th>Glicko Rating</th>
              <th>Glicko RD</th>
              <th>Games</th>
              <th>W/L</th>
              <th>Win Rate</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let player of sortedPlayers; let i = index" 
                [class]="getRankClass(i + 1)">
              <td class="rank">{{i + 1}}</td>
              <td class="player-name">{{player.playerName}}</td>
              <td class="elo-rating">{{player.eloRating}}</td>
              <td class="glicko-rating">{{player.glickoRating}}</td>
              <td class="glicko-rd">{{player.glickoDeviation}}</td>
              <td class="games">{{player.gamesPlayed}}</td>
              <td class="wl-record">{{player.wins}}-{{player.losses}}</td>
              <td class="win-rate">{{getWinRate(player)}}%</td>
              <td class="last-updated">{{formatDate(player.lastUpdated)}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rating-stats">
        <div class="stat-card">
          <h4>Highest Elo</h4>
          <p>{{getHighestElo()}} <span class="player-name">({{getPlayerWithHighestElo()}})</span></p>
        </div>
        <div class="stat-card">
          <h4>Highest Glicko</h4>
          <p>{{getHighestGlicko()}} <span class="player-name">({{getPlayerWithHighestGlicko()}})</span></p>
        </div>
        <div class="stat-card">
          <h4>Most Active</h4>
          <p>{{getMostActivePlayer()}} <span class="games-count">({{getMostGames()} games)</span></p>
        </div>
        <div class="stat-card">
          <h4>Average Elo</h4>
          <p>{{getAverageElo()}}</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './player-ratings.component.css'
})
export class PlayerRatingsComponent implements OnInit {
  
  playerRatings: PlayerRating[] = [];
  sortedPlayers: PlayerRating[] = [];
  sortBy: string = 'elo';

  constructor(private ratingService: RatingService) { }

  ngOnInit(): void {
    this.calculateRatings();
  }

  calculateRatings(): void {
    // Get mock match data and calculate ratings
    const matchData = MockMatchData.getMatchDayResults();
    const allGameResults = Object.values(matchData).flat();
    
    const results = this.ratingService.processMatchResults(allGameResults);
    this.playerRatings = results.playerRatings;
    this.sortPlayers();
  }

  sortPlayers(): void {
    this.sortedPlayers = [...this.playerRatings].sort((a, b) => {
      switch (this.sortBy) {
        case 'elo':
          return b.eloRating - a.eloRating;
        case 'glicko':
          return b.glickoRating - a.glickoRating;
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        case 'name':
          return a.playerName.localeCompare(b.playerName);
        default:
          return b.eloRating - a.eloRating;
      }
    });
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    if (rank <= 10) return 'rank-top10';
    return '';
  }

  getWinRate(player: PlayerRating): number {
    if (player.gamesPlayed === 0) return 0;
    return Math.round((player.wins / player.gamesPlayed) * 100);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getHighestElo(): number {
    if (this.playerRatings.length === 0) return 0;
    return Math.max(...this.playerRatings.map(p => p.eloRating));
  }

  getPlayerWithHighestElo(): string {
    if (this.playerRatings.length === 0) return '';
    const highest = this.playerRatings.reduce((prev, curr) => 
      prev.eloRating > curr.eloRating ? prev : curr
    );
    return highest.playerName;
  }

  getHighestGlicko(): number {
    if (this.playerRatings.length === 0) return 0;
    return Math.max(...this.playerRatings.map(p => p.glickoRating));
  }

  getPlayerWithHighestGlicko(): string {
    if (this.playerRatings.length === 0) return '';
    const highest = this.playerRatings.reduce((prev, curr) => 
      prev.glickoRating > curr.glickoRating ? prev : curr
    );
    return highest.playerName;
  }

  getMostActivePlayer(): string {
    if (this.playerRatings.length === 0) return '';
    const mostActive = this.playerRatings.reduce((prev, curr) => 
      prev.gamesPlayed > curr.gamesPlayed ? prev : curr
    );
    return mostActive.playerName;
  }

  getMostGames(): number {
    if (this.playerRatings.length === 0) return 0;
    return Math.max(...this.playerRatings.map(p => p.gamesPlayed));
  }

  getAverageElo(): number {
    if (this.playerRatings.length === 0) return 0;
    const sum = this.playerRatings.reduce((sum, p) => sum + p.eloRating, 0);
    return Math.round(sum / this.playerRatings.length);
  }
}
