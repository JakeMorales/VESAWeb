import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent, StatStripComponent, StatItem } from '../ui';

export interface StatsData {
  matchesPlayed: number;
  gamesPlayed: number;
  uniquePlayers: number;
  totalPlaytime: string;
}

@Component({
  selector: 'app-detailed-stats',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, StatStripComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="02" title="By the numbers" />
      <div class="groups">
        <div class="group">
          <p class="eyebrow"><span class="tick">▸</span> LEAGUE — LIFETIME</p>
          <app-stat-strip [stats]="toItems(leagueStats)" />
        </div>
        <div class="group">
          <p class="eyebrow"><span class="tick">▸</span> SCRIMS — LIFETIME</p>
          <app-stat-strip [stats]="toItems(scrimsStats)" />
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
    .groups {
      display: grid;
      gap: 28px;
    }
    .eyebrow {
      margin: 0 0 10px;
    }
    @media (max-width: 860px) {
      .block {
        padding-top: 64px;
      }
    }
  `]
})
export class DetailedStatsComponent {
  @Input() leagueStats!: StatsData;
  @Input() scrimsStats!: StatsData;

  toItems(stats: StatsData): StatItem[] {
    return [
      { label: 'Matches played', value: stats.matchesPlayed.toLocaleString() },
      { label: 'Games played', value: stats.gamesPlayed.toLocaleString() },
      { label: 'Unique players', value: stats.uniquePlayers.toLocaleString() },
      { label: 'Total playtime', value: stats.totalPlaytime }
    ];
  }
}
