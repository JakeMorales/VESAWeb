import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Division {
  id: string;
  name: string;
  romanNumeral: string;
  tier: number;
  description: string;
  teamCount: number;
  currentWeek: number;
  color: string;
}

/**
 * Division card — keeps its signature elements (per-division color bar,
 * large roman numeral, name + stats + "view" affordance) restyled to the
 * Mission Control system.
 */
@Component({
  selector: 'app-division-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a class="division-card"
       [routerLink]="['/league', division.id]"
       [style.--division-color]="division.color">
      <div class="card-top">
        <div class="division-rank">
          <span class="roman-numeral">{{ division.romanNumeral }}</span>
          <span class="tier-label">Division {{ division.romanNumeral }}</span>
        </div>
        <span class="teams-chip">{{ division.teamCount }} teams</span>
      </div>

      <h3 class="division-name">{{ division.name }}</h3>

      <div class="division-stats">
        <div class="stat">
          <span class="stat-label">Week</span>
          <span class="stat-value">{{ division.currentWeek }}/{{ totalWeeks }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Teams</span>
          <span class="stat-value">{{ division.teamCount }}</span>
        </div>
      </div>

      <span class="view-division">View division <span class="arrow">→</span></span>
    </a>
  `,
  styles: [`
    .division-card {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 24px;
      min-height: 240px;
      text-decoration: none;
      color: inherit;
      overflow: hidden;
      transition: border-color 0.15s, background 0.15s;
    }
    /* signature per-division color bar */
    .division-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--division-color);
    }
    .division-card:hover,
    .division-card:focus-visible {
      border-color: var(--division-color);
      background: var(--vesa-raised);
    }
    .division-card:hover .arrow,
    .division-card:focus-visible .arrow {
      transform: translateX(4px);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .division-rank {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .roman-numeral {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 700;
      color: var(--division-color);
      line-height: 1;
    }
    .tier-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--vesa-faint);
    }

    .teams-chip {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vesa-dim);
      border: 1px solid var(--vesa-line-strong);
      border-radius: 3px;
      padding: 4px 8px;
      white-space: nowrap;
    }

    .division-name {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .division-stats {
      display: flex;
      gap: 28px;
      margin-bottom: 16px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .stat-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--vesa-faint);
    }
    .stat-value {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-size: 18px;
      color: var(--vesa-text);
    }

    .view-division {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--division-color);
    }
    .arrow {
      display: inline-block;
      transition: transform 0.15s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .arrow { transition: none; }
    }
  `]
})
export class DivisionCardComponent {
  @Input() division!: Division;
  @Input() totalWeeks!: number;
}
