import fs from 'fs';
import path from 'path';
export class LeagueMatchesService {
    /**
     * Gets all available seasons from the divisions_batch directory
     */
    static getSeasons() {
        try {
            return fs.readdirSync(this.LEAGUE_DIR)
                .filter(dir => dir.startsWith('Season_'))
                .sort((a, b) => {
                // Sort by season number
                const numA = parseInt(a.split('_')[1]);
                const numB = parseInt(b.split('_')[1]);
                return numA - numB;
            });
        }
        catch (err) {
            console.error('Error reading seasons:', err);
            return [];
        }
    }
    /**
     * Gets all divisions for a specific season
     */
    static getDivisions(season) {
        try {
            const seasonPath = path.join(this.LEAGUE_DIR, season);
            return fs.readdirSync(seasonPath)
                .filter(dir => dir.startsWith('Division_'))
                .map(dir => dir.replace('Division_', ''))
                .sort((a, b) => parseInt(a) - parseInt(b));
        }
        catch (err) {
            console.error(`Error reading divisions for season ${season}:`, err);
            return [];
        }
    }
    /**
     * Gets all match days for a specific division
     */
    static getDivisionMatches(season, division) {
        try {
            const divPath = path.join(this.LEAGUE_DIR, season, `Division_${division}`);
            const files = fs.readdirSync(divPath)
                .filter(file => file.endsWith('.json'))
                .sort((a, b) => {
                // Sort regular weeks by number
                const weekA = parseInt(a.match(/Week_(\d+)/)?.[1] || '0');
                const weekB = parseInt(b.match(/Week_(\d+)/)?.[1] || '0');
                if (weekA !== weekB)
                    return weekA - weekB;
                // Put playoffs and finals at the end
                if (a.includes('Playoffs') || a.includes('Finals')) {
                    if (b.includes('Playoffs') || b.includes('Finals')) {
                        return a.localeCompare(b);
                    }
                    return 1;
                }
                if (b.includes('Playoffs') || b.includes('Finals')) {
                    return -1;
                }
                return a.localeCompare(b);
            });
            return files.map(file => {
                const filePath = path.join(divPath, file);
                const fileContents = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(fileContents);
                // Extract week information from filename
                const weekMatch = file.match(/Week_(\d+)|Playoffs_(\d+)|Finals/i);
                const week = weekMatch ? weekMatch[0] : file.replace('.json', '');
                const isPlayoffs = week.toLowerCase().includes('playoffs') || week.toLowerCase().includes('finals');
                return {
                    season,
                    division,
                    week,
                    isPlayoffs,
                    stats: {
                        games: data.stats.games.map((game) => ({
                            game: game.game,
                            teams: game.teams.map((team) => ({
                                player_stats: (team.player_stats || team.players || []).map(player => ({
                                    playerId: player.playerId?.toString() || player.player_id?.toString(),
                                    playerName: player.name || player.playerName || player.player_name || '',
                                    teamName: player.teamName || team.name || team.overall_stats?.name || '',
                                    kills: player.kills || 0,
                                    assists: player.assists || 0,
                                    damageDealt: player.damageDealt || player.damage_dealt || 0,
                                    revivesGiven: player.revivesGiven || player.revives_given || 0,
                                    revives: player.revives
                                })),
                                overall_stats: {
                                    teamPlacement: team.overall_stats.teamPlacement,
                                    teamName: team.name || team.overall_stats?.name || null
                                }
                            }))
                        }))
                    }
                };
            });
        }
        catch (err) {
            console.error(`Error reading match days for ${season} Division ${division}:`, err);
            return [];
        }
    }
    /**
     * Gets a specific match day result
     */
    static getMatchDay(season, division, file) {
        try {
            const filePath = path.join(this.LEAGUE_DIR, season, `Division_${division}`, file);
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                return null;
            }
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContents);
            // Extract week information from filename
            const weekMatch = file.match(/Week_(\d+)|Playoffs_(\d+)|Finals/i);
            const week = weekMatch ? weekMatch[0] : file.replace('.json', '');
            const isPlayoffs = week.toLowerCase().includes('playoffs') || week.toLowerCase().includes('finals');
            return {
                season,
                division,
                week,
                isPlayoffs,
                stats: {
                    games: data.stats.games.map((game) => ({
                        game: game.game,
                        teams: game.teams.map((team) => ({
                            player_stats: (team.player_stats || team.players || []).map(player => ({
                                playerId: player.playerId?.toString() || player.player_id?.toString(),
                                playerName: player.name || player.playerName || player.player_name || '',
                                teamName: player.teamName || team.name || team.overall_stats?.name || '',
                                kills: player.kills || 0,
                                assists: player.assists || 0,
                                damageDealt: player.damageDealt || player.damage_dealt || 0,
                                revivesGiven: player.revivesGiven || player.revives_given || 0,
                                revives: player.revives
                            })),
                            overall_stats: {
                                teamPlacement: team.overall_stats.teamPlacement,
                                teamName: team.name || team.overall_stats?.name || null
                            }
                        }))
                    }))
                }
            };
        }
        catch (err) {
            console.error(`Error reading match day ${file} for ${season} Division ${division}:`, err);
            return null;
        }
    }
}
LeagueMatchesService.LEAGUE_DIR = path.join(process.cwd(), 'server', 'divisions_batch');
