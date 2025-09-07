
import { ScrimPlayerStats } from '../services/nhost.service';

/**
 * Returns a map of player_id to their most common name from a list of ScrimPlayerStats.
 */
export function getMostCommonPlayerNames(playerStatsList: ScrimPlayerStats[]): Map<string, string> {
  const nameCounts: Map<string, Record<string, number>> = new Map();

  for (const stats of playerStatsList) {
    if (!stats.player_id) continue;
    if (!nameCounts.has(stats.player_id)) {
      nameCounts.set(stats.player_id, {});
    }
    const counts = nameCounts.get(stats.player_id)!;
    if (stats.name) {
      counts[stats.name] = (counts[stats.name] || 0) + 1;
    }
  }

  const result: Map<string, string> = new Map();
  for (const [playerId, counts] of nameCounts.entries()) {
    let mostCommonName = '';
    let maxCount = 0;
    for (const [name, count] of Object.entries(counts)) {
      if (count > maxCount) {
        mostCommonName = name;
        maxCount = count;
      }
    }
    result.set(playerId, mostCommonName);
  }
  return result;
}
