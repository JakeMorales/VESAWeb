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
        <div class="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by date or match ID (e.g. 2024_07_15)…"
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
        >
      </div>
    </div>
  `,
  styles: [`
    .filter-controls {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .search-box {
      position: relative;
      width: 100%;
      max-width: 440px;
    }

    .search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px 12px 40px;
      border: 1px solid var(--vesa-line-strong);
      border-radius: 4px;
      background: var(--vesa-raised);
      color: var(--vesa-text);
      font-family: var(--font-mono);
      font-size: 13px;
      transition: border-color 0.15s, background 0.15s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--vesa-blue);
      background: var(--vesa-blue-dim);
    }

    .search-input::placeholder {
      color: var(--vesa-faint);
    }

    .search-icon {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--vesa-faint);
      pointer-events: none;
      line-height: 0;
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
