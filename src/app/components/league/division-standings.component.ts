import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../pages/league/division/division.component';
import { BaseGridComponent, GridConfig } from '../base-grid/base-grid.component';

@Component({
  selector: 'app-division-standings',
  standalone: true,
  imports: [CommonModule, BaseGridComponent],
  template: `
    <section class="standings-section">
      <div class="standings-content">
        <h2>Current Standings</h2>
        
        <app-base-grid 
          [data]="teams" 
          [config]="gridConfig" 
          containerClass="division-standings-grid">
          
          <ng-template #cellTemplate let-item let-column="column" let-value="value" let-index="index">
            <ng-container [ngSwitch]="column.key">
              <!-- Rank Column -->
              <span *ngSwitchCase="'rank'" class="rank-number" [class]="'rank-' + (index + 1)">{{ index + 1 }}</span>
              
              <!-- Team Column -->
              <span *ngSwitchCase="'name'" class="team-name">{{ value }}</span>
              
              <!-- Points Column -->
              <span *ngSwitchCase="'points'" class="points-value">{{ value }}</span>
              
              <!-- Wins Column -->
              <span *ngSwitchCase="'wins'" class="wins-value">{{ value }}</span>
              
              <!-- Games Column -->
              <span *ngSwitchCase="'gamesPlayed'" class="games-value">{{ value }}</span>
              
              <!-- Kills Column -->
              <span *ngSwitchCase="'kills'" class="kills-value">{{ value }}</span>
              
              <!-- Trend Column -->
              <span *ngSwitchCase="'trend'" class="trend-indicator" [class]="getTrendClass(value)">
                {{ getTrendIcon(value) }}
              </span>
              
              <!-- Default -->
              <span *ngSwitchDefault>{{ value }}</span>
            </ng-container>
          </ng-template>
        </app-base-grid>
      </div>
    </section>
  `,
  styleUrl: './division-standings.component.css'
})
export class DivisionStandingsComponent {
  @Input() teams: Team[] = [];

  gridConfig: GridConfig = {
    columns: [
      { key: 'rank', label: 'Rank', width: '80px', class: 'rank-col' },
      { key: 'name', label: 'Team', width: '2fr', class: 'team-col', sortable: true },
      { key: 'points', label: 'Points', width: '1fr', class: 'points-col', sortable: true },
      { key: 'wins', label: 'Wins', width: '1fr', class: 'wins-col', sortable: true },
      { key: 'gamesPlayed', label: 'Games', width: '1fr', class: 'games-col', sortable: true },
      { key: 'kills', label: 'Kills', width: '1fr', class: 'kills-col', sortable: true },
      { key: 'trend', label: 'Trend', width: '100px', class: 'trend-col' }
    ],
    hoverable: true,
    showHeader: true
  };

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-same';
    }
  }
}
