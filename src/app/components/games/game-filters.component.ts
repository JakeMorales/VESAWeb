import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-controls">
      <select (change)="onMapChange($event)" class="filter-select">
        <option value="">All Maps</option>
        <option value="World's Edge">World's Edge</option>
        <option value="Kings Canyon">Kings Canyon</option>
        <option value="Olympus">Olympus</option>
        <option value="Storm Point">Storm Point</option>
      </select>
      
      <select (change)="onModeChange($event)" class="filter-select">
        <option value="">All Modes</option>
        <option value="Ranked">Ranked</option>
        <option value="Scrimmage">Scrimmage</option>
        <option value="Tournament">Tournament</option>
      </select>
      
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search by player or team..." 
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
        >
        <small>Search functionality will be added soon</small>
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
      padding: 2rem;
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.05), rgba(44, 156, 255, 0.05));
      border-radius: 16px;
      border: 1px solid rgba(255, 44, 92, 0.2);
      backdrop-filter: blur(20px);
    }
    .filter-select, .search-input {
      padding: 1rem 1.5rem;
      border: 2px solid rgba(255, 44, 92, 0.3);
      border-radius: 12px;
      font-size: 1rem;
      background: rgba(10, 10, 10, 0.8);
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    .filter-select {
      cursor: pointer;
    }
    .filter-select option {
      background: #1a1a1a;
      color: white;
    }
    .search-input {
      width: 280px;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    .filter-select:focus, .search-input:focus {
      outline: none;
      border-color: #ff2c5c;
      box-shadow: 0 0 20px rgba(255, 44, 92, 0.3);
    }
    .search-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .search-box small {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      text-align: center;
    }
    @media (max-width: 768px) {
      .filter-controls { 
        flex-direction: column; 
        gap: 1rem;
        padding: 1.5rem;
      }
      .search-input { 
        width: 100%; 
      }
    }
  `]
})
export class GameFiltersComponent {
  @Output() mapChange = new EventEmitter<string>();
  @Output() modeChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  searchTerm = '';

  onMapChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.mapChange.emit(target.value);
  }

  onModeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.modeChange.emit(target.value);
  }

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }
}
