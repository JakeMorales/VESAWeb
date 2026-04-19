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
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--color-text-primary);
      text-align: center;
    }

    .season-champions-row {
      margin-bottom: 2rem;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .season-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    }

    .season-header h3 {
      margin: 0;
      color: #60a5fa;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .season-id {
      color: #94a3b8;
      font-size: 0.875rem;
      text-transform: uppercase;
    }

    .champions-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    /* Single division view - make champion item wider */
    .champions-row:has(.champion-item:only-child) .champion-item {
      max-width: 300px;
      margin: 0 auto;
    }

    .champion-item {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 6px;
      padding: 1rem;
      text-align: center;
      transition: all 0.2s ease;
    }

    .champion-item:hover {
      border-color: rgba(99, 102, 241, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }

    .champion-name {
      font-weight: 600;
      color: #e2e8f0;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .champion-points {
      color: #60a5fa;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .division-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      display: inline-block;
    }

    .division-pinnacle { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    .division-vanguard { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
    .division-ascendant { background: linear-gradient(135deg, #eab308, #ca8a04); color: white; }
    .division-emergent { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
    .division-challengers { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .division-contenders { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
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
