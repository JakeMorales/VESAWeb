# VESAWeb ELO Aggregation Server

This Node.js/TypeScript server loads scrim files from `src/assets/scrims_batch`, calculates player ELOs using shared logic from the Angular app, and serves leaderboard data to the Angular frontend via HTTP API.

## Features
- Loads all scrim JSON files
- Aggregates player ELOs using shared TypeScript services
- Serves leaderboard data via REST API

## Setup
1. Copy/refactor calculation services from `src/app/services` and models from `src/app/models` into `server/`.
2. Install dependencies: `npm install express typescript ts-node @types/node`
3. Run the server: `npx ts-node server/index.ts`

## API
- `GET /leaderboard` — Returns aggregated player ELO leaderboard as JSON

## Notes
- Keep logic in sync with Angular app by sharing/refactoring service code.
- You can later move aggregation to a scheduled job or serverless function if needed.
