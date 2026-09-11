import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeHeroComponent } from '../../components/home/home-hero.component';
import { DiscordCommunityComponent } from '../../components/home/discord-community.component';
import { DetailedStatsComponent, StatsData } from '../../components/home/detailed-stats.component';
import { FeaturesShowcaseComponent } from '../../components/home/features-showcase.component';
import { RecentActivityComponent, ActivityItem } from '../../components/home/recent-activity.component';
import { HomeStatsService } from '../../services/home-stats.service';

const EMPTY_STATS: StatsData = {
  matchesPlayed: 0,
  gamesPlayed: 0,
  uniquePlayers: 0,
  totalPlaytime: '—'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    HomeHeroComponent,
    DiscordCommunityComponent,
    DetailedStatsComponent,
    FeaturesShowcaseComponent,
    RecentActivityComponent
  ],
  template: `
    <div class="home-container">
      <app-home-hero
        [totalPlayers]="totalPlayers"
        [totalGames]="totalGames"
        [totalMatches]="totalMatches"
        [divisionCount]="divisionCount">
      </app-home-hero>

      <app-discord-community></app-discord-community>

      <app-detailed-stats
        [leagueStats]="leagueStats"
        [scrimsStats]="scrimsStats">
      </app-detailed-stats>

      <app-features-showcase [divisionCount]="divisionCount"></app-features-showcase>

      <app-recent-activity
        [recentActivity]="recentActivity">
      </app-recent-activity>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  leagueStats: StatsData = EMPTY_STATS;
  scrimsStats: StatsData = EMPTY_STATS;
  recentActivity: ActivityItem[] = [];
  divisionCount: number | null = null;

  /** Deduplicated (league ∪ scrims) count once real data loads; naive sum until then. */
  totalPlayers = 0;
  totalGames = 0;
  totalMatches = 0;

  constructor(private homeStats: HomeStatsService) {}

  ngOnInit(): void {
    this.homeStats.getStats().subscribe(stats => {
      if (!stats) return;
      this.leagueStats = {
        matchesPlayed: stats.league.matchesPlayed,
        gamesPlayed: stats.league.gamesPlayed,
        uniquePlayers: stats.league.uniquePlayers,
        totalPlaytime: stats.league.totalPlaytime
      };
      this.scrimsStats = {
        matchesPlayed: stats.scrims.matchesPlayed,
        gamesPlayed: stats.scrims.gamesPlayed,
        uniquePlayers: stats.scrims.uniquePlayers,
        totalPlaytime: stats.scrims.totalPlaytime
      };
      this.divisionCount = stats.league.currentDivisionCount;
      this.totalPlayers = stats.totalUniquePlayers;
      this.totalGames = stats.league.gamesPlayed + stats.scrims.gamesPlayed;
      this.totalMatches = stats.league.matchesPlayed + stats.scrims.matchesPlayed;
      this.recentActivity = stats.recentActivity.map(a => ({
        icon: a.icon,
        title: a.title,
        description: a.description,
        occurredAt: a.occurredAt
      }));
    });
  }
}
