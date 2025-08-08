import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ScrimStats {
  totalPlayers: number;
  activeThisWeek: number;
  totalGames: number;
  averageElo: number;
  highestElo: number;
  totalMatches: number;
}

@Component({
  selector: 'app-scrims-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="scrims-hero">
      <div class="hero-content">
        <h1 class="hero-title">VESA Scrims</h1>
        <h2 class="hero-subtitle">Competitive Practice Arena</h2>
        <p class="hero-description">
          Join our advanced scrimmage system featuring custom ELO tracking, skill-based matchmaking, 
          and comprehensive performance analytics. Practice with the best and climb the ranks!
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalPlayers }}</span>
            <span class="stat-label">Total Players</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.activeThisWeek }}</span>
            <span class="stat-label">Active This Week</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalGames }}</span>
            <span class="stat-label">Total Games</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .scrims-hero {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.1) 0%, rgba(44, 156, 255, 0.1) 100%);
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .scrims-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1000px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(255, 44, 92, 0.3);
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: var(--color-accent-tertiary);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .hero-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
      line-height: 1.6;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(255, 44, 92, 0.2);
      border-color: rgba(255, 44, 92, 0.3);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .scrims-hero {
        padding: 2rem 1rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.25rem;
      }

      .hero-description {
        font-size: 1rem;
        margin-bottom: 2rem;
      }

      .hero-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stat-item {
        padding: 1rem;
      }

      .stat-number {
        font-size: 2rem;
      }
    }
  `]
})
export class ScrimsHeroComponent {
  @Input() stats!: ScrimStats;
}
