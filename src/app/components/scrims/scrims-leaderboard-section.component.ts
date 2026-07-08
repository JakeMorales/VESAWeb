import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrimsLeaderboardComponent, ScrimPlayer } from '../scrims-leaderboard/scrims-leaderboard.component';
import { ChipComponent, SectionHeaderComponent } from '../ui';

@Component({
  selector: 'app-scrims-leaderboard-section',
  standalone: true,
  imports: [CommonModule, ScrimsLeaderboardComponent, ChipComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="03" title="Leaderboard">
        <app-chip variant="red">Beta</app-chip>
        <app-chip variant="blue">{{ seasonLabel || 'Live' }}</app-chip>
      </app-section-header>
      <p class="calibration-note">
        VESA Rating v2 (beta) — computed from every {{ seasonLabel || 'season' }} scrim
        game and refreshed after each scrim night. Ratings are real but the system is
        still being calibrated, so numbers may shift as it tunes. Players with fewer
        than 10 season games are still placing and not shown.
      </p>
      <app-scrims-leaderboard [players]="players"></app-scrims-leaderboard>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    .block {
      padding-top: 88px;
    }
    .calibration-note {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.06em;
      color: var(--vesa-faint);
      margin: -16px 0 20px;
      max-width: 620px;
    }
    @media (max-width: 860px) {
      .block {
        padding-top: 64px;
      }
    }
  `]
})
export class ScrimsLeaderboardSectionComponent {
  @Input() players!: ScrimPlayer[];
  @Input() seasonLabel = '';
}
