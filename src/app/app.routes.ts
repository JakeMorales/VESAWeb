import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayerStatsComponent } from './pages/player-stats/player-stats.component';
import { GamesComponent } from './pages/games/games.component';
import { LeagueComponent } from './pages/league/league.component';
import { DivisionComponent } from './pages/league/division/division.component';
import { MatchComponent } from './pages/match/match.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'players', component: PlayerStatsComponent },
  { path: 'games', component: GamesComponent },
  { path: 'league', component: LeagueComponent },
  { path: 'league/:id', component: DivisionComponent },
  { path: 'match/:id', component: MatchComponent },
  { path: '**', redirectTo: '' }
];
