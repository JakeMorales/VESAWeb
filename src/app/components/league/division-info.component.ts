import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Division } from '../../pages/league/league.component';

@Component({
  selector: 'app-division-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="info-section">
      <div class="info-content">
        <div class="info-grid">
          <div class="info-card">
            <h3>Season Format</h3>
            <p>5 weeks of regular season play followed by Match Point Finals. Teams earn points based on placement and eliminations using ALGS scoring.</p>
          </div>
          <div class="info-card" *ngIf="division && (division.tier === 1 || division.tier === 2)">
            <h3>Promotion/Relegation</h3>
            <p>Active between Divisions I & II only. Top/bottom teams may move between these divisions during the season.</p>
          </div>
          <div class="info-card" *ngIf="division && division.tier > 2">
            <h3>Division Status</h3>
            <p>Static division for this season. Teams remain in this division unless moved for lobby quality purposes.</p>
          </div>
          <div class="info-card">
            <h3>Match Schedule</h3>
            <p>Weekly matches every Sunday. Each team plays multiple games per week with points accumulated across all matches.</p>
          </div>
          <div class="info-card">
            <h3>Finals Qualification</h3>
            <p>All teams qualify for their division finals. Match Point format determines the division champion.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './division-info.component.css'
})
export class DivisionInfoComponent {
  @Input() division?: Division;
}
