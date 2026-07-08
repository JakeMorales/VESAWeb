/**
 * Rating tier bands — the single source of truth for tier names, thresholds,
 * and colors. Used by both the scrims leaderboard and the rating-explanation
 * panel so they can never drift apart.
 *
 * Thresholds are sized to the real VESA Rating v2 distribution (seasonal mean
 * ~1515, std ~145; see elo-engine.ts): Elite is roughly the top 2% of rated
 * players. Revisit if the engine's expectationScale changes.
 */
export interface EloTier {
  name: string;
  /** Inclusive lower bound; the first tier a rating meets (top-down) wins. */
  min: number;
  color: string;
}

/** Ordered highest tier first. */
export const ELO_TIERS: EloTier[] = [
  { name: 'Elite', min: 1800, color: '#ffd77a' },
  { name: 'Expert', min: 1700, color: '#b48aff' },
  { name: 'Veteran', min: 1600, color: '#ff2c5c' },
  { name: 'Skilled', min: 1500, color: '#3d9bff' },
  { name: 'Novice', min: 1400, color: '#00d4ff' },
  { name: 'Rookie', min: -Infinity, color: '#9a9aad' },
];

export function tierFor(elo: number): EloTier {
  return ELO_TIERS.find(t => elo >= t.min) ?? ELO_TIERS[ELO_TIERS.length - 1];
}

/** Display range for a tier, e.g. "1800+", "1500–1599", "< 1400". */
export function tierRangeLabel(tier: EloTier): string {
  const index = ELO_TIERS.indexOf(tier);
  if (index === 0) return `${tier.min}+`;
  if (tier.min === -Infinity) return `< ${ELO_TIERS[index - 1].min}`;
  return `${tier.min}–${ELO_TIERS[index - 1].min - 1}`;
}
