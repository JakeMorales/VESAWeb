import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="games-tabs">
      <button 
        *ngFor="let gameNum of gameNumbers" 
        (click)="onGameSelect(gameNum)"
        [class.active]="selectedGame === gameNum"
        class="game-tab">
        Game {{ gameNum }} - {{ getMapName(gameNum) }}
      </button>
      <button 
        (click)="onGameSelect(0)"
        [class.active]="selectedGame === 0"
        class="game-tab overall-tab">
        Overall Standings
      </button>
    </div>
  `,
  styleUrls: ['./game-tabs.component.css']
})
export class GameTabsComponent {
  @Input() gameNumbers: number[] = [];
  @Input() selectedGame: number = 0;
  @Input() mapNames: { [key: number]: string } = {};
  @Output() gameSelected = new EventEmitter<number>();

  onGameSelect(gameNumber: number): void {
    this.gameSelected.emit(gameNumber);
  }

  getMapName(gameNumber: number): string {
    return this.mapNames[gameNumber] || 'Unknown';
  }
}
