import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-join-scrims',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="wrap block">
      <div class="join-panel">
        <p class="eyebrow"><span class="tick">▸</span> OPEN LOBBIES NIGHTLY</p>
        <h2>Ready to drop<span class="dot">?</span></h2>
        <p class="lede">
          Join thousands of players in the most competitive Apex Legends
          scrimmage environment.
        </p>
        <div class="actions">
          <a
            href="https://discord.gg/xsAH38Jazz"
            target="_blank"
            rel="noopener noreferrer"
            class="btn primary"
          >Join Scrims Discord</a>
          <button type="button" (click)="navigateToLeaderboard()" class="btn ghost">
            View full leaderboard
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    .block {
      padding-top: 88px;
    }
    .join-panel {
      position: relative;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 56px 32px;
      text-align: center;
      overflow: hidden;
    }
    .join-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(420px 200px at 25% 100%, rgba(255, 44, 92, 0.1), transparent 70%),
        radial-gradient(420px 200px at 75% 100%, rgba(61, 155, 255, 0.09), transparent 70%);
      pointer-events: none;
    }
    .join-panel > * {
      position: relative;
    }
    h2 {
      font-family: var(--font-display);
      font-size: clamp(30px, 4.5vw, 44px);
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 14px 0 12px;
    }
    h2 .dot {
      color: var(--vesa-red);
    }
    .lede {
      color: var(--vesa-dim);
      font-size: 15px;
      max-width: 460px;
      margin: 0 auto 28px;
    }
    .actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }
    @media (max-width: 860px) {
      .block {
        padding-top: 64px;
      }
      .join-panel {
        padding: 40px 20px;
      }
    }
  `]
})
export class JoinScrimsComponent {
  constructor(private router: Router) {}

  navigateToLeaderboard(): void {
    this.router.navigate(['/players']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
