import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamCardComponent, Team } from './team-card.component';

export interface GameMatch {
  id: number;
  date: string;
  time: string;
  map: string;
  mode: string;
  duration: string;
  teams: Team[];
  winner: string;
  totalKills: number;
  totalDamage: number;
}

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, TeamCardComponent],
  template: `
    <div class="game-card">
      <div class="game-header">
        <div class="game-info">
          <h3>Match #{{ game.id }}</h3>
          <div class="game-meta">
            <span class="date">{{ game.date }} at {{ game.time }}</span>
            <span class="map">{{ game.map }}</span>
            <span class="mode" [class]="getModeClass()">{{ game.mode }}</span>
            <span class="duration">{{ game.duration }}</span>
          </div>
        </div>
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-value">{{ game.totalKills }}</span>
            <span class="stat-label">Total Kills</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ game.totalDamage | number }}</span>
            <span class="stat-label">Total Damage</span>
          </div>
        </div>
      </div>

      <div class="teams-container">
        <app-team-card 
          *ngFor="let team of game.teams" 
          [team]="team">
        </app-team-card>
      </div>
    </div>
  `,
  styles: [`
    .game-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    .game-card:hover {
      transform: translateY(-2px);
    }
    .game-header {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    .game-info h3 {
      margin: 0 0 0.5rem;
      color: #333;
      font-size: 1.3rem;
    }
    .game-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .game-meta span {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .date { background: #e3f2fd; color: #1976d2; }
    .map { background: #f3e5f5; color: #7b1fa2; }
    .mode.ranked { background: #ffebee; color: #c62828; }
    .mode.scrimmage { background: #e8f5e8; color: #2e7d32; }
    .mode.tournament { background: #fff3e0; color: #ef6c00; }
    .duration { background: #f5f5f5; color: #666; }
    .game-stats {
      display: flex;
      gap: 2rem;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      font-size: 0.8rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .teams-container {
      padding: 1.5rem;
      display: grid;
      gap: 1rem;
    }
    @media (max-width: 768px) {
      .game-header { 
        flex-direction: column; 
        align-items: flex-start; 
        gap: 1rem; 
      }
      .game-stats { 
        gap: 1rem; 
      }
    }
  `]
})
export class GameCardComponent {
  @Input() game!: GameMatch;

  getModeClass(): string {
    return this.game.mode.toLowerCase();
  }
}
