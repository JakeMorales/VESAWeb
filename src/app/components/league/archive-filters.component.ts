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
      margin-bottom: 32px;
    }

    .filter-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 10px 36px 10px 14px;
      border-radius: 4px;
      border: 1px solid var(--vesa-line-strong);
      background: var(--vesa-raised);
      color: var(--vesa-text);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: border-color 0.15s, background 0.15s;
      min-width: 170px;
      cursor: pointer;
      appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%239a9aad" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 0.8rem center;
      background-size: 0.55rem auto;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--vesa-blue);
      background-color: var(--vesa-blue-dim);
    }

    .filter-select:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .filter-select option {
      background: #12121e;
      color: var(--vesa-text);
      text-transform: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: center;
      }

      .filter-select {
        width: 100%;
        max-width: 320px;
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
