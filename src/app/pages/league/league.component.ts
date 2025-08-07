import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './league.component.html',
  styleUrl: './league.component.css'
})
export class LeagueComponent {
  currentSeason = 3;
  totalWeeks = 5;
  currentWeek = 3;
  finalsDate = 'March 15, 2025';

  divisions: Division[] = [
    {
      id: 'pinnacle',
      name: 'Pinnacle',
      romanNumeral: 'I',
      tier: 1,
      description: 'The elite tier featuring the most skilled teams in VESA',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#ff2c5c'
    },
    {
      id: 'vanguard',
      name: 'Vanguard',
      romanNumeral: 'II',
      tier: 2,
      description: 'High-level competitive play with rising stars',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#2c9cff'
    },
    {
      id: 'ascendant',
      name: 'Ascendant',
      romanNumeral: 'III',
      tier: 3,
      description: 'Competitive teams working towards the next level',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#00d4ff'
    },
    {
      id: 'emergent',
      name: 'Emergent',
      romanNumeral: 'IV',
      tier: 4,
      description: 'Developing teams with strong potential',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#7c3aed'
    },
    {
      id: 'challengers',
      name: 'Challengers',
      romanNumeral: 'V',
      tier: 5,
      description: 'Ambitious teams ready to prove themselves',
      teamCount: 20,
      currentWeek: this.currentWeek,
      color: '#f59e0b'
    },
    {
      id: 'contenders',
      name: 'Contenders',
      romanNumeral: 'VI',
      tier: 6,
      description: 'Entry-level competitive teams building their skills',
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
}
