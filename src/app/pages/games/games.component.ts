import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameFiltersComponent } from '../../components/games/game-filters.component';
import { GameStatsOverviewComponent, GameStats } from '../../components/games/game-stats-overview.component';
import { GameCardComponent, GameMatch } from '../../components/games/game-card.component';
import { ScoresArchiveComponent } from '../../components/league/scores-archive.component';
import { Team } from '../../components/games/team-card.component';
import { GamePlayer } from '../../components/games/player-item.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, GameFiltersComponent, GameStatsOverviewComponent, GameCardComponent, ScoresArchiveComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: GameMatch[] = [];
  filteredGames: GameMatch[] = [];
  filterMap = '';
  filterMode = '';
  searchTerm = '';
  displayedCount = 10;
  viewMode: 'current' | 'archive' = 'current';
  gameStats: GameStats = {
    totalMatches: 0,
    averageKills: 0,
    averageDuration: '0:00',
    popularMap: 'N/A'
  };

  ngOnInit() {
    this.generateMockData();
    this.filterGames();
    this.updateStats();
  }

  updateStats() {
    this.gameStats = {
      totalMatches: this.games.length,
      averageKills: this.getAverageKills(),
      averageDuration: this.getAverageDuration(),
      popularMap: this.getMostPopularMap()
    };
  }

  generateMockData() {
    const maps = ['World\'s Edge', 'Kings Canyon', 'Olympus', 'Storm Point'];
    const modes = ['Ranked', 'Scrimmage', 'Tournament'];
    const teamNames = [
      'Team Apex', 'Storm Runners', 'Void Walkers', 'Third Party Kings',
      'Ring Runners', 'Hot Drop Squad', 'Gatekeepers', 'Zone Fighters'
    ];
    const playerNames = [
      'Wraith_Main_BTW', 'Octane_Speed', 'Lifeline_Healer', 'Pathfinder_Grapple',
      'Bangalore_Smoke', 'Bloodhound_Hunter', 'Gibraltar_Tank', 'Caustic_Gas',
      'Mirage_Bamboozle', 'Revenant_Shadow', 'Loba_Thief', 'Rampart_Builder'
    ];

    this.games = Array.from({ length: 50 }, (_, i) => {
      const teams: Team[] = [];
      let totalKills = 0;
      let totalDamage = 0;

      // Generate 6 teams (18 players total)
      for (let t = 0; t < 6; t++) {
        const teamPlayers: GamePlayer[] = [];
        let teamKills = 0;
        let teamDamage = 0;

        // 3 players per team
        for (let p = 0; p < 3; p++) {
          const kills = Math.floor(Math.random() * 8);
          const damage = Math.floor(Math.random() * 2000) + 200;
          
          teamPlayers.push({
            username: playerNames[Math.floor(Math.random() * playerNames.length)],
            kills,
            damage,
            placement: t + 1
          });

          teamKills += kills;
          teamDamage += damage;
        }

        teams.push({
          name: teamNames[t] || `Team ${t + 1}`,
          players: teamPlayers,
          placement: t + 1,
          totalKills: teamKills,
          totalDamage: teamDamage
        });

        totalKills += teamKills;
        totalDamage += teamDamage;
      }

      return {
        id: 50 - i,
        date: this.getRandomDate(i),
        time: this.getRandomTime(),
        map: maps[Math.floor(Math.random() * maps.length)],
        mode: modes[Math.floor(Math.random() * modes.length)],
        duration: this.getRandomDuration(),
        teams,
        winner: teams[0].name,
        totalKills,
        totalDamage
      };
    });
  }

  getRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString();
  }

  getRandomTime(): string {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'PM' : 'AM';
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  getRandomDuration(): string {
    const minutes = Math.floor(Math.random() * 10) + 15;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  filterGames() {
    let filtered = this.games;

    if (this.filterMap) {
      filtered = filtered.filter(game => game.map === this.filterMap);
    }

    if (this.filterMode) {
      filtered = filtered.filter(game => game.mode === this.filterMode);
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.teams.some(team =>
          team.name.toLowerCase().includes(searchLower) ||
          team.players.some(player =>
            player.username.toLowerCase().includes(searchLower)
          )
        )
      );
    }

    this.filteredGames = filtered.slice(0, this.displayedCount);
  }

  loadMoreGames() {
    this.displayedCount += 10;
    this.filterGames();
  }

  getModeClass(mode: string): string {
    return mode.toLowerCase();
  }

  getPlacementClass(placement: number): string {
    if (placement === 1) return 'first-place';
    if (placement === 2) return 'second-place';
    if (placement === 3) return 'third-place';
    return '';
  }

  getPlacementText(placement: number): string {
    if (placement === 1) return '🥇 1st Place';
    if (placement === 2) return '🥈 2nd Place';
    if (placement === 3) return '🥉 3rd Place';
    return `#${placement}`;
  }

  getAverageKills(): number {
    if (this.games.length === 0) return 0;
    const total = this.games.reduce((sum, game) => sum + game.totalKills, 0);
    return Math.round(total / this.games.length);
  }

  getAverageDuration(): string {
    // Simple average of 20 minutes
    return '20:15';
  }

  getMostPopularMap(): string {
    const mapCounts = this.games.reduce((acc, game) => {
      acc[game.map] = (acc[game.map] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mapCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  }

  onMapChange(map: string) {
    this.filterMap = map;
    this.filterGames();
    this.updateStats();
  }

  onModeChange(mode: string) {
    this.filterMode = mode;
    this.filterGames();
    this.updateStats();
  }

  onSearchChange(search: string) {
    this.searchTerm = search;
    this.filterGames();
    this.updateStats();
  }

  switchToCurrentGames() {
    this.viewMode = 'current';
  }

  switchToArchive() {
    this.viewMode = 'archive';
  }
}
