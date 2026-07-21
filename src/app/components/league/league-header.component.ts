import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatStripComponent, StatItem } from '../ui';

@Component({
  selector: 'app-league-header',
  standalone: true,
  imports: [CommonModule, StatStripComponent],
  template: `
    <section class="league-header">
      <div class="wrap">
        <p class="eyebrow"><span class="tick">▸</span> VESA // APEX LEGENDS LEAGUE</p>
        <div class="title-row">
          <h1>VESA Apex League</h1>
          <span class="season-chip">Season {{ currentSeason }}</span>
        </div>
        <p class="subtitle">6-week regular season · Match Point finals · ALGS scoring</p>

        <app-stat-strip [stats]="stats" />

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercentage"></div>
          </div>
          <span class="progress-text">{{ progressLabel }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .league-header {
      border-bottom: 1px solid var(--vesa-line);
      padding: 56px 0 40px;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin: 14px 0 8px;
    }
    .eyebrow { text-align: center; }
    h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(34px, 5vw, 54px);
      line-height: 1;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0;
    }
    .season-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 4px;
      background: var(--vesa-red-dim);
      color: var(--vesa-red);
    }
    .subtitle {
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-dim);
      margin: 0 0 28px;
    }
    .league-header .eyebrow,
    .title-row {
      justify-content: center;
    }
    .eyebrow { display: block; }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 520px;
      margin: 20px auto 0;
    }
    .progress-bar {
      flex: 1;
      height: 4px;
      background: var(--vesa-line);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--vesa-red);
      transition: width 0.3s ease;
      min-width: 2px;
    }
    .progress-text {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .league-header { padding: 40px 0 32px; }
      .progress-section { padding: 0 16px; }
    }
  `]
})
export class LeagueHeaderComponent {
  @Input() currentSeason!: number;
  @Input() currentWeek!: number;
  @Input() totalWeeks!: number;
  @Input() startDate!: string;
  @Input() finalsDate!: string;
  @Input() progressPercentage!: number;
  @Input() progressLabel!: string;

  get stats(): StatItem[] {
    return [
      { label: 'Week', value: `${this.currentWeek}/${this.totalWeeks}` },
      { label: 'Started', value: this.startDate },
      { label: 'Finals', value: this.finalsDate }
    ];
  }
}
