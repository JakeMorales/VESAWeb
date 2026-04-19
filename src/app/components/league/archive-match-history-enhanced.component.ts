import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchDayTableComponent } from '../match/match-day-table.component';
import { MatchDayResults, TeamGameResult, PlayerStats } from '../../models/match-day-results.model';

export interface HistoricalMatch {
  id: string;
  seasonId: string;
  division: string;
  week: string;
  matchNumber: number;
  date: string;
  teams: string[];
  results: MatchGameResult[];
}

export interface MatchGameResult {
  gameNumber: number;
  mapName?: string;
  results: GameTeamResult[];
}

export interface GameTeamResult {
  teamName: string;
  placement: number;
  kills: number;
  points: number;
  players?: PlayerStats[];
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming';
}

@Component({
  selector: 'app-archive-match-history',
  standalone: true,
  imports: [CommonModule, MatchDayTableComponent],
  template: `
    <div class="matches-section">
      <h2>Historical Matches</h2>
      
      <div class="matches-list">
        <div *ngFor="let match of filteredMatches" class="match-card">
          <div class="match-header">
            <div class="match-title">
              <h3>Division {{ match.division }} &middot; {{ getSeasonName(match.seasonId) }} &middot; {{ match.week }}</h3>
            </div>
          </div>

          <app-match-day-table 
            [matchResults]="convertToMatchDayResults(match)">
          </app-match-day-table>
        </div>
      </div>
    </div>
  `,
  styleUrl: './archive-match-history-enhanced.component.css'
})
export class ArchiveMatchHistoryComponent {
  @Input() filteredMatches: HistoricalMatch[] = [];
  @Input() seasons: Season[] = [];

  getSeasonName(seasonId: string): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : seasonId;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  convertToMatchDayResults(match: HistoricalMatch): MatchDayResults {
    const matchDayResults: MatchDayResults = {};

    // Convert each game result to the MatchDayResults format
    match.results.forEach(gameResult => {
      const teamGameResults: TeamGameResult[] = gameResult.results.map(teamResult => ({
        gameNumber: gameResult.gameNumber,
        teamName: teamResult.teamName,
        placement: teamResult.placement,
        teamKills: teamResult.kills,
        placementPoints: this.calculatePlacementPoints(teamResult.placement),
        totalPoints: teamResult.points,
        mapName: gameResult.mapName || `Game ${gameResult.gameNumber}`,
        players: teamResult.players || this.generateMockPlayerData(teamResult.teamName, teamResult.kills),
        isExpanded: false
      }));

      // Sort by placement (best to worst)
      teamGameResults.sort((a, b) => a.placement - b.placement);
      
      matchDayResults[gameResult.gameNumber] = teamGameResults;
    });

    return matchDayResults;
  }

  private calculatePlacementPoints(placement: number): number {
    const placementPoints: { [key: number]: number } = {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
    };
    return placementPoints[placement] || 0;
  }

  private generateMockPlayerData(teamName: string, teamKills: number): PlayerStats[] {
    // Generate mock player data if not provided
    const playerCount = 4; // Assuming 4-player teams
    const players: PlayerStats[] = [];
    
    // Distribute kills among players
    const baseKills = Math.floor(teamKills / playerCount);
    const remainingKills = teamKills % playerCount;
    
    for (let i = 0; i < playerCount; i++) {
      const kills = baseKills + (i < remainingKills ? 1 : 0);
      players.push({
        playerName: `Player ${i + 1}`,
        kills: kills,
        damage: kills * 150 + Math.floor(Math.random() * 200), // Approximate damage
        downs: Math.floor(kills * 1.2),
        headshots: Math.floor(kills * 0.3),
        assists: Math.floor(kills * 0.8),
        shots: Math.floor(kills * 15 + Math.random() * 50),
        hits: Math.floor(kills * 8 + Math.random() * 20),
        revives: Math.floor(Math.random() * 3),
        respawns: Math.floor(Math.random() * 2)
      });
    }
    
    return players;
  }
}
