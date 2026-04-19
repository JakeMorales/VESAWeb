import { Injectable } from '@angular/core';
import { PlayerStats } from './scrims-data.service';
import { MatchLoaderService } from './match-loader.service';

@Injectable({
  providedIn: 'root'
})
export class TeamUtilsService {
  constructor(private matchLoaderService: MatchLoaderService) {}

  groupPlayersByActualTeams(
    playerStats: PlayerStats[],
    scrimSignups: any[]
  ): Array<{
    teamName: string;
    placement: number;
    totalKills: number;
    players: PlayerStats[];
  }> {
    if (!scrimSignups || scrimSignups.length === 0) {
      return this.groupPlayersByTeams(playerStats);
    }
    const playerTeamMap = new Map<string, any>();
    scrimSignups.forEach(signup => {
      if (signup.signup_player_id) playerTeamMap.set(signup.signup_player_id, signup);
      if (signup.player_one_id) playerTeamMap.set(signup.player_one_id, signup);
      if (signup.player_two_id) playerTeamMap.set(signup.player_two_id, signup);
      if (signup.player_three_id) playerTeamMap.set(signup.player_three_id, signup);
    });
    const teamGroups = new Map<string, { signup: any; players: PlayerStats[] }>();
    playerStats.forEach(stat => {
      const teamSignup = playerTeamMap.get(stat.playerName);
      if (teamSignup) {
        const teamKey = `${teamSignup.team_name}_${teamSignup.id}`;
        if (!teamGroups.has(teamKey)) {
          teamGroups.set(teamKey, { signup: teamSignup, players: [] });
        }
        teamGroups.get(teamKey)!.players.push(stat);
      } else {
        const individualTeamKey = `Individual_${stat.playerName}`;
        teamGroups.set(individualTeamKey, {
          signup: {
            id: '',
            team_name: stat.playerName || 'Unknown Player',
            signup_player_id: stat.playerName,
            player_one_id: undefined,
            player_two_id: undefined,
            player_three_id: undefined,
            scrim_id: '',
            created_at: new Date().toISOString()
          },
          players: [stat]
        });
      }
    });
    const teams = Array.from(teamGroups.values()).map(group => {
      const totalKills = group.players.reduce((sum, player) => sum + (player.kills || 0), 0);
      const avgScore = 0;
      return {
        teamName: this.matchLoaderService.normalizeTeamName(group.signup.team_name || 'Unknown Team'),
        placement: 1,
        totalKills,
        avgScore,
        players: group.players
      };
    });
    teams.sort((a, b) => b.avgScore - a.avgScore);
    teams.forEach((team, index) => {
      team.placement = index + 1;
    });
    return teams;
  }

  groupPlayersByTeams(playerStats: PlayerStats[]): Array<{
    teamName: string;
    placement: number;
    totalKills: number;
    players: PlayerStats[];
  }> {
    return playerStats.map((player, index) => ({
      teamName: player.playerName || `Player ${index + 1}`,
      placement: index + 1,
      totalKills: player.kills || 0,
      players: [player]
    }));
  }

  transformToMatchDayResultsWithTeams(
    playerStats: PlayerStats[],
    scrimSignups: any[],
    scrimId: number
  ): any {
    if (!playerStats || playerStats.length === 0) {
      return {};
    }
    const teams = this.groupPlayersByActualTeams(playerStats, scrimSignups);
    const teamResults = teams.map((team, index) => ({
      gameNumber: 1,
      teamName: team.teamName,
      placement: team.placement,
      teamKills: team.totalKills,
      placementPoints: this.getPlacementPoints(team.placement),
      totalPoints: this.getPlacementPoints(team.placement) + Math.floor(team.totalKills / 3),
      mapName: 'Scrim Map',
      players: team.players.map(player => ({
  playerName: player.playerName || 'Unknown',
  kills: player.kills || 0,
  damageDealt: player.damageDealt || 0,
  downs: player.downs || 0,
  revives: player.revives || 0,
  respawns: player.respawns || 0
      })),
      isExpanded: false
    }));
    return { 1: teamResults };
  }

  transformToMatchDayResults(playerStats: PlayerStats[], scrimId: number): any {
    if (!playerStats || playerStats.length === 0) {
      return {};
    }
    const teams = this.groupPlayersByTeams(playerStats);
    const teamResults = teams.map((team, index) => ({
      gameNumber: 1,
      teamName: team.teamName,
      placement: team.placement,
      teamKills: team.totalKills,
      placementPoints: this.getPlacementPoints(team.placement),
      totalPoints: this.getPlacementPoints(team.placement) + Math.floor(team.totalKills / 3),
      mapName: 'Scrim Map',
      players: team.players.map(player => ({
  playerName: player.playerName || 'Unknown',
  kills: player.kills || 0,
  damageDealt: player.damageDealt || 0,
  downs: player.downs || 0,
  revives: player.revives || 0,
  respawns: player.respawns || 0
      })),
      isExpanded: false
    }));
    return { 1: teamResults };
  }

  getPlacementPoints(placement: number): number {
    const points: { [key: number]: number } = {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
    };
    return points[placement] || 0;
  }
}
