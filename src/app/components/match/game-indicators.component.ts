import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-indicators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-indicators">
      <div 
        *ngFor="let gameNum of gameNumbers" 
        class="game-indicator"
        [title]="getTooltipText(gameNum)">
        <span class="trophy-icon" 
              [ngClass]="getTrophyClass(gameNum)">
          🏆
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./game-indicators.component.css']
})
export class GameIndicatorsComponent {
  @Input() gameNumbers: number[] = [];
  @Input() teamPlacements: { [gameNumber: number]: number } = {};

  getTrophyClass(gameNumber: number): string {
    const placement = this.teamPlacements[gameNumber];
    if (!placement) return 'default';
    
    switch (placement) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return 'default';
    }
  }

  getTooltipText(gameNumber: number): string {
    const placement = this.teamPlacements[gameNumber];
    if (!placement) return `Game ${gameNumber}: No placement`;
    
    const suffix = this.getPlacementSuffix(placement);
    return `Game ${gameNumber}: ${placement}${suffix} place`;
  }

  private getPlacementSuffix(placement: number): string {
    if (placement >= 11 && placement <= 13) return 'th';
    
    const lastDigit = placement % 10;
    switch (lastDigit) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
