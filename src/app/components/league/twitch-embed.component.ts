import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** A Twitch VOD reference parsed out of an admin-supplied link. */
export interface TwitchVodRef {
  videoId: string;
  /** Start offset in Twitch's time format (e.g. "1h23m45s"), from a ?t= param. */
  time?: string;
}

/**
 * Accepts the link formats admins are likely to paste:
 *   https://www.twitch.tv/videos/2799221116
 *   https://www.twitch.tv/videos/2799221116?t=1h2m3s
 *   2799221116
 */
export function parseTwitchVodUrl(input: string | null | undefined): TwitchVodRef | null {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return { videoId: trimmed };
  const idMatch = trimmed.match(/twitch\.tv\/videos\/(\d+)/i);
  if (!idMatch) return null;
  const ref: TwitchVodRef = { videoId: idMatch[1] };
  const timeMatch = trimmed.match(/[?&]t=((?:\d+h)?(?:\d+m)?(?:\d+s)?)/i);
  if (timeMatch?.[1]) ref.time = timeMatch[1];
  return ref;
}

/**
 * Embedded Twitch player. Plays a specific VOD when [vodUrl] is set,
 * otherwise falls back to the live [channel] player. Playback stays
 * on-site; the only off-site affordance is the explicit link in the
 * bar under the player.
 */
@Component({
  selector: 'app-twitch-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="twitch-frame" *ngIf="embedUrl">
      <iframe [src]="embedUrl" allowfullscreen frameborder="0" scrolling="no"></iframe>
      <div class="twitch-bar">
        <span class="twitch-bar-label">{{ label || (isVod ? 'Match VOD' : 'Live Channel') }}</span>
        <a class="twitch-bar-link" [href]="externalUrl" target="_blank" rel="noopener">
          Open on Twitch ↗
        </a>
      </div>
    </div>
  `,
  styles: [`
    .twitch-frame {
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
      background: #000;
    }
    iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      border: none;
      display: block;
    }
    .twitch-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 9px 14px;
      background: var(--vesa-panel);
      border-top: 1px solid var(--vesa-line);
    }
    .twitch-bar-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .twitch-bar-link {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vesa-blue);
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.15s;
    }
    .twitch-bar-link:hover {
      color: var(--vesa-text);
    }
  `]
})
export class TwitchEmbedComponent implements OnChanges {
  /** Twitch VOD link (or bare video ID). Takes priority over [channel]. */
  @Input() vodUrl: string | null = '';
  /** Twitch channel login for the live player, used when no VOD is set. */
  @Input() channel: string = '';
  /** Caption shown in the bar under the player. */
  @Input() label: string = '';

  embedUrl: SafeResourceUrl | null = null;
  externalUrl = '';
  isVod = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    const parent = window.location.hostname;
    const vod = parseTwitchVodUrl(this.vodUrl);

    if (vod) {
      this.isVod = true;
      const time = vod.time ? `&time=${vod.time}` : '';
      this.setUrls(
        `https://player.twitch.tv/?video=${vod.videoId}&parent=${parent}&autoplay=false${time}`,
        `https://www.twitch.tv/videos/${vod.videoId}`
      );
    } else if (this.channel) {
      this.isVod = false;
      this.setUrls(
        `https://player.twitch.tv/?channel=${this.channel}&parent=${parent}&autoplay=false`,
        `https://www.twitch.tv/${this.channel}`
      );
    } else {
      this.embedUrl = null;
      this.externalUrl = '';
    }
  }

  private setUrls(embed: string, external: string): void {
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    this.externalUrl = external;
  }
}
