import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="wrap">
        <div class="top">
          <div class="brand">
            <span class="brand-mark">VES<em>A</em></span>
            <span class="brand-sub">Virtual Esports Association</span>
          </div>
          <nav class="links" aria-label="Footer">
            <a routerLink="/league">League</a>
            <a routerLink="/scrims">Scrims</a>
            <a routerLink="/games">Games</a>
            <a href="https://discord.gg/RyvVJqnXbe" target="_blank" rel="noopener noreferrer">League Discord</a>
            <a href="https://discord.gg/xsAH38Jazz" target="_blank" rel="noopener noreferrer">Scrims Discord</a>
          </nav>
        </div>
        <p class="disclaimer">
          VESA is a community-run organization. Not affiliated with, sponsored by, or endorsed by
          Electronic Arts Inc. or Respawn Entertainment. Apex Legends is a trademark of
          Electronic Arts Inc.
        </p>
        <p class="credits">
          <span>Supreme — Architect & Maintainer</span>
          <a
            href="https://github.com/JakeMorales/VESAWeb/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
          >Contributors</a>
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--vesa-line);
      background: var(--vesa-panel);
      margin-top: 96px;
    }
    .wrap {
      max-width: 1140px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .brand-mark {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 22px;
      letter-spacing: 0.22em;
      color: var(--vesa-text);
    }
    .brand-mark em {
      font-style: normal;
      color: var(--vesa-red);
    }
    .brand-sub {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: var(--vesa-faint);
      text-transform: uppercase;
    }
    .links {
      display: flex;
      gap: 4px 20px;
      flex-wrap: wrap;
    }
    .links a {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-dim);
      text-decoration: none;
      transition: color 0.15s;
    }
    .links a:hover,
    .links a:focus-visible {
      color: var(--vesa-text);
    }
    .disclaimer {
      font-size: 12px;
      line-height: 1.7;
      color: var(--vesa-faint);
      border-top: 1px solid var(--vesa-line);
      padding-top: 20px;
      max-width: 720px;
      margin: 0;
    }
    .credits {
      margin: 14px 0 0;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--vesa-faint);
    }
    .credits a {
      color: var(--vesa-dim);
      text-decoration: none;
      transition: color 0.15s;
    }
    .credits a:hover,
    .credits a:focus-visible {
      color: var(--vesa-text);
    }
  `]
})
export class FooterComponent {}
