export interface ScrimBatchFile {
  stats: {
    total: number;
    source: string;
    matchId: string;
    games: ScrimGame[];
  };
}

export interface ScrimGame {
  id: number;
  organizer: string | null;
  eventId: string | null;
  game: number;
  match_start: number;
  mid: string;
  map_name: string;
  aim_assist_allowed: boolean;
  matchId: number;
  source: string;
  livedata: any;
  livedata_checked: boolean;
  teams: ScrimTeam[];
}

export interface ScrimTeam {
  teamId: number;
  name: string;
  overall_stats: TeamStats;
  player_stats: PlayerStats[];
}

export interface TeamStats {
  id: number;
  teamId: number;
  gameId: number;
  teamPlacement: number;
  name: string;
  score: number;
  kills: number;
  revivesGiven: number;
  headshots: number;
  assists: number;
  respawnsGiven: number;
  damageDealt: number;
  knockdowns: number;
  shots: number;
  hits: number;
  survivalTime: number;
  grenadesThrown: number;
  ultimatesUsed: number;
  tacticalsUsed: number;
  damageTaken: number;
  matchId: number;
  characters: string[];
}

export interface PlayerStats {
  id: number;
  playerId: number;
  name: string;
  gameId: number;
  teamId: number;
  teamName: string;
  shots: number;
  hits: number;
  knockdowns: number;
  revivesGiven: number;
  respawnsGiven: number;
  survivalTime: number;
  assists: number;
  damageDealt: number;
  teamPlacement: number;
  hardware: string;
  kills: number;
  characterName: string;
  headshots: number;
  grenadesThrown: number | null;
  ultimatesUsed: number | null;
  tacticalsUsed: number | null;
  skin: string | null;
  damageTaken: number | null;
  matchId: number;
  score: number;
}
