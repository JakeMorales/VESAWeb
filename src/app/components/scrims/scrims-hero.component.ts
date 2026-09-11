import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatStripComponent, StatItem } from '../ui';

export interface ScrimStats {
  totalPlayers: number;
  activeThisWeek: number;
  totalGames: number;
  averageElo: number;
  highestElo: number;
  totalMatches: number;
}

@Component({
  selector: 'app-scrims-hero',
  standalone: true,
  imports: [CommonModule, StatStripComponent],
  template: `
    <section class="hero">
      <div class="wrap hero-content">
        <p class="eyebrow"><span class="tick">▸</span> VESA // SCRIMS · NIGHTLY PRACTICE LOBBIES</p>
        <h1>Practice like it counts<span class="dot">.</span></h1>
        <p class="lede">
          ALGS-settings lobbies every night with full stat capture and a skill
          rating that learns from every game you play. Drop in, grind, climb.
        </p>
      </div>
      <div class="wrap telemetry">
        <app-stat-strip [stats]="heroStats" />
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    .hero {
      border-bottom: 1px solid var(--vesa-line);
      padding-bottom: 40px;
    }
    .hero-content {
      padding-top: 72px;
      text-align: center;
    }
    h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(40px, 6vw, 68px);
      line-height: 1;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin: 18px 0 20px;
      color: var(--vesa-text);
      text-wrap: balance;
    }
    h1 .dot {
      color: var(--vesa-red);
    }
    .lede {
      max-width: 560px;
      margin: 0 auto 40px;
      color: var(--vesa-dim);
      font-size: 16px;
    }
    @media (max-width: 768px) {
      .hero-content {
        padding-top: 48px;
      }
    }
  `]
})
export class ScrimsHeroComponent {
  @Input() stats!: ScrimStats;

  get heroStats(): StatItem[] {
    return [
      { label: 'Players tracked', value: this.stats.totalPlayers.toLocaleString() },
      { label: 'Active this week', value: this.stats.activeThisWeek.toLocaleString() },
      { label: 'Games logged', value: this.stats.totalGames.toLocaleString() },
      { label: 'Sessions run', value: this.stats.totalMatches.toLocaleString() }
    ];
  }
}
