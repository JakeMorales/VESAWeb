import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Player {
  id: number;
  username: string;
  rank: number;
  kills: number;
  deaths: number;
  damage: number;
  wins: number;
  gamesPlayed: number;
  kdr: number;
  avgDamage: number;
  winRate: number;
  lastActive: string;
}

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-stats-container">
      <div class="header-section">
        <h1>Player Statistics</h1>
        <p>Track performance across all VESA league matches</p>
        
        <div class="filter-controls">
          <select (change)="onSortChange($event)" class="sort-select">
            <option value="rank">Sort by Rank</option>
            <option value="kills">Sort by Kills</option>
            <option value="kdr">Sort by K/D Ratio</option>
            <option value="damage">Sort by Damage</option>
            <option value="winRate">Sort by Win Rate</option>
          </select>
          
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search players..." 
              class="search-input"
            >
            <small>Search functionality will be added soon</small>
          </div>
        </div>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <h3>{{ players.length }}</h3>
          <p>Total Players</p>
        </div>
        <div class="stat-card">
          <h3>{{ getAverageKDR() }}</h3>
          <p>Average K/D</p>
        </div>
        <div class="stat-card">
          <h3>{{ getTotalDamage() | number }}</h3>
          <p>Total Damage</p>
        </div>
        <div class="stat-card">
          <h3>{{ getTopPlayer()?.username || 'N/A' }}</h3>
          <p>Top Player</p>
        </div>
      </div>

      <div class="table-container">
        <table class="players-table">
          <thead>
            <tr>
              <th class="rank-col">Rank</th>
              <th class="player-col">Player</th>
              <th class="stat-col">K/D</th>
              <th class="stat-col">Kills</th>
              <th class="stat-col">Deaths</th>
              <th class="stat-col">Damage</th>
              <th class="stat-col">Avg Dmg</th>
              <th class="stat-col">Wins</th>
              <th class="stat-col">Games</th>
              <th class="stat-col">Win %</th>
              <th class="stat-col">Last Active</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let player of filteredPlayers" class="player-row">
              <td class="rank-col">
                <span class="rank-badge" [class]="getRankClass(player.rank)">
                  {{ player.rank }}
                </span>
              </td>
              <td class="player-col">
                <div class="player-info">
                  <div class="player-avatar">{{ player.username.charAt(0).toUpperCase() }}</div>
                  <span class="player-name">{{ player.username }}</span>
                </div>
              </td>
              <td class="stat-col" [class]="getKDRClass(player.kdr)">
                {{ player.kdr.toFixed(2) }}
              </td>
              <td class="stat-col">{{ player.kills | number }}</td>
              <td class="stat-col">{{ player.deaths | number }}</td>
              <td class="stat-col">{{ player.damage | number }}</td>
              <td class="stat-col">{{ player.avgDamage | number }}</td>
              <td class="stat-col">{{ player.wins }}</td>
              <td class="stat-col">{{ player.gamesPlayed }}</td>
              <td class="stat-col" [class]="getWinRateClass(player.winRate)">
                {{ player.winRate.toFixed(1) }}%
              </td>
              <td class="stat-col">{{ player.lastActive }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .player-stats-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .header-section p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .sort-select {
      padding: 0.75rem 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      background-color: white;
      cursor: pointer;
    }

    .sort-select:focus {
      outline: none;
      border-color: #667eea;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      padding: 0.75rem 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
    }

    .stat-card h3 {
      font-size: 2rem;
      margin: 0;
      font-weight: bold;
    }

    .stat-card p {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      overflow: hidden;
      overflow-x: auto;
    }

    .players-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .players-table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0.5rem;
      text-align: left;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .players-table td {
      padding: 1rem 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .player-row:hover {
      background-color: #f8f9fa;
    }

    .rank-col {
      width: 80px;
      text-align: center;
    }

    .player-col {
      width: 200px;
    }

    .stat-col {
      width: 100px;
      text-align: center;
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      font-weight: bold;
      color: white;
    }

    .rank-badge.top-3 {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #333;
    }

    .rank-badge.top-10 {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
      color: #333;
    }

    .rank-badge.top-25 {
      background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
    }

    .rank-badge.default {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .player-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .player-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .player-name {
      font-weight: 600;
      color: #333;
    }

    .high-kdr {
      color: #28a745;
      font-weight: bold;
    }

    .medium-kdr {
      color: #ffc107;
      font-weight: bold;
    }

    .low-kdr {
      color: #dc3545;
      font-weight: bold;
    }

    .high-winrate {
      color: #28a745;
      font-weight: bold;
    }

    .medium-winrate {
      color: #ffc107;
      font-weight: bold;
    }

    .low-winrate {
      color: #dc3545;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .player-stats-container {
        padding: 1rem;
      }

      .header-section h1 {
        font-size: 2rem;
      }

      .filter-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .search-input {
        width: 100%;
      }

      .stats-overview {
        grid-template-columns: repeat(2, 1fr);
      }

      .players-table {
        font-size: 0.8rem;
      }

      .players-table th,
      .players-table td {
        padding: 0.5rem 0.25rem;
      }

      .player-col {
        width: 150px;
      }

      .stat-col {
        width: 80px;
      }
    }
  `]
})
export class PlayerStatsComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  sortBy = 'rank';
  searchTerm = '';

  ngOnInit() {
    this.generateMockData();
    this.sortPlayers();
  }

  generateMockData() {
    const usernames = [
      'Wraith_Main_BTW', 'Octane_Speed', 'Lifeline_Healer', 'Pathfinder_Grapple',
      'Bangalore_Smoke', 'Bloodhound_Hunter', 'Gibraltar_Tank', 'Caustic_Gas',
      'Mirage_Bamboozle', 'Revenant_Shadow', 'Loba_Thief', 'Rampart_Builder',
      'Horizon_Gravity', 'Fuse_Explosives', 'Valkyrie_Pilot', 'Seer_Tracker',
      'Ash_Predator', 'Mad_Maggie', 'Newcastle_Shield', 'Vantage_Sniper',
      'Catalyst_Wall', 'Ballistic_Veteran', 'Conduit_Energy', 'Alter_Portal'
    ];

    this.players = usernames.map((username, index) => {
      const gamesPlayed = Math.floor(Math.random() * 500) + 50;
      const kills = Math.floor(Math.random() * 2000) + 100;
      const deaths = Math.floor(Math.random() * 1500) + 50;
      const wins = Math.floor(Math.random() * gamesPlayed * 0.3);
      const damage = Math.floor(Math.random() * 500000) + 50000;
      
      return {
        id: index + 1,
        username,
        rank: index + 1,
        kills,
        deaths,
        damage,
        wins,
        gamesPlayed,
        kdr: deaths > 0 ? kills / deaths : kills,
        avgDamage: Math.floor(damage / gamesPlayed),
        winRate: (wins / gamesPlayed) * 100,
        lastActive: this.getRandomDate()
      };
    });
  }

  getRandomDate(): string {
    const dates = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago', '2 weeks ago'];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  sortPlayers() {
    this.players.sort((a, b) => {
      switch (this.sortBy) {
        case 'rank':
          return a.rank - b.rank;
        case 'kills':
          return b.kills - a.kills;
        case 'kdr':
          return b.kdr - a.kdr;
        case 'damage':
          return b.damage - a.damage;
        case 'winRate':
          return b.winRate - a.winRate;
        default:
          return a.rank - b.rank;
      }
    });
    this.filterPlayers();
  }

  filterPlayers() {
    this.filteredPlayers = this.players.filter(player =>
      player.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getRankClass(rank: number): string {
    if (rank <= 3) return 'top-3';
    if (rank <= 10) return 'top-10';
    if (rank <= 25) return 'top-25';
    return 'default';
  }

  getKDRClass(kdr: number): string {
    if (kdr >= 2.0) return 'high-kdr';
    if (kdr >= 1.0) return 'medium-kdr';
    return 'low-kdr';
  }

  getWinRateClass(winRate: number): string {
    if (winRate >= 20) return 'high-winrate';
    if (winRate >= 10) return 'medium-winrate';
    return 'low-winrate';
  }

  getAverageKDR(): string {
    const total = this.players.reduce((sum, player) => sum + player.kdr, 0);
    return (total / this.players.length).toFixed(2);
  }

  getTotalDamage(): number {
    return this.players.reduce((sum, player) => sum + player.damage, 0);
  }

  getTopPlayer(): Player | undefined {
    return this.players.find(player => player.rank === 1);
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.sortPlayers();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterPlayers();
  }

  onSearchKeyup(value: string) {
    this.searchTerm = value;
    this.filterPlayers();
  }
}
