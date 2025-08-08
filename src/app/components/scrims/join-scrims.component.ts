import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-join-scrims',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="join-scrims">
      <div class="join-content">
        <h2>Ready to Compete?</h2>
        <p>Join thousands of players in the most competitive Apex Legends scrimmage environment.</p>
        <div class="join-actions">
          <a href="https://discord.gg/xsAH38Jazz" target="_blank" rel="noopener noreferrer" class="join-button primary">
            🎮 Join Scrims Discord
          </a>
          <button type="button" (click)="navigateToLeaderboard()" class="join-button secondary">
            📊 View Full Leaderboard
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .join-scrims {
      padding: 4rem 2rem;
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.1) 0%, rgba(44, 156, 255, 0.1) 100%);
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .join-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .join-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .join-content p {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }

    .join-actions {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .join-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      min-width: 200px;
      justify-content: center;
      cursor: pointer;
      font-family: inherit;
    }

    .join-button.primary {
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      box-shadow: 0 8px 25px rgba(255, 44, 92, 0.3);
    }

    .join-button.primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(255, 44, 92, 0.4);
      filter: brightness(1.1);
    }

    .join-button.secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      border-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .join-button.secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-accent-tertiary);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
    }

    @media (max-width: 768px) {
      .join-scrims {
        padding: 2rem 1rem;
      }

      .join-content h2 {
        font-size: 2rem;
      }

      .join-content p {
        font-size: 1rem;
        margin-bottom: 2rem;
      }

      .join-actions {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .join-button {
        min-width: 250px;
        padding: 1rem 1.5rem;
      }
    }
  `]
})
export class JoinScrimsComponent {
  constructor(private router: Router) {}

  navigateToLeaderboard(): void {
    this.router.navigate(['/players']).then(() => {
      // Scroll to top of the page after navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
