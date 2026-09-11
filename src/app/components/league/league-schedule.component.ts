import { Component, Input } from '@angular/core';
import { CURRENT_SEASON, ScheduleEntry } from '../../config/season';


@Component({
  selector: 'app-league-schedule',
  standalone: true,
  template: `
    <div class="schedule-widget">
      <div class="schedule-header">
        <h2 class="schedule-title">Season {{ season }} Schedule</h2>
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
      margin: 2.5rem auto 0;
      padding: 0 1.5rem;
    }

    .schedule-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .schedule-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--vesa-faint);
      margin: 0;
    }

    .schedule-tz {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      color: rgba(235, 235, 245, 0.25);
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
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-faint);
    }

    .key-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .key-dot.mon { background: var(--vesa-blue); }
    .key-dot.wed { background: var(--vesa-red); }
    .key-dot.thu { background: var(--vesa-cyan); }

    .schedule-list {
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }

    .week-row {
      border-bottom: 1px solid var(--vesa-line);
      position: relative;
    }
    .week-row:last-child { border-bottom: none; }

    .week-row::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 2px;
      background: transparent;
    }

    .type-signup { background: transparent; }
    .type-break {
      opacity: 0.45;
    }
    .type-break .week-label {
      font-size: 0.78rem;
      font-style: italic;
      color: var(--vesa-dim);
    }
    .type-placement::before { background: var(--vesa-blue); }
    .type-match-point::before { background: #f5a623; }
    .type-award::before { background: var(--vesa-red); }

    .is-fully-past { opacity: 0.35; }
    .is-fully-past .week-label { text-decoration: line-through; }

    .is-expanded { background: var(--vesa-raised); }

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
      background: rgba(61, 155, 255, 0.05);
    }
    .week-header:disabled {
      cursor: default;
    }

    .week-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--vesa-text);
    }

    .type-match-point .week-label { color: #f5a623; }
    .type-award .week-label { color: var(--vesa-red); }
    .type-signup .week-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--vesa-dim);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
    }

    .single-date,
    .date-range {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--vesa-faint);
      white-space: nowrap;
    }

    .chevron {
      font-size: 1rem;
      color: var(--vesa-faint);
      display: inline-block;
      transform: rotate(0deg);
      transition: transform 0.2s ease;
      line-height: 1;
    }
    .chevron.open {
      transform: rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .chevron { transition: none; }
    }

    /* Expanded slot list */
    .match-days {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      padding: 0.1rem 1.25rem 0.65rem;
      border-top: 1px solid var(--vesa-line);
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
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--vesa-dim);
      min-width: 11rem;
      flex-shrink: 0;
    }

    .slot-divisions {
      font-size: 0.75rem;
      color: var(--vesa-faint);
      flex: 1;
    }

    .slot-time {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--vesa-faint);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .slot-completed {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      background: rgba(235, 235, 245, 0.06);
      border: 1px solid var(--vesa-line);
      border-radius: 3px;
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

      .slot-date { min-width: 0; font-size: 0.72rem; }
      .slot-divisions { flex-basis: 100%; order: 3; }
      .slot-time, .slot-completed { order: 2; }
    }
  `]
})
export class LeagueScheduleComponent {
  @Input() dates: ScheduleEntry[] = [];

  protected readonly season = CURRENT_SEASON;

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
