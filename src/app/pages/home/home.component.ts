import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { HomeHeroComponent } from '../../components/home/home-hero.component';
import { DiscordCommunityComponent } from '../../components/home/discord-community.component';
import { DetailedStatsComponent, StatsData } from '../../components/home/detailed-stats.component';
import { FeaturesShowcaseComponent } from '../../components/home/features-showcase.component';
import { RecentActivityComponent, ActivityItem } from '../../components/home/recent-activity.component';
import { LeagueService, DivisionSummary, MatchPointChampion } from '../../services/league.service';
import { ScrimsDataService } from '../../services/scrims-data.service';

interface DivisionChampion {
  divisionName: string;
  champion: MatchPointChampion;
}

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

      <section class="season-champions" *ngIf="divisionChampions.length > 0">
        <div class="champions-content">
          <h2>Season 14 Champions</h2>
          <div class="champions-grid">
            <div class="champion-card" *ngFor="let dc of divisionChampions">
              <div class="champion-trophy">🏆</div>
              <div class="champion-division">{{ dc.divisionName }}</div>
              <div class="champion-team">{{ dc.champion.teamName }}</div>
              <div class="champion-players">
                <span class="player-tag" *ngFor="let player of dc.champion.players">{{ player }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <app-recent-activity
        [recentActivity]="recentActivity">
      </app-recent-activity>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  leagueStats: StatsData = { matchesPlayed: 0, gamesPlayed: 0, uniquePlayers: 0, totalPlaytime: '' };
  scrimsStats: StatsData = { matchesPlayed: 0, gamesPlayed: 0, uniquePlayers: 0, totalPlaytime: '' };
  divisionChampions: DivisionChampion[] = [];
  recentActivity: ActivityItem[] = [];

  private maxLeagueWeek = 0;
  private maxLeagueWeekDivision = '';
  private scrimsLastUpdated: Date | null = null;
  private pendingLoads = 2;

  get totalPlayers(): number {
    return this.leagueStats.uniquePlayers + this.scrimsStats.uniquePlayers;
  }

  get totalGames(): number {
    return this.leagueStats.gamesPlayed + this.scrimsStats.gamesPlayed;
  }

  get totalMatches(): number {
    return this.leagueStats.matchesPlayed + this.scrimsStats.matchesPlayed;
  }

  constructor(
    private leagueService: LeagueService,
    private scrimsDataService: ScrimsDataService
  ) {}

  ngOnInit(): void {
    this.loadLeagueData();
    this.loadScrimsData();
  }

  private loadLeagueData(): void {
    this.leagueService.getDivisions('Season_14').pipe(
      switchMap(divisions => {
        if (!divisions.length) {
          return of([] as Array<{ division: string; summary: DivisionSummary | null; files: string[] }>);
        }
        return forkJoin(
          divisions.map(d =>
            forkJoin({
              summary: this.leagueService.getDivisionSummary('Season_14', d),
              files: this.leagueService.getMatchFiles('Season_14', d)
            }).pipe(map(r => ({ division: d, ...r })))
          )
        );
      })
    ).subscribe({
      next: results => {
        let totalTeams = 0;
        let totalMatchDays = 0;
        let maxWeek = 0;
        let maxWeekDivision = '';
        const champions: DivisionChampion[] = [];

        for (const { division, summary, files } of results) {
          if (summary) {
            totalTeams += summary.seasonStandings.length;
            if (summary.matchPointChampion) {
              champions.push({ divisionName: `Division ${division}`, champion: summary.matchPointChampion });
            }
          }
          const weekFiles = files.filter(f => /Week_\d+/i.test(f));
          totalMatchDays += weekFiles.length;
          for (const file of weekFiles) {
            const m = file.match(/Week_(\d+)/i);
            if (m) {
              const w = parseInt(m[1], 10);
              if (w > maxWeek) {
                maxWeek = w;
                maxWeekDivision = `Division ${division}`;
              }
            }
          }
        }

        this.leagueStats = { matchesPlayed: totalMatchDays, gamesPlayed: 0, uniquePlayers: totalTeams, totalPlaytime: '' };
        this.divisionChampions = champions;
        this.maxLeagueWeek = maxWeek;
        this.maxLeagueWeekDivision = maxWeekDivision;
        this.onDataLoaded();
      },
      error: () => this.onDataLoaded()
    });
  }

  private loadScrimsData(): void {
    this.scrimsDataService.getScrimsLeaderboard().subscribe({
      next: data => {
        this.scrimsStats = {
          matchesPlayed: data.totalScrims,
          gamesPlayed: 0,
          uniquePlayers: data.totalPlayers,
          totalPlaytime: ''
        };
        this.scrimsLastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
        this.onDataLoaded();
      },
      error: () => this.onDataLoaded()
    });
  }

  private onDataLoaded(): void {
    this.pendingLoads--;
    if (this.pendingLoads <= 0) {
      this.buildActivityFeed();
    }
  }

  private buildActivityFeed(): void {
    const items: ActivityItem[] = [];

    if (this.maxLeagueWeek > 0) {
      items.push({
        icon: '🏆',
        title: `Match Day ${this.maxLeagueWeek} — ${this.maxLeagueWeekDivision}`,
        description: 'View league standings and match history'
      });
      items.push({
        icon: '📊',
        title: `Season 14 — Week ${this.maxLeagueWeek} in progress`,
        description: `${this.leagueStats.matchesPlayed} match days completed across all divisions`
      });
    }

    if (this.scrimsLastUpdated) {
      const dateStr = this.scrimsLastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      items.push({
        icon: '⚡',
        title: `Scrims — ${dateStr}`,
        description: 'View recent scrim games',
        time: dateStr
      });
    }

    if (items.length === 0) {
      items.push({
        icon: '🏆',
        title: 'Season 14 underway',
        description: 'Check back soon for match results.'
      });
    }

    this.recentActivity = items;
  }
}
