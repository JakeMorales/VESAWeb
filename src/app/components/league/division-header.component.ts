import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Division } from '../../pages/league/league.component';

@Component({
  selector: 'app-division-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="division-header" [style.--division-color]="division.color">
      <div class="header-content">
        <div class="breadcrumb">
          <a routerLink="/league">League</a> / Division {{ division.romanNumeral }}
        </div>
        
        <div class="division-title-section">
          <div class="division-badge">
            <span class="roman-numeral">{{ division.romanNumeral }}</span>
          </div>
          <div class="title-content">
            <h1 class="division-title">{{ division.name }}</h1>
            <p class="division-subtitle">{{ division.description }}</p>
          </div>
        </div>

        <div class="division-stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ division.teamCount }}</span>
            <span class="stat-label">Teams</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ currentWeek }}/{{ totalWeeks }}</span>
            <span class="stat-label">Weeks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalWeeks - currentWeek }}</span>
            <span class="stat-label">Remaining</span>
          </div>
          <div class="stat-item" *ngIf="division.tier <= 2">
            <span class="stat-value">Active</span>
            <span class="stat-label">Promo/Releg</span>
          </div>
          <div class="stat-item" *ngIf="division.tier > 2">
            <span class="stat-value">Static</span>
            <span class="stat-label">Division</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './division-header.component.css'
})
export class DivisionHeaderComponent {
  @Input() division!: Division;
  @Input() currentWeek: number = 2;
  @Input() totalWeeks: number = 5;
}
