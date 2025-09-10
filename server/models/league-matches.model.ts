export interface LeagueMatch {
    game: number;
    teams: LeagueTeam[];
}

export interface LeagueTeam {
    name?: string;
    player_stats: PlayerStats[];
    overall_stats?: TeamStats;
}

export interface PlayerStats {
    playerId?: string | number;
    name?: string;              // Raw player name from API
    playerName?: string;        // Normalized player name
    player_name?: string;       // Snake case variation
    teamName?: string;          // Team name from player data
    kills: number;
    assists: number;
    damageDealt: number;
    damage_dealt?: number;      // Snake case variation
    revivesGiven?: number;
    revives_given?: number;     // Snake case variation
    revives?: number;
}

export interface TeamStats {
    teamPlacement: number;
    teamName?: string;
}

export interface LeagueMatchDay {
    season: string;
    division: string;
    week: string | number;
    isPlayoffs: boolean;
    stats: {
        games: LeagueMatch[];
    };
}

export interface LeagueArchiveResponse {
    matches: {
        [season: string]: Array<LeagueMatchDay>;
    };
    divisions: { [season: string]: string[] };
}
