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
  /** Filenames for the current server page (sorted newest first) */
  scrimFiles: string[] = [];
  /** Cache of already-loaded match data to avoid re-fetching on page back */
  private pageCache = new Map<string, MatchDayResults>();
  /** Data for the currently visible page */
  pagedScrims: { file: string, matchResults: MatchDayResults }[] = [];

  loading = true;
  loadingPage = false;
  error = '';
  viewMode: 'current' | 'archive' = 'current';
  page = 1;
  pageSize = 10;

  hasMore = false;
  get totalPages() {
    // If there's more, allow one more page; otherwise current page is last
    return this.hasMore ? this.page + 1 : this.page;
  }

  constructor(private scrimsDataService: ScrimsDataService) {}

  ngOnInit() {
    // Load first page of filenames from server
    this.loadPage(1);
  }

  /** Loads only the files needed for the given page, using cache for already-fetched files. */
  loadPage(page: number) {
    this.page = page;
    this.loadingPage = true;
    this.scrimsDataService.getScrimFiles(page, this.pageSize).subscribe({
      next: resp => {
        this.scrimFiles = resp.files;
        this.hasMore = resp.hasMore;
        const pageFiles = this.scrimFiles;
        const toFetch = pageFiles.filter(f => !this.pageCache.has(f));

        if (toFetch.length === 0) {
          this.pagedScrims = pageFiles.map(f => ({ file: f, matchResults: this.pageCache.get(f)! }));
          this.loading = false;
          this.loadingPage = false;
          return;
        }

        forkJoin(
          toFetch.map(file =>
            this.scrimsDataService.getScrimMatchResults(file).pipe(
              map(matchResults => ({ file, matchResults })),
              catchError(() => of({ file, matchResults: {} as MatchDayResults }))
            )
          )
        ).subscribe({
          next: results => {
            results.forEach(r => this.pageCache.set(r.file, r.matchResults));
            this.pagedScrims = pageFiles.map(f => ({ file: f, matchResults: this.pageCache.get(f) ?? {} as MatchDayResults }));
            this.loading = false;
            this.loadingPage = false;
          },
          error: () => {
            this.error = 'Failed to load scrim data.';
            this.loading = false;
            this.loadingPage = false;
          }
        });
      },
      error: () => {
        this.error = 'Failed to load scrim files.';
        this.loading = false;
        this.loadingPage = false;
      }
    });
  }

  setPage(page: number) {
    this.loadPage(page);
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    // Search is only applied to current page of filenames
    if (!term.trim()) {
      // nothing to do; reload current page
      this.loadPage(1);
      return;
    }
    const lower = term.toLowerCase();
    this.scrimFiles = this.scrimFiles.filter(f => f.toLowerCase().includes(lower));
    this.loadPage(1);
  }
}
