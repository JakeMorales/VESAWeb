import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName, SectionHeaderComponent } from '../ui';

export interface ActivityItem {
  icon: IconName;
  title: string;
  description: string;
  /** ISO timestamp — relative "time ago" text is computed at render time. */
  occurredAt: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, IconComponent, SectionHeaderComponent],
  template: `
    <section class="wrap block">
      <app-section-header index="04" title="Latest activity" />
      <div class="feed">
        @for (activity of recentActivity; track activity.occurredAt + activity.title) {
          <div class="item">
            <div class="tile">
              <app-icon [name]="activity.icon" [size]="20" />
            </div>
            <div class="details">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
            </div>
            <span class="time">{{ timeAgo(activity.occurredAt) }}</span>
          </div>
        }
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
    .feed {
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--vesa-line);
      transition: background 0.12s;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item:hover {
      background: rgba(61, 155, 255, 0.05);
    }
    .tile {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border: 1px solid var(--vesa-line-strong);
      border-radius: 4px;
      color: var(--vesa-blue);
      flex-shrink: 0;
    }
    h4 {
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      color: var(--vesa-text);
      margin: 0 0 2px;
    }
    p {
      color: var(--vesa-dim);
      font-size: 13px;
      margin: 0;
    }
    .time {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      white-space: nowrap;
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .block {
        padding-top: 64px;
      }
      .item {
        flex-wrap: wrap;
        gap: 12px;
      }
      .time {
        margin-left: 54px;
        order: 3;
        flex-basis: 100%;
      }
    }
  `]
})
export class RecentActivityComponent {
  @Input() recentActivity: ActivityItem[] = [];

  timeAgo(occurredAt: string): string {
    const diffMs = Date.now() - new Date(occurredAt).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30.44);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(days / 365.25);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
}
