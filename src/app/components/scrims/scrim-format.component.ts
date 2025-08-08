import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scrim-format',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="scrim-format">
      <div class="format-content">
        <h2>Scrim Format & Rules</h2>
        <div class="format-grid">
          <div class="format-card">
            <div class="format-icon">🎯</div>
            <h3>Match Structure</h3>
            <ul>
              <li>20 teams per lobby (60 players)</li>
              <li>Best of 6 games per session</li>
              <li>ALGS tournament settings</li>
              <li>Skill-based matchmaking</li>
            </ul>
          </div>
          <div class="format-card">
            <div class="format-icon">⏰</div>
            <h3>Schedule</h3>
            <ul>
              <li>Daily sessions at 8PM EST</li>
              <li>Weekend tournaments</li>
              <li>Special events monthly</li>
              <li>Open registration system</li>
            </ul>
          </div>
          <div class="format-card">
            <div class="format-icon">📊</div>
            <h3>Tracking</h3>
            <ul>
              <li>Real-time ELO updates</li>
              <li>Detailed match analytics</li>
              <li>Performance trends</li>
              <li>Leaderboard rankings</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .scrim-format {
      padding: 4rem 2rem;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .format-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .format-content h2 {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: var(--color-accent-secondary);
    }

    .format-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .format-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .format-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(255, 44, 92, 0.2);
      border-color: rgba(255, 44, 92, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }

    .format-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .format-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--color-accent-primary);
    }

    .format-card ul {
      list-style: none;
      padding: 0;
      text-align: left;
    }

    .format-card li {
      padding: 0.5rem 0;
      color: var(--color-text-secondary);
      position: relative;
      padding-left: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .format-card li::before {
      content: '▶';
      position: absolute;
      left: 0;
      color: var(--color-accent-tertiary);
      font-size: 0.75rem;
    }

    .format-card li:hover {
      color: var(--color-text-primary);
      transform: translateX(5px);
      transition: all 0.2s ease;
    }

    @media (max-width: 768px) {
      .scrim-format {
        padding: 2rem 1rem;
      }

      .format-content h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
      }

      .format-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .format-card {
        padding: 1.5rem;
      }

      .format-icon {
        font-size: 2.5rem;
      }

      .format-card h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class ScrimFormatComponent {
}
