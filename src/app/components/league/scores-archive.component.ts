import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Observable } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ArchiveHeaderComponent } from './archive-header.component';
import { ArchiveFiltersComponent, Season } from './archive-filters.component';
import { SeasonChampionsComponent, SeasonChampions } from './season-champions.component';
import { ArchiveMatchHistoryComponent, HistoricalMatch, MatchGameResult, GameTeamResult, Season as ArchiveSeason } from './archive-match-history-enhanced.component';
import { ModernPaginationComponent } from '../modern-pagination/modern-pagination.component';
import { LeagueService, LeagueMatchDay, DivisionSummary, StandingEntry, MatchPointChampion } from '../../services/league.service';
// Import Season type from season-leaderboards for type safety
import { SeasonStandingsComponent } from './season-standings.component';

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
    ArchiveMatchHistoryComponent,
    ModernPaginationComponent,
    SeasonStandingsComponent
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

      <!-- Match Point Champions View -->
      <app-season-champions 
        *ngIf="viewMode === 'champions'"
        [filteredChampions]="filteredChampions"
        [selectedDivision]="getDivisionDisplayName(selectedDivision)">
      </app-season-champions>

      <!-- Final Leaderboards removed -->

      <!-- Season Standings View -->
      <app-season-standings
        *ngIf="viewMode === 'standings'"
        [summary]="divisionSummary"
        [loading]="loadingStandings">
      </app-season-standings>

      <!-- Match History View -->
      <ng-container *ngIf="viewMode === 'matches'">
        <div *ngIf="loading" class="loading-indicator">Loading match data...</div>
        <div *ngIf="loadingPage && !loading" class="loading-indicator">Loading page...</div>

        <app-archive-match-history
          *ngIf="!loading"
          [filteredMatches]="pagedMatches"
          [seasons]="convertToLeaderboardSeasons(seasons)">
        </app-archive-match-history>

        <app-modern-pagination
          *ngIf="!loading && totalPages > 1"
          [page]="page"
          [totalPages]="totalPages"
          (pageChange)="setPage($event)">
        </app-modern-pagination>
      </ng-container>
    </div>
  `,
  styleUrl: './scores-archive.component.css'
})

export class ScoresArchiveComponent implements OnInit {
  seasons: FilterSeason[] = [];
  champions: SeasonChampions[] = [];

  /** All match filenames for the selected season/division (sorted) */
  matchFiles: string[] = [];
  /** Cache of already-loaded match data to avoid re-fetching on page back */
  private pageCache = new Map<string, HistoricalMatch>();
  /** Data for the currently visible page */
  pagedMatches: HistoricalMatch[] = [];

  selectedSeason: string = '';
  selectedDivision: string = '';
  viewMode: string = 'champions';

  filteredChampions: SeasonChampions[] = [];

  loading = false;
  loadingPage = false;
  loadingStandings = false;
  divisionSummary: DivisionSummary | null = null;
  page = 1;
  pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.matchFiles.length / this.pageSize);
  }

  constructor(private leagueService: LeagueService) {}

  ngOnInit() {
    this.loadLeagueData();
  }

  loadLeagueData() {
    this.leagueService.getSeasons().subscribe({
      next: (seasons: string[]) => {
        this.seasons = seasons.map(season => ({
          id: season,
          name: `Season ${season.replace('Season_', '')}`,
          startDate: '',
          endDate: '',
          status: 'completed' as const,
          divisions: []
        }));

        if (this.seasons.length > 0) {
          this.selectedSeason = this.seasons[0].id;

          this.leagueService.getDivisions(this.selectedSeason).subscribe({
            next: (divisions: string[]) => {
              this.seasons.find(s => s.id === this.selectedSeason)!.divisions = divisions;
              if (divisions.length > 0) {
                this.selectedDivision = divisions[0];
                if (this.viewMode === 'standings' || this.viewMode === 'champions') {
                  this.loadDivisionSummary();
                } else {
                  this.loadMatchFiles();
                }
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

  /** Loads division summary/summaries depending on current season/division selection. */
  loadDivisionSummary() {
    this.loadingStandings = true;
    this.divisionSummary = null;
    this.filteredChampions = [];

    const seasonIds = this.selectedSeason
      ? [this.selectedSeason]
      : this.seasons.map(s => s.id);

    this.loadAllSummaries(seasonIds, this.selectedDivision).subscribe({
      next: (summaries) => {
        // For standings we need a single specific summary
        this.divisionSummary = summaries.length === 1 ? summaries[0] : null;
        this.buildChampionsFromSummaries(summaries);
        this.loadingStandings = false;
      },
      error: () => {
        this.divisionSummary = null;
        this.loadingStandings = false;
      }
    });
  }

  /** Fan out to load all relevant summaries for the given seasons and optional division filter. */
  private loadAllSummaries(seasonIds: string[], divisionFilter: string): Observable<DivisionSummary[]> {
    return forkJoin(
      seasonIds.map(season =>
        (divisionFilter
          ? of([divisionFilter])
          : this.leagueService.getDivisions(season)
        ).pipe(
          switchMap(divs =>
            forkJoin(divs.map(div =>
              this.leagueService.getDivisionSummary(season, div).pipe(catchError(() => of(null)))
            ))
          ),
          map(summaries => summaries.filter((s): s is DivisionSummary => s !== null)),
          catchError(() => of([] as DivisionSummary[]))
        )
      )
    ).pipe(map(results => results.flat()));
  }

  /** Build `filteredChampions` from an array of summaries, grouped by season. */
  private buildChampionsFromSummaries(summaries: DivisionSummary[]) {
    const bySeason = new Map<string, DivisionSummary[]>();
    for (const s of summaries) {
      if (!bySeason.has(s.season)) bySeason.set(s.season, []);
      bySeason.get(s.season)!.push(s);
    }

    this.filteredChampions = Array.from(bySeason.entries()).map(([seasonId, divSummaries]) => {
      const champions: any = {};
      const totalPoints: any = {};
      for (const summary of divSummaries) {
        const champ = summary.matchPointChampion ?? (
          summary.matchPointFinalsStandings?.length
            ? { teamId: summary.matchPointFinalsStandings[0].teamId ?? 0, teamName: summary.matchPointFinalsStandings[0].teamName, players: [] }
            : null
        );
        if (!champ) continue;
        const divNum = parseInt(summary.division) || 1;
        const divKey = `division${divNum}` as keyof SeasonChampions['champions'];
        const ptsKey = `division${divNum}` as keyof SeasonChampions['totalPoints'];
        champions[divKey] = `${champ.teamName}${Array.isArray(champ.players) && champ.players.length ? ` (${champ.players.join(', ')})` : ''}`;
        totalPoints[ptsKey] = summary.matchPointFinalsStandings?.[0]?.points ?? 0;
      }
      return {
        seasonId,
        seasonName: seasonId.replace(/_/g, ' '),
        champions,
        totalPoints
      };
    });
  }

  /** Loads the file list for the selected season/division, then loads the first page */
  loadMatchFiles() {
    if (!this.selectedSeason || !this.selectedDivision) return;

    this.loading = true;
    this.pagedMatches = [];
    this.matchFiles = [];

    this.leagueService.getMatchFiles(this.selectedSeason, this.selectedDivision).subscribe({
      next: (files: string[]) => {
        this.matchFiles = files;
        this.loadPage(1);
      },
      error: (err: any) => {
        console.error('Error loading match files:', err);
        this.loading = false;
      }
    });
  }

  /** Loads only the match files needed for the given page, using cache for already-fetched files */
  loadPage(page: number) {
    this.page = page;
    const start = (page - 1) * this.pageSize;
    const pageFiles = this.matchFiles.slice(start, start + this.pageSize);
    const cacheKey = (file: string) => `${this.selectedSeason}_${this.selectedDivision}_${file}`;

    const toFetch = pageFiles.filter(f => !this.pageCache.has(cacheKey(f)));

    if (toFetch.length === 0) {
      this.pagedMatches = pageFiles.map(f => this.pageCache.get(cacheKey(f))!);
      this.loading = false;
      this.loadingPage = false;
      return;
    }

    this.loadingPage = true;
    forkJoin(
      toFetch.map(file =>
        this.leagueService.getMatchDay(this.selectedSeason, this.selectedDivision, file).pipe(
          map(matchDay => ({
            file,
            match: matchDay ? this.convertToHistoricalMatch(matchDay) : null
          })),
          catchError(() => of({ file, match: null as HistoricalMatch | null }))
        )
      )
    ).subscribe({
      next: results => {
        results.forEach(r => {
          if (r.match) {
            this.pageCache.set(cacheKey(r.file), r.match);
          }
        });
        this.pagedMatches = pageFiles
          .map(f => this.pageCache.get(cacheKey(f)))
          .filter((m): m is HistoricalMatch => m != null);
        this.loading = false;
        this.loadingPage = false;
      },
      error: () => {
        this.loading = false;
        this.loadingPage = false;
      }
    });
  }

  setPage(page: number) {
    this.loadPage(page);
  }

  private convertToHistoricalMatch(matchDay: LeagueMatchDay): HistoricalMatch {
    const results: MatchGameResult[] = matchDay.stats.games.map(game => {
      const gameResults: GameTeamResult[] = game.teams
        .map((team, teamIndex) => {
          const placement = team.overall_stats?.teamPlacement || teamIndex + 1;
          
          const rawTeam = team as { 
            name?: string, 
            overall_stats?: { name?: string, teamName?: string },
            player_stats?: Array<{ teamName?: string }>
          };
          const teamName = rawTeam.name ||
                          rawTeam.overall_stats?.name ||
                          rawTeam.overall_stats?.teamName ||
                          rawTeam.player_stats?.[0]?.teamName ||
                          `Team ${placement}`;

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
              const rawPlayer = player as { 
                name?: string;
                playerName?: string;
                player_name?: string;
                damageDealt?: number;
                damage_dealt?: number;
              };
              
              const playerName = rawPlayer.name ||
                                rawPlayer.playerName ||
                                rawPlayer.player_name ||
                                'Unknown';

              return {
                playerName,
                kills: player.kills || 0,
                assists: player.assists || 0,
                damage: rawPlayer.damageDealt || rawPlayer.damage_dealt || 0,
                revives: player.revivesGiven || player.revives || 0,
                downs: 0,
                respawns: 0
              };
            })
          };
        })
        .sort((a, b) => a.placement - b.placement);

      return {
        gameNumber: game.game,
        mapName: game.mapName,
        results: gameResults
      };
    });

    const weekLabel = typeof matchDay.week === 'string'
      ? matchDay.week.replace(/_/g, ' ')
      : `Week ${matchDay.week}`;

    const teamNames = new Set<string>();
    results.forEach(game => 
      game.results.forEach(team => 
        teamNames.add(team.teamName)
      )
    );

    return {
      id: `${matchDay.season}_${matchDay.division}_${matchDay.week}`,
      seasonId: matchDay.season,
      division: matchDay.division,
      week: weekLabel,
      matchNumber: typeof matchDay.week === 'string' ? 
        parseInt(matchDay.week.replace(/\D/g, '')) :
        matchDay.week,
      date: new Date().toISOString(),
      teams: Array.from(teamNames),
      results
    };
  }

  onSeasonChange = (value: string): void => {
    this.selectedSeason = value;
    // If user selected All Seasons while viewing matches/standings, keep view but default division to 1
    if (!value && (this.viewMode === 'matches' || this.viewMode === 'standings')) {
      this.selectedDivision = '1';
    } else {
      this.selectedDivision = '';
    }
    if (this.viewMode === 'standings' || this.viewMode === 'champions') {
      this.loadDivisionSummary();
    } else {
      if (!value) return; // need specific season for match history
      this.leagueService.getDivisions(value).subscribe({
        next: (divisions: string[]) => {
          const season = this.seasons.find(s => s.id === value);
          if (season) season.divisions = divisions;
          if (divisions.length > 0) {
            this.selectedDivision = divisions[0];
            this.loadMatchFiles();
          }
        },
        error: (err: any) => console.error('Error loading divisions:', err)
      });
    }
  };

  onDivisionChange = (value: string): void => {
    this.selectedDivision = value;
    // Broad selection — force champions view
    if (!value && (this.viewMode === 'matches' || this.viewMode === 'standings')) {
      this.viewMode = 'champions';
    }
    if (this.viewMode === 'standings' || this.viewMode === 'champions') {
      this.loadDivisionSummary();
    } else {
      this.loadMatchFiles();
    }
  };

  onViewModeChange = (value: string): void => {
    this.viewMode = value;
    // If switching into matches/standings while no specific division is selected, default to division 1
    if ((value === 'standings' || value === 'matches') && !this.selectedDivision) {
      this.selectedDivision = '1';
    }
    if (value === 'standings' || value === 'champions') {
      this.loadDivisionSummary();
    } else {
      this.loadMatchFiles();
    }
  };

  convertToLeaderboardSeasons(seasons: FilterSeason[]): ArchiveSeason[] {
    return seasons.map(season => ({
      id: season.id,
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      status: season.status === 'in_progress' ? 'active' : (season.status as 'completed' | 'active' | 'upcoming')
    }));
  }

  getDivisionDisplayName(div: string): string {
    if (!div) return '';
    const map: Record<string, string> = {
      '1': 'Pinnacle',
      '2': 'Vanguard',
      '3': 'Ascendant',
      '4': 'Emergent',
      '5': 'Challengers',
      '6': 'Contenders'
    };
    return map[div] ?? '';
  }
}
