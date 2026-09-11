/**
 * Seasonal ELO engine for VESA scrims.
 *
 * Framework-free: used by scripts/generate-seasonal-elo.ts today and safe to
 * import from Angular later. All state is passed in and returned; nothing here
 * touches the network or filesystem.
 *
 * Design (v2 of the original VESAWeb rating system):
 *
 * Kept from the original algorithm:
 *  - The per-game performance score: tiered placement (50%), capped combat
 *    (25%), capped damage (20%), diminishing support (5%), squashed through a
 *    sigmoid. Capping each factor means one 15-kill pop-off game counts barely
 *    more than a strong 4-kill game, which suits high-variance BR.
 *  - Pool balancing: the rating pool is conserved so the population mean stays
 *    at INITIAL_ELO. The original applied one global correction at the end;
 *    here every game is exactly zero-sum, which achieves the same thing
 *    continuously and per-lobby.
 *
 * Changed from the original:
 *  - Outcome is the player's percentile of performance score *within the
 *    lobby* (0..1) — i.e. the fraction of the field they beat — not the raw
 *    score. This makes every game's outcomes sum to a constant regardless of
 *    stat inflation, map, or lobby size. This is the large-field form used by
 *    racing/FFA rating systems (iRacing, TrueSkill-style rank updates).
 *  - Expectation is pairwise: the player's average Elo win probability
 *    against each individual opponent in the lobby (not vs the lobby's
 *    average rating — facing five demons and fifty rookies is not the same
 *    as facing 55 mids). A highly rated player is *expected* to land a high
 *    percentile and gains nothing for merely doing so. This is what prevents
 *    ratings from being a grind-correlated ladder: once your typical
 *    percentile matches what your rating predicts, your expected change per
 *    game is zero no matter how many games you play. Pairwise expectations
 *    also sum to exactly half the lobby by construction, so the rating pool
 *    is conserved mathematically, not just by correction.
 *  - K decays with games played (fast placement for new players, stability
 *    for established ones) instead of the original volatility/experience mix.
 *  - Ratings are seasonal: every player starts a season at INITIAL_ELO.
 */

// ── Configuration ─────────────────────────────────────────────────────────────

export interface EloConfig {
  /** Season starting rating and the anchor the pool is conserved around. */
  initialElo: number;
  /**
   * Logistic divisor: the rating gap at which one player is expected to beat
   * another 76% of the time. Purely a display-scale choice — doubling it
   * (with K doubled to match) doubles every rating gap without changing
   * rankings, convergence speed, or calibration. 800 puts a two-month
   * season's rated spread at roughly 1100–1900.
   */
  expectationScale: number;
  /** K for a player's first game of the season. */
  kProvisional: number;
  /** K floor for established players. */
  kStable: number;
  /** e-folding games count for the K decay from provisional to stable. */
  kDecayGames: number;
  /** Games with fewer players than this are skipped as degenerate lobbies. */
  minPlayersPerGame: number;
  /** Players with fewer season games than this are flagged provisional. */
  provisionalGames: number;
  /**
   * Fraction of a player's deviation from initialElo carried into the next
   * season, per season of absence: seed = initial + carryover^gap * (elo -
   * initial). One season later a 1900 player seeds at 1740; after a year
   * (4 seasons) at ~1552; a 2024 veteran returning in 2026 seeds near 1500 —
   * old scrim form says little, so they mostly re-place.
   */
  ratingCarryover: number;
  /**
   * Fraction of effective games (the K-decay clock) surviving each season of
   * absence. Lower effective games = higher K = faster re-placement, so a
   * long-absent veteran re-converges almost as fast as a new player while a
   * one-season returner keeps most of their stability.
   */
  gamesCarryover: number;
}

export const DEFAULT_ELO_CONFIG: EloConfig = {
  initialElo: 1500,
  expectationScale: 800,
  kProvisional: 128,
  kStable: 48,
  kDecayGames: 15,
  minPlayersPerGame: 24,
  provisionalGames: 10,
  ratingCarryover: 0.6,
  gamesCarryover: 0.5,
};

