import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elo-system',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="elo-system">
      <div class="system-content">
        <h2>Custom ELO Rating System</h2>
        <div class="elo-grid">
          <div class="elo-explanation">
            <h3>How It Works</h3>
            <p>
              Our advanced ELO system tracks individual performance beyond just wins and losses. 
              Your rating is influenced by kills, damage, placement, team performance, and opponent strength.
            </p>
            <ul class="elo-factors">
              <li><strong>Placement:</strong> Higher placement = more ELO gain</li>
              <li><strong>Kills & Assists:</strong> Combat performance matters</li>
              <li><strong>Damage Dealt:</strong> Consistent damage output rewarded</li>
              <li><strong>Opponent Strength:</strong> Beating higher-rated players gives more ELO</li>
              <li><strong>Team Performance:</strong> Supporting your squad counts</li>
            </ul>
          </div>
          <div class="elo-tiers">
            <h3>ELO Tiers</h3>
            <div class="tier-list">
              <div class="tier-item elite">
                <span class="tier-name">Elite</span>
                <span class="tier-range">2700+</span>
              </div>
              <div class="tier-item expert">
                <span class="tier-name">Expert</span>
                <span class="tier-range">2400-2699</span>
              </div>
              <div class="tier-item veteran">
                <span class="tier-name">Veteran</span>
                <span class="tier-range">2100-2399</span>
              </div>
              <div class="tier-item skilled">
                <span class="tier-name">Skilled</span>
                <span class="tier-range">1800-2099</span>
              </div>
              <div class="tier-item novice">
                <span class="tier-name">Novice</span>
                <span class="tier-range">1500-1799</span>
              </div>
              <div class="tier-item rookie">
                <span class="tier-name">Rookie</span>
                <span class="tier-range">0-1499</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .elo-system {
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .system-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .system-content h2 {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: var(--color-accent-secondary);
    }

    .elo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: start;
    }

    .elo-explanation h3 {
      font-size: 1.5rem;
      color: var(--color-accent-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .elo-explanation p {
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .elo-factors {
      list-style: none;
      padding: 0;
    }

    .elo-factors li {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .elo-factors li:last-child {
      border-bottom: none;
    }

    .elo-factors strong {
      color: var(--color-accent-tertiary);
      font-weight: 600;
    }

    .elo-tiers h3 {
      font-size: 1.5rem;
      color: var(--color-accent-primary);
      margin-bottom: 1.5rem;
      font-weight: 600;
      text-align: center;
    }

    .tier-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tier-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tier-item:hover {
      transform: translateX(10px);
      box-shadow: 0 5px 15px rgba(255, 44, 92, 0.2);
    }

    .tier-name {
      font-weight: 600;
      font-size: 1rem;
    }

    .tier-range {
      font-size: 0.875rem;
      opacity: 0.8;
      font-weight: 500;
    }

    /* Tier Colors */
    .tier-item.elite {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 69, 0, 0.2));
      border-color: rgba(255, 215, 0, 0.3);
    }

    .tier-item.elite .tier-name {
      color: #FFD700;
    }

    .tier-item.expert {
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2));
      border-color: rgba(138, 43, 226, 0.3);
    }

    .tier-item.expert .tier-name {
      color: #8A2BE2;
    }

    .tier-item.veteran {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.2), rgba(220, 20, 60, 0.2));
      border-color: rgba(255, 44, 92, 0.3);
    }

    .tier-item.veteran .tier-name {
      color: var(--color-accent-primary);
    }

    .tier-item.skilled {
      background: linear-gradient(135deg, rgba(44, 156, 255, 0.2), rgba(30, 144, 255, 0.2));
      border-color: rgba(44, 156, 255, 0.3);
    }

    .tier-item.skilled .tier-name {
      color: var(--color-accent-secondary);
    }

    .tier-item.novice {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 191, 255, 0.2));
      border-color: rgba(0, 212, 255, 0.3);
    }

    .tier-item.novice .tier-name {
      color: var(--color-accent-tertiary);
    }

    .tier-item.rookie {
      background: linear-gradient(135deg, rgba(128, 128, 128, 0.2), rgba(169, 169, 169, 0.2));
      border-color: rgba(128, 128, 128, 0.3);
    }

    .tier-item.rookie .tier-name {
      color: #A9A9A9;
    }

    @media (max-width: 768px) {
      .elo-system {
        padding: 2rem 1rem;
      }

      .system-content h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
      }

      .elo-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .elo-explanation h3,
      .elo-tiers h3 {
        font-size: 1.25rem;
      }

      .tier-item {
        padding: 0.75rem 1rem;
      }

      .tier-item:hover {
        transform: translateX(5px);
      }
    }
  `]
})
export class EloSystemComponent {
}
