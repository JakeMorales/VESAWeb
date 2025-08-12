import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ScrimFiltersComponent } from '../../components/games/scrim-filters.component';
import { ScoresArchiveComponent } from '../../components/league/scores-archive.component';
import { ScrimCollapsibleComponent } from '../../components/scrim-collapsible/scrim-collapsible.component';
import { ModernPaginationComponent } from '../../components/modern-pagination/modern-pagination.component';
import { MatchDayResults } from '../../models/match-day-results.model';
import { ScrimsDataService } from '../../services/scrims-data.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, ScrimFiltersComponent, ScoresArchiveComponent, ScrimCollapsibleComponent, ModernPaginationComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('350ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateY(-24px)' }))
      ])
    ])
  ]
})
export class GamesComponent implements OnInit {
  selectorAnimating: 'none' | 'forward' | 'reverse' = 'none';
  set viewModeSetter(val: 'current' | 'archive') {
    if (this.viewMode !== val) {
      this.selectorAnimating = (val === 'archive') ? 'forward' : 'reverse';
      setTimeout(() => this.selectorAnimating = 'none', 450);
    }
    this.viewMode = val;
  }
  searchTerm = '';
  scrimFiles: string[] = [
    // Add all scrim files here. For brevity, we'll use a wildcard loader in a real app, but for now, list a sample or generate dynamically if possible.
    'scrim_2024_07_03_id_7058.json',
    'scrim_2024_07_03_id_7059.json',
    'scrim_2024_07_04_id_7100.json',
    'scrim_2024_07_08_id_7174.json',
    'scrim_2024_07_10_id_7215.json',
    'scrim_2024_08_09_id_7932.json',
    'scrim_2024_08_16_id_8041.json',
    'scrim_2024_08_23_id_8178.json',
    'scrim_2024_09_03_id_8328.json',
    'scrim_2024_09_05_id_8368.json',
    'scrim_2024_09_05_id_8369.json',
    'scrim_2024_09_19_id_8655.json',
    'scrim_2024_09_19_id_8656.json',
    'scrim_2024_09_20_id_8672.json',
    'scrim_2024_09_21_id_8718.json',
    'scrim_2024_09_23_id_8766.json',
    'scrim_2024_09_25_id_8806.json',
    'scrim_2024_09_29_id_8903.json',
    'scrim_2024_09_30_id_8934.json',
    'scrim_2024_10_01_id_8958.json',
    'scrim_2024_10_01_id_8960.json',
    'scrim_2024_10_04_id_9068.json',
    'scrim_2024_10_14_id_9333.json',
    'scrim_2024_10_24_id_9669.json',
    'scrim_2024_10_26_id_9751.json',
    'scrim_2024_10_30_id_9820.json',
    'scrim_2024_10_30_id_9822.json',
    'scrim_2024_10_31_id_9843.json',
    'scrim_2024_10_31_id_9846.json',
    'scrim_2024_10_31_id_9848.json',
    'scrim_2024_11_01_id_9861.json',
    'scrim_2024_11_04_id_9910.json',
    'scrim_2024_11_05_id_9925.json',
    // ...add more as needed or automate this in production
  ];
  scrimsTables: { file: string, matchResults: MatchDayResults }[] = [];
  filteredScrims: { file: string, matchResults: MatchDayResults }[] = [];
  pagedScrims: { file: string, matchResults: MatchDayResults }[] = [];
  loading = true;
  error = '';
  viewMode: 'current' | 'archive' = 'current';
  page = 1;
  pageSize = 10;
  get totalPages() {
    return Math.ceil(this.scrimsTables.length / this.pageSize);
  }

  constructor(private scrimsDataService: ScrimsDataService) {}

  ngOnInit() {
    this.loadScrimsTables();
  }

  loadScrimsTables() {
    this.loading = true;
    this.error = '';
    // Load all scrim files in parallel using ScrimsDataService
    const scrimObservables = this.scrimFiles.map(file =>
      this.scrimsDataService.getScrimMatchResults(file).pipe(
        map(matchResults => ({ file, matchResults })),
        catchError(() => of({ file, matchResults: {} as MatchDayResults }))
      )
    );
    forkJoin(scrimObservables).subscribe({
      next: (results) => {
        this.scrimsTables = results;
        this.applyFilter();
        this.setPage(1);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load scrim tables.';
        this.loading = false;
      }
    });
  }

  setPage(page: number) {
    this.page = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedScrims = this.filteredScrims.slice(start, end);
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.applyFilter();
    this.setPage(1);
  }

  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredScrims = [...this.scrimsTables];
      return;
    }
    const lower = this.searchTerm.toLowerCase();
    this.filteredScrims = this.scrimsTables.filter(scrim => {
      const matchResults = scrim.matchResults;
      // matchResults is a dictionary: { [gameNumber: number]: TeamGameResult[] }
      for (const gameKey in matchResults) {
        const teams = matchResults[gameKey];
        for (const team of teams) {
          if (team.teamName?.toLowerCase().includes(lower)) {
            return true;
          }
          for (const player of team.players || []) {
            if (player.playerName?.toLowerCase().includes(lower)) {
              return true;
            }
          }
        }
      }
      return false;
    });
  }

  // All mock data, filtering, and statistics logic has been removed. This component now only loads and displays real scrim tables.

  // The following methods and properties are now obsolete and should be removed:
  // - filterGames, filteredGames, filterMap, filterMode, searchTerm, displayedCount
  // - loadScrimSessions, scrimSessions, filteredScrimSessions
  // - updateStats, gameStats, getAverageKills, getAverageDuration, getMostPopularMap
  // - generateMockData, games
  // Remove all of them below:

  // (All obsolete methods and properties have been removed. Only scrimsTables loading and display logic remains.)
}
