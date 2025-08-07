import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Division } from '../league.component';

export interface Team {
  id: string;
  name: string;
  points: number;
  wins: number;
  gamesPlayed: number;
  kills: number;
  placement: number;
  trend: 'up' | 'down' | 'same';
}

@Component({
  selector: 'app-division',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './division.component.html',
  styleUrl: './division.component.css'
})
export class DivisionComponent implements OnInit {
  division: Division | null = null;
  currentWeek = 2; // Updated to match actual season progress
  totalWeeks = 5;

  divisions: Division[] = [
    {
      id: 'pinnacle',
      name: 'Pinnacle',
      romanNumeral: 'I',
      tier: 1,
      description: 'The elite tier featuring the most skilled teams in VESA. Promotion/relegation active.',
      teamCount: 20,
      currentWeek: 2,
      color: '#ff2c5c'
    },
    {
      id: 'vanguard',
      name: 'Vanguard',
      romanNumeral: 'II',
      tier: 2,
      description: 'High-level competitive play with rising stars. Promotion/relegation active.',
      teamCount: 20,
      currentWeek: 2,
      color: '#2c9cff'
    },
    {
      id: 'ascendant',
      name: 'Ascendant',
      romanNumeral: 'III',
      tier: 3,
      description: 'Competitive teams working towards the next level. Static division for this season.',
      teamCount: 20,
      currentWeek: 2,
      color: '#00d4ff'
    },
    {
      id: 'emergent',
      name: 'Emergent',
      romanNumeral: 'IV',
      tier: 4,
      description: 'Developing teams with strong potential. Static division for this season.',
      teamCount: 20,
      currentWeek: 2,
      color: '#7c3aed'
    },
    {
      id: 'challengers',
      name: 'Challengers',
      romanNumeral: 'V',
      tier: 5,
      description: 'Ambitious teams ready to prove themselves. Static division for this season.',
      teamCount: 20,
      currentWeek: 2,
      color: '#f59e0b'
    },
    {
      id: 'contenders',
      name: 'Contenders',
      romanNumeral: 'VI',
      tier: 6,
      description: 'Entry-level competitive teams building their skills. Static division for this season.',
      teamCount: 20,
      currentWeek: 2,
      color: '#10b981'
    }
  ];

  teams: Team[] = [
    { id: '1', name: 'Apex Predators', points: 87, wins: 4, gamesPlayed: 8, kills: 68, placement: 1, trend: 'up' },
    { id: '2', name: 'Storm Legends', points: 82, wins: 3, gamesPlayed: 8, kills: 61, placement: 2, trend: 'same' },
    { id: '3', name: 'Shadow Squad', points: 78, wins: 3, gamesPlayed: 8, kills: 59, placement: 3, trend: 'up' },
    { id: '4', name: 'Digital Legends', points: 71, wins: 2, gamesPlayed: 8, kills: 52, placement: 4, trend: 'down' },
    { id: '5', name: 'Void Runners', points: 68, wins: 2, gamesPlayed: 8, kills: 48, placement: 5, trend: 'up' },
    { id: '6', name: 'Catalyst Gaming', points: 63, wins: 2, gamesPlayed: 8, kills: 45, placement: 6, trend: 'same' },
    { id: '7', name: 'Phoenix Rising', points: 59, wins: 1, gamesPlayed: 8, kills: 41, placement: 7, trend: 'down' },
    { id: '8', name: 'Thunder Wolves', points: 55, wins: 1, gamesPlayed: 8, kills: 38, placement: 8, trend: 'up' },
    { id: '9', name: 'Neon Knights', points: 51, wins: 1, gamesPlayed: 8, kills: 35, placement: 9, trend: 'down' },
    { id: '10', name: 'Crimson Elite', points: 47, wins: 0, gamesPlayed: 8, kills: 32, placement: 10, trend: 'same' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const divisionId = params['id'];
      this.division = this.divisions.find(d => d.id === divisionId) || null;
    });
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-same';
    }
  }
}
