import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerDetailsComponent } from './player-details.component';
import { GameIndicatorsComponent } from './game-indicators.component';

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

@Component({
  selector: 'app-overall-standings-table',
  standalone: true,
  imports: [CommonModule, PlayerDetailsComponent, GameIndicatorsComponent],
  template: `
    <div class="overall-standings-container">
      <div class="standings-table">
        <div class="table-header">
          <div class="header-cell rank-col">#</div>
          <div class="header-cell team-col">Team</div>
          <div class="header-cell total-points-col">Total Points</div>
          <div class="header-cell games-won-col">Games Won</div>
          <div class="header-cell avg-placement-col">Avg Placement</div>
          <div class="header-cell expand-col"></div>
        </div>
        
        <ng-container *ngFor="let standing of standings; let i = index">
          <div class="table-row team-row" 
               [ngClass]="getRankClass(i + 1)"
               (click)="toggleExpand(standing)">
            <div class="cell rank-number">{{ i + 1 }}</div>
            <div class="cell team-col">
              <span class="team-name">{{ standing.teamName }}</span>
              <app-game-indicators 
                [gameNumbers]="gameNumbers"
                [teamPlacements]="getTeamPlacements(standing.teamName)">
              </app-game-indicators>
            </div>
            <div class="cell total-points total-points-highlight">{{ standing.totalPoints }}</div>
            <div class="cell games-won">{{ standing.gamesWon }}</div>
            <div class="cell avg-placement" [ngClass]="getPlacementColorClass(standing.avgPlacement)">
              {{ standing.avgPlacement | number:'1.1-1' }}
            </div>
            <div class="cell expand-arrow" [ngClass]="{ 'expanded': standing.isExpanded }">
              <span class="arrow-icon">▼</span>
            </div>
          </div>
          
          <app-player-details 
            *ngIf="standing.isExpanded"
            [players]="standing.players"
            [isOverallStats]="true">
          </app-player-details>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./overall-standings-table.component.css']
})
export class OverallStandingsTableComponent {
  @Input() standings: OverallTeamStanding[] = [];
  @Input() gameNumbers: number[] = [];
  @Input() teamPlacements: { [teamName: string]: { [gameNumber: number]: number } } = {};
  @Output() teamToggled = new EventEmitter<OverallTeamStanding>();

  toggleExpand(standing: OverallTeamStanding): void {
    standing.isExpanded = !standing.isExpanded;
    this.teamToggled.emit(standing);
  }

  getRankClass(rank: number): string {
    return `rank-${rank}`;
  }

  getPlacementColorClass(avgPlacement: number): string {
    if (avgPlacement <= 2.5) return 'placement-excellent';
    if (avgPlacement <= 3.5) return 'placement-good';
    return 'placement-poor';
  }

  getTeamPlacements(teamName: string): { [gameNumber: number]: number } {
    return this.teamPlacements[teamName] || {};
  }
}
