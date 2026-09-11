import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DivisionCardComponent, Division } from './division-card.component';
import { SectionHeaderComponent } from '../ui';

@Component({
  selector: 'app-divisions-grid',
  standalone: true,
  imports: [CommonModule, DivisionCardComponent, SectionHeaderComponent],
  template: `
    <section class="wrap divisions-section">
      <app-section-header index="01" title="Divisions" />
      <p class="meta">{{ divisions?.length ?? 0 }} active divisions this season</p>

      <div class="divisions-grid">
        <app-division-card
          *ngFor="let division of divisions"
          [division]="division"
          [totalWeeks]="totalWeeks">
        </app-division-card>
      </div>
    </section>
  `,
  styles: [`
    .divisions-section {
      padding-top: 56px;
    }

    .meta {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      margin: -16px 0 24px;
    }

    .divisions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    @media (max-width: 640px) {
      .divisions-section {
        padding-top: 40px;
      }
      .divisions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DivisionsGridComponent {
  @Input() divisions!: Division[];
  @Input() totalWeeks!: number;
}
