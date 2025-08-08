import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatchHeaderComponent, MatchDetail } from '../../components/match/match-header.component';
import { MatchResultsComponent, MatchResults, GameResult } from '../../components/match/match-results.component';
import { MatchDayTableComponent, MatchDayResults, TeamGameResult, PlayerStats } from '../../components/match/match-day-table.component';
import { MatchLiveSectionComponent } from '../../components/match/match-live-section.component';
import { MatchUpcomingSectionComponent } from '../../components/match/match-upcoming-section.component';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatchHeaderComponent, 
    MatchResultsComponent,
    MatchDayTableComponent,
    MatchLiveSectionComponent, 
    MatchUpcomingSectionComponent
  ],
  template: `
    <div class="match-container" *ngIf="match">
      <!-- Match Header -->
      <app-match-header [match]="match"></app-match-header>

      <!-- Enhanced Match Day Results Table -->
      <app-match-day-table 
        *ngIf="match.status === 'completed' && matchDayResults" 
        [matchResults]="matchDayResults">
      </app-match-day-table>

      <!-- Legacy Match Results (kept for compatibility) -->
      <app-match-results 
        *ngIf="match.status === 'completed' && gameResults && !matchDayResults" 
        [gameResults]="gameResults">
      </app-match-results>

      <!-- Live Updates -->
      <app-match-live-section 
        *ngIf="match.status === 'live'" 
        [match]="match">
      </app-match-live-section>

      <!-- Upcoming Match Info -->
      <app-match-upcoming-section 
        *ngIf="match.status === 'upcoming'" 
        [match]="match">
      </app-match-upcoming-section>
    </div>

    <div class="error-container" *ngIf="!match">
      <h2>Match Not Found</h2>
      <p>The requested match could not be found.</p>
      <a routerLink="/league" class="back-link">← Back to League</a>
    </div>
  `,
  styleUrl: './match.component.css'
})
export class MatchComponent implements OnInit {
  match: MatchDetail | null = null;
  
