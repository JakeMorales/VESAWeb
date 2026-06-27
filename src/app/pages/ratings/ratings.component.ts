import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent implements OnInit {
  stats: any = {};
  ratedStats: any = {};
  leaderboard: any[] = [];
  loadingLeaderboard = false;
  leaderboardError = '';
  currentPage = 0;
  pageSize = 25;
  totalPlayers = 0;
  isLoading = false;
  playerNameSearch: string = '';

  constructor() {}

  ngOnInit(): void {
    this.loadLeaderboardPage(0);
  }

  loadLeaderboardPage(page: number): void {
    // Ratings leaderboard backend has been removed; this page is feature-flagged off.
    this.leaderboardError = 'Ratings leaderboard is currently unavailable.';
  }

  onSearchPlayerName(): void {
    this.loadLeaderboardPage(0);
  }

  totalPages(): number {
    return Math.ceil(this.totalPlayers / this.pageSize);
  }
}
