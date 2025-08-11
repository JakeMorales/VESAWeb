import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  /**
   * Format scrim date for display
   */
  formatScrimDate(dateString: string): string {
    if (!dateString) {
      return 'Unknown Date';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString();
  }
}
