import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveHeaderComponent } from './archive-header.component';
import { ArchiveFiltersComponent, Season } from './archive-filters.component';
import { SeasonChampionsComponent, SeasonChampions } from './season-champions.component';
import { SeasonLeaderboardsComponent, SeasonLeaderboard, SeasonTeamResult } from './season-leaderboards.component';
import { ArchiveMatchHistoryComponent, HistoricalMatch, MatchGameResult, GameTeamResult } from './archive-match-history.component';

@Component({
  selector: 'app-scores-archive',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ArchiveHeaderComponent,
    ArchiveFiltersComponent,
    SeasonChampionsComponent,
    SeasonLeaderboardsComponent,
    ArchiveMatchHistoryComponent
  ],
  template: `
    <div class="scores-archive-container">
      <app-archive-header></app-archive-header>

      <app-archive-filters
        [seasons]="seasons"
        [selectedSeason]="selectedSeason"
        [selectedDivision]="selectedDivision"
        [viewMode]="viewMode"
        (seasonChange)="onSeasonChange($event)"
        (divisionChange)="onDivisionChange($event)"
        (viewModeChange)="onViewModeChange($event)">
      </app-archive-filters>

      <!-- Season Champions View -->
      <app-season-champions 
        *ngIf="viewMode === 'champions'"
        [filteredChampions]="filteredChampions"
        [selectedDivision]="selectedDivision">
      </app-season-champions>

      <!-- Final Leaderboards View -->
      <app-season-leaderboards
        *ngIf="viewMode === 'leaderboards'"
        [filteredLeaderboards]="filteredLeaderboards"
        [seasons]="seasons">
      </app-season-leaderboards>

      <!-- Match History View -->
      <app-archive-match-history
        *ngIf="viewMode === 'matches'"
        [filteredMatches]="filteredMatches"
        [seasons]="seasons">
      </app-archive-match-history>
    </div>
  `,
  styleUrl: './scores-archive.component.css'
})
export class ScoresArchiveComponent implements OnInit {
  seasons: Season[] = [];
  champions: SeasonChampions[] = [];
  leaderboards: SeasonLeaderboard[] = [];
  matches: HistoricalMatch[] = [];

  selectedSeason: string = '';
  selectedDivision: string = '';
  viewMode: string = 'champions';

  filteredChampions: SeasonChampions[] = [];
  filteredLeaderboards: SeasonLeaderboard[] = [];
  filteredMatches: HistoricalMatch[] = [];

  ngOnInit() {
    this.loadMockData();
    this.filterData();
  }

  onSeasonChange(value: string) {
    this.selectedSeason = value;
    this.filterData();
  }

  onDivisionChange(value: string) {
    this.selectedDivision = value;
    this.filterData();
  }

  onViewModeChange(value: string) {
    this.viewMode = value;
    this.filterData();
  }

