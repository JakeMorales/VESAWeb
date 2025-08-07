import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-league-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="league-header">
      <div class="header-content">
        <div class="league-info">
          <div class="league-title-section">
            <h1 class="league-title">VESA Apex League</h1>
            <span class="season-badge">Season {{ currentSeason }}</span>
          </div>
          <div class="league-subtitle">5-Week Regular Season • Match Point Finals • ALGS Scoring</div>
          
          <div class="schedule-section">
            <div class="schedule-item">
              <span class="schedule-label">Week</span>
              <span class="schedule-value">{{ currentWeek }} / {{ totalWeeks }}</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-label">Started</span>
              <span class="schedule-value">July 21, 2025</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-label">Finals</span>
              <span class="schedule-value">{{ finalsDate }}</span>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercentage"></div>
            </div>
            <span class="progress-text">{{ weeksRemaining }} weeks remaining</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .league-header {
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.75rem 0;
      backdrop-filter: blur(10px);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      text-align: center;
    }

    .league-info {
      width: 100%;
    }

    .league-title-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .league-title {
      font-size: 3rem;
      font-weight: 900;
      margin: 0;
      color: var(--color-text-primary);
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .season-badge {
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      padding: 0.5rem 1.25rem;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 700;
      text-shadow: none;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .league-subtitle {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .schedule-section {
      display: flex;
      gap: 3rem;
      margin-bottom: 1rem;
      justify-content: center;
    }

    .schedule-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
    }

    .schedule-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .schedule-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
      justify-content: center;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00d4ff, #2c9cff);
      transition: width 0.3s ease;
      min-width: 2px;
    }

    .progress-text {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    @media (max-width: 1024px) {
      .schedule-section {
        flex-wrap: wrap;
        gap: 2rem;
        justify-content: center;
      }
      
      .progress-section {
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
      }
      
      .league-title {
        font-size: 2.25rem;
        letter-spacing: 1px;
      }
      
      .season-badge {
        font-size: 0.875rem;
        padding: 0.375rem 1rem;
      }
      
      .schedule-section {
        gap: 1.5rem;
        justify-content: center;
      }
      
      .schedule-item {
        min-width: 90px;
      }
      
      .progress-section {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
      }
      
      .progress-bar {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class LeagueHeaderComponent {
  @Input() currentSeason!: number;
  @Input() currentWeek!: number;
  @Input() totalWeeks!: number;
  @Input() finalsDate!: string;
  @Input() progressPercentage!: number;
  @Input() weeksRemaining!: number;
}
