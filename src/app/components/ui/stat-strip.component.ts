import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  label: string;
  value: string | number;
  /** Small red suffix rendered after the value, e.g. "T-14 DAYS". */
  suffix?: string;
}

/**
 * Telemetry strip: a bordered grid of mono stat readouts.
 * Set `flush` when embedding inside an existing panel so the
 * outer border and radius are dropped.
 *
 *   <app-stat-strip [stats]="[{ label: 'Players', value: 1284 }]" />
 */
@Component({
  selector: 'app-stat-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strip" [class.flush]="flush">
      @for (stat of stats; track stat.label) {
        <div class="cell">
          <span class="label">{{ stat.label }}</span>
          <span class="value" [class.long]="isLong(stat.value)">
            {{ stat.value }}
            @if (stat.suffix) {
              <small>{{ stat.suffix }}</small>
            }
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .strip.flush {
      border: none;
      border-radius: 0;
      background: transparent;
    }
    .cell {
      padding: 22px 24px;
      /* hairline separators that work regardless of wrap position */
      box-shadow: -1px -1px 0 0 var(--vesa-line);
    }
    .label {
      display: block;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      margin-bottom: 6px;
    }
    .value {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-size: 30px;
      line-height: 1.1;
      color: var(--vesa-text);
    }
    .value.long {
      font-size: 19px;
    }
    .value small {
      font-size: 13px;
      color: var(--vesa-red);
      margin-left: 6px;
    }
    @media (max-width: 480px) {
      .cell {
        padding: 16px 18px;
      }
      .value {
        font-size: 24px;
      }
    }
  `]
})
export class StatStripComponent {
  @Input({ required: true }) stats: StatItem[] = [];
  @Input() flush = false;

  isLong(value: string | number): boolean {
    return String(value).length > 9;
  }
}
