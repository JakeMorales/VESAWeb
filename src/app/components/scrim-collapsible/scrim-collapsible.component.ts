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
    const match = file.match(/scrims?_(\d{4})_(\d{2})_(\d{2})/);
    if (!match) return file;
    // Filenames are stamped with the UTC upload date, which is always the
    // calendar day AFTER the evening-ET session they cover (an 8pm ET
    // session crosses into the next UTC day) — subtract a day to show the
    // date the scrims were actually played.
    const uploadDate = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
    uploadDate.setUTCDate(uploadDate.getUTCDate() - 1);
    const yyyy = uploadDate.getUTCFullYear();
    const mm = String(uploadDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(uploadDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }
}
