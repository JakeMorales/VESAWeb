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
        <h2>{{ season }} Matches</h2>

        <div class="matches-grid">
          <!-- Completed Matches -->
          <div class="match-history" *ngIf="getCompletedMatches().length > 0">
            <h3>Match History</h3>
            <div class="match-list">
              <div class="match-card"
                   [class.match-card-finale]="match.isFinale"
                   *ngFor="let match of getCompletedMatches()">
                <div class="match-header">
                  <span class="match-week">{{ match.isFinale ? 'Finals' : 'Week ' + match.weekNumber }}</span>
                  <span class="match-status status-completed">Completed</span>
                </div>
                <h4>{{ match.matchDay }}</h4>
                <div class="match-meta">
                  <span class="match-teams">{{ match.teamsCount }} Teams</span>
                </div>
                <a [routerLink]="['/match', match.id]" class="match-link">View Results</a>
              </div>
            </div>
          </div>

          <!-- Upcoming Matches -->
          <div class="upcoming-matches" *ngIf="getUpcomingMatches().length > 0">
            <h3>Upcoming</h3>
            <div class="match-list">
              <div class="match-card"
                   [class.match-card-finale]="match.isFinale"
                   *ngFor="let match of getUpcomingMatches()">
                <div class="match-header">
                  <span class="match-week">{{ match.isFinale ? 'Finals' : 'Week ' + match.weekNumber }}</span>
                  <span class="match-status status-upcoming">Upcoming</span>
                </div>
                <h4>{{ match.matchDay }}</h4>
                <div class="match-meta">
                  <span class="match-teams" *ngIf="match.teamsCount">{{ match.teamsCount }} Teams</span>
                  <span class="match-date" *ngIf="match.date">{{ match.date }}</span>
                </div>
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
  @Input() season: string = 'Season';

  getCompletedMatches(): Match[] {
    return this.matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => {
        if (a.isFinale && !b.isFinale) return -1;
        if (!a.isFinale && b.isFinale) return 1;
        return b.weekNumber - a.weekNumber;
      });
  }

  getUpcomingMatches(): Match[] {
    return this.matches
      .filter(m => m.status === 'upcoming')
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }
}
