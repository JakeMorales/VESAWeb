# VESAWeb - Virtual Esports Association

A competitive Apex Legends league and scrim server website built with Angular 18. Track player statistics, match history, and league standings for the Virtual Esports Association.

## ✨ Recent Updates

- 🏗️ **Component Modularization** - Refactored monolithic components into focused, reusable modules
- 🎛️ **Base Grid System** - Implemented configurable grid component for consistent data tables
- 🎮 **Match Components** - Split match functionality into specialized header, results, live, and upcoming components  
- 🎨 **Enhanced Scrim System** - Added ELO-based leaderboards and improved scrim management
- 🔧 **Performance Optimizations** - Reduced bundle size through component splitting and lazy loading
- 📱 **Improved Responsive Design** - Better mobile experience across all components

## Features

- 🏆 **Player Statistics** - Comprehensive tracking of kills, deaths, damage, and performance metrics
- 🎮 **Match History** - Detailed breakdowns of all league matches and scrimmages  
- 📊 **League Standings** - Real-time rankings and leaderboards by division
- 🏅 **Division System** - Multi-tier competitive divisions with detailed standings
- 📱 **Responsive Design** - Optimized for desktop and mobile viewing with dark theme
- ⚡ **Live Match Tracking** - Real-time match progress and live indicators
- 🎨 **Modern UI/UX** - Custom VESA brand styling with CSS variables and animations
- 🔍 **Match Details** - Individual match pages with comprehensive game results
- 🎲 **Scrim System** - ELO-based ranking system for practice matches and leaderboards

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Available Pages

- **Home** (`/`) - Landing page with hero section, stats preview, and recent activity
- **Player Stats** (`/players`) - Comprehensive player statistics and rankings  
- **Match History** (`/games`) - Complete record of all matches with filtering and stats
- **League Overview** (`/league`) - Main league page with divisions grid and standings
- **Division Details** (`/league/:id`) - Individual division standings and information
- **Match Details** (`/match/:id`) - Detailed match results and live tracking
- **Scrims** (`/scrims`) - ELO-based leaderboard and scrim management system

## Project Structure

```
VESAWeb/
├── public/                           # Static assets (favicon, logo, etc.)
├── src/
│   ├── app/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── base-grid/           # Configurable data grid component
│   │   │   ├── header/              # Navigation header with VESA branding
│   │   │   ├── games/               # Game-related components (cards, filters, stats)
│   │   │   ├── league/              # League components (standings, divisions, matches)
│   │   │   ├── match/               # Match components (header, results, live tracking)
│   │   │   ├── scrims/              # Scrim system components (ELO, leaderboards)
│   │   │   └── scrims-leaderboard/  # Specialized scrim leaderboard displays
│   │   ├── pages/                   # Route-based page components
│   │   │   ├── home/                # Landing page with hero section
│   │   │   ├── games/               # Match history and game details pages
│   │   │   ├── league/              # League overview and division pages
│   │   │   ├── match/               # Individual match detail pages
│   │   │   ├── player-stats/        # Player statistics and leaderboard pages
│   │   │   └── scrims/              # Scrim system and ELO leaderboard pages
│   │   ├── app.routes.ts            # Angular routing configuration
│   │   └── app.config.ts            # Application configuration
│   ├── assets/                      # App-specific assets
│   ├── styles.css                   # Global VESA brand styling and CSS variables
│   └── index.html                   # Main HTML entry point
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies and scripts
└── tsconfig.json                    # TypeScript configuration
```

## Architecture Highlights

- **Component-Based Design** - Modular components for maintainability and reusability
- **Base Grid System** - Configurable grid component with sorting, selection, and responsive design
- **Page-Component Separation** - Clear distinction between routable pages and reusable components  
- **Standalone Components** - Modern Angular 18 architecture without NgModules
- **Responsive CSS** - Mobile-first design with CSS Grid and Flexbox layouts

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Technology Stack

- **Angular 18** - Latest Angular with standalone components and improved performance
- **TypeScript 5.5** - Strict typing with latest language features  
- **Modern CSS** - CSS Variables, Grid, Flexbox, and custom animations
- **Component Architecture** - Modular, reusable components with clear separation of concerns
- **Responsive Design** - Mobile-first approach with dark theme throughout
- **Performance Optimized** - Lazy loading, OnPush change detection, and optimized bundles

## Design Features

- **Dark Theme** - Consistent dark UI with VESA brand colors (#ff2c5c, #2c9cff, #00d4ff)
- **CSS Variables** - Centralized color management and theming
- **Modern Animations** - Smooth transitions, hover effects, and loading states
- **Glass Morphism** - Backdrop blur effects and translucent cards
- **Responsive Grid** - CSS Grid and Flexbox for layout management
- **Custom Scrollbars** - Styled scrollbars matching the dark theme

## VESA League Info

The Virtual Esports Association (VESA) is a competitive Apex Legends league featuring:
- **Multiple Divisions** - Tiered competitive system (Pinnacle I, Vanguard II, etc.)
- **Live Match Tracking** - Real-time match progress with live indicators and status updates
- **Comprehensive Statistics** - Detailed player and team performance metrics with historical data
- **Match History** - Complete archive of league matches, tournaments, and scrimmages
- **Division Standings** - Real-time rankings with points, wins, and performance trend indicators
- **ELO Scrim System** - Ranked practice matches with skill-based matchmaking and leaderboards
- **Player Profiles** - Individual statistics, match history, and performance analytics

## Contributing

1. Follow Angular style guide and project conventions
2. Use the base grid component for consistent data tables
3. Maintain responsive design across all screen sizes
4. Test components thoroughly before submitting PRs
5. Keep the dark theme and VESA brand consistency
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
