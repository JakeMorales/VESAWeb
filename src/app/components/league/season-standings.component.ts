import { Component, Input, OnChanges, SimpleChanges, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DivisionSummary, LeagueStanding } from '../../services/league.service';

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
        <p class="empty-hint">Run <code>npm run generate-summaries</code> and upload the <code>_summary.json</code> files to HuggingFace.</p>
      </div>

      <ng-container *ngIf="!loading && summary">
        <div class="standings-header">
          <h3>{{ summary.season | seasonLabel }} &mdash; Division {{ summary.division }} Standings</h3>
          <p class="generated-note">Last updated {{ summary.generatedAt | date:'mediumDate' }}</p>
        </div>

        <div class="table-scroll">
          <table class="standings-table">
            <thead>
              <tr>
                <th class="rank-col">#</th>
                <th class="team-col">Team</th>
                <th
                  class="pts-col sortable"
                  [class.sorted]="sortKey === 'total'"
                  (click)="sortBy('total')">
                  Total <span class="sort-arrow">{{ sortKey === 'total' ? (sortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
                <th
                  *ngFor="let col of weekColumns"
                  class="week-col sortable"
                  [class.sorted]="sortKey === col.week"
                  [class.playoffs-col]="col.isPlayoffs"
                  (click)="sortBy(col.week)">
                  {{ col.label }}
                  <span class="sort-arrow">{{ sortKey === col.week ? (sortAsc ? '▲' : '▼') : '↕' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let team of sortedTeams; let i = index"
                  [class.top-three]="i < 3">
                <td class="rank-col">
                  <span class="rank-badge" [attr.data-rank]="i + 1">{{ i + 1 }}</span>
                </td>
                <td class="team-col">{{ team.teamName }}</td>
                <td class="pts-col total-pts">{{ team.totalPoints }}</td>
                <td *ngFor="let col of weekColumns"
                    class="week-col"
                    [class.playoffs-col]="col.isPlayoffs">
                  {{ getWeekPoints(team, col.week) !== null ? getWeekPoints(team, col.week) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
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

    .empty-state code {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: monospace;
    }

    .empty-hint {
      font-size: 0.85rem;
      opacity: 0.7;
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

    .standings-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .standings-table th.sortable:hover {
      color: var(--color-text-primary, #fff);
      background: rgba(255, 255, 255, 0.05);
    }

    .standings-table th.sorted {
      color: var(--color-accent-primary, #e8c46a);
    }

    .sort-arrow {
      margin-left: 0.3rem;
      opacity: 0.7;
      font-size: 0.7rem;
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

    .playoffs-col {
      border-left: 1px solid rgba(255, 255, 255, 0.1);
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
export class SeasonStandingsComponent implements OnChanges {
  @Input() summary: DivisionSummary | null = null;
  @Input() loading = false;

  sortKey = 'total';
  sortAsc = false;

  weekColumns: { week: string; label: string; isPlayoffs: boolean }[] = [];
  sortedTeams: LeagueStanding[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary']) {
      this.buildColumns();
      this.applySort();
    }
  }

  private buildColumns(): void {
    if (!this.summary?.teams?.length) {
      this.weekColumns = [];
      return;
    }

    const seen = new Set<string>();
    const cols: { week: string; label: string; isPlayoffs: boolean }[] = [];

    for (const team of this.summary.teams) {
      for (const w of team.weeks) {
        if (!seen.has(w.week)) {
          seen.add(w.week);
          cols.push({ week: w.week, label: w.label, isPlayoffs: w.isPlayoffs });
        }
      }
    }

    this.weekColumns = cols;
  }

  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = false;
    }
    this.applySort();
  }

  private applySort(): void {
    if (!this.summary) {
      this.sortedTeams = [];
      return;
    }

    this.sortedTeams = [...this.summary.teams].sort((a, b) => {
      let valA: number;
      let valB: number;

      if (this.sortKey === 'total') {
        valA = a.totalPoints;
        valB = b.totalPoints;
      } else {
        valA = this.getWeekPoints(a, this.sortKey) ?? -1;
        valB = this.getWeekPoints(b, this.sortKey) ?? -1;
      }

      return this.sortAsc ? valA - valB : valB - valA;
    });
  }

  getWeekPoints(team: LeagueStanding, weekFilename: string): number | null {
    const result = team.weeks.find(w => w.week === weekFilename);
    return result != null ? result.points : null;
  }
}
