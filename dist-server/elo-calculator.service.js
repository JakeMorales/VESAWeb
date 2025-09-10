// Pure backend ELO calculator utility for Node.js
export class EloCalculatorService {
    /**
     * Normalizes an array of performance scores so the mean is 0.5.
     */
    static normalizePerformanceScores(scores) {
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
    calculateEloChangeWithOpponent(playerElo, opponentElo, performanceScore, gamesPlayed) {
        // Fixed K-factor for all players to ensure zero-sum Elo
        const k = 90;
        const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
        return k * (performanceScore - expectedScore); // No rounding here!
    }
    static getPlacementWeight() { return EloCalculatorService.placementWeight; }
    static getCombatWeight() { return EloCalculatorService.combatWeight; }
    static getDamageWeight() { return EloCalculatorService.damageWeight; }
    static getSupportWeight() { return EloCalculatorService.supportWeight; }
    static calculatePerformanceScore(placement, kills, assists, damage, revives) {
        const placementFactor = EloCalculatorService.calculateTieredPlacementScore(placement);
        const combatScore = kills + assists;
        const combatFactor = Math.min(1, combatScore / 6);
        const damageFactor = Math.min(1, damage / 1200);
        const supportFactor = Math.min(1, revives / 3);
        return ((placementFactor * EloCalculatorService.placementWeight / 100) +
            (combatFactor * EloCalculatorService.combatWeight / 100) +
            (damageFactor * EloCalculatorService.damageWeight / 100) +
            (supportFactor * EloCalculatorService.supportWeight / 100));
    }
    /**
     * Legacy: Calculates Elo change using a fixed expected score (for backward compatibility)
     */
    static calculateEloChange(performanceScore) {
        return Math.round(EloCalculatorService.kFactor * (performanceScore - EloCalculatorService.expectedScore));
    }
    /**
   * Normalizes an array of performance scores so the mean is 0.5.
   */
    /**
     * Normalizes an array of performance scores so the sum is 1 (probability distribution).
     */
    static sumNormalizePerformanceScores(scores) {
        const total = scores.reduce((a, b) => a + b, 0) || 1;
        return scores.map(s => s / total);
    }
    static calculateTieredPlacementScore(placement) {
        switch (placement) {
            case 1: return 1.00;
            case 2: return 0.85;
            case 3: return 0.75;
            case 4: return 0.65;
            case 5: return 0.55;
            case 6: return 0.45;
            case 7: return 0.35;
            case 8: return 0.28;
            case 9: return 0.24;
            case 10: return 0.20;
            case 11: return 0.12;
            case 12: return 0.10;
            case 13: return 0.08;
            case 14: return 0.07;
            case 15: return 0.06;
            case 16: return 0.05;
            case 17: return 0.04;
            case 18: return 0.03;
            case 19: return 0.02;
            case 20: return 0.0;
            default: return 0.0;
        }
    }
}
EloCalculatorService.INITIAL_ELO = 1500;
// These weights and logic are from the RatingsComponent
EloCalculatorService.placementWeight = 45;
EloCalculatorService.combatWeight = 35;
EloCalculatorService.damageWeight = 15;
EloCalculatorService.supportWeight = 5;
EloCalculatorService.kFactor = 35;
EloCalculatorService.expectedScore = 0.2827;
