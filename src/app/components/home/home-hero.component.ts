import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to</h1>
        <div class="hero-banner">
          <img src="VesaBannerWhiteRedBlueTransparent.png" alt="VESA Banner" class="vesa-banner-img" />
        </div>
        <p class="hero-description">
          The premier competitive Apex Legends league and scrim server. 
          Track your performance, climb the ranks, and dominate the arena.
        </p>
        <div class="hero-actions">
          <a routerLink="/league" class="cta-button primary">View League</a>
          <a routerLink="/players" class="cta-button secondary">Player Stats</a>
          <a routerLink="/games" class="cta-button secondary">Latest Games</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="stats-preview">
          <div class="stat-card">
            <h3>{{ totalPlayers }}</h3>
            <p>Total Players</p>
          </div>
          <div class="stat-card">
            <h3>{{ totalGames }}</h3>
            <p>Total Games</p>
          </div>
          <div class="stat-card">
            <h3>{{ totalMatches }}</h3>
            <p>Total Matches</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      padding: 4rem 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 80vh;
      align-items: center;
      width: 100%;
    }

    .hero-content h1 {
      font-size: 4rem;
      font-weight: 900;
      margin: 0 0 1rem 0;
      color: var(--color-text-primary);
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      @supports not (background-clip: text) {
        color: var(--color-text-primary);
      }
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      margin: 0 0 2rem 0;
      font-weight: 300;
    }

    .hero-description {
      font-size: 1.125rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      color: var(--color-text-secondary);
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cta-button {
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .cta-button.primary {
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      box-shadow: 0 4px 20px rgba(255, 44, 92, 0.3);
    }

    .cta-button:hover {
      transform: translateY(-2px);
    }

    .cta-button.primary:hover {
      box-shadow: 0 6px 25px rgba(255, 44, 92, 0.5);
    }

    .cta-button.secondary {
      border: 2px solid var(--color-accent-secondary);
      color: var(--color-accent-secondary);
      background: rgba(44, 156, 255, 0.1);
    }

    .cta-button.secondary:hover {
      background: var(--color-accent-secondary);
      color: white;
    }

    .stats-preview {
      display: grid;
      gap: 1.5rem;
      width: 100%;
      max-width: 300px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      padding: 2rem;
      text-align: center;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      border-color: var(--color-accent-primary);
      box-shadow: 0 10px 30px rgba(255, 44, 92, 0.2);
    }

    .stat-card h3 {
      font-size: 2.5rem;
      font-weight: 900;
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      @supports not (background-clip: text) {
        color: var(--color-text-primary);
      }
    }

    .stat-card p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .hero {
        grid-template-columns: 1fr;
        gap: 3rem;
        padding: 3rem 1rem;
        text-align: center;
      }
      .hero-content h1 {
        font-size: 3rem;
      }
    }
  `]
})
export class HomeHeroComponent {
  @Input() totalPlayers!: number;
  @Input() totalGames!: number;
  @Input() totalMatches!: number;
}
