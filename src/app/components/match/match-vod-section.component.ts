import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchEmbedComponent } from '../league/twitch-embed.component';

/**
 * VOD player for a completed match day. Shows the Twitch VOD assigned in
 * public/data/league/vods.json, or a placeholder while admins haven't set one.
 */
@Component({
  selector: 'app-match-vod-section',
  standalone: true,
  imports: [CommonModule, TwitchEmbedComponent],
  template: `
    <section class="match-vod-section">
      <div class="match-vod-content">
        <div class="match-vod-header">
          <h2>Match VOD</h2>
          <span class="vod-indicator" *ngIf="vodUrl">VOD</span>
        </div>
        <app-twitch-embed *ngIf="vodUrl" [vodUrl]="vodUrl" [label]="label"></app-twitch-embed>
        <div class="vod-placeholder" *ngIf="!vodUrl">
          VOD coming soon — check back after the broadcast is posted.
        </div>
      </div>
    </section>
  `,
  styles: [`
    .match-vod-section {
      padding: 32px 0 0;
    }
    .match-vod-content {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .match-vod-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    .match-vod-header h2 {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin: 0;
      color: var(--vesa-text);
    }
    .vod-indicator {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.16em;
      background: var(--vesa-blue-dim);
      color: var(--vesa-blue);
      padding: 5px 12px;
      border-radius: 4px;
    }
    .vod-placeholder {
      background: var(--vesa-panel);
      border: 1px dashed var(--vesa-line-strong);
      border-radius: 6px;
      padding: 32px 24px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
    }
    @media (max-width: 768px) {
      .match-vod-section {
        padding-top: 24px;
      }
    }
  `]
})
export class MatchVodSectionComponent {
  @Input() vodUrl: string | null = null;
  @Input() label: string = 'Match VOD';
}
