import { Component, Input, OnChanges, SimpleChanges, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DivisionSummary, StandingEntry } from '../../services/league.service';

@Pipe({ name: 'seasonLabel', standalone: true })
export class SeasonLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value?.replace(/_/g, ' ') ?? value;
  }
}

@Component({
  selector: 'app-season-standings',
  standalone: true,
  imports: [CommonModule, DatePipe, SeasonLabelPipe],
  template: `
    <div class="standings-container">
      <div *ngIf="loading" class="loading-indicator">Loading standings...</div>

      <div *ngIf="!loading && !summary" class="empty-state">
        <p>No standings data available for this division.</p>
      </div>

      <ng-container *ngIf="!loading && summary">
        <div class="standings-header">
          <h3>{{ summary.season | seasonLabel }} &mdash; Division {{ summary.division }}</h3>
          <p class="generated-note">Last updated {{ summary.generatedAt | date:'mediumDate' }}</p>
        </div>

        <!-- Match Point Champion -->
        <div *ngIf="summary.matchPointChampion" class="champion-banner">
          <div class="champion-crown">&#x1F451;</div>
          <div class="champion-info">
            <div class="champion-label">Match Point Champion</div>
            <div class="champion-team">{{ summary.matchPointChampion.teamName }}</div>
            <div class="champion-roster">{{ summary.matchPointChampion.players.join(' &bull; ') }}</div>
          </div>
        </div>

        <!-- Season Standings (Weeks 1-5) -->
        <div class="table-section" *ngIf="summary.seasonStandings.length">
          <h4 class="table-title">Season Standings</h4>
          <div class="table-scroll">
            <table class="standings-table">
              <thead>
                <tr>
                  <th class="rank-col">#</th>
                  <th class="team-col">Team</th>
                  <th class="pts-col">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let team of summary.seasonStandings; let i = index"
                    [class.top-three]="i < 3">
                  <td class="rank-col">
                    <span class="rank-badge" [attr.data-rank]="team.rank">{{ team.rank }}</span>
                  </td>
                  <td class="team-col">{{ team.teamName }}</td>
                  <td class="pts-col total-pts">{{ team.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Match Point Finals Standings -->
        <div class="table-section" *ngIf="summary.matchPointFinalsStandings.length">
          <h4 class="table-title">Match Point Finals</h4>
          <div class="table-scroll">
            <table class="standings-table">
              <thead>
                <tr>
                  <th class="rank-col">#</th>
                  <th class="team-col">Team</th>
                  <th class="pts-col">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let team of summary.matchPointFinalsStandings; let i = index"
                    [class.top-three]="i < 3">
                  <td class="rank-col">
                    <span class="rank-badge" [attr.data-rank]="team.rank">{{ team.rank }}</span>
                  </td>
                  <td class="team-col">{{ team.teamName }}</td>
                  <td class="pts-col total-pts">{{ team.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .standings-container {
      padding: 1rem 0;
    }

    .loading-indicator {
      text-align: center;
      color: var(--color-text-secondary, #aaa);
      padding: 3rem;
      font-size: 1.1rem;
    }

    .empty-state {
      text-align: center;
      color: var(--color-text-secondary, #aaa);
      padding: 3rem 1rem;
      line-height: 2;
    }

    .standings-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .standings-header h3 {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-text-primary, #fff);
      margin: 0 0 0.25rem;
    }

    .generated-note {
      font-size: 0.8rem;
      color: var(--color-text-secondary, #aaa);
      margin: 0;
    }

    .champion-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 165, 0, 0.08));
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 12px;
      padding: 1.25rem 2rem;
      margin-bottom: 2rem;
    }

    .champion-crown {
      font-size: 2rem;
    }

    .champion-info {
      text-align: center;
    }

    .champion-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary, #aaa);
      margin-bottom: 0.25rem;
    }

    .champion-team {
      font-size: 1.3rem;
      font-weight: 700;
      color: #ffd700;
    }

    .champion-roster {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #ccc);
      margin-top: 0.25rem;
    }

    .table-section {
      margin-bottom: 2rem;
    }

    .table-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary, #fff);
      margin: 0 0 0.75rem;
      padding-left: 0.5rem;
      border-left: 3px solid var(--color-accent-primary, #e8c46a);
    }

    .table-scroll {
      overflow-x: auto;
      border-radius: 12px;
    }

    .standings-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }

    .standings-table thead tr {
      background: rgba(255, 255, 255, 0.07);
    }

    .standings-table th {
      padding: 0.75rem 1rem;
      text-align: center;
      font-weight: 600;
      color: var(--color-text-secondary, #aaa);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .standings-table th.team-col {
      text-align: left;
      min-width: 180px;
    }

    .standings-table td {
      padding: 0.65rem 1rem;
      text-align: center;
      color: var(--color-text-primary, #fff);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .standings-table td.team-col {
      text-align: left;
      font-weight: 600;
    }

    .standings-table td.total-pts {
      font-weight: 700;
      color: var(--color-accent-primary, #e8c46a);
    }

    .standings-table tbody tr:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .standings-table tbody tr.top-three td {
      background: rgba(232, 196, 106, 0.03);
    }

    .rank-col {
      width: 2.5rem;
      text-align: center;
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.07);
      color: var(--color-text-secondary, #aaa);
    }

    .rank-badge[data-rank="1"] {
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
    }

    .rank-badge[data-rank="2"] {
      background: rgba(192, 192, 192, 0.2);
      color: #c0c0c0;
    }

    .rank-badge[data-rank="3"] {
      background: rgba(205, 127, 50, 0.2);
      color: #cd7f32;
    }
  `]
})
export class SeasonStandingsComponent {
  @Input() summary: DivisionSummary | null = null;
  @Input() loading = false;
}
