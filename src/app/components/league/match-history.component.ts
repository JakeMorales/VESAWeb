import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../pages/league/division/division.component';

@Component({
  selector: 'app-match-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="matches-section">
      <div class="matches-content">
        <h2>Season 11 Matches</h2>
        
        <div class="matches-grid">
          <!-- Completed Matches -->
          <div class="match-history" *ngIf="getCompletedMatches().length > 0">
            <h3>Match History</h3>
            <div class="match-list">
              <div class="match-card" *ngFor="let match of getCompletedMatches()">
                <div class="match-header">
                  <span class="match-week">Week {{ match.weekNumber }}</span>
                  <span class="match-status" [class]="getMatchStatusClass(match.status)">
                    {{ getMatchStatusText(match.status) }}
                  </span>
                </div>
                <h4>{{ match.matchDay }}</h4>
                <div class="match-meta">
                  <span class="match-date">{{ match.date }}</span>
                  <span class="match-teams">{{ match.teamsCount }} Teams</span>
                </div>
                <div class="match-result" *ngIf="match.winner">
                  <span class="winner-label">Winner:</span>
                  <span class="winner-name">{{ match.winner }}</span>
                </div>
                <a [routerLink]="['/match', match.id]" class="match-link">View Results</a>
              </div>
            </div>
          </div>

          <!-- Upcoming Matches -->
          <div class="upcoming-matches" *ngIf="getUpcomingMatches().length > 0">
            <h3>Upcoming Matches</h3>
            <div class="match-list">
              <div class="match-card" *ngFor="let match of getUpcomingMatches()">
                <div class="match-header">
                  <span class="match-week">Week {{ match.weekNumber }}</span>
                  <span class="match-status" [class]="getMatchStatusClass(match.status)">
                    {{ getMatchStatusText(match.status) }}
                  </span>
                </div>
                <h4>{{ match.matchDay }}</h4>
                <div class="match-meta">
                  <span class="match-date">{{ match.date }}</span>
                  <span class="match-time">{{ match.time }}</span>
                  <span class="match-teams">{{ match.teamsCount }} Teams</span>
                </div>
                <a [routerLink]="['/match', match.id]" class="match-link">View Details</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './match-history.component.css'
})
export class MatchHistoryComponent {
  @Input() matches: Match[] = [];

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

  getCompletedMatches(): Match[] {
    return this.matches.filter(m => m.status === 'completed').reverse();
  }

  getUpcomingMatches(): Match[] {
    return this.matches.filter(m => m.status === 'upcoming');
  }
}
