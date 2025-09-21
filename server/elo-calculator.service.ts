// Pure backend ELO calculator utility for Node.js
export class EloCalculatorService {
  static readonly INITIAL_ELO = 1500;
  static readonly MIN_ELO = 500;
  static readonly MAX_ELO = 3000;

  /**
   * Normalizes an array of performance scores so the mean is 0.5.
   */
  static normalizePerformanceScores(scores: number[]): number[] {
    const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    return scores.map(s => 0.5 + (s - mean));
  }
  
  /**
   * Calculates Elo change using a dynamic K-factor based on games played.
   * @param playerElo The player's current Elo rating
   * @param opponentElo The opponent's (or average opposing team) Elo rating
   * @param performanceScore The player's performance score (0-1)
   * @param gamesPlayed Number of games the player has played
   */
  calculateEloChangeWithOpponent(playerElo: number, opponentElo: number, performanceScore: number, gamesPlayed: number): number {
    // Adjust opponent Elo for unrated players (less than 18 games)
    const isOpponentUnrated = gamesPlayed < 18;
    const adjustedOpponentElo = isOpponentUnrated 
      ? Math.min(opponentElo, playerElo + 200) // Limit unrated opponent's effective rating
      : opponentElo;

    // Dynamic K-factor with progressive scaling
    const baseK = 28; // Increased for better mobility
    
    // Standard volatility factor based on rating difference from initial
    const volatilityFactor = Math.max(0.8, Math.min(1.2, 1500 / playerElo));
    
    // Experience factor with slower decay
    const experienceFactor = Math.max(0.8, Math.min(1.2, 40 / Math.max(gamesPlayed, 20)));
    
    // Unrated player bonus
    const unratedBonus = isOpponentUnrated ? 1.2 : 1.0;
    
    const k = Math.round(baseK * volatilityFactor * experienceFactor * unratedBonus);

    // Standard expectation calculation
    const ratingDiff = adjustedOpponentElo - playerElo;
    const expectedScore = 1 / (1 + Math.pow(10, ratingDiff / 600));
    
    // Calculate base change with performance scaling
    const performanceDiff = performanceScore - expectedScore;
    const performanceScale = performanceScore > 0.7 ? 1.15 : 1.0; // Bonus for exceptional performance
    const adjustedDiff = Math.sign(performanceDiff) * 
      Math.pow(Math.abs(performanceDiff), 0.95) * 
      performanceScale;
    
    let change = k * adjustedDiff;
    
    // Standard maximum rating change
    const maxChange = 75;
    if (Math.abs(change) > maxChange) {
        change = maxChange * Math.sign(change);
    }
    
    // Soft clamping with progressive boundaries
    const targetElo = playerElo + change;
    if (targetElo < EloCalculatorService.MIN_ELO) {
        const diff = EloCalculatorService.MIN_ELO - targetElo;
        change += diff * 0.85;
    } else if (targetElo > EloCalculatorService.MAX_ELO) {
        const diff = targetElo - EloCalculatorService.MAX_ELO;
        change -= diff * 0.85;
    }
    
    return change;
  }

  // These weights are optimized for 60-player, 20-team BR format
  static placementWeight = 50;  // Increased because BR is placement-focused
  static combatWeight = 25;     // Reduced but still significant
  static damageWeight = 20;     // Increased because sustained damage is important
  static supportWeight = 5;     // Kept same as team support is still valuable

  static getPlacementWeight(): number { return EloCalculatorService.placementWeight; }
  static getCombatWeight(): number { return EloCalculatorService.combatWeight; }
  static getDamageWeight(): number { return EloCalculatorService.damageWeight; }
  static getSupportWeight(): number { return EloCalculatorService.supportWeight; }

  static calculatePerformanceScore(
    placement: number,
    kills: number,
    assists: number,
    damage: number,
    revives: number,
    teamSize: number = 3
  ): number {
    // Adjusted for 3-player team BR format based on actual statistics
    const placementFactor = EloCalculatorService.calculateTieredPlacementScore(placement);
    
    // Combat score adjusted based on actual average of 0.97 kills per player
    const combatScore = kills + (assists * 0.3); // Reduced assist weight
    const averageExpectedKills = 1.5; // Slightly above average to reward good performance
    const combatFactor = Math.min(1, combatScore / averageExpectedKills);
    
    // Damage factor adjusted based on median (534) and average (600) damage
    const expectedDamage = 650; // Set between median and average
    const damageFactor = Math.min(1, damage / expectedDamage);
    
    // Support factor with diminishing returns
    const supportFactor = Math.min(1, Math.sqrt(revives / (teamSize - 1)));

    // Calculate raw score
    const rawScore = (
      (placementFactor * EloCalculatorService.placementWeight / 100) +
      (combatFactor * EloCalculatorService.combatWeight / 100) +
      (damageFactor * EloCalculatorService.damageWeight / 100) +
      (supportFactor * EloCalculatorService.supportWeight / 100)
    );

    // Apply slight sigmoid transformation to better distribute scores
    return 1 / (1 + Math.exp(-5 * (rawScore - 0.5)));
  }

  /**
   * Normalizes an array of performance scores so the sum is 1 (probability distribution).
   */
  static sumNormalizePerformanceScores(scores: number[]): number[] {
    const total = scores.reduce((a, b) => a + b, 0) || 1;
    return scores.map(s => s / total);
  }

  /**
   * Calculate placement score specifically for 20-team format
   */
  static calculateTieredPlacementScore(placement: number): number {
    if (placement === 1) return 1.0;    // Winners
    if (placement <= 3) return 0.85;    // Top 3 (15%)
    if (placement <= 5) return 0.70;    // Top 5 (25%)
    if (placement <= 10) return 0.50;   // Top 10 (50%)
    if (placement <= 15) return 0.30;   // Top 15 (75%)
    return Math.max(0.1, 0.3 - ((placement - 15) * 0.04)); // Bottom 5 teams
  }

  /**
   * Calculate team performance score
   */
  static calculateTeamPerformanceScore(teamPlacement: number, teamKills: number, teamDamage: number): number {
    const placementScore = EloCalculatorService.calculateTieredPlacementScore(teamPlacement);
    const killScore = Math.min(1, teamKills / 9); // Expecting average of 9 kills per team (3 per player)
    const damageScore = Math.min(1, teamDamage / 2700); // Expecting average of 2700 damage per team

    return (placementScore * 0.6) + (killScore * 0.25) + (damageScore * 0.15);
  }
}
