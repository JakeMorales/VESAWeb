import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../pages/league/division/division.component';

@Component({
  selector: 'app-current-match',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="current-match-section" *ngIf="currentMatch">
      <div class="current-match-content">
        <div class="current-match-header">
          <h2>Current Match</h2>
          <span class="live-indicator">🔴 LIVE</span>
        </div>
        
        <div class="current-match-card">
          <div class="match-info">
            <h3>{{ currentMatch.matchDay }}</h3>
            <div class="match-details">
              <span class="match-date">{{ currentMatch.date }}</span>
              <span class="match-time">{{ currentMatch.time }}</span>
              <span class="teams-count">{{ currentMatch.teamsCount }} Teams</span>
            </div>
            <div class="match-progress" *ngIf="currentMatch.gamesPlayed && currentMatch.totalGames">
              <span>Game {{ currentMatch.gamesPlayed }} of {{ currentMatch.totalGames }}</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="(currentMatch.gamesPlayed / currentMatch.totalGames) * 100"></div>
              </div>
            </div>
          </div>
          <div class="match-actions">
            <a [href]="currentMatch.streamUrl" target="_blank" class="watch-btn" *ngIf="currentMatch.streamUrl">
              📺 Watch Live
            </a>
            <a [routerLink]="['/match', currentMatch.id]" class="details-btn">
              View Details
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './current-match.component.css'
})
export class CurrentMatchComponent {
  @Input() currentMatch?: Match;
}
