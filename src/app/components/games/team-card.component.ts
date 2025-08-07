import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerItemComponent, GamePlayer } from './player-item.component';

export interface Team {
  name: string;
  players: GamePlayer[];
  placement: number;
  totalKills: number;
  totalDamage: number;
}

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, PlayerItemComponent],
  template: `
    <div class="team-card" [class]="getPlacementClass()">
      <div class="team-header">
        <div class="placement-badge">{{ getPlacementText() }}</div>
        <h4 class="team-name">{{ team.name }}</h4>
        <div class="team-stats">
          <span>{{ team.totalKills }} kills</span>
          <span>{{ team.totalDamage | number }} damage</span>
        </div>
      </div>
      
      <div class="players-grid">
        <app-player-item 
          *ngFor="let player of team.players" 
          [player]="player">
        </app-player-item>
      </div>
    </div>
  `,
  styles: [`
    .team-card {
      border: 2px solid #eee;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
    }
    .team-card.first-place {
      border-color: #ffd700;
      background: linear-gradient(135deg, #fff9c4, #ffecb3);
    }
    .team-card.second-place {
      border-color: #c0c0c0;
      background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    }
    .team-card.third-place {
      border-color: #cd7f32;
      background: linear-gradient(135deg, #ffeaa7, #fab1a0);
    }
    .team-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .placement-badge {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .first-place .placement-badge {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #333;
    }
    .second-place .placement-badge {
      background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
      color: #333;
    }
    .third-place .placement-badge {
      background: linear-gradient(135deg, #cd7f32, #daa520);
    }
    .team-name {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }
    .team-stats {
      margin-left: auto;
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }
    @media (max-width: 768px) {
      .team-header { 
        flex-direction: column; 
        align-items: flex-start; 
        gap: 0.5rem; 
      }
      .team-stats { 
        margin-left: 0; 
      }
      .players-grid { 
        grid-template-columns: 1fr; 
      }
    }
  `]
})
export class TeamCardComponent {
  @Input() team!: Team;

  getPlacementClass(): string {
    switch (this.team.placement) {
      case 1: return 'first-place';
      case 2: return 'second-place';
      case 3: return 'third-place';
      default: return '';
    }
  }

  getPlacementText(): string {
    switch (this.team.placement) {
      case 1: return '🥇 1st Place';
      case 2: return '🥈 2nd Place';
      case 3: return '🥉 3rd Place';
      default: return `#${this.team.placement}`;
    }
  }
}
