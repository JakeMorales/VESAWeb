import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-controls">
      <select (change)="onSortChange($event)" class="sort-select">
        <option value="elo">Sort by ELO</option>
        <option value="kills">Sort by Total Kills</option>
        <option value="winRate">Sort by Win Rate</option>
        <option value="gamesPlayed">Sort by Games Played</option>
        <option value="averageKills">Sort by Avg Kills</option>
      </select>
      
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search players..." 
          class="search-input"
          [value]="searchTerm"
          (input)="onSearchChange($event)"
        >
      </div>
    </div>
  `,
  styles: [`
    .filter-controls {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .sort-select {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
    }

    .sort-select:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 2px rgba(255, 44, 92, 0.2);
    }

    .search-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-input {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
      min-width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 2px rgba(255, 44, 92, 0.2);
    }

    .search-input::placeholder {
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .filter-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .search-input {
        min-width: 200px;
      }
    }
  `]
})
export class PlayerFiltersComponent {
  @Input() searchTerm: string = '';
  @Output() sortChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortChange.emit(target.value);
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }
}
