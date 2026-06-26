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

const DIVISION_NAMES: Record<number, string> = {
  1: 'Pinnacle', 2: 'Vanguard', 3: 'Ascendant', 4: 'Emergent',
  5: 'Challenger', 6: 'Prospect', 7: 'Aspirant', 8: 'Contenders'
};

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
    const matchId = this.route.snapshot.paramMap.get('id') || '';
    const parts = matchId.split('~');

    if (parts.length !== 3) {
      this.match = null;
      return;
    }

    const [season, division, filename] = parts;
    const divNum = parseInt(division, 10);
    const isFinale = /playoffs|finals|_mp/i.test(filename);
    const weekMatch = filename.match(/Week_(\d+)/i);
    const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : 0;
    const divisionName = DIVISION_NAMES[divNum] || `Division ${division}`;

    this.match = {
      id: matchId,
      weekNumber: weekNum,
      matchDay: isFinale ? 'Match Point Finals' : `Week ${weekNum}`,
      date: '',
      time: '',
      status: 'completed',
      division: divisionName,
      divisionTier: divNum,
      teamsCount: 0,
      gamesPlayed: 0,
      totalGames: 0,
      description: `${season.replace(/_/g, ' ')} · ${divisionName} Division`
    };

    this.leagueMatchDataService.getLeagueMatchResults(matchId).subscribe({
      next: (results: MatchDayResults | null) => {
        this.matchDayResults = results;
        if (results) {
          const gameNums = Object.keys(results).map(n => parseInt(n, 10));
          this.match!.gamesPlayed = gameNums.length;
          this.match!.totalGames = gameNums.length;
          this.match!.teamsCount = results[gameNums[0]]?.length ?? 0;
        }
      },
      error: (err: any) => {
        console.error('Error loading match results:', err);
      }
    });
  }
}
