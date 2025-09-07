export interface OverallPlayerStats {
  playerName: string;
  totalKills: number;
  totalDamage: number;
  totalDowns: number;
  totalHeadshots?: number;
  totalAssists?: number;
  totalShots?: number;
  totalHits?: number;
  totalRevives: number;
  totalRespawns: number;
  gamesPlayed: number;
  avgKills: number;
  avgDamage: number;
}

export interface OverallTeamStanding {
  teamName: string;
  totalPoints: number;
  gamesWon: number;
  totalKills: number;
  avgPlacement: number;
  players: OverallPlayerStats[];
  isExpanded?: boolean;
}
// Shared interfaces for match day results and related types

export interface PlayerStats {
  player_id?: string;
  playerName: string;
  kills: number;
  damage: number;
  downs: number;
  headshots?: number;
  assists?: number;
  shots?: number;
  hits?: number;
  revives: number;
  respawns: number;
}

export interface TeamGameResult {
  gameNumber: number;
  teamName: string;
  placement: number;
  teamKills: number;
  placementPoints: number;
  totalPoints: number;
  mapName: string;
  players: PlayerStats[];
  isExpanded?: boolean;
}

export interface MatchDayResults {
  [gameNumber: number]: TeamGameResult[];
}
