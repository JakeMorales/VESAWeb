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

@Component({
  selector: 'app-division-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="division-card" 
         [routerLink]="['/league', division.id]"
         [style.--division-color]="division.color">
      <div class="division-header">
        <div class="division-rank">
          <span class="roman-numeral">{{ division.romanNumeral }}</span>
          <span class="tier-label">Division {{ division.romanNumeral }}</span>
        </div>
        <div class="header-right">
          <div class="teams-and-promo">
            <div class="division-teams">{{ division.teamCount }} Teams</div>
            <!-- Promotion/Relegation Icon for Divisions I & II -->
            <div class="promo-icon" *ngIf="division.tier <= 2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 20l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
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
        <!-- Promotion/Relegation Text for Divisions I & II -->
        <div class="promotion-indicator" *ngIf="division.tier <= 2">
          <span class="promo-text" *ngIf="division.tier === 1">Relegation Active</span>
          <span class="promo-text" *ngIf="division.tier === 2">Promotion Active</span>
        </div>
      </div>
      
      <div class="division-action">
        <span class="view-division">View Division →</span>
      </div>
    </div>
  `,
  styles: [`
    .division-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
      height: 320px;
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
    }

    .division-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--division-color);
    }

    .division-card:hover {
      transform: translateY(-8px);
      border-color: var(--division-color);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .division-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .teams-and-promo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .division-rank {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .roman-numeral {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--division-color);
      line-height: 1;
    }

    .tier-label {
      font-size: 0.7rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .division-teams {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.1);
      padding: 0.4rem 0.8rem;
      border-radius: 16px;
    }

    .promo-icon {
      color: #ffd700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .division-name {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 auto 0;
      color: var(--color-text-primary);
      flex: 1;
      display: flex;
      align-items: center;
    }

    .division-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      align-items: flex-end;
    }

    .promotion-indicator {
      background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      flex-shrink: 0;
    }

    .promo-text {
      font-size: 0.6rem;
      color: #ffd700;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 0;
      line-height: 1.2;
      white-space: nowrap;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .division-action {
      margin-top: 0;
    }

    .view-division {
      color: var(--division-color);
      font-weight: 600;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .division-card {
        height: auto;
        min-height: 280px;
        padding: 2rem;
        max-width: none;
      }
      
      .division-stats {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .promotion-indicator {
        padding: 0.25rem 0.5rem;
        text-align: center;
      }
      
      .promo-text {
        font-size: 0.55rem;
        letter-spacing: 0.2px;
      }
      
      .division-name {
        font-size: 1.6rem;
        margin-bottom: 1rem;
        flex: none;
        display: block;
      }
      
      .teams-and-promo {
        gap: 0.3rem;
      }
      
      .promo-icon svg {
        width: 14px;
        height: 14px;
      }
    }
  `]
})
export class DivisionCardComponent {
  @Input() division!: Division;
  @Input() totalWeeks!: number;
}
