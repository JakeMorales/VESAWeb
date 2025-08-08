import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  selector: 'app-match-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="match-header">
      <div class="header-content">
        <div class="breadcrumb">
          <a routerLink="/league">League</a> > 
          <a [routerLink]="['/league', match.division.toLowerCase()]">{{ match.division }} ({{ getRomanNumeral(match.divisionTier) }})</a> > 
          <span>{{ match.matchDay }}</span>
        </div>
        
        <div class="match-title-section">
          <div class="match-info">
            <h1 class="match-title">{{ match.matchDay }}</h1>
            <div class="match-meta">
              <span class="match-date">{{ match.date }}</span>
              <span class="match-time">{{ match.time }}</span>
              <span class="match-division">{{ match.division }} Division</span>
              <span class="match-status" [class]="getMatchStatusClass(match.status)">
                {{ getMatchStatusText(match.status) }}
              </span>
            </div>
            <p class="match-description">{{ match.description }}</p>
          </div>
          
          <div class="match-actions" *ngIf="match.status === 'live'">
            <a [href]="match.streamUrl" target="_blank" class="watch-btn" *ngIf="match.streamUrl">
              📺 Watch Live
            </a>
            <div class="live-indicator">🔴 LIVE</div>
          </div>
        </div>
        
        <div class="match-progress" *ngIf="match.gamesPlayed && match.totalGames">
          <div class="progress-info">
            <span>Progress: Game {{ match.gamesPlayed }} of {{ match.totalGames }}</span>
            <span>{{ ((match.gamesPlayed / match.totalGames) * 100).toFixed(0) }}% Complete</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(match.gamesPlayed / match.totalGames) * 100"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './match-header.component.css'
})
export class MatchHeaderComponent {
  @Input() match!: MatchDetail;

  getRomanNumeral(tier: number): string {
    const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
    return numerals[tier] || tier.toString();
  }

  getMatchStatusClass(status: string): string {
    switch (status) {
      case 'live': return 'status-live';
      case 'completed': return 'status-completed';
      case 'upcoming': return 'status-upcoming';
      default: return '';
    }
  }

  getMatchStatusText(status: string): string {
    switch (status) {
      case 'live': return 'LIVE';
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      default: return '';
    }
  }
}
