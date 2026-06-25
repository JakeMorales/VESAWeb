import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeagueHeaderComponent } from '../../components/league/league-header.component';
import { DivisionsGridComponent } from '../../components/league/divisions-grid.component';

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
export class LeagueComponent {
  currentSeason = 14;
  totalWeeks = 5;
  currentWeek = 2; // Started 7-21, now 8-7 = 2 weeks (with bye week)
  seasonStartDate = new Date('2025-07-21');
  finalsDate = 'September 1, 2025';

  divisions: Division[] = [
    {
      id: 'pinnacle',
      name: 'Pinnacle',
      romanNumeral: 'I',
      tier: 1,
      description: 'The elite tier featuring the most skilled teams in VESA. Promotion/relegation active.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#ff2c5c'
    },
    {
      id: 'vanguard',
      name: 'Vanguard',
      romanNumeral: 'II',
      tier: 2,
      description: 'High-level competitive play with rising stars. Promotion/relegation active.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#2c9cff'
    },
    {
      id: 'ascendant',
      name: 'Ascendant',
      romanNumeral: 'III',
      tier: 3,
      description: 'Competitive teams working towards the next level. Static division for this season.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#00d4ff'
    },
    {
      id: 'emergent',
      name: 'Emergent',
      romanNumeral: 'IV',
      tier: 4,
      description: 'Developing teams with strong potential. Static division for this season.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#7c3aed'
    },
    {
      id: 'challengers',
      name: 'Challengers',
      romanNumeral: 'V',
      tier: 5,
      description: 'Ambitious teams ready to prove themselves. Static division for this season.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#f59e0b'
    },
    {
      id: 'contenders',
      name: 'Contenders',
      romanNumeral: 'VI',
      tier: 6,
      description: 'Entry-level competitive teams building their skills. Static division for this season.',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#10b981'
    }
  ];

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
