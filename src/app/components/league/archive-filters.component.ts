import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeagueSeason } from '../../models/season.model';
export type Season = LeagueSeason;

@Component({
  selector: 'app-archive-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-section">
      <div class="filter-row">
        <select [(ngModel)]="selectedSeason" (ngModelChange)="onSeasonChange()" class="filter-select">
          <option value="">All Seasons</option>
          <option *ngFor="let season of seasons" [value]="season.id">
            {{ season.name }}
          </option>
        </select>

        <select [(ngModel)]="viewMode" (ngModelChange)="onViewModeChange()" class="filter-select">
          <option value="matches" [disabled]="!selectedSeason || !selectedDivision">Match History</option>
          <option value="standings" [disabled]="!selectedSeason || !selectedDivision">Season Standings</option>
          <option value="champions">Match Point Champions</option>
        </select>

        <select [(ngModel)]="selectedDivision" (ngModelChange)="onDivisionChange()" class="filter-select" [disabled]="!selectedSeason && viewMode !== 'champions'">
          <option value="">All Divisions</option>
          <option *ngFor="let division of getSelectedSeasonDivisions()" [value]="division">
            Division {{ division }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filter-section {
      margin-bottom: 3rem;
    }

    .filter-row {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.4);
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 500;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      min-width: 150px;
      appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 0.7rem center;
      background-size: 0.65rem auto;
      padding-right: 2.5rem;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb), 0.2);
      background: rgba(0, 0, 0, 0.6);
    }

    .filter-select option {
      background: #1a1a1a;
      color: #ffffff;
      padding: 0.5rem;
      border: none;
    }

    .filter-select option:hover,
    .filter-select option:checked {
      background: var(--color-accent-primary);
      color: #ffffff;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: center;
      }

      .filter-select {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class ArchiveFiltersComponent {
  @Input() seasons: Season[] = [];
  @Input() selectedSeason: string = '';
  @Input() selectedDivision: string = '';
  @Input() viewMode: string = 'matches'; // Default to match history view

  @Output() seasonChange = new EventEmitter<string>();
  @Output() divisionChange = new EventEmitter<string>();
  @Output() viewModeChange = new EventEmitter<string>();

  getSelectedSeasonDivisions(): string[] {
    if (!this.selectedSeason) return ['1','2','3','4','5','6'];
    const season = this.seasons.find(s => s.id === this.selectedSeason);
    return season ? season.divisions : [];
  }

  onSeasonChange() {
    this.selectedDivision = ''; // Reset division when season changes
    this.seasonChange.emit(this.selectedSeason);
  }

  onDivisionChange() {
    this.divisionChange.emit(this.selectedDivision);
  }

  onViewModeChange() {
    this.viewModeChange.emit(this.viewMode);
  }
}
