import { Component, Input } from '@angular/core';

export interface MatchDaySlot {
  date: Date;
  divisions?: string;
}

export interface ScheduleEntry {
  label: string;
  type: 'signup' | 'placement' | 'regular' | 'match-point' | 'award' | 'break';
  date?: Date;       // single-date entries: signup open/close, award show
  slots?: MatchDaySlot[]; // multi-date entries: placement week, regular weeks, MP
}

// Division day assignments — Monday: III/V/VIII, Wednesday: II/IV/VII, Thursday: I/VI
export const SEASON_14_SCHEDULE: ScheduleEntry[] = [
  {
    label: 'Signups Open',
    type: 'signup',
    date: new Date('2026-07-16T00:00:00-04:00'),
  },
  {
    label: 'Signup Deadline',
    type: 'signup',
    date: new Date('2026-07-30T00:00:00-04:00'),
  },
  {
    label: 'Placements',
    type: 'placement',
    slots: [
      { date: new Date('2026-08-03T20:00:00-04:00'), divisions: 'All Divisions' },
      { date: new Date('2026-08-05T20:00:00-04:00'), divisions: 'All Divisions' },
      { date: new Date('2026-08-10T20:00:00-04:00'), divisions: 'All Divisions' },
      { date: new Date('2026-08-12T20:00:00-04:00'), divisions: 'All Divisions' },
    ],
  },
  {
    label: 'Week 1',
    type: 'regular',
    slots: [
      { date: new Date('2026-08-17T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-08-19T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-08-21T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Week 2',
    type: 'regular',
    slots: [
      { date: new Date('2026-08-24T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-08-26T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-08-28T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Week 3',
    type: 'regular',
    slots: [
      { date: new Date('2026-08-31T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-09-02T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-09-04T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Labor Day Break',
    type: 'break',
    date: new Date('2026-09-07T00:00:00-04:00'),
  },
  {
    label: 'Week 4',
    type: 'regular',
    slots: [
      { date: new Date('2026-09-14T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-09-16T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-09-18T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Week 5',
    type: 'regular',
    slots: [
      { date: new Date('2026-09-21T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-09-23T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-09-25T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Week 6',
    type: 'regular',
    slots: [
      { date: new Date('2026-09-28T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-09-30T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-10-01T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Match Point',
    type: 'match-point',
    slots: [
      { date: new Date('2026-10-05T20:00:00-04:00'), divisions: 'Div III, V & VIII' },
      { date: new Date('2026-10-07T20:00:00-04:00'), divisions: 'Div II, IV & VII' },
      { date: new Date('2026-10-08T20:00:00-04:00'), divisions: 'Div I & VI' },
    ],
  },
  {
    label: 'Season 14 Award Show',
    type: 'award',
    date: new Date('2026-10-10T00:00:00-04:00'),
  },
];

@Component({
  selector: 'app-league-schedule',
  standalone: true,
  template: `
    <div class="schedule-widget">
      <div class="schedule-header">
        <h2 class="schedule-title">Season 14 Schedule</h2>
        <span class="schedule-tz">All match times 8:00 PM ET</span>
      </div>

      <div class="division-key">
        <span class="key-item"><span class="key-dot mon"></span>Monday — Div III, V &amp; VIII</span>
        <span class="key-item"><span class="key-dot wed"></span>Wednesday — Div II, IV &amp; VII</span>
        <span class="key-item"><span class="key-dot thu"></span>Thursday — Div I &amp; VI</span>
      </div>

      <div class="schedule-list">
        @for (entry of dates; track entry.label; let i = $index) {
          <div class="week-row"
            [class.is-fully-past]="isEntryFullyPast(entry)"
            [class.is-expanded]="expandedEntries.has(i)"
            [class.is-collapsible]="!!entry.slots"
            [class.type-signup]="entry.type === 'signup'"
            [class.type-placement]="entry.type === 'placement'"
            [class.type-match-point]="entry.type === 'match-point'"
            [class.type-award]="entry.type === 'award'"
            [class.type-break]="entry.type === 'break'"
          >
            <button
              class="week-header"
              [class.clickable]="!!entry.slots"
              [attr.aria-expanded]="entry.slots ? expandedEntries.has(i) : null"
              (click)="entry.slots ? toggleEntry(i) : null"
              [disabled]="!entry.slots"
            >
              <span class="week-label">{{ entry.label }}</span>
              <span class="header-right">
                @if (entry.date) {
                  <span class="single-date">{{ formatDate(entry.date) }}</span>
                }
                @if (entry.slots) {
                  <span class="date-range">{{ getDateRange(entry) }}</span>
                  <span class="chevron" [class.open]="expandedEntries.has(i)">›</span>
                }
              </span>
            </button>

            @if (entry.slots && expandedEntries.has(i)) {
              <div class="match-days">
                @for (slot of entry.slots; track slot.date.getTime()) {
                  <div class="match-day-slot" [class.slot-past]="isPast(slot.date)">
                    <span class="slot-date">{{ formatDate(slot.date) }}</span>
                    @if (slot.divisions) {
                      <span class="slot-divisions">{{ slot.divisions }}</span>
                    }
                    @if (!isPast(slot.date)) {
                      <span class="slot-time">8:00 PM ET</span>
                    } @else {
                      <span class="slot-completed">Completed</span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
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
      margin-bottom: 0.75rem;
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

    .division-key {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      margin-bottom: 0.75rem;
    }

    .key-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      color: rgba(227,230,243,0.45);
    }

    .key-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .key-dot.mon { background: #5e6cff; }
    .key-dot.wed { background: #b45cff; }
    .key-dot.thu { background: #7ecfff; }

    .schedule-list {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(88,101,242,0.2);
      border-radius: 0.9rem;
      overflow: hidden;
    }

    .week-row {
      border-bottom: 1px solid rgba(255,255,255,0.05);
      position: relative;
    }
    .week-row:last-child { border-bottom: none; }

    .week-row::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: transparent;
      border-radius: 3px 0 0 3px;
    }

    .type-signup { background: rgba(255,255,255,0.01); }
    .type-break {
      background: rgba(255,255,255,0.01);
      opacity: 0.45;
    }
    .type-break .week-label {
      font-size: 0.78rem;
      font-style: italic;
      color: rgba(227,230,243,0.45);
    }
    .type-placement::before { background: #5e6cff; }
    .type-match-point::before { background: linear-gradient(180deg, #ffd700, #ff8c00); }
    .type-award::before { background: linear-gradient(180deg, #b45cff, #5e6cff); }

    .is-fully-past { opacity: 0.35; }
    .is-fully-past .week-label { text-decoration: line-through; }

    .is-expanded { background: rgba(94,108,255,0.04); }

    /* Header button */
    .week-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 0.65rem 1.25rem;
      background: none;
      border: none;
      text-align: left;
      color: inherit;
      font-family: inherit;
    }

    .week-header.clickable {
      cursor: pointer;
    }
    .week-header.clickable:hover {
      background: rgba(94,108,255,0.06);
    }
    .week-header:disabled {
      cursor: default;
    }

    .week-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #e3e6f3;
    }

    .type-match-point .week-label { color: #ffd700; }
    .type-award .week-label { color: #d49aff; }
    .type-signup .week-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(227,230,243,0.55);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
    }

    .single-date,
    .date-range {
      font-size: 0.8rem;
      color: rgba(227,230,243,0.45);
      white-space: nowrap;
    }

    .chevron {
      font-size: 1rem;
      color: rgba(227,230,243,0.3);
      display: inline-block;
      transform: rotate(0deg);
      transition: transform 0.2s ease;
      line-height: 1;
    }
    .chevron.open {
      transform: rotate(90deg);
    }

    /* Expanded slot list */
    .match-days {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      padding: 0.1rem 1.25rem 0.65rem;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .match-day-slot {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.22rem 0;
    }

    .slot-past { opacity: 0.45; }
    .slot-past .slot-date { text-decoration: line-through; }

    .slot-date {
      font-size: 0.8rem;
      color: rgba(227,230,243,0.65);
      min-width: 11rem;
      flex-shrink: 0;
    }

    .slot-divisions {
      font-size: 0.75rem;
      color: rgba(227,230,243,0.4);
      flex: 1;
    }

    .slot-time {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(227,230,243,0.35);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .slot-completed {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(227,230,243,0.3);
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1rem;
      padding: 0.1rem 0.45rem;
      white-space: nowrap;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .schedule-widget { padding: 0 1rem; }
      .division-key { gap: 0.4rem 1rem; }
      .week-header { padding: 0.6rem 1rem; }
      .match-days { padding: 0.1rem 1rem 0.6rem; }

      .match-day-slot {
        flex-wrap: wrap;
        gap: 0.2rem 0.6rem;
      }

      .slot-date { min-width: 0; font-size: 0.78rem; }
      .slot-divisions { flex-basis: 100%; order: 3; }
      .slot-time, .slot-completed { order: 2; }
    }
  `]
})
export class LeagueScheduleComponent {
  @Input() dates: ScheduleEntry[] = [];

  expandedEntries = new Set<number>();

  toggleEntry(index: number): void {
    if (this.expandedEntries.has(index)) {
      this.expandedEntries.delete(index);
    } else {
      this.expandedEntries.add(index);
    }
  }

  getDateRange(entry: ScheduleEntry): string {
    if (!entry.slots?.length) return '';
    const fmt = (d: Date) => new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', timeZone: 'America/New_York',
    }).format(d);
    const first = entry.slots[0].date;
    const last = entry.slots[entry.slots.length - 1].date;
    return first.toDateString() === last.toDateString() ? fmt(first) : `${fmt(first)} – ${fmt(last)}`;
  }

  isPast(date: Date): boolean {
    return date < new Date();
  }

  isEntryFullyPast(entry: ScheduleEntry): boolean {
    if (entry.date) return entry.date < new Date();
    if (entry.slots) return entry.slots.every(s => s.date < new Date());
    return false;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    }).format(date);
  }
}
