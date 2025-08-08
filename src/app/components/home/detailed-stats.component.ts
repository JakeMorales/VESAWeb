import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatsData {
  matchesPlayed: number;
  gamesPlayed: number;
  uniquePlayers: number;
  totalPlaytime: string;
}

@Component({
  selector: 'app-detailed-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="detailed-stats">
      <div class="stats-content">
        <h2>VESA Statistics</h2>
        <div class="stats-grid">
          <div class="stats-category">
            <h3>League Stats</h3>
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-number">{{ leagueStats.matchesPlayed }}</span>
                <span class="stat-label">Matches Played</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ leagueStats.gamesPlayed }}</span>
                <span class="stat-label">Games Played</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ leagueStats.uniquePlayers }}</span>
                <span class="stat-label">Unique Players</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ leagueStats.totalPlaytime }}</span>
                <span class="stat-label">Total Playtime</span>
              </div>
            </div>
          </div>
          <div class="stats-category">
            <h3>Scrims Stats</h3>
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-number">{{ scrimsStats.matchesPlayed }}</span>
                <span class="stat-label">Matches Played</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ scrimsStats.gamesPlayed }}</span>
                <span class="stat-label">Games Played</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ scrimsStats.uniquePlayers }}</span>
                <span class="stat-label">Unique Players</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ scrimsStats.totalPlaytime }}</span>
                <span class="stat-label">Total Playtime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .detailed-stats {
      padding: 4rem 2rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .stats-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-content h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--color-text-primary);
      font-weight: 700;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .stats-category {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .stats-category:hover {
      transform: translateY(-5px);
      border-color: var(--color-accent-primary);
      box-shadow: 0 10px 40px rgba(255, 44, 92, 0.15);
    }

    .stats-category h3 {
      font-size: 1.75rem;
      margin-bottom: 2rem;
      text-align: center;
      color: var(--color-text-primary);
      font-weight: 600;
      position: relative;
    }

    .stats-category h3::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      border-radius: 2px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: scale(1.02);
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-accent-secondary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .detailed-stats {
        padding: 3rem 1rem;
      }
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .stats-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class DetailedStatsComponent {
  @Input() leagueStats!: StatsData;
  @Input() scrimsStats!: StatsData;
}
