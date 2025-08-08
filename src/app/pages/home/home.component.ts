import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeHeroComponent } from '../../components/home/home-hero.component';
import { DiscordCommunityComponent } from '../../components/home/discord-community.component';
import { DetailedStatsComponent, StatsData } from '../../components/home/detailed-stats.component';
import { FeaturesShowcaseComponent } from '../../components/home/features-showcase.component';
import { RecentActivityComponent, ActivityItem } from '../../components/home/recent-activity.component';

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
        [totalMatches]="totalMatches">
      </app-home-hero>

      <app-discord-community></app-discord-community>

      <app-detailed-stats
        [leagueStats]="leagueStats"
        [scrimsStats]="scrimsStats">
      </app-detailed-stats>

      <app-features-showcase></app-features-showcase>

      <app-recent-activity
        [recentActivity]="recentActivity">
      </app-recent-activity>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // League Stats
  leagueStats: StatsData = {
    matchesPlayed: 115,
    gamesPlayed: 825,
    uniquePlayers: 644,
    totalPlaytime: '1yrs 3mo 24d 2h 40m 00s'
  };

  // Scrims Stats
  scrimsStats: StatsData = {
    matchesPlayed: 1045,
    gamesPlayed: 5854,
    uniquePlayers: 3896,
    totalPlaytime: '8yrs 9mo 29d 18h 30m 20s'
  };

  // Combined totals for the hero section
  get totalPlayers() {
    return this.leagueStats.uniquePlayers + this.scrimsStats.uniquePlayers;
  }

  get totalGames() {
    return this.leagueStats.gamesPlayed + this.scrimsStats.gamesPlayed;
  }

  get totalMatches() {
    return this.leagueStats.matchesPlayed + this.scrimsStats.matchesPlayed;
  }

  recentActivity: ActivityItem[] = [
    {
      icon: '🏆',
      title: 'Tournament Finals Completed',
      description: 'Team Horizon claimed victory in the Season 3 Championships',
      time: '2 hours ago'
    },
    {
      icon: '⚡',
      title: 'New High Score',
      description: 'Wraith_Main_BTW achieved a 20-kill game on World\'s Edge',
      time: '4 hours ago'
    },
    {
      icon: '🎯',
      title: 'Weekly Rankings Updated',
      description: 'Check out the latest leaderboard standings',
      time: '1 day ago'
    },
    {
      icon: '📊',
      title: 'Match Analysis Available',
      description: 'Detailed breakdown of last night\'s scrimmage matches',
      time: '2 days ago'
    }
  ];
}
