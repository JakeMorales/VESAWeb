import { Component } from '@angular/core';

@Component({
  selector: 'app-archive-header',
  standalone: true,
  template: `
    <div class="archive-header">
      <h1>Scores Archive</h1>
      <p>Complete historical records for all VESA League seasons and divisions</p>
    </div>
  `,
  styles: [`
    .archive-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .archive-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .archive-header p {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .archive-header h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .archive-header h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class ArchiveHeaderComponent {
}
