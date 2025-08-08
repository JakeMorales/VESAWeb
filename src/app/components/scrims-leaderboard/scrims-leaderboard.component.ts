import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="leaderboard-table">
      <div class="table-header">
        <div class="rank-col">Rank</div>
        <div class="player-col">Player</div>
        <div class="elo-col">ELO</div>
        <div class="stats-col">Stats</div>
        <div class="badges-col">Badges</div>
      </div>
      <div class="table-body">
        <div class="player-row" *ngFor="let player of players">
          <div class="rank-col">
            <span class="rank-number">#{{ player.rank }}</span>
          </div>
          <div class="player-col">
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <div class="player-details">
                <span class="elo-tier" [style.color]="getEloTierColor(player.elo)">
                  {{ getEloTier(player.elo) }}
                </span>
                <span 
                  *ngIf="player.isLeaguePlayer" 
                  class="league-badge"
                  [style.color]="getDivisionColor(player.division)"
                >
                  {{ player.division }} {{ player.divisionRank ? '#' + player.divisionRank : '' }}
                </span>
              </div>
            </div>
          </div>
          <div class="elo-col">
            <div class="elo-info">
              <span class="elo-value">{{ player.elo }}</span>
              <span 
                class="elo-change"
                [class.positive]="player.eloChange > 0"
                [class.negative]="player.eloChange < 0"
              >
                {{ player.eloChange > 0 ? '+' : '' }}{{ player.eloChange }}
              </span>
            </div>
          </div>
          <div class="stats-col">
            <div class="player-stats">
              <div class="stat-item">
                <span class="stat-label">Games:</span>
                <span class="stat-value">{{ player.gamesPlayed }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Kills:</span>
                <span class="stat-value">{{ player.totalKills }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg K/G:</span>
                <span class="stat-value">{{ player.averageKills }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Win Rate:</span>
                <span class="stat-value">{{ player.winRate }}%</span>
              </div>
            </div>
          </div>
          <div class="badges-col">
            <div class="player-badges">
              <span 
                *ngFor="let badge of player.badges" 
                class="badge"
                [style.background-color]="getBadgeColor(badge)"
              >
                {{ badge }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './scrims-leaderboard.component.css'
})
export class ScrimsLeaderboardComponent {
  @Input() players: ScrimPlayer[] = [];

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

  getBadgeColor(badge: string): string {
    const colors: { [key: string]: string } = {
      'Champion': '#FFD700',
      'High Killer': '#FF4444',
      'League Elite': '#FF2C5C',
      'Veteran': '#2C9CFF',
      'Rising Star': '#00D4FF',
      'Consistent': '#32CD32',
      'Team Player': '#9932CC',
      'Aggressive': '#FF6347',
      'Tactical': '#4169E1',
      'Support': '#32CD32',
      'Tank': '#8B4513',
      'Scout': '#00CED1'
    };
    return colors[badge] || '#888';
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
