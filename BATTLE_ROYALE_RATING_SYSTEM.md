# Battle Royale Rating System Documentation

## Overview

This enhanced rating system is specifically designed for battle royale games with 20 teams of 3 players each. Unlike traditional 1v1 Elo systems, this accounts for the high variance and multiple performance factors inherent in battle royale gameplay.

## Key Features

### 1. **Multi-Factor Performance Evaluation**

The system evaluates performance across five key dimensions:

#### Placement Factor (40% weight)
- **Purpose**: Rewards survival and tactical positioning
- **Calculation**: `(20 - placement + 1) / 20`
- **Why Important**: In BR games, placement is the primary objective and heavily correlates with skill

#### Combat Factor (25% weight)
- **Purpose**: Rewards aggressive play and mechanical skill
- **Includes**: Kills + (Downs × 0.5)
- **Normalization**: Against the highest combat performance in the match
- **Why Important**: Combat effectiveness is crucial for securing eliminations and better positioning

#### Damage Factor (15% weight)
- **Purpose**: Rewards consistent damage output and engagement
- **Calculation**: Player damage / Max damage in game
- **Why Important**: Shows sustained performance even without eliminations

#### Support Factor (10% weight)
- **Purpose**: Rewards team play and cooperation
- **Includes**: Revives + Respawns
- **Max Cap**: 5 support actions for normalization
- **Why Important**: Team games require cooperation for optimal performance

#### Opponent Strength Factor (10% weight)
- **Purpose**: Adjusts for the quality of competition
- **Calculation**: Based on teams placed better than yours
- **Why Important**: Beating stronger opponents should yield more rating gain

### 2. **Consistency Bonus**

- **Purpose**: Rewards well-rounded performance across all factors
- **Calculation**: 1 - variance across performance factors
- **Bonus**: Up to 10% additional performance score
- **Why Important**: Encourages balanced gameplay rather than one-dimensional strategies

### 3. **Battle Royale Specific Adjustments**

#### Higher K-Factor
- **Standard Elo K-Factor**: 32
- **BR K-Factor**: 38.4 (20% increase)
- **Reason**: BR games have higher variance, so ratings should adjust more quickly

#### Non-Binary Results
- **Traditional**: Win (1.0), Draw (0.5), Loss (0.0)
- **BR System**: Continuous scale from 0.0 to 1.0 based on overall performance
- **Advantage**: More granular rating adjustments reflect true performance

### 4. **Enhanced Player & Team Tracking**

#### Player Stats Include:
- Average placement across games
- Average kills, damage, revives, respawns
- Win/loss record (top 5/bottom 5 placements)

#### Team Stats Include:
- Average team kills and total points
- Team placement history
- Collective performance metrics

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
  consistency * 0.10 (bonus)
```

### Step 3: Rating Change Calculation
```typescript
expectedScore = 1 / (1 + 10^((gameAvgRating - playerRating) / 400))
ratingChange = K_FACTOR * (performanceScore - expectedScore)
```

## Implementation Benefits

### 1. **Addresses BR-Specific Challenges**
- **High Variance**: Larger K-factor and multi-factor evaluation
- **Non-Binary Outcomes**: Continuous performance scoring
- **Team Dynamics**: Support factor rewards cooperation
- **RNG Mitigation**: Multiple performance vectors reduce luck impact

### 2. **Encourages Balanced Play**
- **Not Just Kills**: Damage and support matter
- **Not Just Camping**: Combat and damage factors prevent passive play
- **Team Focus**: Support actions contribute meaningfully

### 3. **Provides Rich Feedback**
- **Performance Breakdown**: Players see exactly where they excel/struggle
- **Actionable Tips**: System suggests improvement areas
- **Scenario Testing**: Pre-built scenarios show rating impacts

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

## Future Enhancements

1. **Dynamic K-Factor**: Adjust based on player's games played and rating stability
2. **Seasonal Decay**: Implement rating decay for inactive players
3. **Team Synergy**: Bonus for consistent team performance
4. **Map-Specific Adjustments**: Different expectations per map
5. **Tournament Mode**: Special handling for competitive events

This system provides a comprehensive, fair, and engaging rating experience that accurately reflects player skill in the complex environment of battle royale gaming.
