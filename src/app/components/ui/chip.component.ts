import { Component, Input } from '@angular/core';

/**
 * Small mono status label.
 * Blue = informational/data, red = live/priority, neutral = inactive.
 *
 *   <app-chip variant="red">Nightly</app-chip>
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 3px;
      background: var(--vesa-blue-dim);
      color: var(--vesa-blue);
      white-space: nowrap;
    }
    :host(.red) {
      background: var(--vesa-red-dim);
      color: var(--vesa-red);
    }
    :host(.neutral) {
      background: rgba(235, 235, 245, 0.07);
      color: var(--vesa-dim);
    }
  `],
  host: {
    '[class.red]': `variant === 'red'`,
    '[class.neutral]': `variant === 'neutral'`
  }
})
export class ChipComponent {
  @Input() variant: 'blue' | 'red' | 'neutral' = 'blue';
}
