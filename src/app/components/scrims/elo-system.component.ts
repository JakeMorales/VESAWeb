import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipComponent, SectionHeaderComponent } from '../ui';
import { ELO_TIERS, tierRangeLabel } from '../../services/elo/elo-tiers';

@Component({
  selector: 'app-elo-system',
  standalone: true,
  imports: [CommonModule, ChipComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="02" title="VESA Rating">
        <app-chip variant="red">Beta</app-chip>
        <app-chip>Live · Seasonal</app-chip>
      </app-section-header>

      <div class="rating-grid">
        <div class="explanation panel-cell">
          <h3>How it works</h3>
          <p>
            The VESA rating scores every game by how you performed against the
            whole lobby — then moves your rating only when you do better or
            worse than your rating predicted. Beating a stacked lobby pays more
            than farming a weak one, and playing more games doesn't inflate
            your number. Ratings reset each Apex season; your first ~10 games
            place you, carrying momentum from previous seasons. The system is
            in beta — tier bands and scoring may still be tuned, and ratings
            can shift when they are.
          </p>
          <ul class="factors">
            <li><strong>Placement</strong> Tiered like ALGS — the biggest single factor</li>
            <li><strong>Kills &amp; assists</strong> Combat performance matters</li>
            <li><strong>Damage dealt</strong> Consistent output is rewarded</li>
            <li><strong>Revives</strong> Supporting your squad counts</li>
            <li><strong>Lobby strength</strong> Expectations come from every opponent's rating</li>
          </ul>
        </div>

        <div class="tiers panel-cell">
          <h3>Rating tiers</h3>
          <div class="tier-list">
            <div class="tier-item" *ngFor="let tier of tiers">
              <span class="tier-dot" [style.background]="tier.color"></span>
              <span class="tier-name" [style.color]="tier.color">{{ tier.name }}</span>
              <span class="tier-range">{{ rangeLabel(tier) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    .block {
      padding-top: 88px;
    }

    .rating-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1px;
      background: var(--vesa-line);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .panel-cell {
      background: var(--vesa-panel);
      padding: 28px;
    }

    h3 {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 12px;
    }
    .explanation p {
      color: var(--vesa-dim);
      font-size: 14px;
      line-height: 1.7;
      margin: 0 0 20px;
    }

    .factors {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .factors li {
      display: flex;
      align-items: baseline;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--vesa-line);
      color: var(--vesa-dim);
      font-size: 13px;
    }
    .factors li:last-child {
      border-bottom: none;
    }
    .factors strong {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-blue);
      flex-shrink: 0;
      min-width: 150px;
    }

    .tier-list {
      display: flex;
      flex-direction: column;
    }
    .tier-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 4px;
      border-bottom: 1px solid var(--vesa-line);
    }
    .tier-item:last-child {
      border-bottom: none;
    }
    .tier-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tier-name {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      flex: 1;
    }
    .tier-range {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-size: 12px;
      color: var(--vesa-faint);
    }

    @media (max-width: 860px) {
      .rating-grid {
        grid-template-columns: 1fr;
      }
      .block {
        padding-top: 64px;
      }
      .factors strong {
        min-width: 120px;
      }
    }
  `]
})
export class EloSystemComponent {
  readonly tiers = ELO_TIERS;
  readonly rangeLabel = tierRangeLabel;
}
