import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatchDayResults } from '../models/match-day-results.model';
import { MatchResults } from '../components/match/match-results.component';
import { MockMatchData } from './mock-data';

export interface MatchDetail {
  id: string;
  weekNumber: number;
  matchDay: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  division: string;
  divisionTier: number;
  teamsCount: number;
  gamesPlayed?: number;
  totalGames?: number;
  winner?: string;
  streamUrl?: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchDataService {
  
  constructor() { }

  /**
   * Sample matches across different divisions
   * This simulates what would come from a real API
   */
  private getSampleMatches(): MatchDetail[] {
    return [
      {
        id: 'week1-match1',
        weekNumber: 1,
        matchDay: 'Week 1 - Opening Day',
        date: '2024-12-01',
        time: '7:00 PM EST',
        status: 'completed',
        division: 'Pinnacle',
        divisionTier: 1,
        teamsCount: 20,
        gamesPlayed: 6,
        totalGames: 6,
        winner: 'Storm Legends',
        description: 'Season 11 kicks off with the elite Pinnacle Division teams battling for early season points and momentum.'
      },
      {
        id: 'week2-match1',
        weekNumber: 2,
        matchDay: 'Week 2 - Regular Season',
        date: '2024-12-08',
        time: '7:00 PM EST',
        status: 'completed',
        division: 'Pinnacle',
        divisionTier: 1,
        teamsCount: 20,
        gamesPlayed: 6,
        totalGames: 6,
        winner: 'Apex Predators',
        description: 'Week 2 action continues with intense competition as teams fight for playoff positioning.'
      },
      {
        id: 'week1-diamond1',
        weekNumber: 1,
        matchDay: 'Week 1 - Diamond Division',
        date: '2024-12-02',
        time: '8:00 PM EST',
        status: 'completed',
        division: 'Diamond',
        divisionTier: 2,
        teamsCount: 20,
        gamesPlayed: 6,
        totalGames: 6,
        winner: 'Digital Legends',
        description: 'Diamond Division teams showcase their skills in the season opener.'
      },
      {
        id: 'week1-platinum1',
        weekNumber: 1,
        matchDay: 'Week 1 - Platinum Division',
        date: '2024-12-03',
        time: '7:30 PM EST',
        status: 'completed',
        division: 'Platinum',
        divisionTier: 3,
        teamsCount: 20,
        gamesPlayed: 6,
        totalGames: 6,
        winner: 'Shadow Squad',
        description: 'Platinum Division begins their campaign with exciting matches and emerging talent.'
      },
      {
        id: 'week3-match1',
        weekNumber: 3,
        matchDay: 'Week 3 - Championship Series',
        date: '2024-12-15',
        time: '7:00 PM EST',
        status: 'upcoming',
        division: 'Pinnacle',
        divisionTier: 1,
        teamsCount: 20,
        gamesPlayed: 0,
        totalGames: 6,
        description: 'Week 3 brings us closer to the playoffs with crucial matches determining final standings.'
      },
      {
        id: 'week4-match1',
        weekNumber: 4,
        matchDay: 'Week 4 - Playoff Push',
        date: '2024-12-22',
        time: '7:00 PM EST',
        status: 'upcoming',
        division: 'Pinnacle',
        divisionTier: 1,
        teamsCount: 20,
        gamesPlayed: 0,
        totalGames: 6,
        description: 'The final week of regular season play. Teams make their last push for playoff positioning.'
      }
    ];
  }
}
