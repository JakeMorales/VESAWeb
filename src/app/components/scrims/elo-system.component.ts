import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipComponent, SectionHeaderComponent } from '../ui';

@Component({
  selector: 'app-elo-system',
  standalone: true,
  imports: [CommonModule, ChipComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="01" title="VESA Rating">
        <app-chip>Beta · Calibrating</app-chip>
      </app-section-header>

      <div class="rating-grid">
        <div class="explanation panel-cell">
          <h3>How it works</h3>
          <p>
            The VESA rating tracks individual performance beyond wins and losses.
            Your rating is influenced by kills, damage, placement, team performance,
            and the strength of your lobby. It is currently in beta and calibrating
            across Season 15 — expect movement as the system settles.
          </p>
          <ul class="factors">
            <li><strong>Placement</strong> Higher placement, bigger gains</li>
            <li><strong>Kills &amp; assists</strong> Combat performance matters</li>
            <li><strong>Damage dealt</strong> Consistent output is rewarded</li>
            <li><strong>Lobby strength</strong> Beating higher-rated players pays more</li>
            <li><strong>Team performance</strong> Supporting your squad counts</li>
          </ul>
        </div>

        <div class="tiers panel-cell">
          <h3>Rating tiers</h3>
          <div class="tier-list">
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#ffd77a"></span>
              <span class="tier-name" style="color:#ffd77a">Elite</span>
              <span class="tier-range">2700+</span>
            </div>
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#b48aff"></span>
              <span class="tier-name" style="color:#b48aff">Expert</span>
              <span class="tier-range">2400–2699</span>
            </div>
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#ff2c5c"></span>
              <span class="tier-name" style="color:#ff2c5c">Veteran</span>
              <span class="tier-range">2100–2399</span>
            </div>
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#3d9bff"></span>
              <span class="tier-name" style="color:#3d9bff">Skilled</span>
              <span class="tier-range">1800–2099</span>
            </div>
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#00d4ff"></span>
              <span class="tier-name" style="color:#00d4ff">Novice</span>
              <span class="tier-range">1500–1799</span>
            </div>
            <div class="tier-item">
              <span class="tier-dot" style="--tier-color:#9a9aad"></span>
              <span class="tier-name" style="color:#9a9aad">Rookie</span>
              <span class="tier-range">0–1499</span>
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
      background: var(--tier-color);
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
}
