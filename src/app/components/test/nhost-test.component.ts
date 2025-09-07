import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrimsDataService } from '../../services/scrims-data.service';
import { NhostService } from '../../services/nhost.service';
import { getMostCommonPlayerNames } from '../../utils/player-utils';

@Component({
  selector: 'app-nhost-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nhost-test">
      <h2>Nhost Connection Test</h2>
      
      <div class="test-section">
        <h3>Connection Status</h3>
        <div class="connection-info">
          <p>Subdomain: bsgzgiiagytbnyqsvebl</p>
          <p>Region: us-east-1</p>
          <p>GraphQL URL: https://bsgzgiiagytbnyqsvebl.graphql.us-east-1.nhost.run/v1</p>
        </div>
      </div>
      
      <div class="test-section">
        <h3>Players ({{ players.length }})</h3>
        <div *ngIf="loadingPlayers">Loading players...</div>
        <div *ngIf="playersError" class="error">Error: {{ playersError }}</div>
        <ul *ngIf="!loadingPlayers && !playersError">
          <li *ngFor="let player of players.slice(0, 5)">
            {{ player.username }} ({{ player.display_name || 'No display name' }})
          </li>
        </ul>
      </div>

      <div class="test-section">
        <h3>Scrims ({{ scrims.length }})</h3>
        <div *ngIf="loadingScrims">Loading scrims...</div>
        <div *ngIf="scrimsError" class="error">Error: {{ scrimsError }}</div>
        <ul *ngIf="!loadingScrims && !scrimsError">
          <li *ngFor="let scrim of scrims.slice(0, 5)">
            Scrim {{ scrim.id }} - {{ scrim.created_at | date }}
          </li>
        </ul>
      </div>

      <div class="test-section">
        <h3>Scrim Sessions ({{ scrimSessions.length }})</h3>
        <div *ngIf="loadingScrimSessions">Loading scrim sessions...</div>
        <div *ngIf="scrimSessionsError" class="error">Error: {{ scrimSessionsError }}</div>
        <ul *ngIf="!loadingScrimSessions && !scrimSessionsError">
          <li *ngFor="let session of scrimSessions.slice(0, 5)">
            {{ session.date }} at {{ session.time }} - Maps: {{ session.maps.join(', ') }}
          </li>
        </ul>
      </div>

      <div class="test-section">
        <h3>Player Stats ({{ playerStats.length }})</h3>
        <div *ngIf="loadingPlayerStats">Loading player stats...</div>
        <div *ngIf="playerStatsError" class="error">Error: {{ playerStatsError }}</div>
        <ul *ngIf="!loadingPlayerStats && !playerStatsError">
          <li *ngFor="let stat of playerStats.slice(0, 5)">
            {{ stat.name || 'Unknown' }}: {{ stat.kills }} kills, {{ stat.damage_dealt }} damage, score {{ stat.score }}
          </li>
        </ul>
      </div>

      <div class="test-section">
        <h3>Debug Info</h3>
        <p>Check the browser console for detailed error messages.</p>
        <button (click)="testSimpleQuery()">Test Simple Query</button>
      </div>
    </div>
  `,
  styles: [`
    .nhost-test {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .test-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
    }

    .test-section h3 {
      color: #ff2c5c;
      margin-bottom: 1rem;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .error {
      color: #ff6b6b;
      padding: 1rem;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 4px;
      border: 1px solid rgba(255, 107, 107, 0.3);
    }

    .connection-info p {
      margin: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }

    button {
      padding: 0.5rem 1rem;
      background: #ff2c5c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    button:hover {
      background: #e02549;
    }
  `]
})
export class NhostTestComponent implements OnInit {
  players: any[] = [];
  playerIdToName: Map<string, string> = new Map();
  scrims: any[] = [];
  scrimSessions: any[] = [];
  playerStats: any[] = [];

  loadingPlayers = false;
  loadingScrims = false;
  loadingScrimSessions = false;
  loadingPlayerStats = false;

  playersError: string | null = null;
  scrimsError: string | null = null;
  scrimSessionsError: string | null = null;
  playerStatsError: string | null = null;

  constructor(
    private nhostService: NhostService,
    private scrimsDataService: ScrimsDataService
  ) {}

  ngOnInit() {
    console.log('NhostTestComponent initialized');
  this.testConnection();
  this.testPlayers();
  this.testScrims();
  this.testPlayerStats();
  }

  testConnection() {
    console.log('Testing nhost connection...');
    // Simple test query to check if nhost is working
    const simpleQuery = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;
    
    this.nhostService['nhost'].graphql.request(simpleQuery).then(
      (result: any) => {
        console.log('Nhost connection successful:', result);
      },
      (error: any) => {
        console.error('Nhost connection failed:', error);
      }
    );
  }

  testPlayers() {
    this.loadingPlayers = true;
    this.playersError = null;
    console.log('Testing players query...');
    
    this.nhostService.getPlayers().subscribe({
      next: (players) => {
        this.players = players;
        this.loadingPlayers = false;
        console.log('Players loaded successfully:', players);
      },
      error: (error) => {
        console.error('Full error object:', error);
        this.playersError = `${error.message || error.toString()}. Check console for full details.`;
        this.loadingPlayers = false;
      }
    });
  }

  testScrims() {
    this.loadingScrims = true;
    this.scrimsError = null;
    console.log('Testing scrims query...');
    
    this.nhostService.getScrims().subscribe({
      next: (scrims) => {
        this.scrims = scrims;
        this.loadingScrims = false;
        console.log('Scrims loaded successfully:', scrims);
      },
      error: (error) => {
        console.error('Full error object:', error);
        this.scrimsError = `${error.message || error.toString()}. Check console for full details.`;
        this.loadingScrims = false;
      }
    });
  }



  testPlayerStats() {
    this.loadingPlayerStats = true;
    this.nhostService.getScrimPlayerStatsWithDetails().subscribe({
      next: (stats) => {
        this.playerStats = stats;
        this.playerIdToName = getMostCommonPlayerNames(stats);
        this.loadingPlayerStats = false;
        console.log('Player stats loaded:', stats);
        console.log('PlayerId to most common name:', this.playerIdToName);
      },
      error: (error) => {
        this.playerStatsError = error.message || 'Failed to load player stats';
        this.loadingPlayerStats = false;
        console.error('Error loading player stats:', error);
      }
    });
  }

  testSimpleQuery() {
    console.log('Testing simple GraphQL query...');
    
    // Test with a very simple query that should work if nhost is accessible
    const simpleQuery = `
      query {
        __type(name: "Query") {
          name
        }
      }
    `;
    
    this.nhostService['nhost'].graphql.request(simpleQuery).then(
      (result: any) => {
        console.log('Simple query successful:', result);
        alert('Simple query successful! Check console for details.');
      },
      (error: any) => {
        console.error('Simple query failed:', error);
        alert('Simple query failed! Check console for details.');
      }
    );
  }
}
