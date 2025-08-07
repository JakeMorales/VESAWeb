import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GamePlayer {
  username: string;
  kills: number;
  damage: number;
  placement: number;
}

@Component({
  selector: 'app-player-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-item">
      <div class="player-avatar">{{ player.username.charAt(0).toUpperCase() }}</div>
      <div class="player-details">
        <span class="player-name">{{ player.username }}</span>
        <div class="player-stats">
          <span class="kills">{{ player.kills }} K</span>
          <span class="damage">{{ player.damage }} D</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .player-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
    }
    .player-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .player-name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    .player-stats {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    .kills { 
      color: #dc3545; 
      font-weight: 600; 
    }
    .damage { 
      color: #fd7e14; 
      font-weight: 600; 
    }
  `]
})
export class PlayerItemComponent {
  @Input() player!: GamePlayer;
}
