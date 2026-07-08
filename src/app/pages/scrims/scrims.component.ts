import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScrimPlayer } from '../../components/scrims-leaderboard/scrims-leaderboard.component';
import { ScrimsHeroComponent, ScrimStats } from '../../components/scrims/scrims-hero.component';
import { EloSystemComponent } from '../../components/scrims/elo-system.component';
import { ScrimFormatComponent } from '../../components/scrims/scrim-format.component';
import { JoinScrimsComponent } from '../../components/scrims/join-scrims.component';
import { ScrimsLeaderboardSectionComponent } from '../../components/scrims/scrims-leaderboard-section.component';
import { EloDataService } from '../../services/elo-data.service';

const EMPTY_STATS: ScrimStats = {
  totalPlayers: 0,
  activeThisWeek: 0,
  totalGames: 0,
  averageElo: 0,
  highestElo: 0,
  totalMatches: 0,
};

@Component({
  selector: 'app-scrims',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ScrimsHeroComponent,
    EloSystemComponent,
    ScrimFormatComponent,
    JoinScrimsComponent,
    ScrimsLeaderboardSectionComponent
  ],
  templateUrl: './scrims.component.html',
  styleUrl: './scrims.component.css'
})
export class ScrimsComponent {
  /** Top 10 rated Season 29 players from the generated ELO data. */
  leaderboard$: Observable<ScrimPlayer[]>;
  scrimStats$: Observable<ScrimStats>;
  seasonLabel$: Observable<string>;
  readonly emptyStats = EMPTY_STATS;

  constructor(eloData: EloDataService) {
    this.leaderboard$ = eloData.getLeaderboard(10);
    this.scrimStats$ = eloData.getScrimStats().pipe(map(s => s ?? EMPTY_STATS));
    this.seasonLabel$ = eloData.getSeason().pipe(map(s => s?.label ?? 'Season'));
  }
}
