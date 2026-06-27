import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ScrimFiltersComponent } from '../../components/games/scrim-filters.component';
import { ScoresArchiveComponent } from '../../components/league/scores-archive.component';
import { ScrimCollapsibleComponent } from '../../components/scrim-collapsible/scrim-collapsible.component';
import { ModernPaginationComponent } from '../../components/modern-pagination/modern-pagination.component';
import { ScrimsDataService } from '../../services/scrims-data.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { Scrim, ScrimPlayerStats } from '../../services/nhost.service';

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

  viewMode: 'current' | 'archive' = 'current';
  searchTerm = '';

  /** Full in-memory index of all scrims, sorted newest-first */
  allScrims: Scrim[] = [];
  /** Filtered subset used for pagination */
  filteredScrims: Scrim[] = [];
  /** Current page slice shown in the UI */
  pagedScrims: Scrim[] = [];
  /** Cache of lazy-loaded player stats per scrim_id; shared with collapsible components */
  statsCache = new Map<string, ScrimPlayerStats[]>();

  loading = true;
  error = '';
  page = 1;
  readonly pageSize = 10;

  get totalItems(): number {
    return this.filteredScrims.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  constructor(
    private scrimsDataService: ScrimsDataService,
    private dateUtils: DateUtilsService
  ) {}

  ngOnInit() {
    this.loadAllScrims();
  }

  private loadAllScrims() {
    this.loading = true;
    this.error = '';
    this.scrimsDataService.getAllScrims().subscribe({
      next: (scrims) => {
        this.allScrims = scrims;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        const msg: string = err?.message ?? String(err);
        if (msg.includes('not found in type')) {
          this.error = 'Hasura permissions not yet configured for the anon role — scrims data cannot be loaded. See PR #45 for the required table grants.';
        } else {
          this.error = 'Failed to load scrims. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Filter allScrims by search term (date string + skill) then re-paginate.
   */
  private applyFilter() {
    const lower = this.searchTerm.toLowerCase().trim();
    if (!lower) {
      this.filteredScrims = [...this.allScrims];
    } else {
      this.filteredScrims = this.allScrims.filter(s => {
        const dateStr = this.dateUtils.formatScrimDate(s.date_time_field || '').toLowerCase();
        const skill = (s.skill || '').toLowerCase();
        return dateStr.includes(lower) || skill.includes(lower);
      });
    }
    this.setPage(1);
  }

  setPage(page: number) {
    this.page = page;
    const start = (page - 1) * this.pageSize;
    this.pagedScrims = this.filteredScrims.slice(start, start + this.pageSize);
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.applyFilter();
  }
}
