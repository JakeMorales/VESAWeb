import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

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

export interface GameResult {
  gameNumber: number;
  placement: number;
  teamName: string;
  kills: number;
  points: number;
  isWinner: boolean;
}

export interface MatchResults {
  [gameNumber: number]: GameResult[];
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="match-container" *ngIf="match">
      <!-- Match Header -->
      <section class="match-header">
        <div class="header-content">
          <div class="breadcrumb">
            <a routerLink="/league">League</a> > 
            <a [routerLink]="['/league', match.division.toLowerCase()]">{{ match.division }} ({{ getRomanNumeral(match.divisionTier) }})</a> > 
            <span>{{ match.matchDay }}</span>
          </div>
          
          <div class="match-title-section">
            <div class="match-info">
              <h1 class="match-title">{{ match.matchDay }}</h1>
              <div class="match-meta">
                <span class="match-date">{{ match.date }}</span>
                <span class="match-time">{{ match.time }}</span>
                <span class="match-division">{{ match.division }} Division</span>
                <span class="match-status" [class]="getMatchStatusClass(match.status)">
                  {{ getMatchStatusText(match.status) }}
                </span>
              </div>
              <p class="match-description">{{ match.description }}</p>
            </div>
            
            <div class="match-actions" *ngIf="match.status === 'live'">
              <a [href]="match.streamUrl" target="_blank" class="watch-btn" *ngIf="match.streamUrl">
                📺 Watch Live
              </a>
              <div class="live-indicator">🔴 LIVE</div>
            </div>
          </div>
          
          <div class="match-progress" *ngIf="match.gamesPlayed && match.totalGames">
            <div class="progress-info">
              <span>Progress: Game {{ match.gamesPlayed }} of {{ match.totalGames }}</span>
              <span>{{ ((match.gamesPlayed / match.totalGames) * 100).toFixed(0) }}% Complete</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="(match.gamesPlayed / match.totalGames) * 100"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Match Results -->
      <section class="results-section" *ngIf="match.status === 'completed' && getGameNumbers().length > 0">
        <div class="results-content">
          <h2>Match Results</h2>
          
          <div class="games-tabs">
            <button 
              *ngFor="let gameNum of getGameNumbers()" 
              (click)="selectedGame = gameNum"
              [class.active]="selectedGame === gameNum"
              class="game-tab">
              Game {{ gameNum }}
            </button>
            <button 
              (click)="selectedGame = 0"
              [class.active]="selectedGame === 0"
              class="game-tab overall-tab">
              Overall
            </button>
          </div>
          
