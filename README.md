# VESAWeb - Virtual Esports Association

A competitive Apex Legends league and scrim server website built with Angular. Track player statistics, match history, and league standings for the Virtual Esports Association.

## Features

- 🏆 **Player Statistics** - Comprehensive tracking of kills, deaths, damage, and performance metrics
- 🎮 **Match History** - Detailed breakdowns of all league matches and scrimmages  
- 📊 **League Standings** - Real-time rankings and leaderboards by division
- 🏅 **Division System** - Multi-tier competitive divisions with detailed standings
- 📱 **Responsive Design** - Optimized for desktop and mobile viewing with dark theme
- ⚡ **Live Match Tracking** - Real-time match progress and live indicators
- 🎨 **Modern UI/UX** - Custom VESA brand styling with CSS variables and animations
- 🔍 **Match Details** - Individual match pages with comprehensive game results

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Available Pages

- **Home** (`/`) - Landing page with hero section, stats preview, and recent activity
- **Player Stats** (`/players`) - Comprehensive player statistics and rankings
- **Match History** (`/games`) - Complete record of all matches played with filtering
- **League Overview** (`/league`) - Main league page with divisions grid
- **Division Details** (`/league/:id`) - Individual division standings and information
- **Match Details** (`/match/:id`) - Detailed match results and live tracking

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/                    # Navigation header with VESA branding
│   │   ├── games/                     # Game-related components
│   │   │   ├── game-card.component.ts
│   │   │   ├── game-filters.component.ts
│   │   │   ├── game-stats-overview.component.ts
│   │   │   ├── player-item.component.ts
│   │   │   └── team-card.component.ts
│   │   └── league/                    # League-related components
│   │       ├── current-match.component.ts
│   │       ├── division-card.component.ts
│   │       ├── division-header.component.ts
│   │       ├── division-info.component.ts
│   │       ├── division-standings.component.ts
│   │       ├── divisions-grid.component.ts
│   │       ├── league-format.component.ts
│   │       ├── league-header.component.ts
│   │       └── match-history.component.ts
│   ├── pages/
│   │   ├── home/                      # Landing page with hero section
│   │   ├── player-stats/              # Player statistics and leaderboards
│   │   ├── games/                     # Match history and game details
│   │   ├── league/                    # League overview and divisions
│   │   │   └── division/              # Individual division details
│   │   └── match/                     # Individual match details and live tracking
│   ├── app.routes.ts                  # Angular routing configuration
│   └── styles.css                     # Global VESA brand styling
```

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Technology Stack

- **Angular 18** - Frontend framework with standalone components
- **TypeScript** - Programming language with strict typing
- **CSS3** - Modern styling with CSS variables, gradients, and animations
- **Angular Router** - Client-side routing for SPA navigation
- **Responsive Design** - Mobile-first approach with dark theme
- **Custom Design System** - VESA brand colors and consistent UI components

## Design Features

- **Dark Theme** - Consistent dark UI with VESA brand colors (#ff2c5c, #2c9cff, #00d4ff)
- **CSS Variables** - Centralized color management and theming
- **Modern Animations** - Smooth transitions, hover effects, and loading states
- **Glass Morphism** - Backdrop blur effects and translucent cards
- **Responsive Grid** - CSS Grid and Flexbox for layout management
- **Custom Scrollbars** - Styled scrollbars matching the dark theme

## VESA League Info

The Virtual Esports Association (VESA) is a competitive Apex Legends league featuring:
- **Multiple Divisions** - Tiered competitive system (Division I, II, III, etc.)
- **Live Match Tracking** - Real-time match progress with live indicators
- **Comprehensive Statistics** - Detailed player and team performance metrics
- **Match History** - Complete archive of league matches and tournaments
- **Division Standings** - Real-time rankings with points, wins, and trend indicators
- **Professional Presentation** - Tournament-style formatting and branding

## Component Architecture

The application follows Angular best practices with a component-based architecture:

- **Pages** - Route-level components for main navigation
- **Components** - Reusable UI components organized by feature
- **Standalone Components** - Modern Angular approach without NgModules
- **CSS Component Styling** - Scoped styles with global design system
- **TypeScript Interfaces** - Strong typing for data structures

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
