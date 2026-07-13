import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ActivatedRoute, RouterLink } from '@angular/router';
  import { Observable, of, forkJoin } from 'rxjs';
  import { map, catchError, switchMap } from 'rxjs/operators';
  import { NhostService, Player, ScrimPlayerStats } from '../../services/nhost.service';
  import { LeagueService, PlayerLeagueAppearance } from '../../services/league.service';

  const DIVISION_NAMES: Record<number, string> = {
    1: 'Pinnacle', 2: 'Vanguard', 3: 'Ascendant', 4: 'Emergent',
    5: 'Challenger', 6: 'Prospect', 7: 'Aspirant', 8: 'Contenders'
  };
  // TODO's: Line 14, Line 295
 
  // TODO: need to add Win Rate and Top-3 Rate to the scrim_player_stats table in the database, then add them to this interface
  interface AggregateStats {
    totalScrims: number;
    totalGames: number;
    totalKills: number;
    totalDamage: number;
    totalKnockdowns: number;
    totalRevives: number;
    totalRespawns: number;
    avgKillsPerGame: number;
    avgDamagePerGame: number;
    kdRatio: number;
  }

  interface LeagueSummary {
    division: string;
    teamName: string;
    avgPlacement: number;
    avgKills: number;
    avgDamage: number;
    topLegend: string | null;
    gamesPlayed: number;
  }

  interface PlayerSeasonRecord {
    season: string;
    divisionNum: number;
    divisionName: string;
    divisionSlug: string;
    teamName: string;
    gamesPlayed: number;
    seasonPlacement: number | null;
    totalPoints: number | null;
  }

  @Component({
    selector: 'app-player-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
      <ng-container *ngIf="loading">
        <div class="state-msg">Loading...</div>
      </ng-container>

      <ng-container *ngIf="!loading && !player">
        <div class="state-msg error">Player not found.</div>
      </ng-container>

      <div class="profile-container" *ngIf="!loading && player">

        <!-- HEADER -->
        <div class="profile-header">
          <!-- Note: the avatar, the platform badge wont show until theres a connection to the DB and switched to getPlayerById! -->
          <img *ngIf="player.avatar_url" [src]="player.avatar_url" class="avatar" alt="avatar" />
          <div *ngIf="!player.avatar_url" class="avatar-placeholder">{{ initials }}</div>
          <div class="player-info">
            <div class="name-row">
              <h1>{{ player.display_name }}</h1>
              <span class="badge platform-badge" *ngIf="player.platform">{{ platformLabel(player.platform) }}</span>
            </div>
            <div class="badges">
              <span class="badge elo">ELO {{ player.elo ?? 'Unranked' }}</span>
            </div>
            <a *ngIf="player.overstat_id"
               [href]="'https://overstat.gg/player/' + player.overstat_id"
               target="_blank" rel="noopener" class="overstat-link">
              Overstat ↗
            </a>

            <!-- League Summary -->
            <div>
              <p class="summary-heading">League Summary</p>
              <div class="league-summary">
                <div class="summary-row">
                  <span class="summary-label">Division</span>
                  <span class="summary-value">{{ leagueSummary?.division ?? '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Team</span>
                  <span class="summary-value">{{ leagueSummary?.teamName ?? '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Avg Placement</span>
                  <span class="summary-value">{{ leagueSummary ? (leagueSummary.avgPlacement | number:'1.1-1') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Avg Kills</span>
                  <span class="summary-value">{{ leagueSummary ? (leagueSummary.avgKills | number:'1.1-1') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Avg Damage</span>
                  <span class="summary-value">{{ leagueSummary ? (leagueSummary.avgDamage | number:'1.0-0') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Top Legend</span>
                  <span class="summary-value">{{ leagueSummary?.topLegend ?? '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Scrims Summary -->
            <div>
              <p class="summary-heading">Scrims Summary</p>
              <div class="league-summary">
                <div class="summary-row">
                  <span class="summary-label">Games</span>
                  <span class="summary-value">{{ agg ? agg.totalGames : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Avg Kills</span>
                  <span class="summary-value">{{ agg ? (agg.avgKillsPerGame | number:'1.1-1') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Avg Damage</span>
                  <span class="summary-value">{{ agg ? (agg.avgDamagePerGame | number:'1.0-0') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">K/D</span>
                  <span class="summary-value">{{ agg ? (agg.kdRatio | number:'1.2-2') : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Revives</span>
                  <span class="summary-value">{{ agg ? agg.totalRevives : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Respawns</span>
                  <span class="summary-value">{{ agg ? agg.totalRespawns : '-' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Top Legend</span>
                  <span class="summary-value">{{ characterUsage.length > 0 ? characterUsage[0].name : '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SCRIM STATS SUMMARY -->
        <section class="section">
          <h2>Scrim Stats</h2>
          <div class="stat-cards" *ngIf="agg && agg.totalGames > 0">
            <div class="stat-card">
              <div class="val">{{ agg.totalGames }}</div>
              <div class="lbl">Games Played</div>
            </div>
            <div class="stat-card">
              <div class="val">{{ agg.avgKillsPerGame | number:'1.1-1' }}</div>
              <div class="lbl">Avg Kills</div>
            </div>
            <div class="stat-card">
              <div class="val">{{ agg.avgDamagePerGame | number:'1.0-0' }}</div>
              <div class="lbl">Avg Damage</div>
            </div>
            <div class="stat-card">
              <div class="val">{{ agg.kdRatio | number:'1.2-2' }}</div>
              <div class="lbl">K/D</div>
            </div>
            <div class="stat-card">
              <div class="val">-</div>
              <div class="lbl">Win Rate</div>
            </div>
            <div class="stat-card">
              <div class="val">-</div>
              <div class="lbl">Top-3 Rate</div>
            </div>
            <div class="stat-card">
              <div class="val">{{ agg.totalRevives }}</div>
              <div class="lbl">Revives Given</div>
            </div>
            <div class="stat-card">
              <div class="val">{{ agg.totalRespawns }}</div>
              <div class="lbl">Respawns Given</div>
            </div>
          </div>
          <p class="no-data" *ngIf="!agg || agg.totalGames === 0">No scrim data yet.</p>
        </section>

        <!-- RECENT SCRIM PERFORMANCE -->
        <section class="section" *ngIf="recentScrims.length > 0">
          <h2>Recent Scrims</h2>
          <table class="scrim-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Games</th>
                <th>Kills</th>
                <th>Damage</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of (showAllScrims ? recentScrims : recentScrims.slice(0, PAGE_SIZE))">
                <td>
                  <a *ngIf="s.scrim?.overstat_link; else plain"
                     [href]="s.scrim!.overstat_link!" target="_blank" rel="noopener">
                    {{ s.scrim?.date_time_field | date:'MMM d, y' }}
                  </a>
                  <ng-template #plain>{{ s.scrim?.date_time_field | date:'MMM d, y' }}</ng-template>
                </td>
                <td>{{ s.games_played }}</td>
                <td>{{ s.kills }}</td>
                <td>{{ s.damage_dealt | number }}</td>
                <td>{{ s.score }}</td>
              </tr>
            </tbody>
          </table>
          <button *ngIf="recentScrims.length > PAGE_SIZE && !showAllScrims"
                  class="more-btn" (click)="showAllScrims = true">
            Show more ({{ recentScrims.length - PAGE_SIZE }} more)
          </button>
        </section>

        <!-- League History — one row per season, click to expand individual games -->
        <section class="section">
          <h2>League History</h2>
          <div *ngIf="leagueLoading" class="no-data">Loading...</div>
          <table class="scrim-table" *ngIf="!leagueLoading && seasonHistory.length > 0">
            <thead>
              <tr>
                <th>Season</th>
                <th>Division</th>
                <th>Team</th>
                <th>Placement</th>
                <th>Points</th>
                <th></th>
              </tr>
            </thead>
            <!-- Season rows -->
            <tbody>
              <ng-container *ngFor="let r of seasonHistory">
                <tr class="season-row" (click)="toggleSeason(r.season + '_' + r.divisionNum)">
                  <td>{{ seasonLabel(r.season) }}</td>
                  <td>{{ r.divisionName }}</td>
                  <td>{{ r.teamName }}</td>
                  <td>{{ r.seasonPlacement != null ? '#' + r.seasonPlacement : '-' }}</td>
                  <td>{{ r.totalPoints != null ? r.totalPoints + ' pts' : '-' }}</td>
                  <td><a *ngIf="r.divisionSlug" [routerLink]="['/league', r.divisionSlug]" class="div-link" (click)="$event.stopPropagation()">View Division ↗</a></td>
                </tr>
            <!-- Game rows for expanded season -->
                <ng-container *ngIf="expandedSeasons.has(r.season + '_' + r.divisionNum)">
                  <tr class="game-row" *ngFor="let g of getSeasonGames(r.season, r.divisionNum)">
                    <td class="game-week">↳ {{ weekLabel(g.week) }}{{ g.isPlayoffs ? ' · Finals' : '' }}</td>
                    <td></td>
                    <td>{{ g.teamName }}</td>
                    <td>#{{ g.teamPlacement }}</td>
                    <td>{{ g.kills }}K · {{ g.damage | number:'1.0-0' }} dmg</td>
                    <td>{{ g.assists }} ast · {{ g.revives }} rev</td>
                  </tr>
                </ng-container>
              </ng-container>
            </tbody>
          </table>
          <p class="no-data" *ngIf="!leagueLoading && seasonHistory.length === 0">No league data yet.</p>
        </section>

        <!-- Character Usage — only shown when data is present! -->
        <section class="section" *ngIf="characterUsage.length > 0">
          <h2>Legend Usage</h2>
          <div class="char-list">
            <div class="char-item" *ngFor="let c of characterUsage">
              <span class="char-name">{{ c.name }}</span>
              <span class="char-count">{{ c.count }} games</span>
            </div>
          </div>
        </section>

      </div>
    `,
    styleUrl: './player.profile.css'
  })
  
  export class PlayerProfileComponent implements OnInit {
    player: Player | null = null;
    agg: AggregateStats | null = null;
    recentScrims: ScrimPlayerStats[] = [];
    characterUsage: { name: string; count: number }[] = [];
    leagueHistory: PlayerLeagueAppearance[] = [];
    leagueSummary: LeagueSummary | null = null;
    seasonHistory: PlayerSeasonRecord[] = [];
    expandedSeasons = new Set<string>();
    loading = true;
    leagueLoading = true;
    initials = '';
    showAllScrims = false;
    readonly PAGE_SIZE = 6;

    constructor(
      private route: ActivatedRoute,
      private nhost: NhostService,
      private leagueService: LeagueService
    ) {}

    ngOnInit() {
      const name = decodeURIComponent(this.route.snapshot.paramMap.get('id')!);

      // TODO: swap to getPlayerById(uuid) once route uses UUID (scrim-bot#170) 
      this.nhost.getPlayerByDisplayName(name).subscribe({
        next: (player) => {
          this.player = player;
          this.initials = (player?.display_name ?? name).slice(0, 2).toUpperCase();
          this.loading = false;

          if (player?.id) {
            this.nhost.getPlayerScrimHistory(player.id).subscribe({
              next: (stats) => {
                this.agg = this.computeAggregate(stats);
                this.recentScrims = stats;
                this.characterUsage = this.parseCharacters(stats);
                if (this.leagueSummary && this.characterUsage.length > 0) {
                  this.leagueSummary = { ...this.leagueSummary, topLegend: this.characterUsage[0].name };
                }
              },
              error: () => {}
            });
          }
        },
        error: () => { this.loading = false; }
      });

    //  get the player's league history across all seasons, sort it, compute a summary, and build the season history for display
      this.leagueService.getSeasons().pipe(
        switchMap(seasons =>
          seasons.length
            ? forkJoin(seasons.map(s => this.leagueService.getPlayerLeagueHistory(name, s)))
            : of([[]] as PlayerLeagueAppearance[][])
        ),
        map(results => results.flat()),
        switchMap(appearances => {
          this.leagueHistory = this.sortLeagueNewestFirst(appearances);
          this.leagueSummary = this.computeLeagueSummary(this.leagueHistory);
          return this.buildSeasonHistory(appearances);
        })
      ).subscribe({
        next: (records) => {
          this.seasonHistory = records;
          this.leagueLoading = false;
        },
        error: () => { this.leagueLoading = false; }
      });
    }
    // Returns a formatted label for a season based on its name.
    seasonLabel(season: string): string {
      const m = season.match(/\d+/);
      return m ? `Season ${m[0]}` : season;
    }

    // Toggles the expanded/collapsed state of a season in the league history table.
    toggleSeason(key: string): void {
      if (this.expandedSeasons.has(key)) {
        this.expandedSeasons.delete(key);
      } else {
        this.expandedSeasons.add(key);
      }
    }

    // Returns a formatted label for a week based on its name, handling "Week_X", "playoffs", and "finals" cases.
    weekLabel(week: string): string {
      const m = week.match(/Week_(\d+)/i);
      if (m) return `Week ${m[1]}`;
      if (/playoffs/i.test(week)) return 'Playoffs';
      if (/finals/i.test(week)) return 'Finals';
      return week;
    }

    // Returns the player's league appearances for a specific season and division, sorted by week and playoffs status.
    getSeasonGames(season: string, divisionNum: number): PlayerLeagueAppearance[] {
      return this.leagueHistory
        .filter(a => a.season === season && parseInt(a.division, 10) === divisionNum)
        .sort((a, b) => {
          if (a.isPlayoffs !== b.isPlayoffs) return a.isPlayoffs ? 1 : -1;
          const wA = parseInt(String(a.week).match(/\d+/)?.[0] ?? '0', 10);
          const wB = parseInt(String(b.week).match(/\d+/)?.[0] ?? '0', 10);
          return wA - wB;
        });
    }

    // The player's league appearances by season and division, fetches the division summaries, and constructs a list of PlayerSeasonRecord objects for display in the league history table.
    private buildSeasonHistory(appearances: PlayerLeagueAppearance[]): Observable<PlayerSeasonRecord[]> {
      if (!appearances.length) return of([]);

      const bySeasonDiv = new Map<string, PlayerLeagueAppearance[]>();
      appearances.forEach(a => {
        const key = `${a.season}_${a.division}`;
        if (!bySeasonDiv.has(key)) bySeasonDiv.set(key, []);
        bySeasonDiv.get(key)!.push(a);
      });

      const fetches = Array.from(bySeasonDiv.values()).map(apps => {
        const { season, division } = apps[0];

        const teamCounts: Record<string, number> = {};
        apps.forEach(a => { teamCounts[a.teamName] = (teamCounts[a.teamName] || 0) + 1; });
        const teamName = Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0][0];

        const divNum = parseInt(division, 10);
        const divisionName = DIVISION_NAMES[divNum] ?? `Division ${division}`;
        const divisionSlug = divisionName.toLowerCase();

        return this.leagueService.getDivisionSummary(season, division).pipe(
          map(summary => {
            const standing = summary?.seasonStandings.find(s =>
              s.teamName.toLowerCase() === teamName.toLowerCase()
            );
            return {
              season,
              divisionNum: divNum,
              divisionName,
              divisionSlug,
              teamName,
              gamesPlayed: apps.length,
              seasonPlacement: standing?.rank ?? null,
              totalPoints: standing?.points ?? null
            } as PlayerSeasonRecord;
          }),
          catchError(() => of({
            season,
            divisionNum: divNum,
            divisionName,
            divisionSlug,
            teamName,
            gamesPlayed: apps.length,
            seasonPlacement: null,
            totalPoints: null
          } as PlayerSeasonRecord))
        );
      });

      return forkJoin(fetches).pipe(
        map(records => records.sort((a, b) => {
          const numA = parseInt(a.season.match(/\d+/)?.[0] ?? '0', 10);
          const numB = parseInt(b.season.match(/\d+/)?.[0] ?? '0', 10);
          return numB - numA;
        }))
      );
    }

    //  Computes aggregate statistics from ScrimPlayerStats, including total games, kills, damage, knockdowns, revives, respawns, average kills per game, average damage per game, and K/D ratio.
    private computeAggregate(stats: ScrimPlayerStats[]): AggregateStats {
      const totalGames      = stats.reduce((s, r) => s + (r.games_played ?? 0), 0);
      const totalKills      = stats.reduce((s, r) => s + (r.kills ?? 0), 0);
      const totalDamage     = stats.reduce((s, r) => s + (r.damage_dealt ?? 0), 0);
      const totalKnockdowns = stats.reduce((s, r) => s + (r.knockdowns ?? 0), 0);
      const totalRevives    = stats.reduce((s, r) => s + (r.revives_given ?? 0), 0);
      const totalRespawns   = stats.reduce((s, r) => s + (r.respawns_given ?? 0), 0);
      return {
        totalScrims: stats.length,
        totalGames,
        totalKills,
        totalDamage,
        totalKnockdowns,
        totalRevives,
        totalRespawns,
        avgKillsPerGame:  totalGames > 0 ? totalKills / totalGames : 0,
        avgDamagePerGame: totalGames > 0 ? totalDamage / totalGames : 0,
        kdRatio: totalKnockdowns > 0 ? totalKills / totalKnockdowns : totalKills
      };
    }

    // Returns a label for the player's platform, mapping known platform codes to display names. If the platform code is unrecognized, it returns the original string.
    platformLabel(platform: string): string {
      const labels: Record<string, string> = {
        PC: 'PC', pc: 'PC',
        PSN: 'PlayStation', psn: 'PlayStation',
        XBOX: 'Xbox', xbox: 'Xbox'
      };
      return labels[platform] ?? platform;
    }

    // Sorts the player's league appearances in descending order, prioritizing playoff appearances first, then by week number. Returns a new sorted array without modifying the original.
    private sortLeagueNewestFirst(appearances: PlayerLeagueAppearance[]): PlayerLeagueAppearance[] {
      return [...appearances].sort((a, b) => {
        if (a.isPlayoffs !== b.isPlayoffs) return a.isPlayoffs ? -1 : 1;
        const weekA = parseInt(String(a.week).match(/\d+/)?.[0] ?? '0', 10);
        const weekB = parseInt(String(b.week).match(/\d+/)?.[0] ?? '0', 10);
        return weekB - weekA;
      });
    }

    // Computes a summary of the player's league performance based on their appearances.
    private computeLeagueSummary(appearances: PlayerLeagueAppearance[]): LeagueSummary | null {
      if (!appearances.length) return null;
      const n = appearances.length;
      const avgPlacement = appearances.reduce((s, a) => s + a.teamPlacement, 0) / n;
      const avgKills     = appearances.reduce((s, a) => s + a.kills, 0) / n;
      const avgDamage    = appearances.reduce((s, a) => s + a.damage, 0) / n;

      const divCount: Record<string, number> = {};
      appearances.forEach(a => { divCount[a.division] = (divCount[a.division] || 0) + 1; });
      const divNum = parseInt(Object.entries(divCount).sort((a, b) => b[1] - a[1])[0][0], 10);
      const division = DIVISION_NAMES[divNum] ?? `Division ${divNum}`;

      const teamCount: Record<string, number> = {};
      appearances.forEach(a => { teamCount[a.teamName] = (teamCount[a.teamName] || 0) + 1; });
      const teamName = Object.entries(teamCount).sort((a, b) => b[1] - a[1])[0][0];

      const topLegend = this.characterUsage.length > 0 ? this.characterUsage[0].name : null;

      return { division, teamName, avgPlacement, avgKills, avgDamage, topLegend, gamesPlayed: n };
    }

    // Parses the player's character usage statistics from scrim stats and returns a sorted list of the most used characters.
    private parseCharacters(stats: ScrimPlayerStats[]): { name: string; count: number }[] {
      const counts: Record<string, number> = {};
      for (const row of stats) {
        if (!row.characters) continue;
        let chars: string[] = [];
        try { chars = JSON.parse(row.characters); }
        catch { chars = row.characters.split(',').map(c => c.trim()).filter(Boolean); }
        chars.forEach(c => { counts[c] = (counts[c] || 0) + (row.games_played ?? 1); });
      }
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
  };
