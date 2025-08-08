import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatchHeaderComponent } from '../../components/match/match-header.component';
import { MatchResultsComponent, MatchResults } from '../../components/match/match-results.component';
import { MatchDayTableComponent, MatchDayResults } from '../../components/match/match-day-table.component';
import { MatchLiveSectionComponent } from '../../components/match/match-live-section.component';
import { MatchUpcomingSectionComponent } from '../../components/match/match-upcoming-section.component';
import { MatchDataService, MatchDetail } from '../../services/match-data.service';

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
    private matchDataService: MatchDataService
  ) {}

  ngOnInit() {
    // Get the match ID from the route parameters
    const matchId = this.route.snapshot.paramMap.get('id') || 'week1-match1';
    
    // Load match details and data
    this.loadMatchData(matchId);
  }

  private loadMatchData(matchId: string) {
    // Get match details
    this.matchDataService.getMatchById(matchId).subscribe(match => {
      this.match = match;
    });

    // Get match day results (detailed with player stats)
    this.matchDataService.getMatchDayResults(matchId).subscribe(results => {
      this.matchDayResults = results;
    });

    // Get simplified game results (for legacy support)
    this.matchDataService.getGameResults(matchId).subscribe(results => {
      this.gameResults = results;
    });
  }
}
