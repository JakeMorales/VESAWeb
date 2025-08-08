import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-player-stats-header',
  standalone: true,
  template: `
    <div class="header-section">
      <h1>Player Leaderboard</h1>
      <p>Complete rankings for all VESA players with ELO ratings</p>
    </div>
  `,
  styles: [`
    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h1 {
      color: var(--color-accent-primary);
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-section p {
      color: var(--color-text-secondary);
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .header-section h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class PlayerStatsHeaderComponent {}
