const express = require('express');
const path = require('path');
const fs = require('fs');
const {  } = require('./elo-aggregation.service');
const { ScrimFileService } = require('./scrim-file.service');

const SCRIM_DIR = path.join(__dirname, '../src/assets/scrims_batch');
const PORT = process.env['PORT'] || 3001;

const app = express();

// Example: GET /leaderboard returns aggregated ELO leaderboard
/** @type {import('express').Request} */
/** @type {import('express').Response} */
app.get('/leaderboard', async (req: import('express').Request, res: import('express').Response) => {
  try {
    // Use ScrimFileService to load scrim files
    const scrimFileService = new ScrimFileService(SCRIM_DIR);
    // Use a simple identity loader for JSON blocks
  const leaderboard = getAllAggregatedPlayerElos(scrimFileService, (json: any) => json);
    res.json(leaderboard);
  } catch (err) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: errorMsg });
  }
});

app.listen(PORT, () => {
  console.log(`VESAWeb ELO Aggregation Server running on port ${PORT}`);
});
