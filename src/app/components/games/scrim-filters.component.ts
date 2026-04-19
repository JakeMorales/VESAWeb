import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scrim-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-controls">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search by date or match ID (e.g. 2024_07_15)..." 
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
        >
        <div class="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.05), rgba(44, 156, 255, 0.05));
      border-radius: 16px;
      border: 1px solid rgba(255, 44, 92, 0.2);
      backdrop-filter: blur(20px);
      margin-bottom: 2rem;
    }

    .search-box {
      position: relative;
      width: 100%;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-size: 1rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .search-input:focus {
      outline: none;
      border-color: #ff2c5c;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 20px rgba(255, 44, 92, 0.3);
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.6);
      pointer-events: none;
    }

    .search-input:focus + .search-icon {
      color: #ff2c5c;
    }
  `]
})
export class ScrimFiltersComponent {
  @Output() searchChange = new EventEmitter<string>();
  
  searchTerm = '';

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchChange.emit(value);
  }
}
