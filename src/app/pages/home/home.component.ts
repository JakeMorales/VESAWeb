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
  totalPlayers = 247;
  totalGames = 1853;
  totalKills = 12967;

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
