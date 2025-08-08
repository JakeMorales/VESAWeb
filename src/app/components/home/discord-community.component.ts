import { Component } from '@angular/core';

@Component({
  selector: 'app-discord-community',
  standalone: true,
  template: `
    <section class="discord-community">
      <div class="discord-content">
        <h2>Join Our Discord Community</h2>
        <p class="discord-description">
          Connect with fellow players, stay updated on match schedules, and join competitive gameplay!
        </p>
        <div class="discord-servers">
          <div class="discord-server">
            <div class="discord-icon">🏆</div>
            <div class="discord-info">
              <h3>VESA League</h3>
              <p>Official league matches, tournaments, and competitive announcements</p>
              <a href="https://discord.gg/RyvVJqnXbe" target="_blank" rel="noopener noreferrer" class="discord-button league">
                Join League Discord
              </a>
            </div>
          </div>
          <div class="discord-server">
            <div class="discord-icon">⚡</div>
            <div class="discord-info">
              <h3>VESA Scrims</h3>
              <p>Practice matches, pickup games, and community scrimmages</p>
              <a href="https://discord.gg/xsAH38Jazz" target="_blank" rel="noopener noreferrer" class="discord-button scrims">
                Join Scrims Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .discord-community {
      padding: 4rem 2rem;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .discord-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .discord-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
      font-weight: 700;
    }

    .discord-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .discord-servers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .discord-server {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      text-align: center;
    }

    .discord-server:hover {
      transform: translateY(-5px);
      border-color: var(--color-accent-primary);
      box-shadow: 0 10px 40px rgba(255, 44, 92, 0.15);
    }

    .discord-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .discord-info h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .discord-info p {
      color: var(--color-text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .discord-button {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .discord-button.league {
      background: linear-gradient(45deg, #5865F2, #7289DA);
      color: white;
      box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
    }

    .discord-button.league:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(88, 101, 242, 0.5);
    }

    .discord-button.scrims {
      background: linear-gradient(45deg, #00D4FF, #2C9CFF);
      color: white;
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    }

    .discord-button.scrims:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
    }

    @media (max-width: 768px) {
      .discord-community {
        padding: 3rem 1rem;
      }
      .discord-servers {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .discord-server {
        padding: 1.5rem;
      }
    }
  `]
})
export class DiscordCommunityComponent {}
