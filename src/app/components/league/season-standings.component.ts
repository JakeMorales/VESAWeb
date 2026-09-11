import { Component, Input, OnChanges, SimpleChanges, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DivisionSummary, StandingEntry } from '../../services/league.service';
import { IconComponent } from '../ui';

@Pipe({ name: 'seasonLabel', standalone: true })
export class SeasonLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value?.replace(/_/g, ' ') ?? value;
  }
}

@Component({
  selector: 'app-season-standings',
  standalone: true,
  imports: [CommonModule, DatePipe, SeasonLabelPipe, IconComponent],
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
          <app-icon class="champion-crown" name="trophy" [size]="28" />
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
      padding: 8px 0;
    }

    .loading-indicator,
    .empty-state {
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      padding: 3rem 1rem;
    }

    .standings-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .standings-header h3 {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 4px;
    }

    .generated-note {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      margin: 0;
    }

    .champion-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      background: rgba(255, 215, 122, 0.05);
      border: 1px solid rgba(255, 215, 122, 0.35);
      border-radius: 6px;
      padding: 18px 24px;
      margin-bottom: 24px;
    }

    .champion-crown {
      color: #ffd77a;
      flex-shrink: 0;
    }

    .champion-info {
      text-align: center;
    }

    .champion-label {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--vesa-faint);
      margin-bottom: 4px;
    }

    .champion-team {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #ffd77a;
    }

    .champion-roster {
      font-size: 13px;
      color: var(--vesa-dim);
      margin-top: 4px;
    }

    .table-section {
      margin-bottom: 24px;
    }

    .table-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      margin: 0 0 10px;
      padding-left: 10px;
      border-left: 2px solid var(--vesa-red);
    }

    .table-scroll {
      overflow-x: auto;
      border-radius: 6px;
    }

    .standings-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }

    .standings-table th {
      padding: 11px 16px;
      text-align: center;
      font-family: var(--font-mono);
      font-weight: 400;
      color: var(--vesa-faint);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      white-space: nowrap;
      border-bottom: 1px solid var(--vesa-line);
    }

    .standings-table th.team-col {
      text-align: left;
      min-width: 180px;
    }

    .standings-table td {
      padding: 10px 16px;
      text-align: center;
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      color: var(--vesa-dim);
      border-bottom: 1px solid var(--vesa-line);
    }

    .standings-table tbody tr:last-child td {
      border-bottom: none;
    }

    .standings-table td.team-col {
      text-align: left;
      font-family: var(--font-body);
      font-weight: 600;
      color: var(--vesa-text);
    }

    .standings-table td.total-pts {
      font-weight: 600;
      color: var(--vesa-text);
    }

    .standings-table tbody tr {
      transition: background 0.12s;
    }

    .standings-table tbody tr:hover {
      background: rgba(61, 155, 255, 0.05);
    }

    .rank-col {
      width: 3rem;
      text-align: center;
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.8rem;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: 12px;
      border: 1px solid transparent;
      color: var(--vesa-faint);
    }

    .rank-badge[data-rank="1"] {
      color: #ffd77a;
      background: rgba(255, 215, 122, 0.1);
      border-color: rgba(255, 215, 122, 0.4);
    }

    .rank-badge[data-rank="2"] {
      color: #cfd4de;
      background: rgba(207, 212, 222, 0.1);
      border-color: rgba(207, 212, 222, 0.35);
    }

    .rank-badge[data-rank="3"] {
      color: #e0a570;
      background: rgba(224, 165, 112, 0.1);
      border-color: rgba(224, 165, 112, 0.35);
    }
  `]
})
export class SeasonStandingsComponent {
  @Input() summary: DivisionSummary | null = null;
  @Input() loading = false;
}
