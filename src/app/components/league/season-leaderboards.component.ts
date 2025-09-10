import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGridComponent, GridConfig } from '../base-grid/base-grid.component';

export interface SeasonLeaderboard {
  seasonId: string;
  division: string;
  teams: SeasonTeamResult[];
}

export interface SeasonTeamResult {
  rank: number;
  teamName: string;
  totalPoints: number;
  wins: number;
  gamesPlayed: number;
  kills: number;
  avgPlacement: number;
}

import { ArchiveSeason } from '../../models/season.model';
export type Season = ArchiveSeason;

@Component({
  selector: 'app-season-leaderboards',
  standalone: true,
  imports: [CommonModule, BaseGridComponent],
  template: `
    <div class="leaderboards-section">
      <h2>Final Season Leaderboards</h2>
      <div *ngFor="let leaderboard of filteredLeaderboards" class="leaderboard-container">
        <h3>{{ getSeasonName(leaderboard.seasonId) }} - {{ leaderboard.division }}</h3>
        
        <app-base-grid 
          [data]="leaderboard.teams" 
          [config]="leaderboardGridConfig"
          containerClass="archive-leaderboard-grid">
          
          <ng-template #cellTemplate let-item let-column="column" let-value="value" let-index="index">
            <ng-container [ngSwitch]="column.key">
              <span *ngSwitchCase="'rank'" class="rank-number" [class]="'rank-' + item.rank">{{ item.rank }}</span>
              <span *ngSwitchCase="'teamName'" class="team-name">{{ value }}</span>
              <span *ngSwitchCase="'totalPoints'" class="points-value">{{ value }}</span>
              <span *ngSwitchCase="'wins'" class="wins-value">{{ value }}</span>
              <span *ngSwitchCase="'gamesPlayed'" class="games-value">{{ value }}</span>
              <span *ngSwitchCase="'kills'" class="kills-value">{{ value }}</span>
              <span *ngSwitchCase="'avgPlacement'" class="placement-value">{{ value }}</span>
              <span *ngSwitchDefault>{{ value }}</span>
            </ng-container>
          </ng-template>
        </app-base-grid>
      </div>
    </div>
  `,
  styles: [`
    .leaderboards-section h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--color-text-primary);
      text-align: center;
    }

    .leaderboard-container {
      margin-bottom: 3rem;
    }

    .leaderboard-container h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
      text-align: center;
    }

    .archive-leaderboard-grid {
      margin: 1rem 0;
    }

    /* Grid Cell Styling */
    .rank-number {
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .rank-1 {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #000;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    }

    .rank-2 {
      background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
      color: #000;
      box-shadow: 0 0 10px rgba(192, 192, 192, 0.4);
    }

    .rank-3 {
      background: linear-gradient(135deg, #CD7F32, #B8860B);
      color: white;
      box-shadow: 0 0 10px rgba(205, 127, 50, 0.4);
    }

    .points-value {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--color-accent-primary);
    }

    .wins-value,
    .games-value,
    .kills-value,
    .placement-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .team-name {
      font-weight: 600;
    }
  `]
})
export class SeasonLeaderboardsComponent {
  @Input() filteredLeaderboards: SeasonLeaderboard[] = [];
  @Input() seasons: Season[] = [];

  leaderboardGridConfig: GridConfig = {
    columns: [
      { key: 'rank', label: 'Rank', width: '80px', class: 'rank-col' },
      { key: 'teamName', label: 'Team', width: '2fr', class: 'team-col' },
      { key: 'totalPoints', label: 'Points', width: '1fr', class: 'points-col' },
      { key: 'wins', label: 'Wins', width: '1fr', class: 'wins-col' },
      { key: 'gamesPlayed', label: 'Games', width: '1fr', class: 'games-col' },
      { key: 'kills', label: 'Kills', width: '1fr', class: 'kills-col' },
      { key: 'avgPlacement', label: 'Avg Place', width: '1fr', class: 'placement-col' }
    ],
    hoverable: true,
    showHeader: true
  };

  getSeasonName(seasonId: string): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : seasonId;
  }
}
