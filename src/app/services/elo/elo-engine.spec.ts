import {
  DEFAULT_ELO_CONFIG,
  EloConfig,
  GameInput,
  PlayerRatingState,
  SeasonSeed,
  calculatePerformanceScore,
  decayedSeed,
  expectedOutcome,
  expectedOutcomePairwise,
  kFactor,
  percentileOutcomes,
  processGame,
  runSeason,
} from './elo-engine';

/** Build a lobby of n players with mechanically generated stats. */
function makeGame(n: number, statsFor: (i: number) => Partial<{ placement: number; kills: number; damage: number }>): GameInput {
  return {
    players: Array.from({ length: n }, (_, i) => {
      const s = statsFor(i);
      return {
        playerId: `p${i}`,
        name: `Player ${i}`,
        placement: s.placement ?? Math.floor(i / 3) + 1,
        kills: s.kills ?? 0,
        assists: 0,
        damage: s.damage ?? 0,
        revives: 0,
      };
    }),
  };
}

const cfg: EloConfig = { ...DEFAULT_ELO_CONFIG, minPlayersPerGame: 6 };

describe('calculatePerformanceScore', () => {
  it('rewards a win over a bottom placement', () => {
    const win = calculatePerformanceScore(1, 3, 1, 800, 1);
    const loss = calculatePerformanceScore(20, 0, 0, 100, 0);
    expect(win).toBeGreaterThan(loss);
    expect(win).toBeLessThan(1);
    expect(loss).toBeGreaterThan(0);
  });

  it('saturates: a 15-kill game is barely better than a 5-kill game', () => {
    const five = calculatePerformanceScore(5, 5, 0, 2000, 0);
    const fifteen = calculatePerformanceScore(5, 15, 0, 4000, 0);
    expect(fifteen - five).toBeLessThan(0.01);
  });
});

describe('percentileOutcomes', () => {
  it('averages exactly 0.5 across any lobby', () => {
    const outcomes = percentileOutcomes([0.9, 0.1, 0.4, 0.7, 0.2, 0.55]);
    const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
    expect(mean).toBeCloseTo(0.5, 10);
  });

  it('gives tied scores the same outcome and stays mean-0.5', () => {
    const outcomes = percentileOutcomes([0.5, 0.5, 0.9, 0.1]);
    expect(outcomes[0]).toBe(outcomes[1]);
    const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
    expect(mean).toBeCloseTo(0.5, 10);
  });

  it('keeps outcomes strictly inside (0, 1)', () => {
    const outcomes = percentileOutcomes([1, 2, 3, 4, 5]);
    expect(Math.min(...outcomes)).toBeGreaterThan(0);
    expect(Math.max(...outcomes)).toBeLessThan(1);
  });
});

describe('expectedOutcome', () => {
  it('is 0.5 at rating parity and monotonic in the gap', () => {
    expect(expectedOutcome(1500, 1500, 350)).toBeCloseTo(0.5, 10);
    expect(expectedOutcome(1700, 1500, 350)).toBeGreaterThan(0.5);
    expect(expectedOutcome(1300, 1500, 350)).toBeLessThan(0.5);
  });
});

describe('kFactor', () => {
  it('starts at kProvisional and decays toward kStable', () => {
    expect(kFactor(0, cfg)).toBeCloseTo(cfg.kProvisional, 5);
    expect(kFactor(200, cfg)).toBeCloseTo(cfg.kStable, 1);
    expect(kFactor(5, cfg)).toBeLessThan(kFactor(0, cfg));
  });
});

describe('processGame', () => {
  it('is exactly zero-sum (pool balancing)', () => {
    const state = new Map<string, PlayerRatingState>();
    const game = makeGame(12, i => ({ placement: Math.floor(i / 3) + 1, kills: 12 - i, damage: (12 - i) * 150 }));
    processGame(game, state, '2026-05-05', cfg);
    const total = Array.from(state.values()).reduce((sum, r) => sum + r.elo, 0);
    expect(total).toBeCloseTo(12 * cfg.initialElo, 6);
  });

  it('skips degenerate lobbies below the player minimum', () => {
    const state = new Map<string, PlayerRatingState>();
    const ok = processGame(makeGame(5, () => ({})), state, '2026-05-05', cfg);
    expect(ok).toBeFalse();
    expect(state.size).toBe(0);
  });

  it('has no expected gain for a correctly rated player (anti-grind)', () => {
    // A mature player whose rating already predicts their percentile should
    // gain ~nothing from playing more, no matter how often they play.
    const game = makeGame(10, i => ({ placement: i + 1, kills: 10 - i, damage: (10 - i) * 100 }));
    const outcomes = percentileOutcomes(
      game.players.map(p => calculatePerformanceScore(p.placement, p.kills, p.assists, p.damage, p.revives))
    );
    // Opponents all at exactly 1500, so p0's pairwise expectation is the plain
    // logistic; put p0 at the rating whose expectation equals their percentile.
    const target = 1500 - cfg.expectationScale * Math.log10(1 / outcomes[0] - 1);
    const state = new Map<string, PlayerRatingState>();
    game.players.forEach((p, i) => {
      state.set(p.playerId, {
        playerId: p.playerId,
        name: p.name,
        elo: i === 0 ? target : 1500,
        gamesPlayed: 100,
        effectiveGames: 100, // mature K
        peakElo: 1500,
        lastPlayed: '2026-05-05',
        seedElo: 1500,
        totalKills: 0,
        totalDamage: 0,
        wins: 0,
        lastSessionDelta: 0,
      });
    });
    processGame(game, state, '2026-05-06', cfg);
    const delta = Math.abs(state.get('p0')!.elo - target);
    expect(delta).toBeLessThan(3); // only the shared pool-balancing shift remains
  });

  it('expects more from a player facing a weak field than a strong one (pairwise)', () => {
    const strongField = [1900, 1900, 1900, 1500];
    const weakField = [1100, 1100, 1100, 1500];
    const vsStrong = expectedOutcomePairwise(1500, strongField, cfg.expectationScale, 3);
    const vsWeak = expectedOutcomePairwise(1500, weakField, cfg.expectationScale, 3);
    expect(vsWeak).toBeGreaterThan(0.5);
    expect(vsStrong).toBeLessThan(0.5);
    expect(vsWeak + vsStrong).toBeCloseTo(1, 10);
  });
});

