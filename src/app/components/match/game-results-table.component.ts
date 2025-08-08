import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerDetailsComponent } from './player-details.component';

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

@Component({
  selector: 'app-game-results-table',
  standalone: true,
  imports: [CommonModule, PlayerDetailsComponent],
  template: `
    <div class="game-results-container">
      <div class="results-table">
        <div class="table-header">
          <div class="header-cell placement-col">#</div>
          <div class="header-cell team-col">Team</div>
          <div class="header-cell kills-col">Kills</div>
          <div class="header-cell placement-points-col">Placement Pts</div>
          <div class="header-cell total-points-col">Total Points</div>
          <div class="header-cell expand-col"></div>
        </div>
        
        <ng-container *ngFor="let result of results">
          <div class="table-row team-row" 
               [ngClass]="getPlacementClass(result.placement)"
               (click)="toggleExpand(result)">
            <div class="cell placement-number">{{ result.placement }}</div>
            <div class="cell team-col">
              <span class="team-name">{{ result.teamName }}</span>
            </div>
            <div class="cell kills-value">{{ result.teamKills }}</div>
            <div class="cell placement-points">{{ result.placementPoints }}</div>
            <div class="cell total-points">{{ result.totalPoints }}</div>
            <div class="cell expand-arrow" [ngClass]="{ 'expanded': result.isExpanded }">
              <span class="arrow-icon">▼</span>
            </div>
          </div>
          
          <app-player-details 
            *ngIf="result.isExpanded"
            [players]="result.players"
            [isOverallStats]="false">
          </app-player-details>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./game-results-table.component.css']
})
export class GameResultsTableComponent {
  @Input() results: TeamGameResult[] = [];
  @Output() teamToggled = new EventEmitter<TeamGameResult>();

  toggleExpand(result: TeamGameResult): void {
    result.isExpanded = !result.isExpanded;
    this.teamToggled.emit(result);
  }

  getPlacementClass(placement: number): string {
    return `place-${placement}`;
  }
}
