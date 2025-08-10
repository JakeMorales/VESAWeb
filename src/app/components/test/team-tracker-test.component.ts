import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatchDayTableComponent } from '../match/match-day-table.component';
import { MatchDayResults } from '../../models/match-day-results.model';

@Component({
	selector: 'app-team-tracker-test',
	standalone: true,
		imports: [CommonModule, MatchDayTableComponent],
	template: `
		<div style="max-width:1400px;margin:0 auto;padding:32px;">
			<h2>Sample Match Day Results Table (from JSON)</h2>
			<ng-container *ngIf="matchResults; else loading">
				<app-match-day-table [matchResults]="matchResults"></app-match-day-table>
			</ng-container>
			<ng-template #loading>
				<p>Loading sample data...</p>
			</ng-template>
		</div>
	`
})
export class TeamTrackerTestComponent {
	matchResults: MatchDayResults | null = null;
	constructor(public http: HttpClient) {
		this.loadSampleJsonScrim();
	}
		loadSampleJsonScrim(): void {
			const filePath = 'assets/scrim_2024_07_03_id_7058.json';
				this.http.get<any>(filePath).subscribe({
					next: (data: any) => {
						// Map games array to MatchDayResults format: { 1: [...], 2: [...], ... }
						const matchResults: MatchDayResults = {};
												if (Array.isArray(data.games)) {
													const individualGames = Array.isArray(data.individual_games) ? data.individual_games : [];
													data.games.forEach((game: any, i: number) => {
																	matchResults[i + 1] = Array.isArray(game.teams) ? game.teams.map((team: any) => {
																		// Remove '@#' from team name
																		const cleanTeamName = typeof team.team_name === 'string' ? team.team_name.replace(/@\d+$/, '') : team.team_name;
																		// Find all player stats for this team in this game
																		let players = individualGames
																			.filter((p: any) => p.game_number === game.game_number && (p.team_name?.replace(/@\d+$/, '') === cleanTeamName))
																			.map((p: any) => ({
																				playerName: p.player_name,
																				kills: p.kills ?? 0,
																				damage: p.damage_dealt ?? 0,
																				downs: p.knockdowns ?? 0,
																				headshots: p.headshots ?? 0,
																				assists: p.assists ?? 0,
																				shots: p.shots ?? 0,
																				hits: p.hits ?? 0,
																				revives: p.revives_given ?? 0,
																				respawns: p.respawns_given ?? 0
																			}));
																						// Placement points mapping
																						let placementPoints = 0;
																						if (team.placement === 1) placementPoints = 12;
																						else if (team.placement === 2) placementPoints = 9;
																						else if (team.placement === 3) placementPoints = 7;
																						else if (team.placement === 4) placementPoints = 5;
																						else if (team.placement === 5) placementPoints = 4;
																						else if (team.placement === 6 || team.placement === 7) placementPoints = 3;
																						else if (team.placement >= 8 && team.placement <= 10) placementPoints = 2;
																						else if (team.placement >= 11 && team.placement <= 15) placementPoints = 1;
																						else if (team.placement >= 16 && team.placement <= 20) placementPoints = 0;

																						return {
																							gameNumber: game.game_number,
																							teamName: cleanTeamName,
																							placement: team.placement,
																							teamKills: team.kills,
																							placementPoints,
																							totalPoints: team.score,
																							mapName: game.map_name,
																							players,
																							isExpanded: false
																						};
																	}) : [];
													});
												}
												this.matchResults = matchResults;
					},
					error: (err: any) => {
						console.error('Failed to load sample scrim JSON:', err);
					}
				});
		}
}
