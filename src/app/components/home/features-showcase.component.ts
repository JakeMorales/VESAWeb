import { Component } from '@angular/core';

@Component({
  selector: 'app-features-showcase',
  standalone: true,
  template: `
    <section class="features">
      <div class="features-content">
        <h2>League Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>ALGS League</h3>
            <p>Up to 8 competitive divisions with Match Point finals</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Live Standings</h3>
            <p>Season standings and Match Point totals updated after every match day</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Match History</h3>
            <p>Review every game with per-player stats and placement breakdowns</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Scrims Leaderboard</h3>
            <p>Ranked player leaderboard tracking kills, damage, and points across all scrim sessions</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      padding: 6rem 2rem;
      background: rgba(0, 0, 0, 0.3);
    }

    .features-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-content h2 {
      text-align: center;
      font-size: 3rem;
      margin-bottom: 3rem;
      font-weight: 700;
      color: var(--color-text-primary);
      background: linear-gradient(45deg, var(--color-text-primary), var(--color-accent-tertiary));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      @supports not (background-clip: text) {
        color: var(--color-text-primary);
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      padding: 2rem;
      text-align: center;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      border-color: var(--color-accent-secondary);
      box-shadow: 0 15px 40px rgba(44, 156, 255, 0.2);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .feature-card p {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .features {
        padding: 4rem 1rem;
      }
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturesShowcaseComponent {}
