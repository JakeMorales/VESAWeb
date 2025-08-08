import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-states',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Loading more players...</span>
    </div>
    
    <div *ngIf="hasMorePlayers && !isLoading" class="load-more-trigger">
      <span>Scroll down to load more players</span>
    </div>
  `,
  styles: [`
    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      color: var(--color-text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 44, 92, 0.3);
      border-top: 3px solid var(--color-accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .load-more-trigger {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }
  `]
})
export class LoadingStatesComponent {
  @Input() isLoading: boolean = false;
  @Input() hasMorePlayers: boolean = true;
}
