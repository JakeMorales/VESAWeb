import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { ArchiveHeaderComponent } from './archive-header.component';
import { ArchiveFiltersComponent, Season } from './archive-filters.component';
import { SeasonChampionsComponent, SeasonChampions } from './season-champions.component';
import { SeasonLeaderboardsComponent, SeasonLeaderboard, SeasonTeamResult } from './season-leaderboards.component';
import { ArchiveMatchHistoryComponent, HistoricalMatch, MatchGameResult, GameTeamResult } from './archive-match-history-enhanced.component';
import { LeagueService, LeagueMatchDay } from '../../services/league.service';
// Import Season type from season-leaderboards for type safety
import { Season as LeaderboardSeason } from './season-leaderboards.component';

interface FilterSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'active' | 'upcoming';
  divisions: string[];
}

@Component({
  selector: 'app-scores-archive',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ArchiveHeaderComponent,
    ArchiveFiltersComponent,
    SeasonChampionsComponent,
    SeasonLeaderboardsComponent,
    ArchiveMatchHistoryComponent
  ],
  template: `
    <div class="scores-archive-container">
      <app-archive-header></app-archive-header>

      <app-archive-filters
        [seasons]="seasons"
        [selectedSeason]="selectedSeason"
        [selectedDivision]="selectedDivision"
        [viewMode]="viewMode"
        (seasonChange)="onSeasonChange($event)"
        (divisionChange)="onDivisionChange($event)"
        (viewModeChange)="onViewModeChange($event)">
      </app-archive-filters>

      <!-- Season Champions View -->
      <app-season-champions 
        *ngIf="viewMode === 'champions'"
        [filteredChampions]="filteredChampions"
        [selectedDivision]="selectedDivision">
      </app-season-champions>

      <!-- Final Leaderboards View -->
      <app-season-leaderboards
        *ngIf="viewMode === 'leaderboards'"
        [filteredLeaderboards]="filteredLeaderboards"
        [seasons]="convertToLeaderboardSeasons(seasons)">
      </app-season-leaderboards>

      <!-- Match History View -->
      <app-archive-match-history
        *ngIf="viewMode === 'matches'"
        [filteredMatches]="filteredMatches"
        [seasons]="convertToLeaderboardSeasons(seasons)">
      </app-archive-match-history>
    </div>
  `,
  styleUrl: './scores-archive.component.css'
})

export class ScoresArchiveComponent implements OnInit {
  seasons: FilterSeason[] = [];
  champions: SeasonChampions[] = [];
  leaderboards: SeasonLeaderboard[] = [];
  matches: HistoricalMatch[] = [];

  selectedSeason: string = '';
  selectedDivision: string = '';
  viewMode: string = 'champions';

  filteredChampions: SeasonChampions[] = [];
  filteredLeaderboards: SeasonLeaderboard[] = [];
  filteredMatches: HistoricalMatch[] = [];

  constructor(private leagueService: LeagueService) {}

  ngOnInit() {
    this.loadLeagueData();
  }

