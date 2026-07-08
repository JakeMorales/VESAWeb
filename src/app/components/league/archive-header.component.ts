import { Component } from '@angular/core';

@Component({
  selector: 'app-archive-header',
  standalone: true,
  template: `
    <div class="archive-header">
      <p class="eyebrow"><span class="tick">▸</span> LEAGUE RECORDS · EVERY SEASON ON FILE</p>
      <h2>League archive</h2>
      <p class="sub">Complete historical records for every VESA League season and division.</p>
    </div>
  `,
  styles: [`
    .archive-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .archive-header h2 {
      font-family: var(--font-display);
      font-size: clamp(26px, 4vw, 38px);
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 12px 0 8px;
    }

    .sub {
      font-size: 14px;
      color: var(--vesa-dim);
      margin: 0;
    }
  `]
})
export class ArchiveHeaderComponent {
}