  // Sample match day results with detailed player stats
  matchDayResults: MatchDayResults = {
    1: [
      {
        gameNumber: 1,
        teamName: 'Apex Predators',
        placement: 1,
        teamKills: 12,
        placementPoints: 10,
        totalPoints: 22,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Predator_Alpha', kills: 5, damage: 1850, downs: 7, revives: 2, respawns: 0 },
          { playerName: 'Predator_Beta', kills: 4, damage: 1620, downs: 5, revives: 1, respawns: 1 },
          { playerName: 'Predator_Gamma', kills: 3, damage: 1340, downs: 4, revives: 3, respawns: 0 }
        ]
      },
      {
        gameNumber: 1,
        teamName: 'Storm Legends',
        placement: 2,
        teamKills: 8,
        placementPoints: 6,
        totalPoints: 14,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Storm_Thunder', kills: 3, damage: 1420, downs: 4, revives: 1, respawns: 0 },
          { playerName: 'Storm_Lightning', kills: 3, damage: 1380, downs: 3, revives: 2, respawns: 1 },
          { playerName: 'Storm_Tempest', kills: 2, damage: 1150, downs: 3, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 1,
        teamName: 'Shadow Squad',
        placement: 3,
        teamKills: 6,
        placementPoints: 5,
        totalPoints: 11,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Shadow_Wraith', kills: 3, damage: 1280, downs: 4, revives: 0, respawns: 1 },
          { playerName: 'Shadow_Ghost', kills: 2, damage: 1090, downs: 2, revives: 2, respawns: 0 },
          { playerName: 'Shadow_Phantom', kills: 1, damage: 950, downs: 2, revives: 1, respawns: 1 }
        ]
      },
      {
        gameNumber: 1,
        teamName: 'Digital Legends',
        placement: 4,
        teamKills: 4,
        placementPoints: 4,
        totalPoints: 8,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Digital_One', kills: 2, damage: 1020, downs: 3, revives: 1, respawns: 0 },
          { playerName: 'Digital_Two', kills: 1, damage: 890, downs: 1, revives: 0, respawns: 1 },
          { playerName: 'Digital_Three', kills: 1, damage: 760, downs: 2, revives: 2, respawns: 0 }
        ]
      },
      {
        gameNumber: 1,
        teamName: 'Void Runners',
        placement: 5,
        teamKills: 3,
        placementPoints: 3,
        totalPoints: 6,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Void_Runner1', kills: 2, damage: 920, downs: 2, revives: 0, respawns: 1 },
          { playerName: 'Void_Runner2', kills: 1, damage: 680, downs: 1, revives: 1, respawns: 0 },
          { playerName: 'Void_Runner3', kills: 0, damage: 540, downs: 1, revives: 0, respawns: 1 }
        ]
      }
    ],
    2: [
      {
        gameNumber: 2,
        teamName: 'Storm Legends',
        placement: 1,
        teamKills: 10,
        placementPoints: 10,
        totalPoints: 20,
        mapName: 'Kings Canyon',
        players: [
          { playerName: 'Storm_Thunder', kills: 4, damage: 1920, downs: 6, revives: 1, respawns: 0 },
          { playerName: 'Storm_Lightning', kills: 4, damage: 1780, downs: 5, revives: 0, respawns: 0 },
          { playerName: 'Storm_Tempest', kills: 2, damage: 1340, downs: 3, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 2,
        teamName: 'Shadow Squad',
        placement: 2,
        teamKills: 7,
        placementPoints: 6,
        totalPoints: 13,
        mapName: 'Kings Canyon',
        players: [
          { playerName: 'Shadow_Wraith', kills: 3, damage: 1540, downs: 4, revives: 1, respawns: 0 },
          { playerName: 'Shadow_Ghost', kills: 2, damage: 1320, downs: 3, revives: 1, respawns: 1 },
          { playerName: 'Shadow_Phantom', kills: 2, damage: 1180, downs: 2, revives: 0, respawns: 0 }
        ]
      },
      {
        gameNumber: 2,
        teamName: 'Apex Predators',
        placement: 3,
        teamKills: 5,
        placementPoints: 5,
        totalPoints: 10,
        mapName: 'Kings Canyon',
        players: [
          { playerName: 'Predator_Alpha', kills: 2, damage: 1280, downs: 3, revives: 0, respawns: 1 },
          { playerName: 'Predator_Beta', kills: 2, damage: 1150, downs: 2, revives: 2, respawns: 0 },
          { playerName: 'Predator_Gamma', kills: 1, damage: 980, downs: 2, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 2,
        teamName: 'Void Runners',
        placement: 4,
        teamKills: 6,
        placementPoints: 4,
        totalPoints: 10,
        mapName: 'Kings Canyon',
        players: [
          { playerName: 'Void_Runner1', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 0 },
          { playerName: 'Void_Runner2', kills: 2, damage: 1180, downs: 2, revives: 1, respawns: 1 },
          { playerName: 'Void_Runner3', kills: 1, damage: 890, downs: 1, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 2,
        teamName: 'Digital Legends',
        placement: 5,
        teamKills: 2,
        placementPoints: 3,
        totalPoints: 5,
        mapName: 'Kings Canyon',
        players: [
          { playerName: 'Digital_One', kills: 1, damage: 820, downs: 2, revives: 0, respawns: 1 },
          { playerName: 'Digital_Two', kills: 1, damage: 740, downs: 1, revives: 1, respawns: 0 },
          { playerName: 'Digital_Three', kills: 0, damage: 590, downs: 1, revives: 0, respawns: 1 }
        ]
      }
    ],
    3: [
      {
        gameNumber: 3,
        teamName: 'Digital Legends',
        placement: 1,
        teamKills: 9,
        placementPoints: 10,
        totalPoints: 19,
        mapName: 'Olympus',
        players: [
          { playerName: 'Digital_One', kills: 4, damage: 1720, downs: 5, revives: 1, respawns: 0 },
          { playerName: 'Digital_Two', kills: 3, damage: 1480, downs: 4, revives: 0, respawns: 0 },
          { playerName: 'Digital_Three', kills: 2, damage: 1240, downs: 3, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 3,
        teamName: 'Apex Predators',
        placement: 2,
        teamKills: 8,
        placementPoints: 6,
        totalPoints: 14,
        mapName: 'Olympus',
        players: [
          { playerName: 'Predator_Alpha', kills: 4, damage: 1680, downs: 5, revives: 0, respawns: 0 },
          { playerName: 'Predator_Beta', kills: 2, damage: 1290, downs: 3, revives: 1, respawns: 1 },
          { playerName: 'Predator_Gamma', kills: 2, damage: 1120, downs: 2, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 3,
        teamName: 'Storm Legends',
        placement: 3,
        teamKills: 6,
        placementPoints: 5,
        totalPoints: 11,
        mapName: 'Olympus',
        players: [
          { playerName: 'Storm_Thunder', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 1 },
          { playerName: 'Storm_Lightning', kills: 2, damage: 1090, downs: 2, revives: 0, respawns: 0 },
          { playerName: 'Storm_Tempest', kills: 2, damage: 1020, downs: 2, revives: 2, respawns: 0 }
        ]
      },
      {
        gameNumber: 3,
        teamName: 'Shadow Squad',
        placement: 4,
        teamKills: 4,
        placementPoints: 4,
        totalPoints: 8,
        mapName: 'Olympus',
        players: [
          { playerName: 'Shadow_Wraith', kills: 2, damage: 1050, downs: 2, revives: 0, respawns: 1 },
          { playerName: 'Shadow_Ghost', kills: 1, damage: 890, downs: 1, revives: 1, respawns: 0 },
          { playerName: 'Shadow_Phantom', kills: 1, damage: 780, downs: 2, revives: 0, respawns: 1 }
        ]
      },
      {
        gameNumber: 3,
        teamName: 'Void Runners',
        placement: 5,
        teamKills: 2,
        placementPoints: 3,
        totalPoints: 5,
        mapName: 'Olympus',
        players: [
          { playerName: 'Void_Runner1', kills: 1, damage: 720, downs: 1, revives: 1, respawns: 0 },
          { playerName: 'Void_Runner2', kills: 1, damage: 650, downs: 1, revives: 0, respawns: 1 },
          { playerName: 'Void_Runner3', kills: 0, damage: 480, downs: 0, revives: 1, respawns: 1 }
        ]
      }
    ],
    4: [
      {
        gameNumber: 4,
        teamName: 'Shadow Squad',
        placement: 1,
        teamKills: 11,
        placementPoints: 10,
        totalPoints: 21,
        mapName: 'Storm Point',
        players: [
          { playerName: 'Shadow_Wraith', kills: 5, damage: 1920, downs: 6, revives: 1, respawns: 0 },
          { playerName: 'Shadow_Ghost', kills: 4, damage: 1650, downs: 5, revives: 0, respawns: 0 },
          { playerName: 'Shadow_Phantom', kills: 2, damage: 1280, downs: 3, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 4,
        teamName: 'Void Runners',
        placement: 2,
        teamKills: 7,
        placementPoints: 6,
        totalPoints: 13,
        mapName: 'Storm Point',
        players: [
          { playerName: 'Void_Runner1', kills: 3, damage: 1480, downs: 4, revives: 1, respawns: 0 },
          { playerName: 'Void_Runner2', kills: 2, damage: 1220, downs: 3, revives: 0, respawns: 1 },
          { playerName: 'Void_Runner3', kills: 2, damage: 1040, downs: 2, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 4,
        teamName: 'Digital Legends',
        placement: 3,
        teamKills: 6,
        placementPoints: 5,
        totalPoints: 11,
        mapName: 'Storm Point',
        players: [
          { playerName: 'Digital_One', kills: 3, damage: 1380, downs: 4, revives: 0, respawns: 1 },
          { playerName: 'Digital_Two', kills: 2, damage: 1150, downs: 2, revives: 1, respawns: 0 },
          { playerName: 'Digital_Three', kills: 1, damage: 920, downs: 2, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 4,
        teamName: 'Storm Legends',
        placement: 4,
        teamKills: 5,
        placementPoints: 4,
        totalPoints: 9,
        mapName: 'Storm Point',
        players: [
          { playerName: 'Storm_Thunder', kills: 2, damage: 1120, downs: 3, revives: 0, respawns: 1 },
          { playerName: 'Storm_Lightning', kills: 2, damage: 980, downs: 2, revives: 1, respawns: 0 },
          { playerName: 'Storm_Tempest', kills: 1, damage: 840, downs: 1, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 4,
        teamName: 'Apex Predators',
        placement: 5,
        teamKills: 3,
        placementPoints: 3,
        totalPoints: 6,
        mapName: 'Storm Point',
        players: [
          { playerName: 'Predator_Alpha', kills: 2, damage: 980, downs: 2, revives: 1, respawns: 1 },
          { playerName: 'Predator_Beta', kills: 1, damage: 720, downs: 1, revives: 0, respawns: 1 },
          { playerName: 'Predator_Gamma', kills: 0, damage: 590, downs: 1, revives: 1, respawns: 0 }
        ]
      }
    ],
    5: [
      {
        gameNumber: 5,
        teamName: 'Void Runners',
        placement: 1,
        teamKills: 13,
        placementPoints: 10,
        totalPoints: 23,
        mapName: 'Broken Moon',
        players: [
          { playerName: 'Void_Runner1', kills: 6, damage: 2120, downs: 7, revives: 1, respawns: 0 },
          { playerName: 'Void_Runner2', kills: 4, damage: 1840, downs: 5, revives: 0, respawns: 0 },
          { playerName: 'Void_Runner3', kills: 3, damage: 1520, downs: 4, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 5,
        teamName: 'Digital Legends',
        placement: 2,
        teamKills: 9,
        placementPoints: 6,
        totalPoints: 15,
        mapName: 'Broken Moon',
        players: [
          { playerName: 'Digital_One', kills: 4, damage: 1680, downs: 5, revives: 1, respawns: 0 },
          { playerName: 'Digital_Two', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 1 },
          { playerName: 'Digital_Three', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 5,
        teamName: 'Apex Predators',
        placement: 3,
        teamKills: 8,
        placementPoints: 5,
        totalPoints: 13,
        mapName: 'Broken Moon',
        players: [
          { playerName: 'Predator_Alpha', kills: 3, damage: 1520, downs: 4, revives: 1, respawns: 0 },
          { playerName: 'Predator_Beta', kills: 3, damage: 1380, downs: 3, revives: 0, respawns: 1 },
          { playerName: 'Predator_Gamma', kills: 2, damage: 1120, downs: 2, revives: 2, respawns: 0 }
        ]
      },
      {
        gameNumber: 5,
        teamName: 'Shadow Squad',
        placement: 4,
        teamKills: 6,
        placementPoints: 4,
        totalPoints: 10,
        mapName: 'Broken Moon',
        players: [
          { playerName: 'Shadow_Wraith', kills: 3, damage: 1240, downs: 3, revives: 0, respawns: 1 },
          { playerName: 'Shadow_Ghost', kills: 2, damage: 1050, downs: 2, revives: 1, respawns: 0 },
          { playerName: 'Shadow_Phantom', kills: 1, damage: 890, downs: 2, revives: 1, respawns: 1 }
        ]
      },
      {
        gameNumber: 5,
        teamName: 'Storm Legends',
        placement: 5,
        teamKills: 4,
        placementPoints: 3,
        totalPoints: 7,
        mapName: 'Broken Moon',
        players: [
          { playerName: 'Storm_Thunder', kills: 2, damage: 1020, downs: 2, revives: 1, respawns: 1 },
          { playerName: 'Storm_Lightning', kills: 1, damage: 820, downs: 1, revives: 0, respawns: 1 },
          { playerName: 'Storm_Tempest', kills: 1, damage: 680, downs: 1, revives: 2, respawns: 0 }
        ]
      }
    ],
    6: [
      {
        gameNumber: 6,
        teamName: 'Storm Legends',
        placement: 1,
        teamKills: 14,
        placementPoints: 10,
        totalPoints: 24,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Storm_Thunder', kills: 6, damage: 2280, downs: 8, revives: 1, respawns: 0 },
          { playerName: 'Storm_Lightning', kills: 5, damage: 1960, downs: 6, revives: 0, respawns: 0 },
          { playerName: 'Storm_Tempest', kills: 3, damage: 1640, downs: 4, revives: 2, respawns: 1 }
        ]
      },
      {
        gameNumber: 6,
        teamName: 'Apex Predators',
        placement: 2,
        teamKills: 10,
        placementPoints: 6,
        totalPoints: 16,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Predator_Alpha', kills: 4, damage: 1720, downs: 5, revives: 1, respawns: 0 },
          { playerName: 'Predator_Beta', kills: 4, damage: 1580, downs: 4, revives: 0, respawns: 1 },
          { playerName: 'Predator_Gamma', kills: 2, damage: 1280, downs: 3, revives: 1, respawns: 0 }
        ]
      },
      {
        gameNumber: 6,
        teamName: 'Shadow Squad',
        placement: 3,
        teamKills: 7,
        placementPoints: 5,
        totalPoints: 12,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Shadow_Wraith', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 1 },
          { playerName: 'Shadow_Ghost', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 0 },
          { playerName: 'Shadow_Phantom', kills: 2, damage: 1050, downs: 2, revives: 1, respawns: 1 }
        ]
      },
      {
        gameNumber: 6,
        teamName: 'Void Runners',
        placement: 4,
        teamKills: 5,
        placementPoints: 4,
        totalPoints: 9,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Void_Runner1', kills: 2, damage: 1120, downs: 3, revives: 1, respawns: 1 },
          { playerName: 'Void_Runner2', kills: 2, damage: 980, downs: 2, revives: 0, respawns: 1 },
          { playerName: 'Void_Runner3', kills: 1, damage: 760, downs: 1, revives: 2, respawns: 0 }
        ]
      },
      {
        gameNumber: 6,
        teamName: 'Digital Legends',
        placement: 5,
        teamKills: 3,
        placementPoints: 3,
        totalPoints: 6,
        mapName: 'World\'s Edge',
        players: [
          { playerName: 'Digital_One', kills: 2, damage: 920, downs: 2, revives: 0, respawns: 1 },
          { playerName: 'Digital_Two', kills: 1, damage: 680, downs: 1, revives: 1, respawns: 1 },
          { playerName: 'Digital_Three', kills: 0, damage: 540, downs: 1, revives: 1, respawns: 0 }
        ]
      }
    ]
  };

  // Sample match data - in a real app this would come from a service
  matches: MatchDetail[] = [
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
      winner: 'Apex Predators',
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
      winner: 'Storm Legends',
      description: 'The competition intensifies as teams adapt their strategies and fight for crucial season points.'
    },
    {
      id: 'week3-match1',
      weekNumber: 3,
      matchDay: 'Week 3 - Mid Season',
      date: '2024-12-15',
      time: '7:00 PM EST',
      status: 'live',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      gamesPlayed: 3,
      totalGames: 6,
      streamUrl: 'https://twitch.tv/vesaapex',
      description: 'Mid-season action with teams pushing for playoff positioning and proving their championship potential.'
    },
    {
      id: 'week4-match1',
      weekNumber: 4,
      matchDay: 'Week 4 - Late Season',
      date: '2024-12-22',
      time: '7:00 PM EST',
      status: 'upcoming',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      totalGames: 6,
      description: 'Crucial late-season matches that will determine final playoff seeding and championship contenders.'
    },
    {
      id: 'week5-match1',
      weekNumber: 5,
      matchDay: 'Week 5 - Finals',
      date: '2024-12-29',
      time: '7:00 PM EST',
      status: 'upcoming',
      division: 'Pinnacle',
      divisionTier: 1,
      teamsCount: 20,
      totalGames: 6,
      description: 'The season finale featuring Match Point format to crown the Pinnacle Division champion.'
    }
  ];

  // Sample game results
  gameResults: MatchResults = {
    1: [
      { gameNumber: 1, placement: 1, teamName: 'Apex Predators', kills: 12, points: 22, isWinner: true },
      { gameNumber: 1, placement: 2, teamName: 'Storm Legends', kills: 8, points: 17, isWinner: false },
      { gameNumber: 1, placement: 3, teamName: 'Shadow Squad', kills: 6, points: 14, isWinner: false },
      { gameNumber: 1, placement: 4, teamName: 'Digital Legends', kills: 4, points: 11, isWinner: false },
      { gameNumber: 1, placement: 5, teamName: 'Void Runners', kills: 3, points: 9, isWinner: false }
    ],
    2: [
      { gameNumber: 2, placement: 1, teamName: 'Storm Legends', kills: 10, points: 20, isWinner: true },
      { gameNumber: 2, placement: 2, teamName: 'Shadow Squad', kills: 7, points: 16, isWinner: false },
      { gameNumber: 2, placement: 3, teamName: 'Apex Predators', kills: 5, points: 13, isWinner: false },
      { gameNumber: 2, placement: 4, teamName: 'Void Runners', kills: 6, points: 12, isWinner: false },
      { gameNumber: 2, placement: 5, teamName: 'Digital Legends', kills: 2, points: 8, isWinner: false }
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const matchId = params['id'];
      this.match = this.matches.find(m => m.id === matchId) || null;
    });
  }
}
