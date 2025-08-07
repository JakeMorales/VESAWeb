import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GameStats {
  totalMatches: number;
  averageKills: number;
  averageDuration: string;
  popularMap: string;
}

@Component({
  selector: 'app-game-stats-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-overview">
      <div class="stat-card">
        <h3>{{ stats.totalMatches }}</h3>
        <p>Total Matches</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.averageKills }}</h3>
        <p>Avg Kills/Game</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.averageDuration }}</h3>
        <p>Avg Duration</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.popularMap }}</h3>
        <p>Popular Map</p>
      </div>
    </div>
  `,
  styles: [`
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
      padding: 0 1rem;
    }
    .stat-card {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.1), rgba(44, 156, 255, 0.1));
      color: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 8px 25px rgba(255, 44, 92, 0.2);
      border: 1px solid rgba(255, 44, 92, 0.3);
      backdrop-filter: blur(20px);
      transition: all 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 35px rgba(255, 44, 92, 0.4);
    }
    .stat-card h3 {
      font-size: 2.5rem;
      margin: 0;
      font-weight: 900;
      background: linear-gradient(135deg, #ff2c5c 0%, #2c9cff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-card p {
      margin: 0.5rem 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      .stats-overview { 
        grid-template-columns: repeat(2, 1fr); 
      }
    }
  `]
})
export class GameStatsOverviewComponent {
  @Input() stats: GameStats = {
    totalMatches: 0,
    averageKills: 0,
    averageDuration: '0:00',
    popularMap: 'N/A'
  };
}
