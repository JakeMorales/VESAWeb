import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGridComponent, GridConfig } from '../base-grid/base-grid.component';

export interface ScrimPlayer {
  rank: number;
  name: string;
  elo: number;
  eloChange: number;
  gamesPlayed: number;
  totalKills: number;
  averageKills: number;
  averageDamage: number;
  winRate: number;
  isLeaguePlayer: boolean;
  division?: string;
  divisionRank?: number;
  badges: string[];
}

@Component({
  selector: 'app-scrims-leaderboard',
  standalone: true,
  imports: [CommonModule, BaseGridComponent],
  template: `
    <app-base-grid 
      [data]="players" 
      [config]="gridConfig" 
      containerClass="scrims-leaderboard-grid">
      
      <ng-template #cellTemplate let-item let-column="column" let-value="value" let-index="index">
        <ng-container [ngSwitch]="column.key">
          <!-- Rank Column -->
          <span *ngSwitchCase="'rank'" class="rank-number">#{{ value }}</span>
          
          <!-- Player Column -->
          <div *ngSwitchCase="'name'" class="player-cell">
            <div class="player-info">
              <span class="player-name">{{ value }}</span>
              <div class="player-details">
                <span class="elo-tier" [style.color]="getEloTierColor(item.elo)">
                  {{ getEloTier(item.elo) }}
                </span>
                <span 
                  *ngIf="item.isLeaguePlayer" 
                  class="league-badge"
                  [style.color]="getDivisionColor(item.division)"
                >
                  {{ item.division }} {{ item.divisionRank ? '#' + item.divisionRank : '' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- ELO Column -->
          <div *ngSwitchCase="'elo'" class="elo-cell">
            <span class="elo-value">{{ value }}</span>
            <span 
              class="elo-change"
              [class.positive]="item.eloChange > 0"
              [class.negative]="item.eloChange < 0"
            >
              {{ item.eloChange > 0 ? '+' : '' }}{{ item.eloChange }}
            </span>
          </div>
          
          <!-- Stats Column -->
          <div *ngSwitchCase="'stats'" class="stats-cell">
            <div class="stat-item">
              <span class="stat-label">Games:</span>
              <span class="stat-value">{{ item.gamesPlayed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Kills:</span>
              <span class="stat-value">{{ item.totalKills }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avg K/G:</span>
              <span class="stat-value">{{ item.averageKills }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Win Rate:</span>
              <span class="stat-value">{{ item.winRate }}%</span>
            </div>
          </div>
          
          <!-- Badges Column -->
          <div *ngSwitchCase="'badges'" class="badges-cell">
            <span 
              *ngFor="let badge of value" 
              class="badge"
              [class]="getBadgeClass(badge)"
            >
              {{ badge }}
            </span>
          </div>
          
          <!-- Default -->
          <span *ngSwitchDefault>{{ value }}</span>
        </ng-container>
      </ng-template>
    </app-base-grid>
  `,
  styleUrl: './scrims-leaderboard.component.css'
})
export class ScrimsLeaderboardComponent {
  @Input() players: ScrimPlayer[] = [];

  gridConfig: GridConfig = {
    columns: [
      { key: 'rank', label: 'Rank', width: '80px', class: 'rank-col' },
      { key: 'name', label: 'Player', width: '1fr', class: 'player-col', sortable: true },
      { key: 'elo', label: 'ELO', width: '120px', class: 'elo-col', sortable: true },
      { key: 'stats', label: 'Stats', width: '2fr', class: 'stats-col' },
      { key: 'badges', label: 'Badges', width: '1.5fr', class: 'badges-col' }
    ],
    hoverable: true,
    showHeader: true,
    showScrollbar: false
  };

  getDivisionColor(division?: string): string {
    const colors: { [key: string]: string } = {
      'Pinnacle': '#FFD700',
      'Vanguard': '#C0C0C0',
      'Ascendant': '#CD7F32',
      'Emergent': '#4169E1',
      'Challengers': '#32CD32',
      'Contenders': '#FF6347'
    };
    return division ? colors[division] || '#888' : '#888';
  }

  getBadgeClass(badge: string): string {
    const badgeClasses: { [key: string]: string } = {
      'Champion': 'badge badge-champion',
      'High Killer': 'badge badge-high-killer',
      'League Elite': 'badge badge-league-elite',
      'Veteran': 'badge badge-veteran',
      'Rising Star': 'badge badge-rising-star',
      'Consistent': 'badge badge-consistent',
      'Team Player': 'badge badge-team-player',
      'Aggressive': 'badge badge-aggressive',
      'Tactical': 'badge badge-tactical',
      'Support': 'badge badge-support',
      'Tank': 'badge badge-tank',
      'Scout': 'badge badge-scout',
      'Clutch Master': 'badge badge-clutch-master',
      'Elite': 'badge badge-elite',
      'Sharpshooter': 'badge badge-sharpshooter'
    };
    return badgeClasses[badge] || 'badge badge-default';
  }

  getEloTier(elo: number): string {
    if (elo >= 2700) return 'Elite';
    if (elo >= 2400) return 'Expert';
    if (elo >= 2100) return 'Veteran';
    if (elo >= 1800) return 'Skilled';
    if (elo >= 1500) return 'Novice';
    return 'Rookie';
  }

  getEloTierColor(elo: number): string {
    if (elo >= 2700) return '#FF2C5C';
    if (elo >= 2400) return '#00D4FF';
    if (elo >= 2100) return '#2C9CFF';
    if (elo >= 1800) return '#FFD700';
    if (elo >= 1500) return '#C0C0C0';
    return '#CD7F32';
  }
}
