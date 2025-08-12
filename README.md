
# VESAWeb - Virtual Esports Association

VESAWeb is a modern web platform for the Virtual Esports Association, a competitive Apex Legends league and scrim server. Built with Angular 18, it provides real-time player statistics, match history, league standings, and a robust ELO-based scrim system.

---

## 🚀 Key Features

- **Battle Royale Rating System**: Multi-factor, ELO-based rating system tailored for 20-team battle royale games. Evaluates placement, combat, damage, support, and opponent strength, with a consistency bonus and BR-specific K-factor adjustments.
- **Interactive Rating Configurator**: Live tool for admins to experiment with rating weights, K-factor, and normalization parameters. Instantly see how changes affect player ratings and scenario outcomes.
- **Component Modularization**: All major features are split into focused, reusable Angular components for maintainability and performance.
- **Base Grid System**: Custom, highly-configurable grid component for all data tables, supporting sorting, selection, responsive layouts, and custom cell templates.
- **Comprehensive Player & Match Stats**: Track kills, deaths, damage, support actions, and more, with detailed breakdowns for every match and player.
- **Live Match Tracking**: Real-time updates for ongoing matches, including live status, progress bars, and in-game events.
- **ELO Scrim Leaderboards**: Practice matches use a skill-based ELO system with dynamic leaderboards and player analytics.
- **Modern UI/UX**: Dark theme, glass morphism, CSS variables, and smooth animations for a professional, branded experience.

---

## 🏗️ Architecture & Project Structure

```
VESAWeb/
├── public/                           # Static assets (favicon, logo, etc.)
├── src/
│   ├── app/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── base-grid/           # Configurable data grid component
│   │   │   ├── header/              # Navigation header
│   │   │   ├── games/               # Game-related components
│   │   │   ├── league/              # League/standings components
│   │   │   ├── match/               # Match header, results, live, upcoming
│   │   │   ├── scrims/              # Scrim system, ELO, leaderboards
│   │   │   └── scrims-leaderboard/  # Specialized scrim leaderboard displays
│   │   ├── pages/                   # Route-based page components
│   │   │   ├── home/                # Landing page
│   │   │   ├── games/               # Match history
│   │   │   ├── league/              # League overview/divisions
│   │   │   ├── match/               # Match details
│   │   │   ├── player-stats/        # Player stats/leaderboards
│   │   │   └── scrims/              # Scrim/ELO leaderboard pages
│   │   ├── app.routes.ts            # Angular routing
│   │   └── app.config.ts            # App configuration
│   ├── assets/                      # App-specific assets
│   ├── styles.css                   # Global VESA brand styling
│   └── index.html                   # Main HTML entry point
├── angular.json                     # Angular CLI config
├── package.json                     # Dependencies/scripts
└── tsconfig.json                    # TypeScript config
```

---

## 🧩 Component & Grid System Highlights

- **Base Grid Component**: Reusable, configurable grid for all tables. Supports column config, sorting, custom templates, selection, and responsive design.
- **Match Modularization**: Match features split into header, results, live, and upcoming components for clarity and maintainability.
- **Page-Component Separation**: Routable pages vs. reusable feature components.
- **Standalone Components**: Modern Angular 18, no NgModules required.
- **Responsive CSS**: Mobile-first, CSS Grid/Flexbox, dark theme, glass morphism.

---

## 🏆 Battle Royale Rating System

VESAWeb uses a custom ELO-based rating system designed for battle royale games:

- **Multi-Factor Evaluation**: Placement (40%), Combat (25%), Damage (15%), Support (10%), Opponent Strength (10%)
- **Consistency Bonus**: Rewards balanced performance across all factors
- **BR-Specific K-Factor**: Higher volatility (K=38.4) for faster rating adjustment
- **Continuous Results**: Non-binary, granular rating changes based on performance
- **Team & Player Tracking**: Ratings tracked for both teams and individuals

### Example Calculation Factors

- Placement: `(20 - placement + 1) / 20`
- Combat: Kills + (Downs × 0.5), normalized
- Damage: Player damage / Max damage in game
- Support: Revives + Respawns (max 5)
- Opponent Strength: Based on teams placed above

---

## 🛠️ Interactive Rating Configurator

Admins can dynamically adjust rating weights, K-factor, and normalization parameters using a live configurator tool:

- **Sliders for Each Factor**: Placement, Combat, Damage, Support, Opponent Strength, Consistency
- **Real-Time Validation**: Ensures weights total 100%, warns if not
- **Preset Configurations**: Balanced, placement-focused, combat-focused, team-focused
- **Scenario Testing**: Try different match outcomes and see instant rating changes
- **AI Suggestions**: Recommends balanced weights and warns about extremes

---

## 📄 Pages & Features

- **Home** (`/`) - Hero, stats preview, recent activity
- **Player Stats** (`/players`) - Player stats, rankings
- **Match History** (`/games`) - All matches, filters, stats
- **League Overview** (`/league`) - Divisions grid, standings
- **Division Details** (`/league/:id`) - Standings, info
- **Match Details** (`/match/:id`) - Results, live tracking
- **Scrims** (`/scrims`) - ELO leaderboard, scrim management

---

## 🧑‍💻 Development

- `ng serve` - Start dev server at `http://localhost:4200/`
- `ng build` - Build project to `dist/`
- `ng test` - Run unit tests with Karma
- `ng generate component <name>` - Scaffold new component

---

## 🛠️ Technology Stack

- **Angular 18** (standalone components)
- **TypeScript 5.5**
- **Modern CSS** (variables, grid, flexbox, animations)
- **Karma/Jasmine** (unit testing)

---

## 🤝 Contributing

1. Follow Angular style guide and project conventions
2. Use the base grid for all data tables
3. Maintain responsive design and dark theme
4. Test thoroughly before PRs
5. Keep VESA branding consistent

---

## ℹ️ Further Help

For Angular CLI help, run `ng help` or see the [Angular CLI Reference](https://angular.dev/tools/cli).
