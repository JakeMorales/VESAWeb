import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrimsLeaderboardComponent, ScrimPlayer } from '../scrims-leaderboard/scrims-leaderboard.component';

@Component({
  selector: 'app-scrims-leaderboard-section',
  standalone: true,
  imports: [CommonModule, ScrimsLeaderboardComponent],
  template: `
    <section class="leaderboard-section">
      <div class="leaderboard-content">
        <h2>Scrims Leaderboard</h2>
        <p class="leaderboard-subtitle">Top 10 performers in the current season</p>
        <app-scrims-leaderboard [players]="players"></app-scrims-leaderboard>
      </div>
    </section>
  `,
  styles: [`
    .leaderboard-section {
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .leaderboard-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .leaderboard-content h2 {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--color-accent-secondary);
    }

    .leaderboard-subtitle {
      text-align: center;
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .leaderboard-section {
        padding: 2rem 1rem;
      }

      .leaderboard-content h2 {
        font-size: 2rem;
      }

      .leaderboard-subtitle {
        font-size: 1rem;
        margin-bottom: 2rem;
      }
    }
  `]
})
export class ScrimsLeaderboardSectionComponent {
  @Input() players!: ScrimPlayer[];
}