// ── Input / output shapes ─────────────────────────────────────────────────────

/** One player's line from one game. */
export interface GamePlayerInput {
  playerId: string;
  name: string;
  placement: number;
  kills: number;
  assists: number;
  damage: number;
  revives: number;
}

export interface GameInput {
  players: GamePlayerInput[];
}

/** One scrim session (one HuggingFace file), games in played order. */
export interface SessionInput {
  sessionId: string;
  /** ISO date (YYYY-MM-DD); sessions are processed in date order. */
  date: string;
  games: GameInput[];
}

export interface PlayerRatingState {
  playerId: string;
  name: string;
  elo: number;
  /** Games played this season (drives the provisional flag). */
  gamesPlayed: number;
  /**
   * The K-decay clock: season games plus the decayed remainder of previous
   * seasons' games. A returning veteran starts above zero (some stability
   * retained) but well below where they left off (their rating is stale).
   */
  effectiveGames: number;
  peakElo: number;
  lastPlayed: string;
  /** Rating this player started the season at (initialElo or a carryover seed). */
  seedElo: number;
  /** Season display stats. */
  totalKills: number;
  totalDamage: number;
  /** Games this season where the player's team placed 1st. */
  wins: number;
  /** Elo change over the player's most recent session (for display). */
  lastSessionDelta: number;
}

export interface PlayerSeasonResult extends PlayerRatingState {
  provisional: boolean;
}

/** Prior carried into a new season for a player with history. */
export interface SeasonSeed {
  elo: number;
  effectiveGames: number;
}

/**
 * Decay a player's end-of-season rating into a seed for a later season.
 * @param seasonsGap Seasons between the last one they played and the one
 *   being seeded (1 = consecutive seasons).
 */
export function decayedSeed(
  prevElo: number,
  prevEffectiveGames: number,
  seasonsGap: number,
  cfg: EloConfig
): SeasonSeed {
  const gap = Math.max(1, seasonsGap);
  return {
    elo: cfg.initialElo + (prevElo - cfg.initialElo) * Math.pow(cfg.ratingCarryover, gap),
    effectiveGames: prevEffectiveGames * Math.pow(cfg.gamesCarryover, gap),
  };
}

export interface SeasonResult {
  players: PlayerSeasonResult[];
  gamesProcessed: number;
  gamesSkipped: number;
  sessionsProcessed: number;
}

// ── Performance score (kept from the original algorithm) ─────────────────────

export const PERFORMANCE_WEIGHTS = {
  placement: 50,
  combat: 25,
  damage: 20,
  support: 5,
} as const;

/** Placement score tiers for the 20-team format (unchanged from original). */
export function calculateTieredPlacementScore(placement: number): number {
  if (placement === 1) return 1.0;
  if (placement <= 3) return 0.85;
  if (placement <= 5) return 0.7;
  if (placement <= 10) return 0.5;
  if (placement <= 15) return 0.3;
  return Math.max(0.1, 0.3 - (placement - 15) * 0.04);
}

/**
 * Per-game performance score in (0, 1) — the original construction: capped
 * factors weighted 50/25/20/5, then a sigmoid centred at 0.5.
 *
 * The caps were recalibrated on Season 29 data (2026-07): the originals
 * (1.5 kill-equivalents / 650 damage, tuned on 2024 stats) saturated on 32% /
 * 43% of player-games, wasting differentiation among good players. At 2.5 /
 * 1000 saturation drops to 20% / 25% and the within-lobby ranking variance is
 * 42% placement / 33% combat / 23% damage / 2% support — matching ALGS
 * scoring's own placement share (44%) on the same games. Only the ordering of
 * scores matters to the rating (outcomes are within-lobby percentiles), so
 * the sigmoid is cosmetic for rating purposes.
 */