  loadMockData() {
    // Mock seasons data - 11 seasons of VESA League
    this.seasons = [
      { id: 's11', name: 'Season 11', startDate: '2025-01-01', endDate: '2025-03-31', status: 'active' },
      { id: 's10', name: 'Season 10', startDate: '2024-10-01', endDate: '2024-12-31', status: 'completed' },
      { id: 's9', name: 'Season 9', startDate: '2024-07-01', endDate: '2024-09-30', status: 'completed' },
      { id: 's8', name: 'Season 8', startDate: '2024-04-01', endDate: '2024-06-30', status: 'completed' },
      { id: 's7', name: 'Season 7', startDate: '2024-01-01', endDate: '2024-03-31', status: 'completed' },
      { id: 's6', name: 'Season 6', startDate: '2023-10-01', endDate: '2023-12-31', status: 'completed' },
      { id: 's5', name: 'Season 5', startDate: '2023-07-01', endDate: '2023-09-30', status: 'completed' },
      { id: 's4', name: 'Season 4', startDate: '2023-04-01', endDate: '2023-06-30', status: 'completed' },
      { id: 's3', name: 'Season 3', startDate: '2023-01-01', endDate: '2023-03-31', status: 'completed' },
      { id: 's2', name: 'Season 2', startDate: '2022-10-01', endDate: '2022-12-31', status: 'completed' },
      { id: 's1', name: 'Season 1', startDate: '2022-07-01', endDate: '2022-09-30', status: 'completed' }
    ];

    // Mock champions data - All champions for each season in one row
    this.champions = [
      // Season 10 (most recent completed season)
      {
        seasonId: 's10',
        seasonName: 'Season 10',
        champions: {
          division1: 'Apex Legends Elite',
          division2: 'Storm Chasers',
          division3: 'Rising Phoenix', 
          division4: 'Thunder Wolves',
          division5: 'Neon Runners',
          division6: 'Digital Warriors'
        },
        totalPoints: {
          division1: 187,
          division2: 168,
          division3: 152,
          division4: 143,
          division5: 135,
          division6: 128
        }
      },

      // Season 9
      {
        seasonId: 's9',
        seasonName: 'Season 9',
        champions: {
          division1: 'Void Walkers',
          division2: 'Cyber Knights',
          division3: 'Flame Guardians',
          division4: 'Lightning Strike',
          division5: 'Shadow Hunters',
          division6: 'Quantum Leap'
        },
        totalPoints: {
          division1: 172,
          division2: 159,
          division3: 145,
          division4: 138,
          division5: 131,
          division6: 124
        }
      },

      // Season 8
      {
        seasonId: 's8',
        seasonName: 'Season 8',
        champions: {
          division1: 'Titanfall Legends',
          division2: 'Frost Bite',
          division3: 'Solar Flare',
          division4: 'Wind Runners',
          division5: 'Echo Squad',
          division6: 'Pulse Wave'
        },
        totalPoints: {
          division1: 165,
          division2: 154,
          division3: 142,
          division4: 135,
          division5: 128,
          division6: 121
        }
      },

      // Season 7
      {
        seasonId: 's7',
        seasonName: 'Season 7',
        champions: {
          division1: 'Blizzard Force',
          division2: 'Ice Breakers',
          division3: 'Arctic Wolves',
          division4: 'Frozen Thunder',
          division5: 'Crystal Storm',
          division6: 'Snow Leopards'
        },
        totalPoints: {
          division1: 179,
          division2: 163,
          division3: 148,
          division4: 141,
          division5: 134,
          division6: 127
        }
      },

      // Season 6
      {
        seasonId: 's6',
        seasonName: 'Season 6',
        champions: {
          division1: 'Alpha Predators',
          division2: 'Beta Strikers',
          division3: 'Gamma Elite',
          division4: 'Delta Force',
          division5: 'Epsilon Squad',
          division6: 'Zeta Warriors'
        },
        totalPoints: {
          division1: 183,
          division2: 167,
          division3: 151,
          division4: 144,
          division5: 137,
          division6: 130
        }
      },

      // Season 5
      {
        seasonId: 's5',
        seasonName: 'Season 5',
        champions: {
          division1: 'Storm Masters',
          division2: 'Fire Legends',
          division3: 'Thunder Hawks',
          division4: 'Lightning Wolves',
          division5: 'Cyber Storm'
        },
        totalPoints: {
          division1: 174,
          division2: 158,
          division3: 143,
          division4: 136,
          division5: 129
        }
      },

      // Season 4
      {
        seasonId: 's4',
        seasonName: 'Season 4',
        champions: {
          division1: 'Void Masters',
          division2: 'Shadow Elite',
          division3: 'Neon Legends',
          division4: 'Pulse Warriors',
          division5: 'Digital Hawks'
        },
        totalPoints: {
          division1: 169,
          division2: 153,
          division3: 138,
          division4: 131,
          division5: 124
        }
      },

      // Season 3
      {
        seasonId: 's3',
        seasonName: 'Season 3',
        champions: {
          division1: 'Apex Titans',
          division2: 'Storm Kings',
          division3: 'Fire Guardians',
          division4: 'Thunder Strike',
          division5: 'Lightning Bolt'
        },
        totalPoints: {
          division1: 166,
          division2: 150,
          division3: 135,
          division4: 128,
          division5: 121
        }
      },

      // Season 2
      {
        seasonId: 's2',
        seasonName: 'Season 2',
        champions: {
          division1: 'Void Legends',
          division2: 'Cyber Titans',
          division3: 'Neon Force',
          division4: 'Pulse Elite',
          division5: 'Digital Storm'
        },
        totalPoints: {
          division1: 161,
          division2: 145,
          division3: 130,
          division4: 123,
          division5: 116
        }
      },

      // Season 1 (inaugural season)
      {
        seasonId: 's1',
        seasonName: 'Season 1',
        champions: {
          division1: 'First Legends',
          division2: 'Pioneer Squad',
          division3: 'Founding Fathers',
          division4: 'Genesis Team',
          division5: 'Alpha Genesis'
        },
        totalPoints: {
          division1: 156,
          division2: 140,
          division3: 125,
          division4: 118,
          division5: 111
        }
      }
    ];

    // Mock leaderboards data for Fall 2024 and Summer 2024 (complete seasons)
    this.leaderboards = [
      // Fall 2024 - Pinnacle Division
      {
        seasonId: 's2024-fall',
        division: 'Pinnacle',
        teams: [
          { rank: 1, teamName: 'Apex Legends Elite', totalPoints: 187, wins: 12, gamesPlayed: 15, kills: 134, avgPlacement: 1.8 },
          { rank: 2, teamName: 'Storm Riders Pro', totalPoints: 174, wins: 10, gamesPlayed: 15, kills: 128, avgPlacement: 2.1 },
          { rank: 3, teamName: 'Fire Hawks X', totalPoints: 168, wins: 9, gamesPlayed: 15, kills: 122, avgPlacement: 2.4 },
          { rank: 4, teamName: 'Thunder Bolts', totalPoints: 156, wins: 8, gamesPlayed: 15, kills: 115, avgPlacement: 2.8 },
          { rank: 5, teamName: 'Lightning Legends', totalPoints: 149, wins: 7, gamesPlayed: 15, kills: 108, avgPlacement: 3.1 },
          { rank: 6, teamName: 'Cyber Phoenixes', totalPoints: 142, wins: 6, gamesPlayed: 15, kills: 102, avgPlacement: 3.5 },
          { rank: 7, teamName: 'Neon Guardians', totalPoints: 135, wins: 5, gamesPlayed: 15, kills: 96, avgPlacement: 3.8 },
          { rank: 8, teamName: 'Void Hunters', totalPoints: 128, wins: 4, gamesPlayed: 15, kills: 89, avgPlacement: 4.2 }
        ]
      },
      
      // Fall 2024 - Vanguard Division
      {
        seasonId: 's2024-fall',
        division: 'Vanguard',
        teams: [
          { rank: 1, teamName: 'Storm Chasers', totalPoints: 168, wins: 10, gamesPlayed: 15, kills: 118, avgPlacement: 2.2 },
          { rank: 2, teamName: 'Frost Warriors', totalPoints: 161, wins: 9, gamesPlayed: 15, kills: 112, avgPlacement: 2.5 },
          { rank: 3, teamName: 'Blade Runners', totalPoints: 154, wins: 8, gamesPlayed: 15, kills: 106, avgPlacement: 2.8 },
          { rank: 4, teamName: 'Shadow Strike', totalPoints: 147, wins: 7, gamesPlayed: 15, kills: 100, avgPlacement: 3.1 },
          { rank: 5, teamName: 'Crystal Force', totalPoints: 140, wins: 6, gamesPlayed: 15, kills: 94, avgPlacement: 3.4 },
          { rank: 6, teamName: 'Quantum Reapers', totalPoints: 133, wins: 5, gamesPlayed: 15, kills: 88, avgPlacement: 3.7 },
          { rank: 7, teamName: 'Digital Demons', totalPoints: 126, wins: 4, gamesPlayed: 15, kills: 82, avgPlacement: 4.0 },
          { rank: 8, teamName: 'Pulse Rangers', totalPoints: 119, wins: 3, gamesPlayed: 15, kills: 76, avgPlacement: 4.3 }
        ]
      },

      // Fall 2024 - Ascendant Division
      {
        seasonId: 's2024-fall',
        division: 'Ascendant',
        teams: [
          { rank: 1, teamName: 'Rising Phoenix', totalPoints: 152, wins: 9, gamesPlayed: 15, kills: 102, avgPlacement: 2.6 },
          { rank: 2, teamName: 'Solar Flares', totalPoints: 145, wins: 8, gamesPlayed: 15, kills: 96, avgPlacement: 2.9 },
          { rank: 3, teamName: 'Midnight Wolves', totalPoints: 138, wins: 7, gamesPlayed: 15, kills: 90, avgPlacement: 3.2 },
          { rank: 4, teamName: 'Crimson Hawks', totalPoints: 131, wins: 6, gamesPlayed: 15, kills: 84, avgPlacement: 3.5 },
          { rank: 5, teamName: 'Ocean Titans', totalPoints: 124, wins: 5, gamesPlayed: 15, kills: 78, avgPlacement: 3.8 },
          { rank: 6, teamName: 'Steel Vipers', totalPoints: 117, wins: 4, gamesPlayed: 15, kills: 72, avgPlacement: 4.1 },
          { rank: 7, teamName: 'Ghost Riders', totalPoints: 110, wins: 3, gamesPlayed: 15, kills: 66, avgPlacement: 4.4 },
          { rank: 8, teamName: 'Savage Legends', totalPoints: 103, wins: 2, gamesPlayed: 15, kills: 60, avgPlacement: 4.7 }
        ]
      },

      // Summer 2024 - Pinnacle Division
      {
        seasonId: 's2024-summer',
        division: 'Pinnacle',
        teams: [
          { rank: 1, teamName: 'Void Walkers', totalPoints: 172, wins: 11, gamesPlayed: 15, kills: 127, avgPlacement: 2.0 },
          { rank: 2, teamName: 'Apex Dominators', totalPoints: 165, wins: 10, gamesPlayed: 15, kills: 121, avgPlacement: 2.3 },
          { rank: 3, teamName: 'Storm Legends', totalPoints: 158, wins: 9, gamesPlayed: 15, kills: 115, avgPlacement: 2.6 },
          { rank: 4, teamName: 'Fire Storm Elite', totalPoints: 151, wins: 8, gamesPlayed: 15, kills: 109, avgPlacement: 2.9 },
          { rank: 5, teamName: 'Thunder Strikers', totalPoints: 144, wins: 7, gamesPlayed: 15, kills: 103, avgPlacement: 3.2 },
          { rank: 6, teamName: 'Lightning Bolts', totalPoints: 137, wins: 6, gamesPlayed: 15, kills: 97, avgPlacement: 3.5 },
          { rank: 7, teamName: 'Cyber Legends', totalPoints: 130, wins: 5, gamesPlayed: 15, kills: 91, avgPlacement: 3.8 },
          { rank: 8, teamName: 'Neon Phantoms', totalPoints: 123, wins: 4, gamesPlayed: 15, kills: 85, avgPlacement: 4.1 }
        ]
      },

      // Summer 2024 - Vanguard Division
      {
        seasonId: 's2024-summer',
        division: 'Vanguard',
        teams: [
          { rank: 1, teamName: 'Cyber Knights', totalPoints: 159, wins: 9, gamesPlayed: 15, kills: 115, avgPlacement: 2.4 },
          { rank: 2, teamName: 'Frost Guardians', totalPoints: 152, wins: 8, gamesPlayed: 15, kills: 109, avgPlacement: 2.7 },
          { rank: 3, teamName: 'Shadow Warriors', totalPoints: 145, wins: 7, gamesPlayed: 15, kills: 103, avgPlacement: 3.0 },
          { rank: 4, teamName: 'Blade Masters', totalPoints: 138, wins: 6, gamesPlayed: 15, kills: 97, avgPlacement: 3.3 },
          { rank: 5, teamName: 'Storm Breakers', totalPoints: 131, wins: 5, gamesPlayed: 15, kills: 91, avgPlacement: 3.6 },
          { rank: 6, teamName: 'Crystal Raiders', totalPoints: 124, wins: 4, gamesPlayed: 15, kills: 85, avgPlacement: 3.9 },
          { rank: 7, teamName: 'Quantum Wolves', totalPoints: 117, wins: 3, gamesPlayed: 15, kills: 79, avgPlacement: 4.2 },
          { rank: 8, teamName: 'Digital Pirates', totalPoints: 110, wins: 2, gamesPlayed: 15, kills: 73, avgPlacement: 4.5 }
        ]
      },

      // Summer 2024 - Ascendant Division
      {
        seasonId: 's2024-summer',
        division: 'Ascendant',
        teams: [
          { rank: 1, teamName: 'Flame Guardians', totalPoints: 145, wins: 8, gamesPlayed: 15, kills: 98, avgPlacement: 2.8 },
          { rank: 2, teamName: 'Solar Warriors', totalPoints: 138, wins: 7, gamesPlayed: 15, kills: 92, avgPlacement: 3.1 },
          { rank: 3, teamName: 'Night Hawks', totalPoints: 131, wins: 6, gamesPlayed: 15, kills: 86, avgPlacement: 3.4 },
          { rank: 4, teamName: 'Crimson Tide', totalPoints: 124, wins: 5, gamesPlayed: 15, kills: 80, avgPlacement: 3.7 },
          { rank: 5, teamName: 'Ocean Storms', totalPoints: 117, wins: 4, gamesPlayed: 15, kills: 74, avgPlacement: 4.0 },
          { rank: 6, teamName: 'Steel Panthers', totalPoints: 110, wins: 3, gamesPlayed: 15, kills: 68, avgPlacement: 4.3 },
          { rank: 7, teamName: 'Ghost Wolves', totalPoints: 103, wins: 2, gamesPlayed: 15, kills: 62, avgPlacement: 4.6 },
          { rank: 8, teamName: 'Savage Storm', totalPoints: 96, wins: 1, gamesPlayed: 15, kills: 56, avgPlacement: 4.9 }
        ]
      }
    ];

    // Mock matches data - Comprehensive match history for Fall 2024 and Summer 2024
    this.matches = [
      // Fall 2024 - Pinnacle Division Matches
      {
        id: 'f24-p-m1',
        seasonId: 's2024-fall',
        division: 'Pinnacle',
        matchNumber: 1,
        date: '2024-10-05',
        teams: ['Apex Legends Elite', 'Storm Riders Pro', 'Fire Hawks X', 'Thunder Bolts'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Apex Legends Elite', placement: 1, kills: 12, points: 22 },
              { teamName: 'Fire Hawks X', placement: 2, kills: 8, points: 16 },
              { teamName: 'Storm Riders Pro', placement: 3, kills: 6, points: 13 },
              { teamName: 'Thunder Bolts', placement: 4, kills: 4, points: 10 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Storm Riders Pro', placement: 1, kills: 10, points: 20 },
              { teamName: 'Apex Legends Elite', placement: 2, kills: 9, points: 17 },
              { teamName: 'Thunder Bolts', placement: 3, kills: 5, points: 12 },
              { teamName: 'Fire Hawks X', placement: 4, kills: 3, points: 9 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Fire Hawks X', placement: 1, kills: 11, points: 21 },
              { teamName: 'Apex Legends Elite', placement: 2, kills: 7, points: 15 },
              { teamName: 'Storm Riders Pro', placement: 3, kills: 6, points: 13 },
              { teamName: 'Thunder Bolts', placement: 4, kills: 2, points: 8 }
            ]
          }
        ]
      },

      {
        id: 'f24-p-m2',
        seasonId: 's2024-fall',
        division: 'Pinnacle',
        matchNumber: 2,
        date: '2024-10-12',
        teams: ['Lightning Legends', 'Cyber Phoenixes', 'Neon Guardians', 'Void Hunters'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Lightning Legends', placement: 1, kills: 9, points: 19 },
              { teamName: 'Cyber Phoenixes', placement: 2, kills: 7, points: 15 },
              { teamName: 'Neon Guardians', placement: 3, kills: 5, points: 12 },
              { teamName: 'Void Hunters', placement: 4, kills: 3, points: 9 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Cyber Phoenixes', placement: 1, kills: 8, points: 18 },
              { teamName: 'Lightning Legends', placement: 2, kills: 6, points: 14 },
              { teamName: 'Void Hunters', placement: 3, kills: 4, points: 11 },
              { teamName: 'Neon Guardians', placement: 4, kills: 2, points: 8 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Neon Guardians', placement: 1, kills: 10, points: 20 },
              { teamName: 'Lightning Legends', placement: 2, kills: 5, points: 13 },
              { teamName: 'Cyber Phoenixes', placement: 3, kills: 4, points: 11 },
              { teamName: 'Void Hunters', placement: 4, kills: 1, points: 7 }
            ]
          }
        ]
      },

      // Fall 2024 - Vanguard Division Match
      {
        id: 'f24-v-m1',
        seasonId: 's2024-fall',
        division: 'Vanguard',
        matchNumber: 1,
        date: '2024-10-06',
        teams: ['Storm Chasers', 'Frost Warriors', 'Blade Runners', 'Shadow Strike'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Storm Chasers', placement: 1, kills: 11, points: 21 },
              { teamName: 'Blade Runners', placement: 2, kills: 8, points: 16 },
              { teamName: 'Frost Warriors', placement: 3, kills: 6, points: 13 },
              { teamName: 'Shadow Strike', placement: 4, kills: 3, points: 9 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Frost Warriors', placement: 1, kills: 9, points: 19 },
              { teamName: 'Storm Chasers', placement: 2, kills: 7, points: 15 },
              { teamName: 'Shadow Strike', placement: 3, kills: 5, points: 12 },
              { teamName: 'Blade Runners', placement: 4, kills: 2, points: 8 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Blade Runners', placement: 1, kills: 10, points: 20 },
              { teamName: 'Storm Chasers', placement: 2, kills: 6, points: 14 },
              { teamName: 'Frost Warriors', placement: 3, kills: 4, points: 11 },
              { teamName: 'Shadow Strike', placement: 4, kills: 1, points: 7 }
            ]
          }
        ]
      },

      // Summer 2024 - Pinnacle Division Matches
      {
        id: 's24-p-m1',
        seasonId: 's2024-summer',
        division: 'Pinnacle',
        matchNumber: 1,
        date: '2024-07-08',
        teams: ['Void Walkers', 'Apex Dominators', 'Storm Legends', 'Fire Storm Elite'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Void Walkers', placement: 1, kills: 13, points: 23 },
              { teamName: 'Storm Legends', placement: 2, kills: 9, points: 17 },
              { teamName: 'Apex Dominators', placement: 3, kills: 7, points: 14 },
              { teamName: 'Fire Storm Elite', placement: 4, kills: 5, points: 11 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Apex Dominators', placement: 1, kills: 11, points: 21 },
              { teamName: 'Void Walkers', placement: 2, kills: 8, points: 16 },
              { teamName: 'Fire Storm Elite', placement: 3, kills: 6, points: 13 },
              { teamName: 'Storm Legends', placement: 4, kills: 3, points: 9 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Storm Legends', placement: 1, kills: 12, points: 22 },
              { teamName: 'Void Walkers', placement: 2, kills: 6, points: 14 },
              { teamName: 'Apex Dominators', placement: 3, kills: 4, points: 11 },
              { teamName: 'Fire Storm Elite', placement: 4, kills: 2, points: 8 }
            ]
          }
        ]
      },

      {
        id: 's24-p-m2',
        seasonId: 's2024-summer',
        division: 'Pinnacle',
        matchNumber: 2,
        date: '2024-07-15',
        teams: ['Thunder Strikers', 'Lightning Bolts', 'Cyber Legends', 'Neon Phantoms'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Thunder Strikers', placement: 1, kills: 10, points: 20 },
              { teamName: 'Lightning Bolts', placement: 2, kills: 8, points: 16 },
              { teamName: 'Cyber Legends', placement: 3, kills: 5, points: 12 },
              { teamName: 'Neon Phantoms', placement: 4, kills: 3, points: 9 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Lightning Bolts', placement: 1, kills: 9, points: 19 },
              { teamName: 'Thunder Strikers', placement: 2, kills: 7, points: 15 },
              { teamName: 'Neon Phantoms', placement: 3, kills: 4, points: 11 },
              { teamName: 'Cyber Legends', placement: 4, kills: 2, points: 8 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Cyber Legends', placement: 1, kills: 11, points: 21 },
              { teamName: 'Thunder Strikers', placement: 2, kills: 5, points: 13 },
              { teamName: 'Lightning Bolts', placement: 3, kills: 3, points: 10 },
              { teamName: 'Neon Phantoms', placement: 4, kills: 1, points: 7 }
            ]
          }
        ]
      },

      // Summer 2024 - Vanguard Division Match
      {
        id: 's24-v-m1',
        seasonId: 's2024-summer',
        division: 'Vanguard',
        matchNumber: 1,
        date: '2024-07-09',
        teams: ['Cyber Knights', 'Frost Guardians', 'Shadow Warriors', 'Blade Masters'],
        results: [
          {
            gameNumber: 1,
            results: [
              { teamName: 'Cyber Knights', placement: 1, kills: 12, points: 22 },
              { teamName: 'Shadow Warriors', placement: 2, kills: 9, points: 17 },
              { teamName: 'Frost Guardians', placement: 3, kills: 6, points: 13 },
              { teamName: 'Blade Masters', placement: 4, kills: 4, points: 10 }
            ]
          },
          {
            gameNumber: 2,
            results: [
              { teamName: 'Frost Guardians', placement: 1, kills: 10, points: 20 },
              { teamName: 'Cyber Knights', placement: 2, kills: 7, points: 15 },
              { teamName: 'Blade Masters', placement: 3, kills: 5, points: 12 },
              { teamName: 'Shadow Warriors', placement: 4, kills: 2, points: 8 }
            ]
          },
          {
            gameNumber: 3,
            results: [
              { teamName: 'Shadow Warriors', placement: 1, kills: 11, points: 21 },
              { teamName: 'Cyber Knights', placement: 2, kills: 6, points: 14 },
              { teamName: 'Frost Guardians', placement: 3, kills: 3, points: 10 },
              { teamName: 'Blade Masters', placement: 4, kills: 1, points: 7 }
            ]
          }
        ]
      }
    ];
  }

  filterData() {
    // Filter champions based on season and division
    this.filteredChampions = this.champions.filter(season => {
      return (!this.selectedSeason || season.seasonId === this.selectedSeason);
    });

    // Filter leaderboards
    this.filteredLeaderboards = this.leaderboards.filter(leaderboard => {
      return (!this.selectedSeason || leaderboard.seasonId === this.selectedSeason) &&
             (!this.selectedDivision || leaderboard.division === this.selectedDivision);
    });

    // Filter matches
    this.filteredMatches = this.matches.filter(match => {
      return (!this.selectedSeason || match.seasonId === this.selectedSeason) &&
             (!this.selectedDivision || match.division === this.selectedDivision);
    });
  }
}
