import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { HomeComponent } from './pages/home/home.component';
import { PlayerStatsComponent } from './pages/player-stats/player-stats.component';
import { GamesComponent } from './pages/games/games.component';
import { LeagueComponent } from './pages/league/league.component';
import { LeagueOverviewComponent } from './pages/league-overview/league-overview.component';
import { LeagueSignupComponent } from './pages/league-signup/league-signup.component';
import { DivisionComponent } from './pages/league/division/division.component';
import { MatchComponent } from './pages/match/match.component';
import { ScrimsComponent } from './pages/scrims/scrims.component';
import { RatingsComponent } from './pages/ratings/ratings.component';
import { NhostTestComponent } from './components/test/nhost-test.component';
import { SimpleNhostTestComponent } from './components/test/simple-nhost-test.component';
import { TeamTrackerTestComponent } from './components/test/team-tracker-test.component';

const playerStatsGuard: CanActivateFn = () => {
  if (environment.features.playerStats) {
    return true;
  }
  return inject(Router).createUrlTree(['/']);
};

const ratingsLeaderboardGuard: CanActivateFn = () => {
  if (environment.features.ratingsLeaderboard) {
    return true;
  }
  return inject(Router).createUrlTree(['/']);
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'players', component: PlayerStatsComponent, canActivate: [playerStatsGuard] },
  { path: 'games', component: GamesComponent },
  { path: 'scrims', component: ScrimsComponent },
  { path: 'league', component: LeagueOverviewComponent },
  { path: 'league/current-season', component: LeagueComponent },
  { path: 'league/signup', component: LeagueSignupComponent },
  { path: 'league/:id', component: DivisionComponent },
  { path: 'match/:id', component: MatchComponent },
  { path: 'ratings', component: RatingsComponent, canActivate: [ratingsLeaderboardGuard] },
  { path: 'test', component: NhostTestComponent },
  { path: 'simple-test', component: SimpleNhostTestComponent },
  { path: 'team-tracker-test', component: TeamTrackerTestComponent },
  { path: '**', redirectTo: '' }
];