export function calculatePerformanceScore(
  placement: number,
  kills: number,
  assists: number,
  damage: number,
  revives: number,
  teamSize = 3
): number {
  const placementFactor = calculateTieredPlacementScore(placement);

  const combatScore = kills + assists * 0.3;
  const combatCap = 2.5; // kill-equivalents; ~80th percentile of S29 player-games
  const combatFactor = Math.min(1, combatScore / combatCap);

  const damageCap = 1000; // ~75th percentile of S29 player-games (mean 698)
  const damageFactor = Math.min(1, damage / damageCap);

  const supportFactor = Math.min(1, Math.sqrt(revives / (teamSize - 1)));

  const rawScore =
    (placementFactor * PERFORMANCE_WEIGHTS.placement) / 100 +
    (combatFactor * PERFORMANCE_WEIGHTS.combat) / 100 +
    (damageFactor * PERFORMANCE_WEIGHTS.damage) / 100 +
    (supportFactor * PERFORMANCE_WEIGHTS.support) / 100;

  return 1 / (1 + Math.exp(-5 * (rawScore - 0.5)));
}

// ── Rating update ─────────────────────────────────────────────────────────────

/**
 * Percentile outcomes (0..1) for an array of performance scores, ties sharing
 * their average rank. Outcomes always average exactly 0.5 across the lobby.
 */
export function percentileOutcomes(scores: number[]): number[] {
  const n = scores.length;
  const order = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => a.score - b.score);
  const outcomes = new Array<number>(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && order[j + 1].score === order[i].score) j++;
    // ranks i..j (0-based) tie; average their percentiles
    const percentile = (i + j) / 2 / (n - 1 || 1);
    for (let k = i; k <= j; k++) outcomes[order[k].index] = percentile;
    i = j + 1;
  }
  // Rescale from [0,1] endpoints to (0,1) open interval so extremes aren't
  // treated as certainties: p' = (p*(n-1) + 0.5)/n
  return outcomes.map(p => (p * (n - 1) + 0.5) / n);
}

/** Classic Elo logistic win probability against a single opponent rating. */
export function expectedOutcome(playerElo: number, opponentElo: number, scale: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / scale));
}

/**
 * Pairwise expected percentile: the average win probability against each
 * individual opponent in the lobby. Since E(a,b) + E(b,a) = 1, these sum to
 * exactly N/2 across the lobby — matching the percentile outcomes, which
 * also average exactly 0.5.
 */
export function expectedOutcomePairwise(playerElo: number, lobbyElos: number[], scale: number, selfIndex: number): number {
  let sum = 0;
  for (let j = 0; j < lobbyElos.length; j++) {
    if (j === selfIndex) continue;
    sum += expectedOutcome(playerElo, lobbyElos[j], scale);
  }
  return lobbyElos.length > 1 ? sum / (lobbyElos.length - 1) : 0.5;
}

/**
 * K decays exponentially from kProvisional toward kStable with effective
 * games (season games + the decayed remainder of past seasons' games, so
 * returning players re-place quickly).
 */
export function kFactor(effectiveGames: number, cfg: EloConfig): number {
  return cfg.kStable + (cfg.kProvisional - cfg.kStable) * Math.exp(-effectiveGames / cfg.kDecayGames);
}

/** Per-player observation emitted for each processed game (for diagnostics). */
export interface GameObservation {
  playerId: string;
  eloBefore: number;
  gamesBefore: number;
  expected: number;
  outcome: number;
  delta: number;
}

/**
 * Process one game, mutating the rating state map. Players not present in the
 * map are created at initialElo. Returns false if the lobby was skipped.
 */
