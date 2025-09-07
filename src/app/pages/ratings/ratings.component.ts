import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingsService } from '../../services/ratings.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent implements OnInit {
  leaderboard: any[] = [];
  loadingLeaderboard = true;
  leaderboardError = '';

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    this.leaderboardError = '';
    this.ratingsService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = Array.isArray(data) ? data : [];
        this.loadingLeaderboard = false;
      },
      error: (err) => {
        this.leaderboardError = 'Failed to load leaderboard';
        this.loadingLeaderboard = false;
      }
    });
  }
}
