import { MatchDayResults, TeamGameResult, PlayerStats, OverallPlayerStats, OverallTeamStanding } from '../../models/match-day-results.model';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { GameTabsComponent } from './game-tabs.component';
import { GameResultsTableComponent } from './game-results-table.component';
import { OverallStandingsTableComponent } from './overall-standings-table.component';

// interfaces moved to models/match-day-results.model.ts

// Placement points based on standard BR scoring
const PLACEMENT_POINTS: { [key: number]: number } = {
  1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
  11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
};

@Component({
  selector: 'app-match-day-table',
  standalone: true,
  imports: [CommonModule, GameTabsComponent, GameResultsTableComponent, OverallStandingsTableComponent],
  template: `
    <section class="match-day-section" *ngIf="matchResults && getGameNumbers().length > 0">
      <div class="match-day-content">
        <h2>Match Day Results</h2>
        
        <app-game-tabs
          [gameNumbers]="getGameNumbers()"
          [selectedGame]="selectedGame"
          [mapNames]="getMapNames()"
          (gameSelected)="onGameSelected($event)">
        </app-game-tabs>
        
        <app-game-results-table
          *ngIf="selectedGame > 0"
          [results]="getGameResults(selectedGame)"
          (teamToggled)="onTeamToggled($event)">
        </app-game-results-table>
        
        <app-overall-standings-table
          *ngIf="selectedGame === 0"
          [standings]="getOverallStandings()"
          [gameNumbers]="getGameNumbers()"
          [teamPlacements]="getTeamPlacementsForIndicators()"
          [teamScores]="getTeamScoresForIndicators()"
          [teamKills]="getTeamKillsForIndicators()"
          (teamToggled)="onStandingToggled($event)">
        </app-overall-standings-table>
      </div>
    </section>
  `,
  styleUrl: './match-day-table.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          height: '0px', 
          overflow: 'hidden'
        }),
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({ 
          opacity: 1, 
          height: '*'
        }))
      ]),
      transition(':leave', [
        style({ 
          opacity: 1, 
          height: '*', 
          overflow: 'hidden'
        }),
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({ 
          opacity: 0, 
          height: '0px'
        }))
      ])
    ])
  ]
})
export class MatchDayTableComponent {
  @Input() matchResults!: MatchDayResults;
  
  selectedGame = 0; // Default to overall standings view
  private cachedOverallStandings: OverallTeamStanding[] = [];
  private lastMatchResultsHash: string = '';

  getGameNumbers(): number[] {
    return Object.keys(this.matchResults).map(num => parseInt(num)).sort((a, b) => a - b);
  }

  getGameResults(gameNumber: number): TeamGameResult[] {
    return this.matchResults[gameNumber] || [];
  }

  toggleTeamExpanded(result: TeamGameResult): void {
    result.isExpanded = !result.isExpanded;
  }

  toggleStandingExpanded(standing: OverallTeamStanding): void {
    standing.isExpanded = !standing.isExpanded;
  }

  getTeamGameResults(teamName: string): TeamGameResult[] {
    const results: TeamGameResult[] = [];
    Object.values(this.matchResults).forEach((gameResults: TeamGameResult[]) => {
      const teamResult = gameResults.find(result => result.teamName === teamName);
      if (teamResult) {
        results.push(teamResult);
      }
    });
    return results.sort((a, b) => a.gameNumber - b.gameNumber);
  }

