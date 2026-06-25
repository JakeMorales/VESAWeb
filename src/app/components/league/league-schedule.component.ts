import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ScheduleEntry {
  label: string;
  date: Date;
  type: 'regular' | 'playoffs' | 'finals';
}

// TODO: Replace with actual Season 14 match dates
export const SEASON_14_SCHEDULE: ScheduleEntry[] = [
  { label: 'Week 1',   date: new Date('2026-07-19T20:00:00-05:00'), type: 'regular' },
  { label: 'Week 2',   date: new Date('2026-07-26T20:00:00-05:00'), type: 'regular' },
  { label: 'Week 3',   date: new Date('2026-08-02T20:00:00-05:00'), type: 'regular' },
  { label: 'Week 4',   date: new Date('2026-08-09T20:00:00-05:00'), type: 'regular' },
  { label: 'Week 5',   date: new Date('2026-08-16T20:00:00-05:00'), type: 'regular' },
  { label: 'Week 6',   date: new Date('2026-08-23T20:00:00-05:00'), type: 'regular' },
  { label: 'Playoffs', date: new Date('2026-08-30T20:00:00-05:00'), type: 'playoffs' },
  { label: 'Finals',   date: new Date('2026-09-06T20:00:00-05:00'), type: 'finals' },
];

@Component({
  selector: 'app-league-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="schedule-widget">
      <div class="schedule-header">
        <h2 class="schedule-title">Season 14 Schedule</h2>
        <span class="schedule-tz">All times Eastern (ET)</span>
      </div>
      <ul class="schedule-list">
        <li
          *ngFor="let entry of dates"
          class="schedule-row"
          [class.is-past]="isPast(entry.date)"
          [class.is-playoffs]="entry.type === 'playoffs'"
          [class.is-finals]="entry.type === 'finals'"
        >
          <div class="row-left">
            <span class="week-label">{{ entry.label }}</span>
            <span
              *ngIf="entry.type === 'playoffs' || entry.type === 'finals'"
              class="type-badge"
              [class.badge-playoffs]="entry.type === 'playoffs'"
              [class.badge-finals]="entry.type === 'finals'"
            >{{ entry.type }}</span>
          </div>
          <div class="row-right">
            <span class="date-str">{{ formatDate(entry.date) }}</span>
            <span class="time-str">{{ formatTime(entry.date) }} <span class="tz-tag">ET</span></span>
          </div>
          <div *ngIf="isPast(entry.date)" class="past-pill">Completed</div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .schedule-widget {
      max-width: 760px;
      margin: 2rem auto 0;
      padding: 0 1.5rem;
    }

    .schedule-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }

    .schedule-title {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: rgba(227,230,243,0.5);
      margin: 0;
    }

    .schedule-tz {
      font-size: 0.72rem;
      color: rgba(227,230,243,0.3);
    }

    .schedule-list {
      list-style: none;
      margin: 0;
      padding: 0;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(88,101,242,0.2);
      border-radius: 0.9rem;
      overflow: hidden;
    }

    .schedule-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      position: relative;
      transition: background 0.15s;
    }
    .schedule-row:last-child { border-bottom: none; }

    /* Hover highlight for upcoming entries */
    .schedule-row:not(.is-past):hover {
      background: rgba(94,108,255,0.07);
    }

    /* Gradient left-edge accent on hover */
    .schedule-row:not(.is-past)::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: transparent;
      border-radius: 3px 0 0 3px;
      transition: background 0.15s;
    }
    .schedule-row:not(.is-past):hover::before {
      background: linear-gradient(180deg, #5e6cff, #b45cff);
    }

    /* Past entries */
    .is-past {
      opacity: 0.35;
    }
    .is-past .week-label {
      text-decoration: line-through;
    }

    /* Playoffs / Finals subtle background */
    .is-playoffs,
    .is-finals {
      background: rgba(94,108,255,0.04);
    }

    /* Left column: label + optional badge */
    .row-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 7rem;
      flex-shrink: 0;
    }

    .week-label {
      font-size: 0.88rem;
      font-weight: 700;
      color: #e3e6f3;
      white-space: nowrap;
    }

    .type-badge {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.1rem 0.45rem;
      border-radius: 1rem;
      line-height: 1.5;
      white-space: nowrap;
    }

    .badge-playoffs {
      background: rgba(94,108,255,0.2);
      border: 1px solid rgba(94,108,255,0.4);
      color: #a0aaff;
    }

    .badge-finals {
      background: rgba(180,92,255,0.18);
      border: 1px solid rgba(180,92,255,0.4);
      color: #d49aff;
    }

    /* Right column: date + time */
    .row-right {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-width: 0;
    }

    .date-str {
      font-size: 0.87rem;
      color: rgba(227,230,243,0.72);
    }

    .time-str {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(227,230,243,0.58);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tz-tag {
      font-size: 0.72rem;
      font-weight: 400;
      color: rgba(227,230,243,0.35);
    }

    /* Completed pill shown for past entries */
    .past-pill {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(227,230,243,0.35);
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 0.1rem 0.5rem;
      white-space: nowrap;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .schedule-widget {
        padding: 0 1rem;
      }

      .schedule-row {
        flex-wrap: wrap;
        padding: 0.65rem 1rem;
        gap: 0.35rem 0.75rem;
      }

      .row-left {
        min-width: auto;
      }

      .row-right {
        flex-basis: 100%;
        gap: 0.5rem;
      }

      .date-str {
        font-size: 0.8rem;
      }

      .time-str {
        font-size: 0.8rem;
      }
    }
  `]
})
export class LeagueScheduleComponent {
  @Input() dates: ScheduleEntry[] = [];

  isPast(date: Date): boolean {
    return date < new Date();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    }).format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    }).format(date);
  }
}
