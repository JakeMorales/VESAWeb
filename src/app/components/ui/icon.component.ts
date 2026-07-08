import { Component, Input } from '@angular/core';

export type IconName =
  | 'target'
  | 'radar'
  | 'chart'
  | 'trophy'
  | 'bolt'
  | 'chat'
  | 'calendar'
  | 'clock'
  | 'users'
  | 'arrow-right';

/**
 * Stroke icon set (feather-style, MIT). Inherits `currentColor`,
 * so color it from the parent. Replaces emoji icons site-wide.
 *
 *   <app-icon name="target" [size]="30" />
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name) {
        @case ('target') {
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="1" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="1" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="23" y2="12" />
        }
        @case ('radar') {
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M12 7a5 5 0 1 0 5 5" />
          <line x1="12" y1="12" x2="19" y2="5" />
          <circle cx="12" cy="12" r="1" />
        }
        @case ('chart') {
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="15 7 21 7 21 13" />
        }
        @case ('trophy') {
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        }
        @case ('bolt') {
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        }
        @case ('chat') {
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          />
        }
        @case ('calendar') {
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 6 12 12 16 14" />
        }
        @case ('users') {
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        }
        @case ('arrow-right') {
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        }
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      line-height: 0;
    }
  `]
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 24;
  @Input() strokeWidth = 1.4;
}