  getPlaceSuffix(place: number): string {
    if (place >= 11 && place <= 13) return 'th';
    const lastDigit = place % 10;
    switch (lastDigit) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  trackByTeam(index: number, item: TeamGameResult): string {
    return `${item.gameNumber}-${item.teamName}`;
  }

  trackByPlayer(index: number, item: PlayerStats): string {
    return item.playerName;
  }

  trackByOverallPlayer(index: number, item: OverallPlayerStats): string {
    return item.playerName;
  }

  getOverallStandings(): OverallTeamStanding[] {
    // Create a hash of the match results to detect changes
    const currentHash = JSON.stringify(this.matchResults);
    
    // Only recalculate if the data has changed
    if (this.lastMatchResultsHash !== currentHash || this.cachedOverallStandings.length === 0) {
      this.lastMatchResultsHash = currentHash;
      this.cachedOverallStandings = this.calculateOverallStandings();
    }
    
    return this.cachedOverallStandings;
  }

  private calculateOverallStandings(): OverallTeamStanding[] {
    const teamStandings: { [teamName: string]: {
      totalPoints: number;
      gamesWon: number;
      totalKills: number;
      totalPlacement: number;
      gamesPlayed: number;
      playerStats: { [playerName: string]: {
        totalKills: number;
        totalDamage: number;
        totalDowns: number;
        totalRevives: number;
        totalRespawns: number;
        gamesPlayed: number;
      } };
    } } = {};
    
    Object.values(this.matchResults).forEach((gameResults: TeamGameResult[]) => {
      gameResults.forEach((result: TeamGameResult) => {
        if (!teamStandings[result.teamName]) {
          teamStandings[result.teamName] = {
            totalPoints: 0,
            gamesWon: 0,
            totalKills: 0,
            totalPlacement: 0,
            gamesPlayed: 0,
            playerStats: {}
          };
        }
        
        teamStandings[result.teamName].totalPoints += result.totalPoints;
        teamStandings[result.teamName].totalKills += result.teamKills;
        teamStandings[result.teamName].totalPlacement += result.placement;
        teamStandings[result.teamName].gamesPlayed += 1;
        
        if (result.placement === 1) {
          teamStandings[result.teamName].gamesWon += 1;
        }

        // Aggregate player stats
        result.players.forEach(player => {
          if (!teamStandings[result.teamName].playerStats[player.playerName]) {
            teamStandings[result.teamName].playerStats[player.playerName] = {
              totalKills: 0,
              totalDamage: 0,
              totalDowns: 0,
              totalRevives: 0,
              totalRespawns: 0,
              gamesPlayed: 0
            };
          }
          
          const playerStat = teamStandings[result.teamName].playerStats[player.playerName];
          playerStat.totalKills += player.kills;
          playerStat.totalDamage += player.damage;
          playerStat.totalDowns += player.downs;
          playerStat.totalRevives += player.revives;
          playerStat.totalRespawns += player.respawns;
          playerStat.gamesPlayed += 1;
        });
      });
    });

    const standings = Object.entries(teamStandings)
      .map(([teamName, stats]) => ({
        teamName,
        totalPoints: stats.totalPoints,
        gamesWon: stats.gamesWon,
        totalKills: stats.totalKills,
        avgPlacement: stats.totalPlacement / stats.gamesPlayed,
        players: Object.entries(stats.playerStats).map(([playerName, playerData]) => ({
          playerName,
          totalKills: playerData.totalKills,
          totalDamage: playerData.totalDamage,
          totalDowns: playerData.totalDowns,
          totalRevives: playerData.totalRevives,
          totalRespawns: playerData.totalRespawns,
          gamesPlayed: playerData.gamesPlayed,
          avgKills: playerData.totalKills / playerData.gamesPlayed,
          avgDamage: playerData.totalDamage / playerData.gamesPlayed
        })),
        isExpanded: false // Will be preserved from cached data below
      }));
    
    const sortedStandings = standings.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Preserve expanded state from existing cached data
    const result = sortedStandings.map(standing => {
      const existing = this.cachedOverallStandings.find(cached => cached.teamName === standing.teamName);
      if (existing && existing.isExpanded !== undefined) {
        standing.isExpanded = existing.isExpanded;
      }
      return standing;
    });
    
    return result;
  }

  getMapName(gameNumber: number): string {
    const gameResults = this.getGameResults(gameNumber);
    return gameResults.length > 0 ? gameResults[0].mapName : '';
  }

  getMapNames(): { [key: number]: string } {
    const mapNames: { [key: number]: string } = {};
    this.getGameNumbers().forEach(gameNum => {
      mapNames[gameNum] = this.getMapName(gameNum);
    });
    return mapNames;
  }

  onGameSelected(gameNumber: number): void {
    this.selectedGame = gameNumber;
  }

  onTeamToggled(result: TeamGameResult): void {
    // Team expansion state is already handled in the child component
  }

  onStandingToggled(standing: OverallTeamStanding): void {
    // Standing expansion state is already handled in the child component
  }

  getTeamPlacementsForIndicators(): { [teamName: string]: { [gameNumber: number]: number } } {
    const teamPlacements: { [teamName: string]: { [gameNumber: number]: number } } = {};
    
    this.getGameNumbers().forEach(gameNum => {
      const gameResults = this.getGameResults(gameNum);
      gameResults.forEach(result => {
        if (!teamPlacements[result.teamName]) {
          teamPlacements[result.teamName] = {};
        }
        teamPlacements[result.teamName][gameNum] = result.placement;
      });
    });
    
    return teamPlacements;
  }

  getTeamScoresForIndicators(): { [teamName: string]: { [gameNumber: number]: number } } {
    const teamScores: { [teamName: string]: { [gameNumber: number]: number } } = {};
    
    this.getGameNumbers().forEach(gameNum => {
      const gameResults = this.getGameResults(gameNum);
      gameResults.forEach(result => {
        if (!teamScores[result.teamName]) {
          teamScores[result.teamName] = {};
        }
        teamScores[result.teamName][gameNum] = result.totalPoints;
      });
    });
    
    return teamScores;
  }

  getTeamKillsForIndicators(): { [teamName: string]: { [gameNumber: number]: number } } {
    const teamKills: { [teamName: string]: { [gameNumber: number]: number } } = {};
    
    this.getGameNumbers().forEach(gameNum => {
      const gameResults = this.getGameResults(gameNum);
      gameResults.forEach(result => {
        if (!teamKills[result.teamName]) {
          teamKills[result.teamName] = {};
        }
        teamKills[result.teamName][gameNum] = result.teamKills;
      });
    });
    
    return teamKills;
  }

  // Helper function to get color class for average placement
  getAvgPlacementColorClass(avgPlacement: number): string {
    // Scale from 1 (best - green) to 20 (worst - red)
    // Green: 1-5, Yellow: 5.1-10, Orange: 10.1-15, Red: 15.1-20
    if (avgPlacement <= 5) {
      return 'placement-excellent'; // Green
    } else if (avgPlacement <= 10) {
      return 'placement-good'; // Yellow
    } else if (avgPlacement <= 15) {
      return 'placement-fair'; // Orange
    } else {
      return 'placement-poor'; // Red
    }
  }

  // Helper function to calculate placement points
  static getPlacementPoints(placement: number): number {
    return PLACEMENT_POINTS[placement] || 0;
  }
}
