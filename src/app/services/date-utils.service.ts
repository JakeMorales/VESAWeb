import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  /**
   * Format a UTC ISO timestamp string for display in the user's local timezone.
   * Output format: "Sat, Jun 21 · 8:00 PM EDT"
   */
  formatScrimDate(utcString: string): string {
    if (!utcString) {
      return 'Unknown Date';
    }
    try {
      const date = new Date(utcString);
      if (isNaN(date.getTime())) {
        return utcString;
      }
      const formatted = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }).format(date);
      // Replace the last comma (before the time) with " ·" for a nicer separator
      // e.g. "Sat, Jun 21, 8:00 PM EDT" → "Sat, Jun 21 · 8:00 PM EDT"
      return formatted.replace(/,([^,]*)$/, ' ·$1');
    } catch {
      return utcString;
    }
  }
}
