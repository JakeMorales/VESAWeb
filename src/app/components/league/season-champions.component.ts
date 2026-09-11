import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SeasonChampions {
  seasonId: string;
  seasonName: string;
  champions: {
    division1: string;  // Pinnacle
    division2: string;  // Vanguard  
    division3: string;  // Ascendant
    division4: string;  // Emergent
    division5: string;  // Challengers
    division6?: string; // Contenders (added in later seasons)
  };
  totalPoints: {
    division1: number;
    division2: number;
    division3: number;
    division4: number;
    division5: number;
    division6?: number;
  };
}

@Component({
  selector: 'app-season-champions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="champions-section">
      <h2>Match Point Champions</h2>
      <div *ngIf="!filteredChampions || filteredChampions.length === 0" class="no-data">No match point champion data for the selected season/division.</div>
      <div class="seasons-list">
        <ng-container *ngFor="let season of filteredChampions">
          <div class="season-champions-row" *ngIf="hasSelectedDivisionChampion(season)">
            <div class="season-header">
              <h3>{{ season.seasonName }}</h3>
              <div class="season-id">{{ season.seasonId }}</div>
            </div>
            <div class="champions-row">
              <!-- Division 1 Champion (Pinnacle) -->
              <div class="champion-item" *ngIf="season.champions.division1 && (!selectedDivision || selectedDivision === 'Pinnacle')">
                <div class="division-badge division-pinnacle">Pinnacle</div>
                <div class="champion-name">{{ season.champions.division1 }}</div>
                <div class="champion-points">{{ season.totalPoints.division1 }}pts</div>
              </div>
              
              <!-- Division 2 Champion (Vanguard) -->
              <div class="champion-item" *ngIf="season.champions.division2 && (!selectedDivision || selectedDivision === 'Vanguard')">
                <div class="division-badge division-vanguard">Vanguard</div>
                <div class="champion-name">{{ season.champions.division2 }}</div>
                <div class="champion-points">{{ season.totalPoints.division2 }}pts</div>
              </div>
              
              <!-- Division 3 Champion (Ascendant) -->
              <div class="champion-item" *ngIf="season.champions.division3 && (!selectedDivision || selectedDivision === 'Ascendant')">
                <div class="division-badge division-ascendant">Ascendant</div>
                <div class="champion-name">{{ season.champions.division3 }}</div>
                <div class="champion-points">{{ season.totalPoints.division3 }}pts</div>
              </div>
              
              <!-- Division 4 Champion (Emergent) -->
              <div class="champion-item" *ngIf="season.champions.division4 && (!selectedDivision || selectedDivision === 'Emergent')">
                <div class="division-badge division-emergent">Emergent</div>
                <div class="champion-name">{{ season.champions.division4 }}</div>
                <div class="champion-points">{{ season.totalPoints.division4 }}pts</div>
              </div>
              
              <!-- Division 5 Champion (Challengers) -->
              <div class="champion-item" *ngIf="season.champions.division5 && (!selectedDivision || selectedDivision === 'Challengers')">
                <div class="division-badge division-challengers">Challengers</div>
                <div class="champion-name">{{ season.champions.division5 }}</div>
                <div class="champion-points">{{ season.totalPoints.division5 }}pts</div>
              </div>
              
              <!-- Division 6 Champion (Contenders) -->
              <div class="champion-item" *ngIf="season.champions.division6 && (!selectedDivision || selectedDivision === 'Contenders')">
                <div class="division-badge division-contenders">Contenders</div>
                <div class="champion-name">{{ season.champions.division6 }}</div>
                <div class="champion-points">{{ season.totalPoints.division6 }}pts</div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .champions-section h2 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 24px;
      color: var(--vesa-text);
      text-align: center;
    }

    .no-data {
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      padding: 2rem;
    }

    .season-champions-row {
      margin-bottom: 16px;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 20px 24px;
    }

    .season-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vesa-line);
    }

    .season-header h3 {
      margin: 0;
      font-family: var(--font-display);
      color: var(--vesa-text);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .season-id {
      font-family: var(--font-mono);
      color: var(--vesa-faint);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .champions-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    /* Single division view - make champion item wider */
    .champions-row:has(.champion-item:only-child) .champion-item {
      max-width: 320px;
      margin: 0 auto;
    }

    .champion-item {
      position: relative;
      background: var(--vesa-raised);
      border: 1px solid var(--vesa-line);
      border-radius: 4px;
      padding: 16px 14px 14px;
      text-align: center;
      overflow: hidden;
      transition: border-color 0.15s;
    }

    .champion-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--div-color, var(--vesa-line-strong));
    }

    .champion-item:hover {
      border-color: var(--vesa-line-strong);
    }

    .champion-name {
      font-weight: 600;
      color: var(--vesa-text);
      margin: 8px 0 4px;
      font-size: 13px;
    }

    .champion-points {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      color: var(--vesa-dim);
      font-size: 12px;
    }

    .division-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 3px 8px;
      border-radius: 3px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      display: inline-block;
      color: var(--div-color);
      background: color-mix(in srgb, var(--div-color) 12%, transparent);
    }

    /* Division identity colors — match the league's division palette */
    .division-pinnacle    { --div-color: #ff2c5c; }
    .division-vanguard    { --div-color: #2c9cff; }
    .division-ascendant   { --div-color: #00d4ff; }
    .division-emergent    { --div-color: #7c3aed; }
    .division-challengers { --div-color: #f59e0b; }
    .division-contenders  { --div-color: #10b981; }

    .champion-item:has(.division-pinnacle)    { --div-color: #ff2c5c; }
    .champion-item:has(.division-vanguard)    { --div-color: #2c9cff; }
    .champion-item:has(.division-ascendant)   { --div-color: #00d4ff; }
    .champion-item:has(.division-emergent)    { --div-color: #7c3aed; }
    .champion-item:has(.division-challengers) { --div-color: #f59e0b; }
    .champion-item:has(.division-contenders)  { --div-color: #10b981; }
  `]
})
export class SeasonChampionsComponent {
  @Input() filteredChampions: SeasonChampions[] = [];
  @Input() selectedDivision: string = '';

  // Helper method to get division property name from division display name
  getDivisionProperty(divisionName: string): keyof SeasonChampions['champions'] | null {
    const divisionMap: { [key: string]: keyof SeasonChampions['champions'] } = {
      'Pinnacle': 'division1',
      'Vanguard': 'division2', 
      'Ascendant': 'division3',
      'Emergent': 'division4',
      'Challengers': 'division5',
      'Contenders': 'division6'
    };
    return divisionMap[divisionName] || null;
  }

  // Helper method to check if a season has a champion for the selected division
  hasSelectedDivisionChampion(season: SeasonChampions): boolean {
    if (!this.selectedDivision) return true;
    
    const divisionProperty = this.getDivisionProperty(this.selectedDivision);
    return divisionProperty ? !!season.champions[divisionProperty] : false;
  }
}
