import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-league-format',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="format-section">
      <div class="format-header" (click)="onToggle()">
        <h3>League Format</h3>
        <div class="expand-icon" [class.expanded]="isExpanded">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div class="format-content" [class.expanded]="isExpanded">
        <div class="format-grid">
          <div class="format-card">
            <div class="format-icon">📅</div>
            <div class="format-info">
              <h4>Regular Season</h4>
              <p>5 weeks of competitive play</p>
            </div>
          </div>
          <div class="format-card">
            <div class="format-icon">🏆</div>
            <div class="format-info">
              <h4>Match Point Finals</h4>
              <p>Championship format</p>
            </div>
          </div>
          <div class="format-card">
            <div class="format-icon">⬆️</div>
            <div class="format-info">
              <h4>Promotion/Relegation</h4>
              <p>Active between Divisions I & II only</p>
            </div>
          </div>
          <div class="format-card">
            <div class="format-icon">🎯</div>
            <div class="format-info">
              <h4>ALGS Scoring</h4>
              <p>Placement + elimination points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .format-section {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      overflow: hidden;
    }

    .format-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s ease;
    }

    .format-header:hover {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.5rem;
      margin: -0.5rem;
    }

    .format-header h3 {
      font-size: 1.5rem;
      margin: 0;
      color: var(--color-text-primary);
    }

    .expand-icon {
      color: var(--color-text-secondary);
      transition: transform 0.3s ease;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .format-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding-top 0.3s ease;
    }

    .format-content.expanded {
      max-height: 500px;
      padding-top: 1rem;
    }

    .format-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .format-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .format-card:hover {
      transform: translateY(-2px);
      border-color: var(--color-accent-primary);
    }

    .format-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .format-info {
      flex: 1;
    }

    .format-info h4 {
      font-size: 0.875rem;
      margin: 0 0 0.25rem 0;
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .format-info p {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.3;
    }

    @media (max-width: 768px) {
      .format-grid {
        grid-template-columns: 1fr;
      }
      .format-content.expanded {
        max-height: 600px;
      }
    }
  `]
})
export class LeagueFormatComponent {
  @Input() isExpanded = false;
  @Output() toggleExpanded = new EventEmitter<void>();

  onToggle(): void {
    this.toggleExpanded.emit();
  }
}
