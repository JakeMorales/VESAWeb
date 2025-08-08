import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrimFiltersComponent } from '../../components/games/scrim-filters.component';
import { ScrimSessionComponent, ScrimSession } from '../../components/games/scrim-session.component';
import { ScoresArchiveComponent } from '../../components/league/scores-archive.component';
import { GameStatsOverviewComponent, GameStats } from '../../components/games/game-stats-overview.component';
import { GameCardComponent, GameMatch } from '../../components/games/game-card.component';
import { Team } from '../../components/games/team-card.component';
import { GamePlayer } from '../../components/games/player-item.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, ScrimFiltersComponent, ScrimSessionComponent, ScoresArchiveComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: GameMatch[] = [];
  filteredGames: GameMatch[] = [];
  scrimSessions: ScrimSession[] = [];
  filteredScrimSessions: ScrimSession[] = [];
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
    this.generateScrimData();
    this.filterGames();
    this.filterScrimSessions();
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
    // Not used for scrims view, kept for potential future use
    this.filterMap = map;
    this.filterGames();
    this.updateStats();
  }

  onModeChange(mode: string) {
    // Not used for scrims view, kept for potential future use
    this.filterMode = mode;
    this.filterGames();
    this.updateStats();
  }

  onSearchChange(search: string) {
    this.searchTerm = search;
    this.filterGames();
    this.filterScrimSessions();
    this.updateStats();
  }

  generateScrimData() {
    const maps = ['World\'s Edge', 'Kings Canyon', 'Olympus', 'Storm Point'];
    const teamNames = [
      'Team Apex', 'Storm Runners', 'Void Walkers', 'Third Party Kings',
      'Ring Runners', 'Hot Drop Squad', 'Gatekeepers', 'Zone Fighters',
      'Chaos Squad', 'Elite Strikers', 'Phantom Force', 'Night Owls'
    ];
    const playerNames = [
      'Wraith_Main_BTW', 'Octane_Speed', 'Lifeline_Healer', 'Pathfinder_Grapple',
      'Bangalore_Smoke', 'Bloodhound_Hunter', 'Gibraltar_Tank', 'Caustic_Gas',
      'Mirage_Bamboozle', 'Revenant_Shadow', 'Loba_Thief', 'Rampart_Builder',
      'Wattson_Fence', 'Crypto_Drone', 'Horizon_Gravity', 'Fuse_Explosives',
      'Valkyrie_Jets', 'Seer_Scan', 'Ash_Portal', 'Mad_Maggie_Drill'
    ];

    // Generate scrim sessions for the last few weeks
    this.scrimSessions = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 3)); // Every 3 days
      
      const time = Math.random() > 0.5 ? '8:00 PM EST' : '11:00 PM EST';
      const numMaps = 6; // Standard 6-game scrim set
      const sessionMaps = this.getRandomMaps(maps, numMaps);
      
      const matches = sessionMaps.map((map, mapIndex) => {
        const teams = this.generateScrimTeams(teamNames, playerNames, 6); // 6 teams per match
        return {
          id: i * 10 + mapIndex,
          map: map,
          teams: teams
        };
      });

      return {
        id: i,
        date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: time,
        maps: sessionMaps,
        matches: matches
      };
    });
  }

  private getRandomMaps(maps: string[], count: number): string[] {
    // Allow for map repeats in 6-game sets since we only have 4 maps
    const selectedMaps = [];
    for (let i = 0; i < count; i++) {
      const randomMap = maps[Math.floor(Math.random() * maps.length)];
      selectedMaps.push(randomMap);
    }
    return selectedMaps;
  }

  private generateScrimTeams(teamNames: string[], playerNames: string[], teamCount: number) {
    const teams = [];
    const usedPlayers = new Set<string>();
    
    for (let i = 0; i < teamCount; i++) {
      const teamPlayers = [];
      
      // Generate 3 players per team
      for (let p = 0; p < 3; p++) {
        let playerName;
        do {
          playerName = playerNames[Math.floor(Math.random() * playerNames.length)];
        } while (usedPlayers.has(playerName));
        
        usedPlayers.add(playerName);
        
        const kills = Math.floor(Math.random() * 8);
        const damage = Math.floor(Math.random() * 2000) + 200;
        
        teamPlayers.push({
          username: playerName,
          kills: kills,
          damage: damage,
          placement: i + 1
        });
      }
      
      const totalKills = teamPlayers.reduce((sum, p) => sum + p.kills, 0);
      const totalDamage = teamPlayers.reduce((sum, p) => sum + p.damage, 0);
      
      teams.push({
        name: teamNames[i] || `Team ${i + 1}`,
        players: teamPlayers,
        placement: i + 1,
        totalKills: totalKills,
        totalDamage: totalDamage
      });
    }
    
    // Randomize placements
    teams.sort(() => 0.5 - Math.random());
    teams.forEach((team, index) => {
      team.placement = index + 1;
      team.players.forEach(player => {
        player.placement = index + 1;
      });
    });
    
    return teams;
  }

  filterScrimSessions() {
    if (!this.searchTerm) {
      this.filteredScrimSessions = [...this.scrimSessions];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredScrimSessions = this.scrimSessions.filter(session => {
      // Search in team names and player names across all matches
      return session.matches.some(match => 
        match.teams.some(team => 
          team.name.toLowerCase().includes(searchLower) ||
          team.players.some(player => 
            player.username.toLowerCase().includes(searchLower)
          )
        )
      );
    });
  }

  switchToScrimsHistory() {
    this.viewMode = 'current';
  }

  switchToLeagueArchive() {
    this.viewMode = 'archive';
  }
}
