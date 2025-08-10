import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NhostClient } from '@nhost/nhost-js';

@Component({
  selector: 'app-simple-nhost-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-test">
      <h2>Simple Nhost Connection Test</h2>
      
      <div class="test-section">
        <h3>Connection Details</h3>
        <p>Subdomain: bsgzgiiagytbnyqsvebl</p>
        <p>Region: us-east-1</p>
        <p>GraphQL Endpoint: {{ graphqlUrl }}</p>
      </div>

      <div class="test-section">
        <h3>Tests</h3>
        <button (click)="testIntrospection()">Test Schema Introspection</button>
        <button (click)="testSimpleQuery()">Test Simple Query</button>
        <button (click)="explorePlayersSchema()">Explore Players Schema</button>
        <button (click)="exploreScrimsSchema()">Explore Scrims Schema</button>
        <button (click)="exploreStatsSchema()">Explore Scrim Stats Schema</button>
        <button (click)="testScrimPlayerStats()">Test Scrim Player Stats</button>
        <button (click)="testDetailedScrims()">Test Detailed Scrims</button>
        <button (click)="testDetailedPlayers()">Test All Players</button>
        <button (click)="testPlayersWithLimit()">Test Players with Limit 3000</button>
        <button (click)="testPlayersWithOffset()">Test Players with Offset</button>
        <button (click)="testPlayersTable()">Test Players Table</button>
        <button (click)="testHttpConnection()">Test HTTP Connection</button>
      </div>

      <div class="test-section">
        <h3>Results</h3>
        <div class="results">
          <div *ngFor="let result of results" [class]="result.type">
            <strong>{{ result.title }}:</strong> {{ result.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simple-test {
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

    button {
      margin: 0.5rem;
      padding: 0.5rem 1rem;
      background: #ff2c5c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #e02549;
    }

    .results div {
      padding: 0.5rem;
      margin: 0.5rem 0;
      border-radius: 4px;
    }

    .success {
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      color: #00ff00;
    }

    .error {
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.3);
      color: #ff6b6b;
    }

    .info {
      background: rgba(0, 123, 255, 0.1);
      border: 1px solid rgba(0, 123, 255, 0.3);
      color: #007bff;
    }
  `]
})
export class SimpleNhostTestComponent implements OnInit {
  results: Array<{title: string, message: string, type: string}> = [];
  graphqlUrl: string;
  private nhost: NhostClient;

  constructor() {
    this.nhost = new NhostClient({
      subdomain: 'bsgzgiiagytbnyqsvebl',
      region: 'us-east-1'
    });
    this.graphqlUrl = `https://bsgzgiiagytbnyqsvebl.graphql.us-east-1.nhost.run/v1`;
  }

  ngOnInit() {
    this.addResult('Component Initialized', 'Nhost client created successfully', 'info');
  }

  addResult(title: string, message: string, type: 'success' | 'error' | 'info') {
    this.results.push({ title, message, type });
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }

  async testIntrospection() {
    this.addResult('Schema Introspection', 'Testing...', 'info');
    
    const query = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
          }
          types {
            name
            kind
          }
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Introspection result:', result);
      
      if (result.error) {
        this.addResult('Schema Introspection', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const typeCount = result.data.__schema.types.length;
        this.addResult('Schema Introspection', `Success! Found ${typeCount} types in schema`, 'success');
      }
    } catch (error: any) {
      this.addResult('Schema Introspection', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Introspection error:', error);
    }
  }

  async testSimpleQuery() {
    this.addResult('Simple Query', 'Testing __typename query...', 'info');
    
    const query = `
      query {
        __typename
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Simple query result:', result);
      
      if (result.error) {
        this.addResult('Simple Query', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        this.addResult('Simple Query', `Success! Typename: ${result.data.__typename}`, 'success');
      }
    } catch (error: any) {
      this.addResult('Simple Query', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Simple query error:', error);
    }
  }

  async testPlayersTable() {
    this.addResult('Players Table', 'Testing players table access...', 'info');
    
    const query = `
      query {
        players {
          id
          discord_id
          display_name
          elo
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Players query result:', result);
      
      if (result.error) {
        this.addResult('Players Table', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const playerCount = result.data.players ? result.data.players.length : 0;
        this.addResult('Players Table', `Success! Found ${playerCount} players`, 'success');
      }
    } catch (error: any) {
      this.addResult('Players Table', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Players query error:', error);
    }
  }

  async testHttpConnection() {
    this.addResult('HTTP Connection', 'Testing direct HTTP connection to GraphQL endpoint...', 'info');
    
    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }'
        })
      });

      const data = await response.json();
      console.log('HTTP response:', data);

      if (response.ok) {
        this.addResult('HTTP Connection', `Success! Status: ${response.status}`, 'success');
      } else {
        this.addResult('HTTP Connection', `HTTP Error ${response.status}: ${JSON.stringify(data)}`, 'error');
      }
    } catch (error: any) {
      this.addResult('HTTP Connection', `Network Error: ${error.message || error.toString()}`, 'error');
      console.error('HTTP connection error:', error);
    }
  }

  async explorePlayersSchema() {
    this.addResult('Players Schema', 'Exploring players table schema...', 'info');
    await this.exploreTableSchema('players');
  }

  async exploreScrimsSchema() {
    this.addResult('Scrims Schema', 'Exploring scrims table schema...', 'info');
    await this.exploreTableSchema('scrims');
  }

  async exploreStatsSchema() {
    this.addResult('Scrim Stats Schema', 'Exploring scrim_player_stats table schema...', 'info');
    await this.exploreTableSchema('scrim_player_stats');
  }

  async exploreTableSchema(tableName: string) {
    const query = `
      query {
        __type(name: "${tableName}") {
          name
          kind
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log(`${tableName} schema result:`, result);
      
      if (result.error) {
        this.addResult(`${tableName} Schema`, `Error: ${JSON.stringify(result.error)}`, 'error');
      } else if (result.data.__type) {
        const fields = result.data.__type.fields;
        const fieldNames = fields.map((f: any) => f.name).join(', ');
        this.addResult(`${tableName} Schema`, `Fields: ${fieldNames}`, 'success');
        
        // Log detailed field info
        console.log(`${tableName} fields:`, fields);
      } else {
        this.addResult(`${tableName} Schema`, `Table type not found`, 'error');
      }
    } catch (error: any) {
      this.addResult(`${tableName} Schema`, `Exception: ${error.message || error.toString()}`, 'error');
      console.error(`${tableName} schema error:`, error);
    }
  }

  async testScrimPlayerStats() {
    this.addResult('Scrim Player Stats', 'Testing scrim_player_stats table...', 'info');
    
    const query = `
      query {
        scrim_player_stats(limit: 5) {
          id
          scrim_id
          player_id
          name
          kills
          damage_dealt
          score
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Scrim player stats result:', result);
      
      if (result.error) {
        this.addResult('Scrim Player Stats', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const statsCount = result.data.scrim_player_stats ? result.data.scrim_player_stats.length : 0;
        this.addResult('Scrim Player Stats', `Success! Found ${statsCount} stats records`, 'success');
      }
    } catch (error: any) {
      this.addResult('Scrim Player Stats', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Scrim player stats error:', error);
    }
  }

  async testDetailedScrims() {
    this.addResult('Detailed Scrims', 'Testing scrims with all fields...', 'info');
    
    const query = `
      query {
        scrims(limit: 3) {
          id
          active
          date_time_field
          discord_channel
          overstat_link
          skill
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Detailed scrims result:', result);
      
      if (result.error) {
        this.addResult('Detailed Scrims', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const scrims = result.data.scrims || [];
        this.addResult('Detailed Scrims', `Success! Sample data: ${JSON.stringify(scrims[0] || {})}`, 'success');
      }
    } catch (error: any) {
      this.addResult('Detailed Scrims', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Detailed scrims error:', error);
    }
  }

  async testDetailedPlayers() {
    this.addResult('All Players Test', 'Testing players table with count...', 'info');
    
    const query = `
      query {
        players_aggregate {
          aggregate {
            count
          }
        }
        players(limit: 20) {
          id
          discord_id
          display_name
          elo
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('All players result:', result);
      
      if (result.error) {
        this.addResult('All Players Test', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const totalCount = result.data.players_aggregate?.aggregate?.count || 0;
        const sampleCount = result.data.players?.length || 0;
        this.addResult('All Players Test', `Total players in DB: ${totalCount}, Sample shown: ${sampleCount}`, 'success');
      }
    } catch (error: any) {
      this.addResult('All Players Test', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('All players error:', error);
    }
  }

  async testPlayersWithLimit() {
    this.addResult('Players with Limit', 'Testing players query with limit 3000...', 'info');
    
    const query = `
      query {
        players(limit: 3000) {
          id
          discord_id
          display_name
          elo
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Players with limit result:', result);
      
      if (result.error) {
        this.addResult('Players with Limit', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const playerCount = result.data.players ? result.data.players.length : 0;
        this.addResult('Players with Limit', `Success! Got ${playerCount} players with limit 3000`, 'success');
      }
    } catch (error: any) {
      this.addResult('Players with Limit', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Players with limit error:', error);
    }
  }

  async testPlayersWithOffset() {
    this.addResult('Players with Offset', 'Testing players with offset to check pagination...', 'info');
    
    const query = `
      query {
        players(limit: 50, offset: 10) {
          id
          discord_id
          display_name
        }
      }
    `;

    try {
      const result = await this.nhost.graphql.request(query);
      console.log('Players with offset result:', result);
      
      if (result.error) {
        this.addResult('Players with Offset', `Error: ${JSON.stringify(result.error)}`, 'error');
      } else {
        const playerCount = result.data.players ? result.data.players.length : 0;
        this.addResult('Players with Offset', `Success! Got ${playerCount} players with offset 10`, 'success');
      }
    } catch (error: any) {
      this.addResult('Players with Offset', `Exception: ${error.message || error.toString()}`, 'error');
      console.error('Players with offset error:', error);
    }
  }
}
