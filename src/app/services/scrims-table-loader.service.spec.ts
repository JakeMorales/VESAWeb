import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScrimsTableLoaderService } from './scrims-table-loader.service';
import { MatchDayResults } from '../models/match-day-results.model';

// Import the sample JSON as a TypeScript object
import { scrim_2024_07_03_id_7058 } from './__testdata__/scrim_2024_07_03_id_7058';
const SAMPLE_JSON_PATH = 'assets/scrims_batch/scrim_2024_07_03_id_7058.json';

 fdescribe('ScrimsTableLoaderService Integration', () => {
  let service: ScrimsTableLoaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScrimsTableLoaderService]
    });
    service = TestBed.inject(ScrimsTableLoaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load and normalize teams/players for each game', (done) => {
    service.loadScrimTableFromJson(SAMPLE_JSON_PATH).subscribe((results: MatchDayResults) => {
      // For each game, every team should appear with normalized name and correct players
      Object.values(results).forEach((teams: import('../models/match-day-results.model').TeamGameResult[]) => {
        teams.forEach((team: import('../models/match-day-results.model').TeamGameResult) => {
          expect(team.teamName).not.toMatch(/@\d+$/);
          expect(Array.isArray(team.players)).toBeTrue();
          // New: Assert that every team has at least one player
          expect(team.players.length).toBeGreaterThan(0);
          team.players.forEach((player: import('../models/match-day-results.model').PlayerStats) => {
            expect(player.playerName).toBeTruthy();
          });
        });
      });
      done();
    });
    // Provide the imported JSON object as the response
    const req = httpMock.expectOne(SAMPLE_JSON_PATH);
    req.flush(scrim_2024_07_03_id_7058);
  });
});
