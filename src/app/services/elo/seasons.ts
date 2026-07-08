/**
 * Time-boxed rating seasons following Apex Legends season windows. Ratings
 * are seeded at each boundary from the previous season via decayedSeed()
 * (carryover shrinks toward the initial rating per season of absence).
 * Scrim files are assigned to seasons by the date in their filename.
 *
 * Dates for seasons 26–28 follow the quarterly cadence; boundary sessions a
 * day or two off would shift at most one scrim night between seasons.
 * VESA scrim data collection began 2024-06-28, mid Season 21.
 */
export interface EloSeason {
  key: string;
  label: string;
  /** Inclusive ISO start date (YYYY-MM-DD). */
  start: string;
  /** Inclusive ISO end date, or null while the season is ongoing. */
  end: string | null;
}

export const ELO_SEASONS: EloSeason[] = [
  { key: 'season-21', label: 'Apex Legends Season 21', start: '2024-05-07', end: '2024-08-05' },
  { key: 'season-22', label: 'Apex Legends Season 22', start: '2024-08-06', end: '2024-11-04' },
  { key: 'season-23', label: 'Apex Legends Season 23', start: '2024-11-05', end: '2025-02-10' },
  { key: 'season-24', label: 'Apex Legends Season 24', start: '2025-02-11', end: '2025-05-05' },
  { key: 'season-25', label: 'Apex Legends Season 25', start: '2025-05-06', end: '2025-08-04' },
  { key: 'season-26', label: 'Apex Legends Season 26', start: '2025-08-05', end: '2025-11-03' },
  { key: 'season-27', label: 'Apex Legends Season 27', start: '2025-11-04', end: '2026-02-02' },
  { key: 'season-28', label: 'Apex Legends Season 28', start: '2026-02-03', end: '2026-05-04' },
  { key: 'season-29', label: 'Apex Legends Season 29', start: '2026-05-05', end: null },
];

export function seasonForDate(date: string, seasons: EloSeason[] = ELO_SEASONS): EloSeason | undefined {
  return seasons.find(s => date >= s.start && (s.end === null || date <= s.end));
}
