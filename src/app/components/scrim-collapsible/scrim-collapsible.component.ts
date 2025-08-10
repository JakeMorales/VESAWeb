import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchDayResults } from '../../models/match-day-results.model';
import { MatchDayTableComponent } from '../match/match-day-table.component';

@Component({
  selector: 'app-scrim-collapsible',
  standalone: true,
  imports: [CommonModule, MatchDayTableComponent],
  templateUrl: './scrim-collapsible.component.html',
  styleUrl: './scrim-collapsible.component.css'
})
export class ScrimCollapsibleComponent {
  @Input() file!: string;
  @Input() matchResults!: MatchDayResults;
  expanded = false;

  getScrimDate(file: string): string {
    const match = file.match(/scrim_(\d{4})_(\d{2})_(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return file;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }
}