  loadLeagueData() {
    // Get available seasons
    this.leagueService.getSeasons().subscribe({
      next: (seasons: string[]) => {
        console.log('Received seasons:', seasons); // Debug log
        this.seasons = seasons.map(season => ({
          id: season,
          name: `Season ${season.replace('Season_', '')}`,
          startDate: '', // These could be added to the metadata if needed
          endDate: '',
          status: 'completed',
          divisions: []
        }));

        if (this.seasons.length > 0) {
          this.selectedSeason = this.seasons[0].id;
          
          // Get divisions for the first season
          this.leagueService.getDivisions(this.selectedSeason).subscribe({
            next: (divisions: string[]) => {
              this.seasons.find(s => s.id === this.selectedSeason)!.divisions = divisions;
              if (divisions.length > 0) {
                this.selectedDivision = divisions[0];
                this.loadMatchHistory();
              }
            },
            error: (err: any) => {
              console.error('Error loading divisions:', err);
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Error loading seasons:', err);
      }
    });
  }

  loadMatchHistory() {
    if (!this.selectedSeason || !this.selectedDivision) return;

    // Load all match days for the selected season/division
    this.leagueService.getDivisionMatches(this.selectedSeason, this.selectedDivision).subscribe({
      next: (matchDays: LeagueMatchDay[]) => {
        this.matches = matchDays.map(matchDay => this.convertToHistoricalMatch(matchDay));
        this.filterData();
      },
      error: (err: any) => {
        console.error('Error loading match days:', err);
      }
    });
  }

  private convertToHistoricalMatch(matchDay: LeagueMatchDay): HistoricalMatch {
    // Map each game in the match day
    const results: MatchGameResult[] = matchDay.stats.games.map(game => {
      // Map each team in the game
      const gameResults: GameTeamResult[] = game.teams
        .map((team, teamIndex) => {
          // Get team placement
          const placement = team.overall_stats?.teamPlacement || teamIndex + 1;
          
          // Try to get team name from multiple possible locations
          const rawTeam = team as { 
            name?: string, 
            overall_stats?: { name?: string, teamName?: string },
            player_stats?: Array<{ teamName?: string }>
          };
          const teamName = rawTeam.name ||                       // team.name
                          rawTeam.overall_stats?.name ||         // team.overall_stats.name
                          rawTeam.overall_stats?.teamName ||     // team.overall_stats.teamName
                          rawTeam.player_stats?.[0]?.teamName || // first player's teamName
                          `Team ${placement}`;                   // fallback

          // Map player stats for the team
          const playerStats = team.player_stats || [];
          return {
            teamName,
            placement,
            kills: playerStats.reduce((sum, p) => sum + (p.kills || 0), 0),
            assists: playerStats.reduce((sum, p) => sum + (p.assists || 0), 0),
            points: playerStats.reduce((sum, p) => 
              sum + (p.kills || 0) + (p.assists || 0) * 0.5, 0
            ),
            players: playerStats.map(player => {
              // Handle both name formats and add debug logging
              const rawPlayer = player as { 
                name?: string;
                playerName?: string;
                player_name?: string;
                damageDealt?: number;
                damage_dealt?: number;
              };
              
              const playerName = rawPlayer.name ||           // Original API field
                                rawPlayer.playerName ||      // Our normalized field
                                rawPlayer.player_name ||     // Snake case variation
                                'Unknown';

              return {
                playerName,
                kills: player.kills || 0,
                assists: player.assists || 0,
                damage: rawPlayer.damageDealt || rawPlayer.damage_dealt || 0,
                revives: player.revivesGiven || player.revives || 0,
                downs: 0, // Not tracked in league games
                respawns: 0  // Not tracked in league games
              };
            })
          };
        })
        .sort((a, b) => a.placement - b.placement); // Sort teams by placement

      return {
        gameNumber: game.game,
        results: gameResults
      };
    });

    // Get unique team names across all games
    const teamNames = new Set<string>();
    results.forEach(game => 
      game.results.forEach(team => 
        teamNames.add(team.teamName)
      )
    );

    // Construct the match history entry
    return {
      id: `${matchDay.season}_${matchDay.division}_${matchDay.week}`,
      seasonId: matchDay.season,
      division: matchDay.division,
      matchNumber: typeof matchDay.week === 'string' ? 
        parseInt(matchDay.week.replace(/\D/g, '')) : // Extract numbers from string
        matchDay.week,
      date: new Date().toISOString(), // TODO: Extract from matchDay if available
      teams: Array.from(teamNames),
      results
    };
  }

  onSeasonChange = (value: string): void => {
    this.selectedSeason = value;
    // Load divisions for the selected season
    this.leagueService.getDivisions(value).subscribe({
      next: (divisions: string[]) => {
        const season = this.seasons.find(s => s.id === value);
        if (season) {
          season.divisions = divisions;
          if (divisions.length > 0) {
            this.selectedDivision = divisions[0];
            this.loadMatchHistory();
          }
        }
      },
      error: (err: any) => {
        console.error('Error loading divisions:', err);
      }
    });
  };

  onDivisionChange = (value: string): void => {
    this.selectedDivision = value;
    this.loadMatchHistory();
  };

  onViewModeChange = (value: string): void => {
    this.viewMode = value;
    this.filterData();
  };

  convertToLeaderboardSeasons(seasons: FilterSeason[]): LeaderboardSeason[] {
    return seasons.map(season => ({
      id: season.id,
      name: season.name,
      divisions: season.divisions,
      status: season.status === 'in_progress' ? 'active' : season.status,
      startDate: season.startDate,
      endDate: season.endDate
    }));
  }

  private filterData(): void {
    if (this.viewMode === 'matches') {
      // Filter matches based on selected season and division
      this.filteredMatches = this.matches.filter(match => 
        (!this.selectedSeason || match.seasonId === this.selectedSeason) &&
        (!this.selectedDivision || match.division === this.selectedDivision)
      );
    }
    // Champions and leaderboards are handled by their respective components
  }
}
