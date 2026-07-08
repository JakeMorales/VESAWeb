/**
 * Single source of truth for the current league season.
 *
 * Bump these on season rollover — the nav ticker, home hero countdown,
 * signup page badge, and schedule widget all read from here.
 */

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

export const CURRENT_SEASON = 15;

export const SIGNUPS_OPEN = new Date('2026-07-16T00:00:00-04:00');
export const SIGNUPS_CLOSE = new Date('2026-07-30T00:00:00-04:00');

// Division day assignments — Monday: III/V/VIII, Wednesday: II/IV/VII, Thursday: I/VI
export const SEASON_SCHEDULE: ScheduleEntry[] = [
  {
    label: 'Signups Open',
    type: 'signup',
    date: SIGNUPS_OPEN,
  },
  {
    label: 'Signup Deadline',
    type: 'signup',
    date: SIGNUPS_CLOSE,
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
    label: `Season ${CURRENT_SEASON} Award Show`,
    type: 'award',
    date: new Date('2026-10-10T00:00:00-04:00'),
  },
];

/** e.g. "07.16.2026" — ET, for the nav ticker. */
export function formatTickerDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('month')}.${get('day')}.${get('year')}`;
}
