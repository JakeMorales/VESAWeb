import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ChipComponent, IconComponent, SectionHeaderComponent } from '../ui';

/**
 * "Programs" section — the three things VESA runs: League, Scrims, Ratings.
 */
@Component({
  selector: 'app-features-showcase',
  standalone: true,
  imports: [RouterModule, ChipComponent, IconComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="01" title="Programs" />
      <div class="modules">
        <a class="module" routerLink="/league">
          <app-icon name="target" [size]="30" />
          <h3>League</h3>
          <p>
            Six competitive divisions, six-week seasons, and a Match Point
            finale. Full standings and per-game breakdowns for every match day.
          </p>
        </a>
        <a class="module" routerLink="/scrims">
          <app-icon name="radar" [size]="30" />
          <h3>Scrims <app-chip variant="red">Nightly</app-chip></h3>
          <p>
            Practice lobbies with the same stat capture as league play.
            Weekly leaderboards keep every session competitive.
          </p>
        </a>
        @if (environment.features.ratingsLeaderboard) {
          <a class="module" routerLink="/ratings">
            <app-icon name="chart" [size]="30" />
            <h3>Ratings <app-chip>Calibrating</app-chip></h3>
            <p>
              An MMR built from every game you play — kills, placement, and
              strength of lobby. Rolling out across Season 15.
            </p>
          </a>
        } @else {
          <div class="module">
            <app-icon name="chart" [size]="30" />
            <h3>Ratings <app-chip>Calibrating</app-chip></h3>
            <p>
              An MMR built from every game you play — kills, placement, and
              strength of lobby. Rolling out across Season 15.
            </p>
          </div>
        }
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
    .modules {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--vesa-line);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .module {
      background: var(--vesa-panel);
      padding: 28px;
      text-decoration: none;
      transition: background 0.15s;
    }
    a.module:hover,
    a.module:focus-visible {
      background: var(--vesa-raised);
    }
    app-icon {
      color: var(--vesa-blue);
      margin-bottom: 18px;
    }
    h3 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: var(--vesa-dim);
      font-size: 14px;
      margin: 0;
    }
    @media (max-width: 860px) {
      .modules {
        grid-template-columns: 1fr;
      }
      .block {
        padding-top: 64px;
      }
    }
  `]
})
export class FeaturesShowcaseComponent {
  protected readonly environment = environment;
}
