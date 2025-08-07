import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DivisionCardComponent, Division } from './division-card.component';

@Component({
  selector: 'app-divisions-grid',
  standalone: true,
  imports: [CommonModule, DivisionCardComponent],
  template: `
    <section class="divisions-section">
      <div class="divisions-content">
        <h2>League Divisions</h2>
        <p class="divisions-description">
          Six competitive divisions organized by skill level, each featuring 20 teams competing for championship glory.
        </p>
        
        <div class="divisions-grid">
          <app-division-card 
            *ngFor="let division of divisions" 
            [division]="division"
            [totalWeeks]="totalWeeks">
          </app-division-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .divisions-section {
      padding: 1rem 2rem 2rem 2rem;
    }

    .divisions-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .divisions-content h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
      font-weight: 700;
    }

    .divisions-description {
      text-align: center;
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 1.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .divisions-grid {
      display: grid;
      gap: 2rem;
      grid-template-columns: repeat(auto-fit, 400px);
      justify-content: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Tablet: 2 columns */
    @media (min-width: 768px) and (max-width: 1199px) {
      .divisions-grid {
        grid-template-columns: repeat(2, 400px);
        gap: 2.5rem;
        max-width: 850px;
      }
    }

    /* Desktop: 3 columns for optimal 3x2 layout */
    @media (min-width: 1200px) {
      .divisions-grid {
        grid-template-columns: repeat(3, 400px);
        gap: 2.5rem;
        max-width: 1300px;
      }
    }

    /* Large desktop: maintain 3x2 layout with more space */
    @media (min-width: 1400px) {
      .divisions-content {
        max-width: 1600px;
      }
      
      .divisions-grid {
        grid-template-columns: repeat(3, 400px);
        gap: 3rem;
        max-width: 1400px;
      }
    }

    @media (max-width: 767px) {
      .divisions-section {
        padding: 1rem 1rem 2rem 1rem;
      }
      
      .divisions-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
        max-width: none;
      }
    }
  `]
})
export class DivisionsGridComponent {
  @Input() divisions!: Division[];
  @Input() totalWeeks!: number;
}
