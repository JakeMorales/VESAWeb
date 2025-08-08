import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGridComponent, GridConfig } from '../base-grid/base-grid.component';

export interface GameResult {
  gameNumber: number;
  placement: number;
  teamName: string;
  kills: number;
  points: number;
  isWinner: boolean;
}

export interface MatchResults {
  [gameNumber: number]: GameResult[];
}

export interface OverallStanding {
  teamName: string;
  totalPoints: number;
  wins: number;
  avgKills: number;
}

@Component({
  selector: 'app-match-results',
  standalone: true,
  imports: [CommonModule, BaseGridComponent],
  template: `
    <section class="results-section" *ngIf="gameResults && getGameNumbers().length > 0">
      <div class="results-content">
        <h2>Match Results</h2>
        
        <div class="games-tabs">
          <button 
            *ngFor="let gameNum of getGameNumbers()" 
            (click)="selectedGame = gameNum"
            [class.active]="selectedGame === gameNum"
            class="game-tab">
            Game {{ gameNum }}
          </button>
          <button 
            (click)="selectedGame = 0"
            [class.active]="selectedGame === 0"
            class="game-tab overall-tab">
            Overall
          </button>
        </div>
        
        <!-- Game Results Grid -->
        <app-base-grid 
          *ngIf="selectedGame > 0"
          [data]="getGameResults(selectedGame)"
          [config]="gameResultsConfig"
          containerClass="game-results-grid">
          
          <ng-template #cellTemplate let-item let-column="column" let-value="value">
            <ng-container [ngSwitch]="column.key">
              <span *ngSwitchCase="'placement'" 
                    class="placement-number" 
                    [class]="'place-' + value">
                {{ value }}
              </span>
              
              <div *ngSwitchCase="'teamName'" class="team-cell">
                <span class="team-name">{{ value }}</span>
                <span class="winner-badge" *ngIf="item.isWinner">👑</span>
              </div>
              
              <span *ngSwitchCase="'points'" class="points-value">{{ value }}</span>
              
              <span *ngSwitchDefault>{{ value }}</span>
            </ng-container>
          </ng-template>
        </app-base-grid>
        
        <!-- Overall Standings Grid -->
        <app-base-grid 
          *ngIf="selectedGame === 0"
          [data]="getOverallStandings()"
          [config]="overallStandingsConfig"
          containerClass="overall-standings-grid">
          
          <ng-template #cellTemplate let-item let-column="column" let-value="value" let-index="index">
            <ng-container [ngSwitch]="column.key">
              <span *ngSwitchCase="'rank'" 
                    class="rank-number" 
                    [class]="'rank-' + (index + 1)">
                {{ index + 1 }}
              </span>
              
              <span *ngSwitchCase="'teamName'" class="team-name">{{ value }}</span>
              
              <span *ngSwitchCase="'totalPoints'" class="points-value">{{ value }}</span>
              
              <span *ngSwitchCase="'avgKills'">{{ value.toFixed(1) }}</span>
              
              <span *ngSwitchDefault>{{ value }}</span>
            </ng-container>
          </ng-template>
        </app-base-grid>
      </div>
    </section>
  `,
  styleUrl: './match-results.component.css'
})
export class MatchResultsComponent {
  @Input() gameResults!: MatchResults;
  
  selectedGame = 1;

  gameResultsConfig: GridConfig = {
    columns: [
      { key: 'placement', label: 'Place', width: '80px', class: 'placement-col' },
      { key: 'teamName', label: 'Team', width: '1fr', class: 'team-col' },
      { key: 'kills', label: 'Kills', width: '80px', class: 'kills-col', sortable: true },
      { key: 'points', label: 'Points', width: '100px', class: 'points-col', sortable: true }
    ],
    hoverable: true,
    showHeader: true
  };

  overallStandingsConfig: GridConfig = {
    columns: [
      { key: 'rank', label: 'Rank', width: '60px', class: 'rank-col' },
      { key: 'teamName', label: 'Team', width: '1fr', class: 'team-col' },
      { key: 'totalPoints', label: 'Total Points', width: '120px', class: 'total-points-col', sortable: true },
      { key: 'wins', label: 'Wins', width: '80px', class: 'wins-col', sortable: true },
      { key: 'avgKills', label: 'Avg Kills', width: '100px', class: 'avg-kills-col', sortable: true }
    ],
    hoverable: true,
    showHeader: true
  };

  getGameNumbers(): number[] {
    return Object.keys(this.gameResults).map(num => parseInt(num)).sort((a, b) => a - b);
  }

  getGameResults(gameNumber: number): GameResult[] {
    return this.gameResults[gameNumber] || [];
  }

  getOverallStandings(): OverallStanding[] {
    const teamStandings: { [teamName: string]: { totalPoints: number, wins: number, totalKills: number, games: number } } = {};
    
    Object.values(this.gameResults).forEach((gameResults: GameResult[]) => {
      gameResults.forEach((result: GameResult) => {
        if (!teamStandings[result.teamName]) {
          teamStandings[result.teamName] = { totalPoints: 0, wins: 0, totalKills: 0, games: 0 };
        }
        teamStandings[result.teamName].totalPoints += result.points;
        teamStandings[result.teamName].totalKills += result.kills;
        teamStandings[result.teamName].games += 1;
        if (result.isWinner) {
          teamStandings[result.teamName].wins += 1;
        }
      });
    });

    return Object.entries(teamStandings)
      .map(([teamName, stats]) => ({
        teamName,
        totalPoints: stats.totalPoints,
        wins: stats.wins,
        avgKills: stats.totalKills / stats.games
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }
}
