import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeagueHeaderComponent } from '../../components/league/league-header.component';
import { DivisionsGridComponent } from '../../components/league/divisions-grid.component';
import { LeagueService } from '../../services/league.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface Division {
  id: string;
  name: string;
  romanNumeral: string;
  tier: number;
  description: string;
  teamCount: number;
  currentWeek: number;
  color: string;
}

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [CommonModule, RouterModule, LeagueHeaderComponent, DivisionsGridComponent],
  templateUrl: './league.component.html',
  styleUrl: './league.component.css'
})
export class LeagueComponent implements OnInit {
  currentSeason = 14;
  totalWeeks = 6;
  seasonStartDate = new Date('2025-07-21');
  finalsDate = 'September 1, 2025';

  divisions: Division[] = [];
  loading = true;
  error = false;

  private readonly DIVISION_META: Record<number, { name: string; romanNumeral: string; color: string; description: string }> = {
    1: { name: 'Pinnacle',   romanNumeral: 'I',    color: '#ff2c5c', description: 'The elite tier featuring the most skilled teams in VESA.' },
    2: { name: 'Vanguard',   romanNumeral: 'II',   color: '#2c9cff', description: 'High-level competitive play with rising stars.' },
    3: { name: 'Ascendant',  romanNumeral: 'III',  color: '#00d4ff', description: 'Competitive teams working towards the next level.' },
    4: { name: 'Emergent',   romanNumeral: 'IV',   color: '#7c3aed', description: 'Developing teams with strong potential.' },
    5: { name: 'Challenger', romanNumeral: 'V',    color: '#f59e0b', description: 'Ambitious teams ready to prove themselves.' },
    6: { name: 'Prospect',   romanNumeral: 'VI',   color: '#ec4899', description: 'Entry-level competitive teams building their skills.' },
    7: { name: 'Aspirant',   romanNumeral: 'VII',  color: '#14b8a6', description: 'Newest teams finding their footing.' },
    8: { name: 'Contenders', romanNumeral: 'VIII', color: '#10b981', description: 'Entry-level teams new to structured competition.' },
  };

  constructor(private leagueService: LeagueService) {}

  get currentWeek(): number {
    if (this.divisions.length === 0) return 0;
    return Math.max(...this.divisions.map(d => d.currentWeek));
  }

  ngOnInit(): void {
    this.leagueService.getDivisions('Season_14').pipe(
      switchMap(divNums => {
        if (divNums.length === 0) {
          return of([] as Division[]);
        }
        const requests = divNums.map(divNum =>
          forkJoin({
            files: this.leagueService.getMatchFiles('Season_14', divNum),
            summary: this.leagueService.getDivisionSummary('Season_14', divNum)
          }).pipe(
            map(({ files, summary }) => {
              const tier = parseInt(divNum, 10);
              const meta = this.DIVISION_META[tier] ?? {
                name: `Division ${divNum}`,
                romanNumeral: divNum,
                color: '#888888',
                description: ''
              };
              const weekFiles = files.filter(f => /Week_\d+\.json$/i.test(f));
              const currentWeek = weekFiles.length;
              const teamCount = summary?.seasonStandings?.length ?? 0;
              return {
                id: meta.name.toLowerCase(),
                name: meta.name,
                romanNumeral: meta.romanNumeral,
                tier,
                description: meta.description,
                teamCount,
                currentWeek,
                color: meta.color
              } as Division;
            })
          )
        );
        return forkJoin(requests);
      }),
      catchError(() => {
        this.error = true;
        this.loading = false;
        return of([] as Division[]);
      })
    ).subscribe({
      next: (divs) => {
        this.divisions = divs.sort((a, b) => a.tier - b.tier);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  getProgressPercentage(): number {
    return (this.currentWeek / this.totalWeeks) * 100;
  }

  getWeeksRemaining(): number {
    return this.totalWeeks - this.currentWeek;
  }

  getDaysIntoSeason(): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - this.seasonStartDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
