import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrimPlayer } from '../../components/scrims-leaderboard/scrims-leaderboard.component';
import { ScrimsHeroComponent, ScrimStats } from '../../components/scrims/scrims-hero.component';
import { EloSystemComponent } from '../../components/scrims/elo-system.component';
import { ScrimFormatComponent } from '../../components/scrims/scrim-format.component';
import { JoinScrimsComponent } from '../../components/scrims/join-scrims.component';
import { ScrimsLeaderboardSectionComponent } from '../../components/scrims/scrims-leaderboard-section.component';

@Component({
  selector: 'app-scrims',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ScrimsHeroComponent,
    EloSystemComponent,
    ScrimFormatComponent,
    JoinScrimsComponent,
    ScrimsLeaderboardSectionComponent
  ],
  templateUrl: './scrims.component.html',
  styleUrl: './scrims.component.css'
})
export class ScrimsComponent {
  // Sample leaderboard data
  leaderboard: ScrimPlayer[] = [
    {
      rank: 1,
      name: 'ApexPredator_TTV',
      elo: 2847,
      eloChange: +24,
      gamesPlayed: 157,
      totalKills: 892,
      averageKills: 5.7,
      averageDamage: 1234,
      winRate: 76.4,
      isLeaguePlayer: true,
      division: 'Pinnacle',
      divisionRank: 1,
      badges: ['Champion', 'High Killer', 'League Elite']
    },
    {
      rank: 2,
      name: 'WraithMain_Pro',
      elo: 2756,
      eloChange: +18,
      gamesPlayed: 203,
      totalKills: 1045,
      averageKills: 5.1,
      averageDamage: 1156,
      winRate: 71.2,
      isLeaguePlayer: true,
      division: 'Pinnacle',
      divisionRank: 3,
      badges: ['Veteran', 'High Killer', 'League Elite']
    },
    {
      rank: 3,
      name: 'PathfinderGod',
      elo: 2689,
      eloChange: -12,
      gamesPlayed: 134,
      totalKills: 743,
      averageKills: 5.5,
      averageDamage: 1189,
      winRate: 68.9,
      isLeaguePlayer: true,
      division: 'Vanguard',
      divisionRank: 1,
      badges: ['Rising Star', 'High Killer']
    },
    {
      rank: 4,
      name: 'BloodhoundTracker',
      elo: 2634,
      eloChange: +31,
      gamesPlayed: 189,
      totalKills: 856,
      averageKills: 4.5,
      averageDamage: 1078,
      winRate: 64.5,
      isLeaguePlayer: true,
      division: 'Vanguard',
      divisionRank: 2,
      badges: ['Consistent', 'Team Player']
    },
    {
      rank: 5,
      name: 'OctaneSpeed_Demon',
      elo: 2598,
      eloChange: +15,
      gamesPlayed: 176,
      totalKills: 934,
      averageKills: 5.3,
      averageDamage: 1145,
      winRate: 62.1,
      isLeaguePlayer: false,
      badges: ['High Killer', 'Aggressive']
    },
    {
      rank: 6,
      name: 'CausticTrap_Master',
      elo: 2523,
      eloChange: +8,
      gamesPlayed: 145,
      totalKills: 612,
      averageKills: 4.2,
      averageDamage: 1234,
      winRate: 59.3,
      isLeaguePlayer: true,
      division: 'Ascendant',
      divisionRank: 1,
      badges: ['Tactical', 'Team Player']
    },
    {
      rank: 7,
      name: 'LifelineHealer',
      elo: 2487,
      eloChange: -5,
      gamesPlayed: 198,
      totalKills: 567,
      averageKills: 2.9,
      averageDamage: 967,
      winRate: 61.2,
      isLeaguePlayer: true,
      division: 'Ascendant',
      divisionRank: 4,
      badges: ['Support', 'Team Player', 'Consistent']
    },
    {
      rank: 8,
      name: 'Gibraltar_Shield',
      elo: 2445,
      eloChange: +22,
      gamesPlayed: 167,
      totalKills: 698,
      averageKills: 4.2,
      averageDamage: 1089,
      winRate: 58.7,
      isLeaguePlayer: false,
      badges: ['Tank', 'Team Player']
    },
    {
      rank: 9,
      name: 'HorizonGravity',
      elo: 2401,
      eloChange: +19,
      gamesPlayed: 123,
      totalKills: 543,
      averageKills: 4.4,
      averageDamage: 1023,
      winRate: 56.9,
      isLeaguePlayer: true,
      division: 'Emergent',
      divisionRank: 1,
      badges: ['Rising Star', 'Tactical']
    },
    {
      rank: 10,
      name: 'ValkyrieSky_Pilot',
      elo: 2378,
      eloChange: -8,
      gamesPlayed: 156,
      totalKills: 623,
      averageKills: 4.0,
      averageDamage: 978,
      winRate: 55.1,
      isLeaguePlayer: true,
      division: 'Emergent',
      divisionRank: 3,
      badges: ['Scout', 'Team Player']
    }
  ];

  // Get top 10 players for scrims page leaderboard
  get topLeaderboard(): ScrimPlayer[] {
    return this.leaderboard.slice(0, 10);
  }

  // Scrim statistics
  scrimStats: ScrimStats = {
    totalPlayers: 3896,
    activeThisWeek: 1247,
    totalGames: 5854,
    averageElo: 1956,
    highestElo: 2847,
    totalMatches: 1045
  };
}
