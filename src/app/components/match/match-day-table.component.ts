import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface PlayerStats {
  playerName: string;
  kills: number;
  damage: number;
  downs: number;
  headshots?: number;
  assists?: number;
  shots?: number;
  hits?: number;
  revives: number;
  respawns: number;
}

export interface TeamGameResult {
  gameNumber: number;
  teamName: string;
  placement: number;
  teamKills: number;
  placementPoints: number;
  totalPoints: number;
  mapName: string;
  players: PlayerStats[];
  isExpanded?: boolean;
}

export interface OverallPlayerStats {
  playerName: string;
  totalKills: number;
  totalDamage: number;
  totalDowns: number;
  totalHeadshots?: number;
  totalAssists?: number;
  totalShots?: number;
  totalHits?: number;
  totalRevives: number;
  totalRespawns: number;
  gamesPlayed: number;
  avgKills: number;
  avgDamage: number;
}

export interface OverallTeamStanding {
  teamName: string;
  totalPoints: number;
  gamesWon: number;
  totalKills: number;
  avgPlacement: number;
  players: OverallPlayerStats[];
  isExpanded?: boolean;
}

export interface MatchDayResults {
  [gameNumber: number]: TeamGameResult[];
}

// Placement points based on standard BR scoring
const PLACEMENT_POINTS: { [key: number]: number } = {
  1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
  11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
};