export function processGame(
  game: GameInput,
  state: Map<string, PlayerRatingState>,
  date: string,
  cfg: EloConfig,
  seeds?: Map<string, SeasonSeed>,
  observer?: (obs: GameObservation) => void
): boolean {
  // Dedupe player lines by id (rare data glitches repeat a player in a game)
  const seen = new Set<string>();
  const players = game.players.filter(p => {
    if (seen.has(p.playerId)) return false;
    seen.add(p.playerId);
    return true;
  });

  if (players.length < cfg.minPlayersPerGame) return false;

  for (const p of players) {
    if (!state.has(p.playerId)) {
      const seed = seeds?.get(p.playerId);
      const startElo = seed?.elo ?? cfg.initialElo;
      state.set(p.playerId, {
        playerId: p.playerId,
        name: p.name,
        elo: startElo,
        gamesPlayed: 0,
        effectiveGames: seed?.effectiveGames ?? 0,
        peakElo: startElo,
        lastPlayed: date,
        seedElo: startElo,
        totalKills: 0,
        totalDamage: 0,
        wins: 0,
        lastSessionDelta: 0,
      });
    }
  }

  const ratings = players.map(p => state.get(p.playerId)!);
  const lobbyElos = ratings.map(r => r.elo);

  const perfScores = players.map(p =>
    calculatePerformanceScore(p.placement, p.kills, p.assists, p.damage, p.revives)
  );
  const outcomes = percentileOutcomes(perfScores);

  const expectations = ratings.map((r, i) =>
    expectedOutcomePairwise(r.elo, lobbyElos, cfg.expectationScale, i)
  );
  const deltas = players.map((_, i) =>
    kFactor(ratings[i].effectiveGames, cfg) * (outcomes[i] - expectations[i])
  );

  // Pool balancing: make the game exactly zero-sum so the population mean
  // stays anchored at initialElo (the original's rebalancing, applied per game).
  const meanDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

  players.forEach((p, i) => {
    const r = ratings[i];
    const delta = deltas[i] - meanDelta;
    observer?.({
      playerId: p.playerId,
      eloBefore: r.elo,
      gamesBefore: r.gamesPlayed,
      expected: expectations[i],
      outcome: outcomes[i],
      delta,
    });
    r.elo += delta;
    r.gamesPlayed++;
    r.effectiveGames++;
    r.name = p.name; // keep the latest display name
    r.lastPlayed = date;
    r.totalKills += p.kills;
    r.totalDamage += p.damage;
    if (p.placement === 1) r.wins++;
    if (r.elo > r.peakElo) r.peakElo = r.elo;
  });

  return true;
}

/**
 * Run a full season: sessions in date order, games in file order.
 * @param seeds Optional carryover priors from previous seasons (see
 *   decayedSeed); players without a seed start at initialElo.
 */
export function runSeason(
  sessions: SessionInput[],
  cfg: EloConfig = DEFAULT_ELO_CONFIG,
  seeds?: Map<string, SeasonSeed>,
  observer?: (obs: GameObservation) => void
): SeasonResult {
  const state = new Map<string, PlayerRatingState>();
  let gamesProcessed = 0;
  let gamesSkipped = 0;

  const ordered = [...sessions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.sessionId.localeCompare(b.sessionId)
  );

  for (const session of ordered) {
    // Snapshot elos so we can report each player's change over their most
    // recent session (players created mid-session diff against their seed).
    const preSession = new Map<string, number>();
    for (const [id, r] of state) preSession.set(id, r.elo);

    const participants = new Set<string>();
    for (const game of session.games) {
      if (processGame(game, state, session.date, cfg, seeds, observer)) {
        gamesProcessed++;
        for (const p of game.players) participants.add(p.playerId);
      } else {
        gamesSkipped++;
      }
    }

    for (const id of participants) {
      const r = state.get(id)!;
      r.lastSessionDelta = r.elo - (preSession.get(id) ?? r.seedElo);
    }
  }

  const players = Array.from(state.values())
    .map(r => ({
      ...r,
      elo: round2(r.elo),
      peakElo: round2(r.peakElo),
      seedElo: round2(r.seedElo),
      effectiveGames: round2(r.effectiveGames),
      totalDamage: Math.round(r.totalDamage),
      lastSessionDelta: round2(r.lastSessionDelta),
      provisional: r.gamesPlayed < cfg.provisionalGames,
    }))
    .sort((a, b) => b.elo - a.elo);

  return { players, gamesProcessed, gamesSkipped, sessionsProcessed: ordered.length };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
