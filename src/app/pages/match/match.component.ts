import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatchHeaderComponent, MatchDetail } from '../../components/match/match-header.component';
import { MatchResultsComponent, MatchResults, GameResult } from '../../components/match/match-results.component';
import { MatchLiveSectionComponent } from '../../components/match/match-live-section.component';
import { MatchUpcomingSectionComponent } from '../../components/match/match-upcoming-section.component';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatchHeaderComponent, 
    MatchResultsComponent, 
    MatchLiveSectionComponent, 
    MatchUpcomingSectionComponent
  ],
  template: `
    <div class="match-container" *ngIf="match">
      <!-- Match Header -->
      <app-match-header [match]="match"></app-match-header>

      <!-- Match Results -->
      <app-match-results 
        *ngIf="match.status === 'completed' && gameResults" 
        [gameResults]="gameResults">
      </app-match-results>

      <!-- Live Updates -->
      <app-match-live-section 
        *ngIf="match.status === 'live'" 
        [match]="match">
      </app-match-live-section>

      <!-- Upcoming Match Info -->
      <app-match-upcoming-section 
        *ngIf="match.status === 'upcoming'" 
        [match]="match">
      </app-match-upcoming-section>
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
}