          <div class="results-table" *ngIf="selectedGame > 0">
            <div class="table-header">
              <div class="placement-col">Place</div>
              <div class="team-col">Team</div>
              <div class="kills-col">Kills</div>
              <div class="points-col">Points</div>
            </div>
            <div class="table-body">
              <div class="result-row" *ngFor="let result of getGameResults(selectedGame); let i = index" [class.winner]="result.isWinner">
                <div class="placement-col">
                  <span class="placement-number" [class]="'place-' + result.placement">{{ result.placement }}</span>
                </div>
                <div class="team-col">
                  <span class="team-name">{{ result.teamName }}</span>
                  <span class="winner-badge" *ngIf="result.isWinner">👑</span>
                </div>
                <div class="kills-col">{{ result.kills }}</div>
                <div class="points-col">
                  <span class="points-value">{{ result.points }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="overall-standings" *ngIf="selectedGame === 0">
            <div class="table-header">
              <div class="rank-col">Rank</div>
              <div class="team-col">Team</div>
              <div class="total-points-col">Total Points</div>
              <div class="wins-col">Wins</div>
              <div class="avg-kills-col">Avg Kills</div>
            </div>
            <div class="table-body">
              <div class="result-row" *ngFor="let standing of getOverallStandings(); let i = index">
                <div class="rank-col">
                  <span class="rank-number" [class]="'rank-' + (i + 1)">{{ i + 1 }}</span>
                </div>
                <div class="team-col">
                  <span class="team-name">{{ standing.teamName }}</span>
                </div>
                <div class="total-points-col">
                  <span class="points-value">{{ standing.totalPoints }}</span>
                </div>
                <div class="wins-col">{{ standing.wins }}</div>
                <div class="avg-kills-col">{{ standing.avgKills.toFixed(1) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Updates -->
      <section class="live-section" *ngIf="match.status === 'live'">
        <div class="live-content">
          <h2>Live Updates</h2>
          <div class="live-game-info">
            <p>Game {{ match.gamesPlayed }} of {{ match.totalGames }} is currently in progress.</p>
            <p class="live-notice">Results will be updated as games complete.</p>
          </div>
        </div>
      </section>

      <!-- Upcoming Match Info -->
      <section class="upcoming-section" *ngIf="match.status === 'upcoming'">
        <div class="upcoming-content">
          <h2>Match Information</h2>
          <div class="upcoming-info">
            <div class="info-card">
              <h3>Schedule</h3>
              <p>{{ match.date }} at {{ match.time }}</p>
              <p>{{ match.teamsCount }} teams competing</p>
              <p>{{ match.totalGames }} games planned</p>
            </div>
            <div class="info-card">
              <h3>Format</h3>
              <p>ALGS scoring system</p>
              <p>Points awarded for placement and eliminations</p>
              <p>All games count towards season standings</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="error-container" *ngIf="!match">
      <h2>Match Not Found</h2>
      <p>The requested match could not be found.</p>
      <a routerLink="/league" class="back-link">← Back to League</a>
    </div>
  `,
  styleUrl: './match.component.css'
})
export class MatchComponent implements OnInit {
  match: MatchDetail | null = null;
  selectedGame = 1;

  // Sample match data - in a real app this would come from a service
  matches: MatchDetail[] = [
    {
      id: 'week1-match1',
      weekNumber: 1,
      matchDay: 'Week 1 - Opening Day',
      date: '2024-12-01',
      time: '7:00 PM EST',
      status: 'completed',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      gamesPlayed: 6,
      totalGames: 6,
      winner: 'Apex Predators',
      description: 'Season 11 kicks off with the elite Pinnacle Division teams battling for early season points and momentum.'
    },
    {
      id: 'week2-match1',
      weekNumber: 2,
      matchDay: 'Week 2 - Regular Season',
      date: '2024-12-08',
      time: '7:00 PM EST',
      status: 'completed',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      gamesPlayed: 6,
      totalGames: 6,
      winner: 'Storm Legends',
      description: 'The competition intensifies as teams adapt their strategies and fight for crucial season points.'
    },
    {
      id: 'week3-match1',
      weekNumber: 3,
      matchDay: 'Week 3 - Mid Season',
      date: '2024-12-15',
      time: '7:00 PM EST',
      status: 'live',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      gamesPlayed: 3,
      totalGames: 6,
      streamUrl: 'https://twitch.tv/vesaapex',
      description: 'Mid-season action with teams pushing for playoff positioning and proving their championship potential.'
    },
    {
      id: 'week4-match1',
      weekNumber: 4,
      matchDay: 'Week 4 - Late Season',
      date: '2024-12-22',
      time: '7:00 PM EST',
      status: 'upcoming',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      totalGames: 6,
      description: 'Crucial late-season matches that will determine final playoff seeding and championship contenders.'
    },
    {
      id: 'week5-match1',
      weekNumber: 5,
      matchDay: 'Week 5 - Finals',
      date: '2024-12-29',
      time: '7:00 PM EST',
      status: 'upcoming',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      totalGames: 6,
      description: 'The season finale featuring Match Point format to crown the Pinnacle Division champion.'
    }
  ];

  // Sample game results
  gameResults: MatchResults = {
    1: [
      { gameNumber: 1, placement: 1, teamName: 'Apex Predators', kills: 12, points: 22, isWinner: true },
      { gameNumber: 1, placement: 2, teamName: 'Storm Legends', kills: 8, points: 17, isWinner: false },
      { gameNumber: 1, placement: 3, teamName: 'Shadow Squad', kills: 6, points: 14, isWinner: false },
      { gameNumber: 1, placement: 4, teamName: 'Digital Legends', kills: 4, points: 11, isWinner: false },
      { gameNumber: 1, placement: 5, teamName: 'Void Runners', kills: 3, points: 9, isWinner: false }
    ],
    2: [
      { gameNumber: 2, placement: 1, teamName: 'Storm Legends', kills: 10, points: 20, isWinner: true },
      { gameNumber: 2, placement: 2, teamName: 'Shadow Squad', kills: 7, points: 16, isWinner: false },
      { gameNumber: 2, placement: 3, teamName: 'Apex Predators', kills: 5, points: 13, isWinner: false },
      { gameNumber: 2, placement: 4, teamName: 'Void Runners', kills: 6, points: 12, isWinner: false },
      { gameNumber: 2, placement: 5, teamName: 'Digital Legends', kills: 2, points: 8, isWinner: false }
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const matchId = params['id'];
      this.match = this.matches.find(m => m.id === matchId) || null;
    });
  }

  getRomanNumeral(tier: number): string {
    const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
    return numerals[tier] || tier.toString();
  }

  getMatchStatusClass(status: string): string {
    switch (status) {
      case 'live': return 'status-live';
      case 'completed': return 'status-completed';
      case 'upcoming': return 'status-upcoming';
      default: return '';
    }
  }

  getMatchStatusText(status: string): string {
    switch (status) {
      case 'live': return 'LIVE';
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      default: return '';
    }
  }

  getGameNumbers(): number[] {
    return Object.keys(this.gameResults).map(num => parseInt(num)).sort((a, b) => a - b);
  }

  getGameResults(gameNumber: number): GameResult[] {
    return this.gameResults[gameNumber] || [];
  }

  getOverallStandings(): any[] {
    const teamStandings: { [teamName: string]: { totalPoints: number, wins: number, totalKills: number, games: number } } = {};
    
    Object.values(this.gameResults).forEach((gameResults: GameResult[]) => {
      gameResults.forEach((result: GameResult) => {
        if (!teamStandings[result.teamName]) {
          teamStandings[result.teamName] = { totalPoints: 0, wins: 0, totalKills: 0, games: 0 };
        }
        teamStandings[result.teamName].totalPoints += result.points;
        teamStandings[result.teamName].totalKills += result.kills;
        teamStandings[result.teamName].games += 1;
        if (result.isWinner) {
          teamStandings[result.teamName].wins += 1;
        }
      });
    });

    return Object.entries(teamStandings)
      .map(([teamName, stats]) => ({
        teamName,
        totalPoints: stats.totalPoints,
        wins: stats.wins,
        avgKills: stats.totalKills / stats.games
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }
}
