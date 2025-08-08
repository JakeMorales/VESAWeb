import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActivityItem {
  icon: string;
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="recent-activity">
      <div class="activity-content">
        <h2>Latest Activity</h2>
        <div class="activity-feed">
          <div class="activity-item" *ngFor="let activity of recentActivity">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-details">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .recent-activity {
      padding: 4rem 2rem;
    }

    .activity-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .activity-content h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--color-text-primary);
      font-weight: 700;
    }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .activity-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .activity-item:hover {
      border-color: var(--color-accent-primary);
    }

    .activity-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, var(--color-accent-primary), var(--color-accent-secondary));
      border-radius: 50%;
      flex-shrink: 0;
    }

    .activity-details h4 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .activity-details p {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .activity-time {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      font-style: italic;
    }

    @media (max-width: 768px) {
      .recent-activity {
        padding: 3rem 1rem;
      }
      .activity-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class RecentActivityComponent {
  @Input() recentActivity: ActivityItem[] = [];
}
