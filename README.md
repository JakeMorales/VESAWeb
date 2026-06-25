
# VESAWeb — Virtual Esports Association

VESAWeb is the official web platform for the Virtual Esports Association (VESA), a structured competitive Apex Legends community offering both a tiered **League** format and a casual **Scrims** system. Built with Angular 18 standalone components, it pulls match data from HuggingFace datasets, player/team data from an Nhost (Hasura/PostgreSQL) backend, and uses Discord OAuth for authentication.

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero stats, features showcase, Discord CTA, recent activity |
| `/league` | League Overview | What is VESA League, divisions list, signup/season links |
| `/league/current-season` | Current Season (S14) | Season 14 match data, divisions, standings |
| `/league/signup` | League Signup | Discord-gated team registration form for Season 14 |
| `/league/:id` | Division | Standings, match history, current match, scores archive for a named division (e.g. `/league/pinnacle`) |
| `/match/:id` | Match Details | Per-game results table, player details, overall standings, live/upcoming states |
| `/scrims` | Scrims | ELO leaderboard section, format info, join instructions |
| `/games` | Games | Paginated browser of scrim batch files |
| `/players` | Player Stats | Player stats with search/filter and loading states |
| `/ratings` | Ratings Leaderboard | Paginated BR ELO ratings leaderboard with name search |

> Test-only routes (`/test`, `/simple-test`, `/team-tracker-test`) are present in the router and should be removed before production.

---

## Key Features

### League
- **8-Division Tier System**: Pinnacle (I) → Contenders (VIII), with division pages showing standings, match history, and scores archive
- **Season 14 Active**: Current season data served from HuggingFace `apex-league` dataset; pre-computed `_summary.json` per division for fast standings load
- **Match Point / Finals Support**: Playoff/finals matches distinguished from regular weeks; match point champions displayed
- **League Signup**: Discord OAuth flow (via Nhost auth), player autocomplete against the Nhost player database, Overstat ID auto-lookup, sub/alternate roster support

### Scrims
- **File-Based Match Data**: Scrim JSON files stored on HuggingFace `apex-scrims` dataset, paginated browser in the Games page
- **Leaderboard**: Aggregated stats served from a local backend at `localhost:3001/leaderboard`
- **ELO System**: Custom BR ELO displayed on the Scrims page leaderboard section

### Ratings
- **Custom BR Rating System**: Multi-factor rating (placement, combat, damage, support, opponent strength, consistency bonus)
- **Paginated Leaderboard**: 25 players per page, name search; backed by the ratings backend service

### UI/UX
- **Dark Theme**: CSS variables, glass morphism, gradient branding throughout
- **Responsive**: Mobile-first, CSS Grid/Flexbox, hamburger nav on mobile
- **Base Grid Component**: Reusable, sortable, configurable data grid used across match and stats tables
- **Modern Pagination**: Custom pagination component used in the Games page and match tables

---

## Architecture & Project Structure

