import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // League Stats
  leagueStats = {
    matchesPlayed: 115,
    gamesPlayed: 825,
    uniquePlayers: 644,
    totalPlaytime: '1yrs 3mo 24d 2h 40m 00s'
  };

  // Scrims Stats
  scrimsStats = {
    matchesPlayed: 1045,
    gamesPlayed: 5854,
    uniquePlayers: 3896,
    totalPlaytime: '8yrs 9mo 29d 18h 30m 20s'
  };

  // Combined totals for the hero section
  get totalPlayers() {
    return this.leagueStats.uniquePlayers + this.scrimsStats.uniquePlayers;
  }

  get totalGames() {
    return this.leagueStats.gamesPlayed + this.scrimsStats.gamesPlayed;
  }

  get totalMatches() {
    return this.leagueStats.matchesPlayed + this.scrimsStats.matchesPlayed;
  }

  recentActivity = [
    {
      icon: '🏆',
      title: 'Tournament Finals Completed',
      description: 'Team Horizon claimed victory in the Season 3 Championships',
      time: '2 hours ago'
    },
    {
      icon: '⚡',
      title: 'New High Score',
      description: 'Wraith_Main_BTW achieved a 20-kill game on World\'s Edge',
      time: '4 hours ago'
    },
    {
      icon: '🎯',
      title: 'Weekly Rankings Updated',
      description: 'Check out the latest leaderboard standings',
      time: '1 day ago'
    },
    {
      icon: '📊',
      title: 'Match Analysis Available',
      description: 'Detailed breakdown of last night\'s scrimmage matches',
      time: '2 days ago'
    }
  ];
}
