import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RatingCalculatorComponent } from '../../components/ratings/rating-calculator.component';
import { PlayerRatingsComponent } from '../../components/ratings/player-ratings.component';
import { TeamRatingsComponent } from '../../components/ratings/team-ratings.component';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RatingCalculatorComponent,
    PlayerRatingsComponent,
    TeamRatingsComponent
  ],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Initialize any rating data or calculations here
  }
}
