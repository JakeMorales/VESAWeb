import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../pages/league/division/division.component';
import { TwitchEmbedComponent } from './twitch-embed.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-current-match',
  standalone: true,
  imports: [CommonModule, RouterModule, TwitchEmbedComponent],
  template: `
    <section class="current-match-section" *ngIf="currentMatch || streamChannel">
      <div class="current-match-content">

        <!-- Live match layout -->
        <ng-container *ngIf="currentMatch?.status === 'live' || (!currentMatch && streamChannel)">
          <div class="current-match-header">
            <h2>Current Match</h2>
            <span class="live-indicator"><span class="live-dot"></span> LIVE</span>
          </div>
          <app-twitch-embed *ngIf="streamChannel && showTwitchEmbeds" [channel]="streamChannel" height="400px"></app-twitch-embed>
          <div class="current-match-card" *ngIf="currentMatch">
            <div class="match-info">
              <h3>{{ currentMatch.matchDay }}</h3>
              <div class="match-details">
                <span class="teams-count">{{ currentMatch.teamsCount }} Teams</span>
              </div>
              <div class="match-progress" *ngIf="currentMatch.gamesPlayed && currentMatch.totalGames">
                <span>Game {{ currentMatch.gamesPlayed }} of {{ currentMatch.totalGames }}</span>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(currentMatch.gamesPlayed / currentMatch.totalGames) * 100"></div>
                </div>
              </div>
            </div>
            <div class="match-actions">
              <a [routerLink]="['/match', currentMatch.id]" class="details-btn">View Details</a>
            </div>
          </div>
        </ng-container>

        <!-- Last played layout -->
        <ng-container *ngIf="currentMatch?.status === 'completed'">
          <div class="current-match-header">
            <h2>Last Played</h2>
          </div>
          <app-twitch-embed *ngIf="streamChannel && showTwitchEmbeds" [channel]="streamChannel" height="400px"></app-twitch-embed>
          <a [routerLink]="['/match', currentMatch!.id]" class="last-played-card">
            <div class="last-played-info">
              <span class="last-played-label">{{ currentMatch!.matchDay }}</span>
              <span class="last-played-teams">{{ currentMatch!.teamsCount }} Teams</span>
            </div>
            <span class="last-played-cta">View Results →</span>
          </a>
        </ng-container>

      </div>
    </section>
  `,
  styleUrl: './current-match.component.css'
})
export class CurrentMatchComponent {
  @Input() currentMatch?: Match;
  @Input() streamChannel: string = '';

  readonly showTwitchEmbeds = environment.features.leagueTwitchEmbeds;
}
