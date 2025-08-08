import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MatchDetail {
  id: string;
  weekNumber: number;
  matchDay: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  division: string;
  divisionTier: number;
  teamsCount: number;
  gamesPlayed?: number;
  totalGames?: number;
  winner?: string;
  streamUrl?: string;
  description: string;
}

@Component({
  selector: 'app-match-upcoming-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="upcoming-section">
      <div class="upcoming-content">
        <h2>Match Information</h2>
        
        <div class="upcoming-info">
          <div class="info-card schedule-card">
            <div class="card-header">
              <h3>📅 Schedule</h3>
            </div>
            <div class="card-content">
              <div class="schedule-item">
                <span class="schedule-label">Date:</span>
                <span class="schedule-value">{{ match.date }}</span>
              </div>
              <div class="schedule-item">
                <span class="schedule-label">Time:</span>
                <span class="schedule-value">{{ match.time }}</span>
              </div>
              <div class="schedule-item">
                <span class="schedule-label">Teams:</span>
                <span class="schedule-value">{{ match.teamsCount }} competing</span>
              </div>
              <div class="schedule-item">
                <span class="schedule-label">Games:</span>
                <span class="schedule-value">{{ match.totalGames }} planned</span>
              </div>
            </div>
          </div>

          <div class="info-card format-card">
            <div class="card-header">
              <h3>🏆 Format</h3>
            </div>
            <div class="card-content">
              <div class="format-item">
                <span class="format-icon">⚡</span>
                <span>ALGS scoring system</span>
              </div>
              <div class="format-item">
                <span class="format-icon">🎯</span>
                <span>Points for placement and eliminations</span>
              </div>
              <div class="format-item">
                <span class="format-icon">📊</span>
                <span>All games count towards season standings</span>
              </div>
              <div class="format-item">
                <span class="format-icon">👑</span>
                <span>Championship points awarded</span>
              </div>
            </div>
          </div>

          <div class="info-card division-card">
            <div class="card-header">
              <h3>🏅 Division</h3>
            </div>
            <div class="card-content">
              <div class="division-info">
                <span class="division-name">{{ match.division }} Division</span>
                <span class="division-tier">Tier {{ getRomanNumeral(match.divisionTier) }}</span>
              </div>
              <div class="division-desc">
                <p>Elite competition featuring the top teams in their skill bracket.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="countdown-section">
          <h3>Match starts in:</h3>
          <div class="countdown-placeholder">
            <span class="countdown-text">Check back soon for live updates!</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './match-upcoming-section.component.css'
})
export class MatchUpcomingSectionComponent {
  @Input() match!: MatchDetail;

  getRomanNumeral(tier: number): string {
    const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
    return numerals[tier] || tier.toString();
  }
}
