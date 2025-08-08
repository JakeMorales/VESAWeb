import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrimsLeaderboardComponent, ScrimPlayer } from '../../components/scrims-leaderboard/scrims-leaderboard.component';

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrimsLeaderboardComponent],
  template: `
    <div class="player-stats-container">
      <div class="header-section">
        <h1>Player Leaderboard</h1>
        <p>Complete rankings for all VESA players with ELO ratings</p>
        
        <div class="filter-controls">
          <select (change)="onSortChange($event)" class="sort-select">
            <option value="elo">Sort by ELO</option>
            <option value="kills">Sort by Total Kills</option>
            <option value="winRate">Sort by Win Rate</option>
            <option value="gamesPlayed">Sort by Games Played</option>
            <option value="averageKills">Sort by Avg Kills</option>
          </select>
          
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search players..." 
              class="search-input"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchModelChange()"
            >
          </div>
        </div>
      </div>

      <div class="leaderboard-section">
        <app-scrims-leaderboard [players]="displayedPlayers"></app-scrims-leaderboard>
        
        <div *ngIf="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <span>Loading more players...</span>
        </div>
        
        <div *ngIf="hasMorePlayers && !isLoading" class="load-more-trigger">
          <span>Scroll down to load more players</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .player-stats-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h1 {
      color: var(--color-accent-primary);
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-section p {
      color: var(--color-text-secondary);
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    .filter-controls {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .sort-select {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
    }

    .sort-select:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 2px rgba(255, 44, 92, 0.2);
    }

    .search-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-input {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
      min-width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 2px rgba(255, 44, 92, 0.2);
    }

    .search-input::placeholder {
      color: var(--color-text-secondary);
    }

    .leaderboard-section {
      margin-top: 2rem;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      color: var(--color-text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 44, 92, 0.3);
      border-top: 3px solid var(--color-accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .load-more-trigger {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-secondary);
      font-style: italic;
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
        min-width: 200px;
      }
    }
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
  allPlayers: ScrimPlayer[] = [];
  displayedPlayers: ScrimPlayer[] = [];
  isLoading = false;
  hasMorePlayers = true;
  searchTerm = '';
  sortBy = 'elo';
  currentPage = 0;
  playersPerPage = 10;

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isNearBottom() && this.hasMorePlayers && !this.isLoading) {
      this.loadMorePlayers();
    }
  }

  ngOnInit() {
    this.generateMockData();
    this.sortPlayers();
    this.loadInitialPlayers();
  }

  generateMockData() {
    const names = [
      'Shadow_Strike', 'Apex_Legend', 'Elite_Gamer', 'Pro_Player_1', 'Combat_King',
      'Victory_Queen', 'Skill_Master', 'Top_Fragger', 'Clutch_God', 'Aim_Bot',
      'Head_Hunter', 'Damage_Dealer', 'Win_Streak', 'Carry_Lord', 'Beast_Mode',
      'Predator_Rank', 'Diamond_Dive', 'Platinum_Pro', 'Gold_Rush', 'Silver_Surfer',
      'Bronze_Warrior', 'Rookie_Rising', 'Veteran_Volt', 'Master_Chief', 'Legend_Born',
      'Champion_Call', 'Winner_Takes', 'Final_Circle', 'Last_Stand', 'Victory_Lap',
      'Kill_Leader', 'Squad_Wipe', 'Third_Party', 'High_Ground', 'Zone_Master',
      'Loot_Goblin', 'Shield_Swap', 'Armor_Break', 'Knock_Down', 'Full_Send',
      'No_Scope', 'Quick_Scope', 'Flick_Shot', 'Tracking_God', 'Movement_King',
      'Slide_Cancel', 'Wall_Jump', 'Tap_Strafe', 'Portal_Play', 'Rift_Walker'
    ];

    const divisions = ['Pinnacle', 'Vanguard', 'Ascendant', 'Emergent', 'Challengers', 'Contenders'];
    const badges = ['Champion', 'Veteran', 'Elite', 'Sharpshooter', 'Team Player', 'Clutch Master'];

    this.allPlayers = names.map((name, index) => {
      const gamesPlayed = Math.floor(Math.random() * 200) + 50;
      const totalKills = Math.floor(Math.random() * 1500) + 200;
      const averageKills = totalKills / gamesPlayed;
      const averageDamage = Math.floor(Math.random() * 800) + 400;
      const winRate = Math.floor(Math.random() * 40) + 10;
      const elo = Math.floor(Math.random() * 2500) + 500;
      const eloChange = Math.floor(Math.random() * 51) - 25;
      const isLeaguePlayer = Math.random() > 0.3;

      return {
        rank: index + 1,
        name,
        elo,
        eloChange,
        gamesPlayed,
        totalKills,
        averageKills: Math.round(averageKills * 10) / 10,
        averageDamage,
        winRate,
        isLeaguePlayer,
        division: isLeaguePlayer ? divisions[Math.floor(Math.random() * divisions.length)] : undefined,
        divisionRank: isLeaguePlayer ? Math.floor(Math.random() * 20) + 1 : undefined,
        badges: this.getRandomBadges(badges)
      };
    });
  }

  getRandomBadges(badges: string[]): string[] {
    const numBadges = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...badges].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numBadges);
  }

  sortPlayers() {
    this.allPlayers.sort((a, b) => {
      switch (this.sortBy) {
        case 'elo':
          return b.elo - a.elo;
        case 'kills':
          return b.totalKills - a.totalKills;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'gamesPlayed':
          return b.gamesPlayed - a.gamesPlayed;
        case 'averageKills':
          return b.averageKills - a.averageKills;
        default:
          return b.elo - a.elo;
      }
    });

    // Update ranks after sorting
    this.allPlayers.forEach((player, index) => {
      player.rank = index + 1;
    });

    // Filter by search term
    if (this.searchTerm) {
      this.allPlayers = this.allPlayers.filter(player =>
        player.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Reset pagination
    this.currentPage = 0;
    this.hasMorePlayers = this.allPlayers.length > this.playersPerPage;
    this.loadInitialPlayers();
  }

  loadInitialPlayers() {
    this.displayedPlayers = this.allPlayers.slice(0, this.playersPerPage);
    this.currentPage = 1;
  }

  loadMorePlayers() {
    if (this.isLoading || !this.hasMorePlayers) return;

    this.isLoading = true;

    // Simulate loading delay
    setTimeout(() => {
      const startIndex = this.currentPage * this.playersPerPage;
      const endIndex = startIndex + this.playersPerPage;
      const newPlayers = this.allPlayers.slice(startIndex, endIndex);

      this.displayedPlayers = [...this.displayedPlayers, ...newPlayers];
      this.currentPage++;
      this.hasMorePlayers = endIndex < this.allPlayers.length;
      this.isLoading = false;
    }, 500);
  }

  isNearBottom(): boolean {
    const threshold = 200;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    return position > height - threshold;
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }

  onSearchChange(searchValue: string) {
    this.searchTerm = searchValue;
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }

  onSearchModelChange() {
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }

  onSearchKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }
}
