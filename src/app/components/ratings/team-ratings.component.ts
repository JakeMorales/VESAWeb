import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, TeamRating } from '../../services/rating.service';
import { MockMatchData } from '../../services/mock-data';

@Component({
  selector: 'app-team-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="team-ratings-container">
      <div class="controls">
        <button (click)="calculateRatings()" class="refresh-btn">
          Recalculate from Mock Data
        </button>
        <div class="sort-controls">
          <label>Sort by:</label>
          <select [(ngModel)]="sortBy" (change)="sortTeams()" class="sort-select">
            <option value="elo">Elo Rating</option>
            <option value="glicko">Glicko Rating</option>
            <option value="placement">Avg Placement</option>
            <option value="games">Games Played</option>
            <option value="name">Team Name</option>
          </select>
        </div>
      </div>

      <div class="ratings-table-container">
        <table class="ratings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Elo Rating</th>
              <th>Glicko Rating</th>
              <th>Glicko RD</th>
              <th>Games</th>
              <th>W/L</th>
              <th>Win Rate</th>
              <th>Avg Placement</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let team of sortedTeams; let i = index" 
                [class]="getRankClass(i + 1)">
              <td class="rank">{{i + 1}}</td>
              <td class="team-name">{{team.teamName}}</td>
              <td class="elo-rating">{{team.eloRating}}</td>
              <td class="glicko-rating">{{team.glickoRating}}</td>
              <td class="glicko-rd">{{team.glickoDeviation}}</td>
              <td class="games">{{team.gamesPlayed}}</td>
              <td class="wl-record">{{team.wins}}-{{team.losses}}</td>
              <td class="win-rate">{{getWinRate(team)}}%</td>
              <td class="avg-placement">{{team.avgPlacement}}</td>
              <td class="last-updated">{{formatDate(team.lastUpdated)}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rating-stats">
        <div class="stat-card">
          <h4>Highest Elo</h4>
          <p>{{getHighestElo()}} <span class="team-name">({{getTeamWithHighestElo()}})</span></p>
        </div>
        <div class="stat-card">
          <h4>Best Avg Placement</h4>
          <p>{{getBestAvgPlacement()}} <span class="team-name">({{getTeamWithBestPlacement()}})</span></p>
        </div>
        <div class="stat-card">
          <h4>Most Active</h4>
          <p>{{getMostActiveTeam()}} <span class="games-count">({{getMostGames()} games)</span></p>
        </div>
        <div class="stat-card">
          <h4>Average Elo</h4>
          <p>{{getAverageElo()}}</p>
        </div>
      </div>

      <!-- Team Comparison Tool -->
      <div class="comparison-section">
        <h3>Team Comparison</h3>
        <div class="comparison-controls">
          <div class="team-select">
            <label>Team A:</label>
            <select [(ngModel)]="selectedTeamA" class="team-select-dropdown">
              <option value="">Select Team</option>
              <option *ngFor="let team of sortedTeams" [value]="team.teamName">
                {{team.teamName}}
              </option>
            </select>
          </div>
          <div class="vs-divider">VS</div>
          <div class="team-select">
            <label>Team B:</label>
            <select [(ngModel)]="selectedTeamB" class="team-select-dropdown">
              <option value="">Select Team</option>
              <option *ngFor="let team of sortedTeams" [value]="team.teamName">
                {{team.teamName}}
              </option>
            </select>
          </div>
        </div>
        
        <div class="comparison-result" *ngIf="selectedTeamA && selectedTeamB">
          <div class="team-comparison">
            <div class="team-a-stats">
              <h4>{{selectedTeamA}}</h4>
              <p>Elo: {{getTeamByName(selectedTeamA)?.eloRating}}</p>
              <p>Glicko: {{getTeamByName(selectedTeamA)?.glickoRating}}</p>
              <p>Avg Placement: {{getTeamByName(selectedTeamA)?.avgPlacement}}</p>
            </div>
            <div class="prediction">
              <h4>Prediction</h4>
              <p>{{getPrediction()}}</p>
              <p class="win-probability">Win Probability: {{getWinProbability()}}%</p>
            </div>
            <div class="team-b-stats">
              <h4>{{selectedTeamB}}</h4>
              <p>Elo: {{getTeamByName(selectedTeamB)?.eloRating}}</p>
              <p>Glicko: {{getTeamByName(selectedTeamB)?.glickoRating}}</p>
              <p>Avg Placement: {{getTeamByName(selectedTeamB)?.avgPlacement}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './team-ratings.component.css'
})
export class TeamRatingsComponent implements OnInit {
  
  teamRatings: TeamRating[] = [];
  sortedTeams: TeamRating[] = [];
  sortBy: string = 'elo';
  selectedTeamA: string = '';
  selectedTeamB: string = '';

  constructor(private ratingService: RatingService) { }

  ngOnInit(): void {
    this.calculateRatings();
  }

  calculateRatings(): void {
    // Get mock match data and calculate ratings
    const matchData = MockMatchData.getMatchDayResults();
    const allGameResults = Object.values(matchData).flat();
    
    const results = this.ratingService.processMatchResults(allGameResults);
    this.teamRatings = results.teamRatings;
    this.sortTeams();
  }

  sortTeams(): void {
    this.sortedTeams = [...this.teamRatings].sort((a, b) => {
      switch (this.sortBy) {
        case 'elo':
          return b.eloRating - a.eloRating;
        case 'glicko':
          return b.glickoRating - a.glickoRating;
        case 'placement':
          return a.avgPlacement - b.avgPlacement; // Lower placement is better
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        case 'name':
          return a.teamName.localeCompare(b.teamName);
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

  getWinRate(team: TeamRating): number {
    if (team.gamesPlayed === 0) return 0;
    return Math.round((team.wins / team.gamesPlayed) * 100);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getHighestElo(): number {
    if (this.teamRatings.length === 0) return 0;
    return Math.max(...this.teamRatings.map(t => t.eloRating));
  }

  getTeamWithHighestElo(): string {
    if (this.teamRatings.length === 0) return '';
    const highest = this.teamRatings.reduce((prev, curr) => 
      prev.eloRating > curr.eloRating ? prev : curr
    );
    return highest.teamName;
  }

  getBestAvgPlacement(): number {
    if (this.teamRatings.length === 0) return 0;
    return Math.min(...this.teamRatings.map(t => t.avgPlacement));
  }

  getTeamWithBestPlacement(): string {
    if (this.teamRatings.length === 0) return '';
    const best = this.teamRatings.reduce((prev, curr) => 
      prev.avgPlacement < curr.avgPlacement ? prev : curr
    );
    return best.teamName;
  }

  getMostActiveTeam(): string {
    if (this.teamRatings.length === 0) return '';
    const mostActive = this.teamRatings.reduce((prev, curr) => 
      prev.gamesPlayed > curr.gamesPlayed ? prev : curr
    );
    return mostActive.teamName;
  }

  getMostGames(): number {
    if (this.teamRatings.length === 0) return 0;
    return Math.max(...this.teamRatings.map(t => t.gamesPlayed));
  }

  getAverageElo(): number {
    if (this.teamRatings.length === 0) return 0;
    const sum = this.teamRatings.reduce((sum, t) => sum + t.eloRating, 0);
    return Math.round(sum / this.teamRatings.length);
  }

  getTeamByName(teamName: string): TeamRating | undefined {
    return this.teamRatings.find(t => t.teamName === teamName);
  }

  getPrediction(): string {
    const teamA = this.getTeamByName(this.selectedTeamA);
    const teamB = this.getTeamByName(this.selectedTeamB);
    
    if (!teamA || !teamB) return '';
    
    if (teamA.eloRating > teamB.eloRating) {
      return `${teamA.teamName} favored`;
    } else if (teamB.eloRating > teamA.eloRating) {
      return `${teamB.teamName} favored`;
    } else {
      return 'Even match';
    }
  }

  getWinProbability(): number {
    const teamA = this.getTeamByName(this.selectedTeamA);
    const teamB = this.getTeamByName(this.selectedTeamB);
    
    if (!teamA || !teamB) return 50;
    
    // Calculate expected score using Elo formula
    const expected = 1 / (1 + Math.pow(10, (teamB.eloRating - teamA.eloRating) / 400));
    return Math.round(expected * 100);
  }
}
