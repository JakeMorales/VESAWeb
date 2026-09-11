import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Division } from '../league.component';
import { DivisionHeaderComponent } from '../../../components/league/division-header.component';
import { CurrentMatchComponent } from '../../../components/league/current-match.component';
import { DivisionStandingsComponent } from '../../../components/league/division-standings.component';
import { MatchHistoryComponent } from '../../../components/league/match-history.component';
import { DivisionInfoComponent } from '../../../components/league/division-info.component';
import { LeagueService } from '../../../services/league.service';
import { forkJoin } from 'rxjs';

export interface Team {
  id: string;
  name: string;
  points: number;
  wins: number;
  gamesPlayed: number;
  kills: number;
  placement: number;
  trend: 'up' | 'down' | 'same';
  trendDelta: number;
}

export interface Match {
  id: string;
  weekNumber: number;
  matchDay: string;
  filename: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  teamsCount: number;
  gamesPlayed?: number;
  totalGames?: number;
  winner?: string;
  streamUrl?: string;
  isFinale?: boolean;
}

export interface MatchResult {
  matchId: string;
  teamName: string;
  placement: number;
  kills: number;
  points: number;
}

const DIVISION_META: Record<number, { name: string; romanNumeral: string; color: string; description: string }> = {
  1: { name: 'Pinnacle',   romanNumeral: 'I',    color: '#ff2c5c', description: 'The elite tier featuring the most skilled teams in VESA.' },
  2: { name: 'Vanguard',   romanNumeral: 'II',   color: '#2c9cff', description: 'High-level competitive play with rising stars.' },
  3: { name: 'Ascendant',  romanNumeral: 'III',  color: '#00d4ff', description: 'Competitive teams working towards the next level.' },
  4: { name: 'Emergent',   romanNumeral: 'IV',   color: '#7c3aed', description: 'Developing teams with strong potential.' },
  5: { name: 'Challenger', romanNumeral: 'V',    color: '#f59e0b', description: 'Ambitious teams ready to prove themselves.' },
  6: { name: 'Prospect',   romanNumeral: 'VI',   color: '#ec4899', description: 'Entry-level competitive teams building their skills.' },
  7: { name: 'Aspirant',   romanNumeral: 'VII',  color: '#14b8a6', description: 'Newest teams finding their footing.' },
  8: { name: 'Contenders', romanNumeral: 'VIII', color: '#10b981', description: 'Entry-level teams new to structured competition.' },
};

const NAME_TO_DIVISION: Record<string, number> = Object.fromEntries(
  Object.entries(DIVISION_META).map(([num, meta]) => [meta.name.toLowerCase(), parseInt(num)])
);

// Per-division Twitch channel — update per-season as streamers are assigned
const DIVISION_STREAM_CHANNELS: Record<number, string> = {
  1: 'virida3', 2: 'virida3', 3: 'virida3', 4: 'virida3',
  5: 'virida3', 6: 'virida3', 7: 'virida3', 8: 'virida3',
};

const isFinalsFile = (f: string) => /playoffs|finals|_mp/i.test(f);

@Component({
  selector: 'app-division',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DivisionHeaderComponent,
    CurrentMatchComponent,
    DivisionStandingsComponent,
    MatchHistoryComponent,
    DivisionInfoComponent
  ],
  templateUrl: './division.component.html',
  styleUrl: './division.component.css'
})
export class DivisionComponent implements OnInit {
  division: Division | null = null;
  currentWeek = 0;
  totalWeeks = 6;
  mpPlayed = false;
  loading = true;
  error = false;

  divisionNumber: string = '';
  streamChannel: string = '';
  teams: Team[] = [];
  matches: Match[] = [];
  currentMatch?: Match;

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const divisionId = params['id'] as string;
      const divNum = NAME_TO_DIVISION[divisionId.toLowerCase()];

      if (!divNum) {
        this.error = true;
        this.loading = false;
        return;
      }

      const meta = DIVISION_META[divNum];
      this.division = {
        id: divisionId,
        name: meta.name,
        romanNumeral: meta.romanNumeral,
        tier: divNum,
        description: meta.description,
        teamCount: 0,
        currentWeek: 0,
        mpPlayed: false,
        color: meta.color
      };

      const season = 'Season_14';
      const divStr = String(divNum);
      this.divisionNumber = divStr;
      this.streamChannel = DIVISION_STREAM_CHANNELS[divNum] ?? 'virida3';

      forkJoin({
        summary: this.leagueService.getDivisionSummary(season, divStr),
        files: this.leagueService.getMatchFiles(season, divStr)
      }).subscribe({
        next: ({ summary, files }) => {
          this.teams = (summary?.seasonStandings ?? []).map(entry => ({
            id: String(entry.teamId),
            name: entry.teamName,
            points: entry.points,
            wins: entry.wins ?? 0,
            gamesPlayed: entry.matchDaysPlayed ?? 0,
            kills: entry.kills ?? 0,
            placement: entry.rank,
            trend: entry.trend ?? 'same',
            trendDelta: entry.trendDelta ?? 0
          }));

          const weekFiles = files.filter(f => /Week_\d+\.json$/i.test(f) && !isFinalsFile(f));
          const finalsFiles = files.filter(isFinalsFile);
          this.currentWeek = weekFiles.length;
          this.mpPlayed = finalsFiles.length > 0;

          this.division = {
            ...this.division!,
            teamCount: this.teams.length,
            currentWeek: this.currentWeek,
            mpPlayed: this.mpPlayed
          };

          const weekMatches: Match[] = weekFiles.map(filename => {
            const weekMatch = filename.match(/Week_(\d+)/i);
            const weekNum = weekMatch ? parseInt(weekMatch[1]) : 0;
            return {
              id: `Season_14~${divStr}~${filename}`,
              weekNumber: weekNum,
              matchDay: `Week ${weekNum}`,
              filename,
              date: '',
              time: '',
              status: 'completed' as const,
              teamsCount: this.teams.length,
              isFinale: false,
            };
          });

          const finaleMatches: Match[] = finalsFiles.map(filename => ({
            id: `Season_14~${divStr}~${filename}`,
            weekNumber: 999,
            matchDay: 'Match Point Finals',
            filename,
            date: '',
            time: '',
            status: 'completed' as const,
            teamsCount: this.teams.length,
            isFinale: true,
          }));

          const upcomingWeeks: Match[] = [];
          for (let w = weekFiles.length + 1; w <= this.totalWeeks; w++) {
            upcomingWeeks.push({
              id: `s14-div${divNum}-week${w}-upcoming`,
              weekNumber: w,
              matchDay: `Week ${w}`,
              filename: '',
              date: '',
              time: '',
              status: 'upcoming' as const,
              teamsCount: this.teams.length,
              isFinale: false,
            });
          }

          const upcomingFinals: Match[] = finalsFiles.length === 0 ? [{
            id: `s14-div${divNum}-finals-upcoming`,
            weekNumber: 999,
            matchDay: 'Match Point Finals',
            filename: '',
            date: '',
            time: '',
            status: 'upcoming' as const,
            teamsCount: this.teams.length,
            isFinale: true,
          }] : [];

          this.matches = [...finaleMatches, ...weekMatches, ...upcomingWeeks, ...upcomingFinals];

          // Show the most recently completed match in the Current Match section.
          // Match Point Finals is chronologically last, so it takes priority once played;
          // otherwise fall back to the latest completed regular week (Week 5 before Week 4, etc.).
          this.currentMatch = finaleMatches.find(m => m.status === 'completed')
            ?? [...weekMatches]
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .find(m => m.status === 'completed');

          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    });
  }
}
