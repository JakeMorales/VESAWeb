import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scrim, ScrimPlayerStats, NhostService } from '../../services/nhost.service';
import { DateUtilsService } from '../../services/date-utils.service';

@Component({
  selector: 'app-scrim-collapsible',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scrim-collapsible.component.html',
  styleUrl: './scrim-collapsible.component.css'
})
export class ScrimCollapsibleComponent {
  @Input() scrim!: Scrim;
  /** Shared cache managed by GamesComponent so stats survive page changes */
  @Input() statsCache!: Map<string, ScrimPlayerStats[]>;

  expanded = false;
  loadingStats = false;
  stats: ScrimPlayerStats[] = [];

  constructor(
    private nhostService: NhostService,
    private dateUtils: DateUtilsService
  ) {}

  get formattedDate(): string {
    return this.dateUtils.formatScrimDate(this.scrim.date_time_field || '');
  }

  get teamCountLabel(): string {
    if (!this.statsCache?.has(this.scrim.id)) return '—';
    const count = this.stats.length;
    if (count === 0) return '—';
    const teams = Math.round(count / 3);
    return teams > 0 ? `${teams} team${teams !== 1 ? 's' : ''}` : `${count} players`;
  }

  get skillClass(): string {
    const s = (this.scrim.skill || '').toLowerCase();
    if (s.includes('high')) return 'skill-high';
    if (s.includes('med')) return 'skill-medium';
    if (s.includes('low')) return 'skill-low';
    return 'skill-default';
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      if (this.statsCache?.has(this.scrim.id)) {
        this.stats = this.statsCache.get(this.scrim.id)!;
      } else {
        this.loadStats();
      }
    }
  }

  private loadStats() {
    this.loadingStats = true;
    this.nhostService.getScrimStats(this.scrim.id).subscribe({
      next: (stats) => {
        // Sort by score descending for leaderboard view
        this.stats = stats.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        this.statsCache?.set(this.scrim.id, this.stats);
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
      }
    });
  }
}
