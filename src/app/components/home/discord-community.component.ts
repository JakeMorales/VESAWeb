import { Component } from '@angular/core';
import { IconComponent, SectionHeaderComponent } from '../ui';

@Component({
  selector: 'app-discord-community',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="03" title="Community" />
      <div class="servers">
        <div class="server">
          <app-icon name="chat" [size]="30" />
          <div class="info">
            <h3>VESA League</h3>
            <p>Official league matches, tournaments, and competitive announcements.</p>
            <a
              class="btn primary small"
              href="https://discord.gg/RyvVJqnXbe"
              target="_blank"
              rel="noopener noreferrer"
            >Join League Discord</a>
          </div>
        </div>
        <div class="server">
          <app-icon name="users" [size]="30" />
          <div class="info">
            <h3>VESA Scrims</h3>
            <p>Practice matches, pickup games, and community scrimmages.</p>
            <a
              class="btn ghost small"
              href="https://discord.gg/xsAH38Jazz"
              target="_blank"
              rel="noopener noreferrer"
            >Join Scrims Discord</a>
          </div>
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
    .servers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .server {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 28px;
      transition: border-color 0.15s;
    }
    .server:hover {
      border-color: var(--vesa-line-strong);
    }
    app-icon {
      color: var(--vesa-blue);
      flex-shrink: 0;
      margin-top: 2px;
    }
    h3 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 6px;
    }
    p {
      color: var(--vesa-dim);
      font-size: 14px;
      margin: 0 0 18px;
    }
    @media (max-width: 860px) {
      .servers {
        grid-template-columns: 1fr;
      }
      .block {
        padding-top: 64px;
      }
    }
  `]
})
export class DiscordCommunityComponent {}
