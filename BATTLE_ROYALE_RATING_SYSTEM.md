# Battle Royale Rating System Documentation

## Overview

This rating system is designed for battle royale games with 20 teams of 3 players each. It uses a multi-factor performance evaluation and an Elo-based rating adjustment, tailored for the high variance and team dynamics of battle royale gameplay.

---

## Current Implementation

- **Historical Data Source:**  
  - Scrim blocks are loaded from JSON files using the `ScrimFileService`.
  - Each file represents a scrim session with player results and metadata.

- **ELO Calculation:**
  - Players start with a default ELO (typically 1500).
  - ELO is updated after each game using a weighted performance score (see below) and the standard Elo formula, accounting for the ELO difference between players/teams.
  - Players with fewer than 18 games are considered "unrated" and retain the default ELO until they reach the threshold.
  - ELO changes are applied regardless of rated/unrated status, but unrated players can skew results due to their default ELO.

- **Lobby Sorting:**
  - Historical lobbies were manually sorted by perceived skill, not ELO.
  - This results in both lobbies having similar average ELOs (due to many unrated players), which can distort ELO changes for both high and low skill groups.

- **Stats Tracked:**
  - Min, Max, Mean, Std Dev of ELO
  - Unrated percent, percent of players over 12 games
  - Average ELO gain/loss per game
  - Player counts and segmentation

---

## Key Features

### 1. Multi-Factor Performance Evaluation

Performance is evaluated across five key dimensions:

- **Placement Factor (40%)**: `(20 - placement + 1) / 20`
- **Combat Factor (25%)**: `(kills + downs × 0.5) / maxCombatInGame`
- **Damage Factor (15%)**: `playerDamage / maxDamageInGame`
- **Support Factor (10%)**: `(revives + respawns) / 5` (max cap)
- **Opponent Strength Factor (10%)**: Based on teams placed better than yours: `betterTeams / 19`
- **Consistency Bonus (up to 10%)**: `1 - variance(allFactors)`

### 2. Battle Royale Specific Adjustments

- **Higher K-Factor**: 38.4 (20% higher than standard Elo)
- **Non-Binary Results**: Performance score is a continuous value from 0.0 to 1.0, not just win/loss/draw.

### 3. Enhanced Player & Team Tracking

- **Player Stats**: Average placement, kills, damage, revives, respawns, win/loss record.
- **Team Stats**: Average team kills, total points, placement history, collective metrics.

---

## Rating Calculation Process

### Step 1: Performance Factor Calculation

```typescript
performance = {
  placement: (20 - placement + 1) / 20,
  combat: (kills + downs * 0.5) / maxCombatInGame,
  damage: playerDamage / maxDamageInGame,
  support: (revives + respawns) / 5,
  opponentStrength: betterTeams / 19,
  consistency: 1 - variance(allFactors)
}
```

### Step 2: Weighted Performance Score

```typescript
performanceScore = 
  placement * 0.40 +
  combat * 0.25 +
  damage * 0.15 +
  support * 0.10 +
  opponentStrength * 0.10 +
  consistency * 0.10 // (bonus)
```

### Step 3: Rating Change Calculation

```typescript
expectedScore = 1 / (1 + 10^((gameAvgRating - playerRating) / 400))
ratingChange = K_FACTOR * (performanceScore - expectedScore)
```

---

## Known Issues

- **High Unrated Player Percentage:**  
  - ~70% of players are unrated, causing ELO averages to cluster around the default and reducing the accuracy of the rating system.

- **Lobby Sorting Bias:**  
  - Manual lobby sorting means ELO changes may not reflect true skill differences, especially early on.

- **Player Identity:**  
  - Players may appear under different names or Overstat IDs, leading to duplicate entries and inaccurate stats.

- **Data Source:**  
  - All data is loaded from static files, not a database, limiting scalability and query capabilities.

---

## TO DOs

1. **Feed Scrim Blocks into a Database**
   - Migrate from file-based loading to a proper database (e.g., PostgreSQL via Nhost).
   - Enable querying, aggregation, and better data integrity.

2. **De-duplicate Players**
   - Implement logic to merge player records based on name and Overstat ID.
   - Create a canonical player identity for accurate stats and ELO tracking.

3. **Account for Lobby Sorting Bias**
   - Seed initial ELOs based on historical lobby assignment (e.g., higher starting ELO for players consistently in top lobbies).
   - Consider a provisional period where ELO changes for unrated players have reduced impact on rated players.
   - Optionally, run multiple passes over the data to retroactively adjust ELOs.

4. **Improve ELO Calculation**
   - Tune K-factor and provisional rules for unrated players.
   - Segment stats and leaderboards to show only rated players.
   - Add transparency for provisional status.

5. **Testing & Validation**
   - Add unit/integration tests for ELO calculation logic.
   - Validate ELO distribution and fairness after changes.

---

## Usage Examples

### Champion Performance (1st Place, 8 Kills, 2200 Damage)
- Placement Factor: 100% (1st place)
- Combat Factor: ~80% (high kills)
- Damage Factor: ~90% (high damage)
- Support Factor: ~60% (some revives)
- **Result**: Large positive rating gain

### Support Player (6th Place, 1 Kill, 600 Damage, 4 Revives)
- Placement Factor: 75% (good placement)
- Combat Factor: ~15% (low kills)
- Damage Factor: ~30% (moderate damage)
- Support Factor: 80% (high revives)
- **Result**: Moderate positive gain, rewarding team play

### High-Kill Early Exit (8th Place, 12 Kills, 1800 Damage)
- Placement Factor: 65% (middle placement)
- Combat Factor: 100% (highest kills)
- Damage Factor: ~80% (high damage)
- Support Factor: 0% (no team support)
- **Result**: Moderate gain, but placement penalty limits growth

---

## Future Enhancements

1. **Dynamic K-Factor**: Adjust based on player's games played and rating stability
2. **Seasonal Decay**: Implement rating decay for inactive players
3. **Team Synergy**: Bonus for consistent team performance
4. **Map-Specific Adjustments**: Different expectations per map
5. **Tournament Mode**: Special handling for competitive events

---

_Last updated: August 20, 2025_