import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGridComponent, GridConfig } from '../base-grid/base-grid.component';

export interface HistoricalMatch {
  id: string;
  seasonId: string;
  division: string;
  matchNumber: number;
  date: string;
  teams: string[];
  results: MatchGameResult[];
}

export interface MatchGameResult {
  gameNumber: number;
  results: GameTeamResult[];
}

export interface GameTeamResult {
  teamName: string;
  placement: number;
  kills: number;
  points: number;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming';
}

@Component({
  selector: 'app-archive-match-history',
  standalone: true,
  imports: [CommonModule, BaseGridComponent],
  template: `
    <div class="matches-section">
      <h2>Historical Matches</h2>
      <div class="matches-list">
        <div *ngFor="let match of filteredMatches" class="match-card">
          <div class="match-header">
            <h3>{{ getSeasonName(match.seasonId) }} - {{ match.division }}</h3>
            <div class="match-info">
              <span class="match-number">Match {{ match.matchNumber }}</span>
              <span class="match-date">{{ formatDate(match.date) }}</span>
            </div>
          </div>
          
          <div class="match-teams">
            <span *ngFor="let team of match.teams; let last = last" class="team-name">
              {{ team }}<span *ngIf="!last"> vs </span>
            </span>
          </div>

          <div class="match-results">
            <div *ngFor="let gameResult of match.results" class="game-result">
              <h4>Game {{ gameResult.gameNumber }}</h4>
              
              <app-base-grid 
                [data]="gameResult.results" 
                [config]="matchGridConfig"
                containerClass="match-result-grid">
                
                <ng-template #cellTemplate let-item let-column="column" let-value="value">
                  <ng-container [ngSwitch]="column.key">
                    <span *ngSwitchCase="'teamName'" class="team-name">{{ value }}</span>
                    <span *ngSwitchCase="'placement'" class="placement-value" [class]="'placement-' + value">{{ getPlacementText(value) }}</span>
                    <span *ngSwitchCase="'kills'" class="kills-value">{{ value }}</span>
                    <span *ngSwitchCase="'points'" class="points-value">{{ value }}</span>
                    <span *ngSwitchDefault>{{ value }}</span>
                  </ng-container>
                </ng-template>
              </app-base-grid>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .matches-section h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--color-text-primary);
      text-align: center;
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .match-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2rem;
      backdrop-filter: blur(10px);
    }

    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .match-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-text-primary);
    }

    .match-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .match-number,
    .match-date {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
    }

    .match-teams {
      margin-bottom: 1.5rem;
      font-size: 1rem;
      color: var(--color-text-primary);
      text-align: center;
    }

    .match-teams .team-name {
      font-weight: 600;
    }

    .match-results {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .game-result h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--color-accent-secondary);
      text-align: center;
    }

    .match-result-grid {
      margin: 0;
    }

    .points-value {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--color-accent-primary);
    }

    .kills-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .placement-1 {
      color: #FFD700;
      font-weight: 700;
    }

    .placement-2 {
      color: #C0C0C0;
      font-weight: 700;
    }

    .placement-3 {
      color: #CD7F32;
      font-weight: 700;
    }

    .team-name {
      font-weight: 600;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .match-card {
        padding: 1.5rem;
      }

      .match-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .match-info {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ArchiveMatchHistoryComponent {
  @Input() filteredMatches: HistoricalMatch[] = [];
  @Input() seasons: Season[] = [];

  matchGridConfig: GridConfig = {
    columns: [
      { key: 'teamName', label: 'Team', width: '2fr', class: 'team-col' },
      { key: 'placement', label: 'Place', width: '1fr', class: 'placement-col' },
      { key: 'kills', label: 'Kills', width: '1fr', class: 'kills-col' },
      { key: 'points', label: 'Points', width: '1fr', class: 'points-col' }
    ],
    hoverable: true,
    showHeader: true
  };

  getSeasonName(seasonId: string): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : seasonId;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPlacementText(placement: number): string {
    const suffixes = ['', 'st', 'nd', 'rd'];
    const suffix = suffixes[placement] || 'th';
    return `${placement}${suffix}`;
  }
}