@Component({
  selector: 'app-match-day-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="match-day-section" *ngIf="matchResults && getGameNumbers().length > 0">
      <div class="match-day-content">
        <h2>Match Day Results</h2>
        
        <div class="games-tabs">
          <button 
            *ngFor="let gameNum of getGameNumbers()" 
            (click)="selectedGame = gameNum"
            [class.active]="selectedGame === gameNum"
            class="game-tab">
            Game {{ gameNum }} - {{ getMapName(gameNum) }}
          </button>
          <button 
            (click)="selectedGame = 0"
            [class.active]="selectedGame === 0"
            class="game-tab overall-tab">
            Overall Standings
          </button>
        </div>
        
        <!-- Game Results Table -->
        <div *ngIf="selectedGame > 0" class="game-results-container">
          <div class="results-table">
            <div class="table-header">
              <div class="header-cell placement-col">#</div>
              <div class="header-cell team-col">Team</div>
              <div class="header-cell kills-col">Kills</div>
              <div class="header-cell placement-points-col">Placement Pts</div>
              <div class="header-cell total-points-col">Total Points</div>
              <div class="header-cell expand-col"></div>
            </div>
            
            <ng-container *ngFor="let result of getGameResults(selectedGame); let i = index; trackBy: trackByTeam">
              <!-- Team Row -->
              <div class="table-row team-row" 
                   (click)="toggleTeamExpanded(result)"
                   [class.expanded]="result.isExpanded"
                   [class]="'place-' + result.placement">
                <div class="cell placement-col">
                  <span class="placement-number">{{ result.placement }}</span>
                </div>
                <div class="cell team-col">
                  <span class="team-name">{{ result.teamName }}</span>
                </div>
                <div class="cell kills-col">
                  <span class="kills-value">{{ result.teamKills }}</span>
                </div>
                <div class="cell placement-points-col">
                  <span class="placement-points">{{ result.placementPoints }}</span>
                </div>
                <div class="cell total-points-col">
                  <span class="total-points">{{ result.totalPoints }}</span>
                </div>
                <div class="cell expand-col">
                  <div class="expand-arrow" 
                       [class.expanded]="result.isExpanded">
                    <span class="arrow-icon">▼</span>
                  </div>
                </div>
              </div>
              
              <!-- Player Details Rows -->
              <div class="player-details" *ngIf="result.isExpanded" [@slideDown]>
                <div class="player-header">
                  <div class="player-header-cell player-name-col">Player</div>
                  <div class="player-header-cell player-kills-col">Kills</div>
                  <div class="player-header-cell player-damage-col">Damage</div>
                  <div class="player-header-cell player-downs-col">Downs</div>
                  <div class="player-header-cell player-headshots-col">Headshots</div>
                  <div class="player-header-cell player-assists-col">Assists</div>
                  <div class="player-header-cell player-shots-col">Shots</div>
                  <div class="player-header-cell player-hits-col">Hits</div>
                  <div class="player-header-cell player-respawns-col">Respawns</div>
                  <div class="player-header-cell player-revives-col">Revives</div>
                </div>
                
                <div class="player-row" *ngFor="let player of result.players; trackBy: trackByPlayer">
                  <div class="player-cell player-name-col">{{ player.playerName }}</div>
                  <div class="player-cell player-kills-col">{{ player.kills }}</div>
                  <div class="player-cell player-damage-col">{{ player.damage | number:'1.0-0' }}</div>
                  <div class="player-cell player-downs-col">{{ player.downs }}</div>
                  <div class="player-cell player-headshots-col">{{ player.headshots || 0 }}</div>
                  <div class="player-cell player-assists-col">{{ player.assists || 0 }}</div>
                  <div class="player-cell player-shots-col">{{ player.shots || 0 }}</div>
                  <div class="player-cell player-hits-col">{{ player.hits || 0 }}</div>
                  <div class="player-cell player-respawns-col">{{ player.respawns }}</div>
                  <div class="player-cell player-revives-col">{{ player.revives }}</div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
        
        <!-- Overall Standings -->
        <div *ngIf="selectedGame === 0" class="game-results-container">
          <div class="results-table">
            <div class="table-header">
              <div class="header-cell placement-col">Rank</div>
              <div class="header-cell team-col">Team</div>
              <div class="header-cell kills-col">Total Points</div>
              <div class="header-cell placement-points-col">Avg Place</div>
              <div class="header-cell total-points-col">Total Kills</div>
              <div class="header-cell expand-col"></div>
            </div>
            
            <ng-container *ngFor="let standing of getOverallStandings(); let i = index">
              <!-- Team Row -->
              <div class="table-row team-row" 
                   (click)="toggleStandingExpanded(standing)"
                   [class.expanded]="standing.isExpanded"
                   [class]="'place-' + (i + 1)">
                <div class="cell placement-col">
                  <span class="placement-number">{{ i + 1 }}</span>
                </div>
                <div class="cell team-col">
                  <span class="team-name">{{ standing.teamName }}</span>
                  <div class="game-indicators">
                    <div class="game-indicator" 
                         *ngFor="let gameResult of getTeamGameResults(standing.teamName)"
                         [title]="'Game ' + gameResult.gameNumber + ': ' + gameResult.placement + getPlaceSuffix(gameResult.placement) + ' place, ' + gameResult.totalPoints + ' pts, ' + gameResult.teamKills + ' kills'">
                      <span class="trophy-icon" 
                            [ngClass]="{
                              'gold': gameResult.placement === 1,
                              'silver': gameResult.placement === 2,
                              'bronze': gameResult.placement === 3,
                              'default': gameResult.placement > 3
                            }">●</span>
                    </div>
                  </div>
                </div>
                <div class="cell kills-col">
                  <span class="kills-value">{{ standing.totalPoints }}</span>
                </div>
                <div class="cell placement-points-col">
                  <span class="placement-points">{{ standing.avgPlacement.toFixed(1) }}</span>
                </div>
                <div class="cell total-points-col">
                  <span class="total-points">{{ standing.totalKills }}</span>
                </div>
                <div class="cell expand-col">
                  <div class="expand-arrow" 
                       [class.expanded]="standing.isExpanded">
                    <span class="arrow-icon">▼</span>
                  </div>
                </div>
              </div>
              
              <!-- Player Details Rows -->
              <div class="player-details" *ngIf="standing.isExpanded" [@slideDown]>
                <div class="player-header">
                  <div class="player-header-cell player-name-col">Player</div>
                  <div class="player-header-cell player-kills-col">Kills</div>
                  <div class="player-header-cell player-damage-col">Damage</div>
                  <div class="player-header-cell player-downs-col">Downs</div>
                  <div class="player-header-cell player-headshots-col">Headshots</div>
                  <div class="player-header-cell player-assists-col">Assists</div>
                  <div class="player-header-cell player-shots-col">Shots</div>
                  <div class="player-header-cell player-hits-col">Hits</div>
                  <div class="player-header-cell player-respawns-col">Respawns</div>
                  <div class="player-header-cell player-revives-col">Revives</div>
                </div>
                
                <div class="player-row" *ngFor="let player of standing.players; trackBy: trackByOverallPlayer">
                  <div class="player-cell player-name-col">{{ player.playerName }}</div>
                  <div class="player-cell player-kills-col">{{ player.totalKills }}</div>
                  <div class="player-cell player-damage-col">{{ player.totalDamage | number:'1.0-0' }}</div>
                  <div class="player-cell player-downs-col">{{ player.totalDowns }}</div>
                  <div class="player-cell player-headshots-col">{{ player.totalHeadshots || 0 }}</div>
                  <div class="player-cell player-assists-col">{{ player.totalAssists || 0 }}</div>
                  <div class="player-cell player-shots-col">{{ player.totalShots || 0 }}</div>
                  <div class="player-cell player-hits-col">{{ player.totalHits || 0 }}</div>
                  <div class="player-cell player-respawns-col">{{ player.totalRespawns }}</div>
                  <div class="player-cell player-revives-col">{{ player.totalRevives }}</div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
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
  
  selectedGame = 1;
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

  // Helper function to calculate placement points
  static getPlacementPoints(placement: number): number {
    return PLACEMENT_POINTS[placement] || 0;
  }
}