```
VESAWeb/
├── public/                              # Static assets (VESA logo, favicon)
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── base-grid/              # Reusable configurable data grid
│   │   │   ├── header/                 # Sticky navigation header with dropdown
│   │   │   ├── modern-pagination/      # Pagination UI component
│   │   │   ├── scrim-collapsible/      # Collapsible scrim batch entry
│   │   │   ├── home/                   # Hero, features, Discord CTA, recent activity, detailed stats
│   │   │   ├── games/                  # Game card, team card, player item, filters
│   │   │   ├── league/                 # Division card, standings, match history, archive, season champions
│   │   │   ├── match/                  # Match header, results, live, upcoming, game tabs, player details
│   │   │   ├── player-stats/           # Player filters, stats header, loading states
│   │   │   ├── scrims/                 # Scrims hero, ELO system, leaderboard section, join, format
│   │   │   ├── scrims-leaderboard/     # Scrims leaderboard display component
│   │   │   └── test/                   # Nhost/team tracker test components (dev only)
│   │   ├── pages/
│   │   │   ├── home/                   # Home page
│   │   │   ├── league/                 # League current-season + division sub-pages
│   │   │   ├── league-overview/        # /league landing page
│   │   │   ├── league-signup/          # Discord-gated team registration
│   │   │   ├── match/                  # Match details page
│   │   │   ├── games/                  # Scrim match browser page
│   │   │   ├── player-stats/           # Player stats page
│   │   │   ├── scrims/                 # Scrims page
│   │   │   └── ratings/               # Ratings leaderboard page
│   │   ├── services/
│   │   │   ├── nhost.service.ts        # Nhost GraphQL client — players, scrims, signups, auth
│   │   │   ├── discord.service.ts      # Discord user profile lookup (avatar, username)
│   │   │   ├── league.service.ts       # League seasons, divisions, match files, division summaries
│   │   │   ├── league-match-data.service.ts
│   │   │   ├── match-loader.service.ts # HuggingFace dataset fetcher (scrims + league JSON)
│   │   │   ├── match-data.service.ts
│   │   │   ├── scrims-data.service.ts  # Scrim aggregation, leaderboard, match results
│   │   │   ├── player-stats.service.ts # Player stat mapping/aggregation
│   │   │   ├── team-utils.service.ts   # Team grouping, MatchDayResults transformation
│   │   │   ├── rating.service.ts       # BR ELO rating calculation logic
│   │   │   ├── ratings.service.ts      # Ratings leaderboard API calls
│   │   │   ├── date-utils.service.ts   # Scrim date formatting
│   │   │   └── mock-data.ts            # Static mock data (dev/fallback)
│   │   ├── models/
│   │   │   ├── scrim-batch-file.model.ts
│   │   │   ├── match-day-results.model.ts
│   │   │   ├── season.model.ts
│   │   │   └── apex-map-names.ts       # Apex map internal key → display name mapping
│   │   ├── utils/
│   │   │   └── player-utils.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── styles.css                       # Global VESA brand CSS variables and base styles
│   └── index.html
├── proxy.conf.json                      # Dev proxy: HuggingFace APIs + local leaderboard backend
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Data Layer

### HuggingFace Datasets (match JSON files)
- **Scrims**: `VESA-apex/apex-scrims` — files named `scrim_YYYY_MM_DD_id_XXXX.json`
- **League**: `VESA-apex/apex-league` — structure: `Season_XX/Division_X/Week_X.json`; each division also has a pre-computed `_summary.json` with season standings and match point results

The dev proxy in `proxy.conf.json` rewrites `/hf-api`, `/hf-resolve`, `/hf-league-api`, and `/hf-league-resolve` to the appropriate HuggingFace endpoints so the Angular dev server can reach them without CORS issues.

### Nhost (PostgreSQL + GraphQL)
Backend at subdomain `bsgzgiiagytbnyqsvebl` (us-east-1). Key tables:
- `players` — `id`, `discord_id`, `display_name`, `elo`, `overstat_id`
- `scrims` — scrim sessions with `active`, `date_time_field`, `discord_channel`, `overstat_link`, `skill`
- `scrim_player_stats` — per-player per-scrim stats (kills, damage, knockdowns, assists, revives, etc.)
- `scrim_signups` — team rosters for scrims (`team_name`, `player_one/two/three_id`, `signup_player_id`, `combined_elo`)

Nhost also provides **Discord OAuth** used in the League Signup flow.

### Ratings Backend
A local Express server at `localhost:3001` serves `/leaderboard` with paginated, aggregated player ratings. Proxied via `/leaderboard` in `proxy.conf.json`.

---

## Divisions

| # | Name | Route |
|---|---|---|
| I | Pinnacle | `/league/pinnacle` |
| II | Vanguard | `/league/vanguard` |
| III | Ascendant | `/league/ascendant` |
| IV | Emergent | `/league/emergent` |
| V | Challenger | `/league/challenger` |
| VI | Prospect | `/league/prospect` |
| VII | Aspirant | `/league/aspirant` |
| VIII | Contenders | `/league/contenders` |

Division count active per season varies based on signups; placement is admin-determined.

---

## BR Rating System

The ratings system (`rating.service.ts`) uses a multi-factor ELO designed for 20-team battle royale:

- **Placement** (40%): `(20 - placement + 1) / 20`
- **Combat** (25%): Kills + (Downs × 0.5), normalized
- **Damage** (15%): Player damage / Max damage in lobby
- **Support** (10%): Revives + Respawns (capped at 5)
- **Opponent Strength** (10%): Based on average ELO of teams placed above
- **Consistency Bonus**: Rewards balanced performance across all factors
- **K-Factor**: 38.4 (higher volatility for faster BR adjustment)

---

## Development

```bash
npm start          # ng serve — dev server at http://localhost:4200 with proxy
npm run build      # ng build — production build to dist/
npm test           # ng test — Karma/Jasmine unit tests
npm run generate-summaries  # Node script to pre-compute league _summary.json files
```

The dev server requires `proxy.conf.json` to reach HuggingFace and the local leaderboard backend. The Angular CLI picks this up automatically via `angular.json`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular 18 (standalone components, no NgModules) |
| Language | TypeScript 5.5 |
| Styling | CSS variables, Grid, Flexbox, glass morphism dark theme |
| Backend / DB | Nhost (Hasura GraphQL + PostgreSQL) |
| Auth | Nhost Auth — Discord OAuth provider |
| Match Data | HuggingFace Datasets (`VESA-apex/apex-scrims`, `VESA-apex/apex-league`) |
| Leaderboard API | Local Node.js server (`localhost:3001`) |
| Testing | Karma + Jasmine |

---

## Contributing

1. Follow Angular standalone component conventions — no NgModules
2. Use `BaseGridComponent` for all data tables
3. Maintain the dark theme and CSS variable system from `styles.css`
4. Keep the VESA brand gradient (`#5e6cff` → `#b45cff`) consistent
5. Team name normalization goes through `MatchLoaderService.normalizeTeamName()` — always use it
6. Do not add test routes to `app.routes.ts`; use a separate dev-only mechanism