describe('runSeason', () => {
  it('processes sessions in date order and flags provisional players', () => {
    const game = makeGame(9, i => ({ placement: i + 1, kills: 9 - i, damage: (9 - i) * 120 }));
    const result = runSeason(
      [
        { sessionId: 'b', date: '2026-05-10', games: [game] },
        { sessionId: 'a', date: '2026-05-05', games: [game, game] },
      ],
      cfg
    );
    expect(result.sessionsProcessed).toBe(2);
    expect(result.gamesProcessed).toBe(3);
    expect(result.players.length).toBe(9);
    expect(result.players.every(p => p.provisional)).toBeTrue(); // 3 games < 10
    expect(result.players.every(p => p.gamesPlayed === 3)).toBeTrue();
    // sorted by elo descending
    const elos = result.players.map(p => p.elo);
    expect([...elos].sort((a, b) => b - a)).toEqual(elos);
  });

  it('seeds returning players from carryover and re-places them fast', () => {
    // A 1900 player one season away seeds at 1500 + 0.6*400 = 1740 with
    // reduced effective games (higher K than a settled veteran).
    const oneAway = decayedSeed(1900, 100, 1, cfg);
    expect(oneAway.elo).toBeCloseTo(1500 + 400 * cfg.ratingCarryover, 6);
    expect(oneAway.effectiveGames).toBeCloseTo(50, 6);
    expect(kFactor(oneAway.effectiveGames, cfg)).toBeGreaterThan(kFactor(100, cfg));

    // Eight seasons away (a 2024 veteran in 2026): rating ~fresh, K ~provisional.
    const longAway = decayedSeed(1900, 100, 8, cfg);
    expect(Math.abs(longAway.elo - 1500)).toBeLessThan(10);
    expect(kFactor(longAway.effectiveGames, cfg)).toBeGreaterThan(0.9 * cfg.kProvisional);

    // Seeds flow into runSeason: the seeded player starts from their prior.
    const game = makeGame(9, i => ({ placement: i + 1, kills: 9 - i, damage: (9 - i) * 120 }));
    const seeds = new Map<string, SeasonSeed>([['p8', { elo: 1800, effectiveGames: 40 }]]);
    const result = runSeason([{ sessionId: 's', date: '2026-05-05', games: [game] }], cfg, seeds);
    const p8 = result.players.find(p => p.playerId === 'p8')!;
    expect(p8.seedElo).toBe(1800);
    expect(p8.elo).toBeLessThan(1800); // bottomed the lobby, so they fell
    const p0 = result.players.find(p => p.playerId === 'p0')!;
    expect(p0.seedElo).toBe(1500);
  });

  it('consistently better performers end higher (skill signal)', () => {
    // p0 always tops the lobby, p8 always bottoms it, across 30 games.
    const game = makeGame(9, i => ({ placement: i + 1, kills: 9 - i, damage: (9 - i) * 120 }));
    const sessions = Array.from({ length: 5 }, (_, s) => ({
      sessionId: `s${s}`,
      date: `2026-05-0${s + 1}`,
      games: Array.from({ length: 6 }, () => game),
    }));
    const result = runSeason(sessions, cfg);
    const byId = new Map(result.players.map(p => [p.playerId, p]));
    expect(byId.get('p0')!.elo).toBeGreaterThan(byId.get('p4')!.elo);
    expect(byId.get('p4')!.elo).toBeGreaterThan(byId.get('p8')!.elo);
    // pool conserved across the whole season
    const total = result.players.reduce((sum, p) => sum + p.elo, 0);
    expect(total).toBeCloseTo(9 * cfg.initialElo, 0);
  });
});
