import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, SectionHeaderComponent } from '../ui';

@Component({
  selector: 'app-scrim-format',
  standalone: true,
  imports: [CommonModule, IconComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="02" title="Format &amp; rules" />
      <div class="modules">
        <div class="module">
          <app-icon name="target" [size]="30" />
          <h3>Match structure</h3>
          <ul>
            <li>20 teams per lobby (60 players)</li>
            <li>Best of 6 games per session</li>
            <li>ALGS tournament settings</li>
            <li>Skill-based matchmaking</li>
          </ul>
        </div>
        <div class="module">
          <app-icon name="clock" [size]="30" />
          <h3>Schedule</h3>
          <ul>
            <li>Daily sessions at 8PM EST</li>
            <li>Weekend tournaments</li>
            <li>Special events monthly</li>
            <li>Open registration system</li>
          </ul>
        </div>
        <div class="module">
          <app-icon name="chart" [size]="30" />
          <h3>Tracking</h3>
          <ul>
            <li>Rating updates after every session</li>
            <li>Detailed match analytics</li>
            <li>Performance trends</li>
            <li>Leaderboard rankings</li>
          </ul>
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
    .modules {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--vesa-line);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .module {
      background: var(--vesa-panel);
      padding: 28px;
      transition: background 0.15s;
    }
    .module:hover {
      background: var(--vesa-raised);
    }
    app-icon {
      color: var(--vesa-blue);
      display: inline-flex;
      margin-bottom: 18px;
    }
    h3 {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 14px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      position: relative;
      padding: 7px 0 7px 18px;
      color: var(--vesa-dim);
      font-size: 14px;
      line-height: 1.5;
    }
    li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: var(--vesa-red);
      font-size: 11px;
      top: 10px;
    }

    @media (max-width: 860px) {
      .modules {
        grid-template-columns: 1fr;
      }
      .block {
        padding-top: 64px;
      }
    }
  `]
})
export class ScrimFormatComponent {
}
