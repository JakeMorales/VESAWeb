import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatchHeaderComponent } from '../../components/match/match-header.component';
import { MatchResultsComponent, MatchResults } from '../../components/match/match-results.component';
import { MatchDayTableComponent } from '../../components/match/match-day-table.component';
import { MatchDayResults } from '../../models/match-day-results.model';
import { MatchLiveSectionComponent } from '../../components/match/match-live-section.component';
import { MatchUpcomingSectionComponent } from '../../components/match/match-upcoming-section.component';
import { LeagueMatchDataService } from '../../services/league-match-data.service';
import { MatchDetail } from '../../services/match-data.service';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatchHeaderComponent, 
    MatchResultsComponent,
    MatchDayTableComponent,
    MatchLiveSectionComponent, 
    MatchUpcomingSectionComponent
  ],
  template: `
    <div class="match-container" *ngIf="match">
      <!-- Match Header -->
      <app-match-header [match]="match"></app-match-header>

      <!-- Enhanced Match Day Results Table -->
      <app-match-day-table 
        *ngIf="match.status === 'completed' && matchDayResults" 
        [matchResults]="matchDayResults">
      </app-match-day-table>

      <!-- Legacy Match Results (kept for compatibility) -->
      <app-match-results 
        *ngIf="match.status === 'completed' && gameResults && !matchDayResults" 
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
      <a routerLink="/league" class="back-link">â† Back to League</a>
    </div>
  `,
  styleUrl: './match.component.css'
})
export class MatchComponent implements OnInit {
  match: MatchDetail | null = null;
  matchDayResults: MatchDayResults | null = null;
  gameResults: MatchResults | null = null;

  constructor(
    private route: ActivatedRoute,
  private leagueMatchDataService: LeagueMatchDataService
  ) {}

  ngOnInit() {
    // Get the match ID from the route parameters
    const matchId = this.route.snapshot.paramMap.get('id') || 'week1-match1';
    
    // Load match details and data
    this.loadMatchData(matchId);
  }

  private loadMatchData(matchId: string) {
    // Get match details
    // Placeholder: keep using static meta-data for now
    // TODO: Replace with real meta-data when available
    this.match = {
      id: matchId,
      weekNumber: 1,
      matchDay: 'Week 1 - Placeholder',
      date: '2024-12-01',
      time: '7:00 PM EST',
      status: 'completed',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      gamesPlayed: 6,
      totalGames: 6,
      winner: 'Placeholder Winner',
      description: 'Placeholder match meta-data.'
    };

    // Get match day results (detailed with player stats)
    this.leagueMatchDataService.getLeagueMatchResults(matchId).subscribe({
      next: (results: MatchDayResults | null) => {
        this.matchDayResults = results;
        if (!results) {
          console.error('No match results found for:', matchId);
        }
      },
      error: (err: any) => {
        console.error('Error loading match results:', err);
      }
    });
  }
}
