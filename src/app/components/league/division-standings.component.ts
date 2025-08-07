import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../pages/league/division/division.component';

@Component({
  selector: 'app-division-standings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="standings-section">
      <div class="standings-content">
        <h2>Current Standings</h2>
        
        <div class="standings-table">
          <div class="table-header">
            <div class="rank-col">Rank</div>
            <div class="team-col">Team</div>
            <div class="points-col">Points</div>
            <div class="wins-col">Wins</div>
            <div class="games-col">Games</div>
            <div class="kills-col">Kills</div>
            <div class="trend-col">Trend</div>
          </div>
          
          <div class="table-body">
            <div class="team-row" *ngFor="let team of teams; let i = index">
              <div class="rank-col">
                <span class="rank-number" [class]="'rank-' + (i + 1)">{{ i + 1 }}</span>
              </div>
              <div class="team-col">
                <span class="team-name">{{ team.name }}</span>
              </div>
              <div class="points-col">
                <span class="points-value">{{ team.points }}</span>
              </div>
              <div class="wins-col">{{ team.wins }}</div>
              <div class="games-col">{{ team.gamesPlayed }}</div>
              <div class="kills-col">{{ team.kills }}</div>
              <div class="trend-col">
                <span class="trend-indicator" [class]="getTrendClass(team.trend)">
                  {{ getTrendIcon(team.trend) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './division-standings.component.css'
})
export class DivisionStandingsComponent {
  @Input() teams: Team[] = [];

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-same';
    }
  }
}
