import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchDayTableComponent, MatchDayResults, TeamGameResult, PlayerStats } from '../match/match-day-table.component';

export interface ScrimSession {
  id: number;
  date: string;
  time: string;
  maps: string[];
  matches: ScrimMatch[];
}

export interface ScrimMatch {
  id: number;
  map: string;
  teams: ScrimTeam[];
}

export interface ScrimTeam {
  name: string;
  players: ScrimPlayer[];
  placement: number;
  totalKills: number;
  totalDamage: number;
}

export interface ScrimPlayer {
  username: string;
  kills: number;
  damage: number;
  placement: number;
}

@Component({
  selector: 'app-scrim-session',
  standalone: true,
  imports: [CommonModule, MatchDayTableComponent],
  template: `
    <div class="scrim-session">
      <!-- Collapsed Header -->
      <div class="session-header" (click)="toggleExpanded()">
        <div class="session-info">
          <div class="session-date-time">
            <span class="date">{{ scrimSession.date }}</span>
            <span class="time">{{ scrimSession.time }}</span>
          </div>
          <div class="maps-played">
            <span class="maps-label">Maps:</span>
            <span class="maps-list">{{ scrimSession.maps.join(', ') }}</span>
          </div>
        </div>
        <div class="expand-icon" [class.expanded]="isExpanded">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>

      <!-- Expanded Content -->
      <div class="session-content" [class.expanded]="isExpanded">
        <div class="session-matches">
          <app-match-day-table [matchResults]="convertAllMatchesToResults()"></app-match-day-table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrim-session {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
      border: 1px solid rgba(255, 44, 92, 0.2);
      border-radius: 16px;
      margin-bottom: 1.5rem;
      overflow: hidden;
      backdrop-filter: blur(20px);
      transition: all 0.3s ease;
    }

    .scrim-session:hover {
      border-color: rgba(255, 44, 92, 0.4);
      box-shadow: 0 8px 32px rgba(255, 44, 92, 0.1);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.02);
    }

    .session-header:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .session-date-time {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .date {
      font-size: 1.2rem;
      font-weight: 600;
      color: #ffffff;
    }

    .time {
      font-size: 1rem;
      color: #ff2c5c;
      font-weight: 500;
      padding: 0.25rem 0.75rem;
      background: rgba(255, 44, 92, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(255, 44, 92, 0.3);
    }

    .maps-played {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .maps-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .maps-list {
      color: #2c9cff;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .expand-icon {
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
      color: #ff2c5c;
    }

    .session-content {
      max-height: 0;
      overflow: hidden;
      transition: all 0.5s ease;
      opacity: 0;
    }

    .session-content.expanded {
      max-height: none;
      opacity: 1;
      padding: 0 2rem 2rem 2rem;
    }

    .session-matches {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 768px) {
      .session-header {
        padding: 1rem;
      }

      .session-date-time {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .maps-played {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .session-content.expanded {
        padding: 0 1rem 1rem 1rem;
      }

      .session-matches {
        padding: 1rem;
      }
    }
  `]
})
export class ScrimSessionComponent {
  @Input() scrimSession!: ScrimSession;
  
  isExpanded = false;

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  convertAllMatchesToResults(): MatchDayResults {
    // Convert all matches in the session to a single MatchDayResults object
    const allResults: MatchDayResults = {};
    
    this.scrimSession.matches.forEach((match, index) => {
      const gameNumber = index + 1;
      const teamResults: TeamGameResult[] = match.teams.map(team => ({
        gameNumber: gameNumber,
        teamName: team.name,
        placement: team.placement,
        teamKills: team.totalKills,
        placementPoints: this.getPlacementPoints(team.placement),
        totalPoints: this.getPlacementPoints(team.placement) + Math.floor(team.totalKills * 0.5),
        mapName: match.map,
        players: team.players.map(player => ({
          playerName: player.username,
          kills: player.kills,
          damage: player.damage,
          downs: Math.floor(player.damage / 100), // Estimate downs from damage
          revives: Math.floor(Math.random() * 3), // Mock data
          respawns: Math.floor(Math.random() * 2) // Mock data
        } as PlayerStats)),
        isExpanded: false
      }));
      
      allResults[gameNumber] = teamResults;
    });

    return allResults;
  }

  private getPlacementPoints(placement: number): number {
    const points: { [key: number]: number } = {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
    };
    return points[placement] || 0;
  }
}
