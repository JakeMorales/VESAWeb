import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MatchDetail {
  id: string;
  weekNumber: number;
  matchDay: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  division: string;
  divisionTier: number;
  teamsCount: number;
  gamesPlayed?: number;
  totalGames?: number;
  winner?: string;
  streamUrl?: string;
  description: string;
}

@Component({
  selector: 'app-match-live-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="live-section">
      <div class="live-content">
        <div class="live-header">
          <h2>🔴 Live Updates</h2>
          <div class="live-pulse"></div>
        </div>
        
        <div class="live-game-info">
          <div class="current-game">
            <h3>Game {{ match.gamesPlayed }} of {{ match.totalGames }}</h3>
            <p class="game-status">Currently in progress</p>
          </div>
          
          <div class="live-stats">
            <div class="stat-card">
              <span class="stat-value">{{ match.gamesPlayed }}</span>
              <span class="stat-label">Games Played</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ (match.totalGames || 0) - (match.gamesPlayed || 0) }}</span>
              <span class="stat-label">Remaining</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ match.teamsCount }}</span>
              <span class="stat-label">Teams</span>
            </div>
          </div>
          
          <div class="live-notice">
            <p>📊 Results will be updated as games complete</p>
            <p>🎮 Follow the action live on stream</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './match-live-section.component.css'
})
export class MatchLiveSectionComponent {
  @Input() match!: MatchDetail;
}
