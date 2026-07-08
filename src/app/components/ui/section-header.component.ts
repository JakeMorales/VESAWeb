import { Component, Input } from '@angular/core';

/**
 * Section heading: optional mono index, condensed title, hairline rule
 * with a red tick. Projected content lands to the right of the rule
 * (e.g. a "View all" link).
 *
 *   <app-section-header index="01" title="Programs" />
 */
@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <div class="sec-head">
      @if (index) {
        <span class="idx"><span class="tick">{{ index }}</span></span>
      }
      <h2>{{ title }}</h2>
      <div class="rule"></div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .sec-head {
      display: flex;
      align-items: baseline;
      gap: 20px;
      margin-bottom: 32px;
    }
    .idx {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.24em;
      flex-shrink: 0;
    }
    .idx .tick {
      color: var(--vesa-red);
    }
    h2 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 34px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1;
      margin: 0;
      color: var(--vesa-text);
      text-wrap: balance;
    }
    .rule {
      flex: 1;
      height: 1px;
      background: var(--vesa-line);
      position: relative;
      align-self: center;
      min-width: 40px;
    }
    .rule::before {
      content: '';
      position: absolute;
      right: 0;
      top: -2px;
      width: 28px;
      height: 5px;
      background: var(--vesa-red);
    }
    @media (max-width: 768px) {
      h2 {
        font-size: 27px;
      }
      .sec-head {
        gap: 14px;
        margin-bottom: 24px;
      }
    }
  `]
})
export class SectionHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() index?: string;
}
