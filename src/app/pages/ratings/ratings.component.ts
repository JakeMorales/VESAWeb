import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingsService } from '../../services/ratings.service';

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

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.loadLeaderboardPage(0);
  }

  loadLeaderboardPage(page: number): void {
    this.isLoading = true;
    this.leaderboardError = '';
    const offset = page * this.pageSize;
    this.ratingsService.getLeaderboard(offset, this.pageSize, this.playerNameSearch).subscribe({
      next: (result) => {
        this.leaderboard = Array.isArray(result.data) ? result.data : [];
        this.stats = result.stats || {};
        this.ratedStats = result.ratedStats || {};
        this.currentPage = page;
        this.totalPlayers = result.total || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.leaderboardError = 'Failed to load leaderboard';
        this.isLoading = false;
      }
    });
  }

  onSearchPlayerName(): void {
    this.loadLeaderboardPage(0);
  }

  totalPages(): number {
    return Math.ceil(this.totalPlayers / this.pageSize);
  }
}
