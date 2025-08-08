import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrimsLeaderboardComponent, ScrimPlayer } from '../../components/scrims-leaderboard/scrims-leaderboard.component';
import { PlayerStatsHeaderComponent } from '../../components/player-stats/player-stats-header.component';
import { PlayerFiltersComponent } from '../../components/player-stats/player-filters.component';
import { LoadingStatesComponent } from '../../components/player-stats/loading-states.component';

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ScrimsLeaderboardComponent,
    PlayerStatsHeaderComponent,
    PlayerFiltersComponent,
    LoadingStatesComponent
  ],
  template: `
    <div class="player-stats-container">
      <app-player-stats-header></app-player-stats-header>
      
      <app-player-filters
        [searchTerm]="searchTerm"
        (sortChange)="onSortChange($event)"
        (searchChange)="onSearchChange($event)">
      </app-player-filters>

      <div class="leaderboard-section">
        <app-scrims-leaderboard [players]="displayedPlayers"></app-scrims-leaderboard>
        
        <app-loading-states
          [isLoading]="isLoading"
          [hasMorePlayers]="hasMorePlayers">
        </app-loading-states>
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

    .leaderboard-section {
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .player-stats-container {
        padding: 1rem;
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

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }

  onSearchChange(searchValue: string) {
    this.searchTerm = searchValue;
    this.generateMockData(); // Regenerate to get fresh data
    this.sortPlayers();
  }
}
