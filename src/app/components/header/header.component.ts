import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CURRENT_SEASON, SIGNUPS_OPEN, formatTickerDate } from '../../config/season';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ticker">
      <div class="wrap ticker-row">
        <span class="ticker-left"><b>VESA</b> // VIRTUAL ESPORTS ASSOCIATION</span>
        <span class="ticker-right">
          <span class="live">●</span> SEASON {{ season }} SIGNUPS OPEN <b>{{ signupsOpenDate }}</b>
        </span>
      </div>
    </div>

    <header class="bar">
      <div class="wrap bar-row">
        <a routerLink="/home" class="brand" aria-label="VESA home" (click)="closeNav()">
          <img src="WhiteVesaLogoTransparent.png" alt="" class="brand-logo" />
          <span class="brand-mark">VES<em>A</em></span>
          <span class="brand-sub">Apex League</span>
        </a>

        <nav class="links" aria-label="Primary">
          <a routerLink="/league" routerLinkActive="active">League</a>
          <a routerLink="/scrims" routerLinkActive="active">Scrims</a>
          @if (environment.features.playerStats) {
            <a routerLink="/players" routerLinkActive="active">Players</a>
          }
          <a routerLink="/games" routerLinkActive="active">Games</a>
          @if (environment.features.ratingsLeaderboard) {
            <a routerLink="/ratings" routerLinkActive="active">Ratings</a>
          }
        </nav>

        <a
          class="btn primary small register"
          href="https://discord.gg/RyvVJqnXbe"
          target="_blank"
          rel="noopener noreferrer"
        >Register</a>

        <button
          class="mobile-toggle"
          type="button"
          (click)="toggleNav()"
          [attr.aria-expanded]="isNavOpen"
          aria-label="Toggle navigation"
        >
          <span class="hamburger"></span>
          <span class="hamburger"></span>
          <span class="hamburger"></span>
        </button>
      </div>

      <nav class="mobile-menu" [class.open]="isNavOpen" aria-label="Primary mobile">
        <a routerLink="/league" routerLinkActive="active" (click)="closeNav()">League</a>
        <a routerLink="/scrims" routerLinkActive="active" (click)="closeNav()">Scrims</a>
        @if (environment.features.playerStats) {
          <a routerLink="/players" routerLinkActive="active" (click)="closeNav()">Players</a>
        }
        <a routerLink="/games" routerLinkActive="active" (click)="closeNav()">Games</a>
        @if (environment.features.ratingsLeaderboard) {
          <a routerLink="/ratings" routerLinkActive="active" (click)="closeNav()">Ratings</a>
        }
        <a
          class="btn primary small"
          href="https://discord.gg/RyvVJqnXbe"
          target="_blank"
          rel="noopener noreferrer"
          (click)="closeNav()"
        >Register</a>
      </nav>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .wrap {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ---------- ticker ---------- */
    .ticker {
      background: var(--vesa-void);
      border-bottom: 1px solid var(--vesa-line);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      color: var(--vesa-faint);
      text-transform: uppercase;
    }
    .ticker-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding-top: 7px;
      padding-bottom: 7px;
      white-space: nowrap;
      overflow: hidden;
    }
    .ticker b {
      color: var(--vesa-dim);
      font-weight: 400;
    }
    .ticker .live {
      color: var(--vesa-red);
    }

    /* ---------- bar ---------- */
    .bar {
      position: relative;
      background: rgba(4, 4, 10, 0.86);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--vesa-line);
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 28px;
      height: 60px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      object-fit: contain;
    }
    .brand-mark {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 24px;
      letter-spacing: 0.22em;
      color: var(--vesa-text);
      line-height: 1;
    }
    .brand-mark em {
      font-style: normal;
      color: var(--vesa-red);
    }
    .brand-sub {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: var(--vesa-faint);
      text-transform: uppercase;
      align-self: flex-end;
      padding-bottom: 2px;
    }

    .links {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }
    .links a {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-dim);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .links a:hover,
    .links a:focus-visible {
      color: var(--vesa-text);
      background: var(--vesa-raised);
    }
    .links a.active {
      color: var(--vesa-text);
      box-shadow: inset 0 -2px 0 var(--vesa-red);
      border-radius: 4px 4px 0 0;
    }

    .register {
      flex-shrink: 0;
    }

    /* ---------- mobile ---------- */
    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      margin-left: auto;
    }
    .hamburger {
      width: 22px;
      height: 2px;
      background: var(--vesa-text);
      border-radius: 1px;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(2) {
      opacity: 0;
    }
    .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    .mobile-menu {
      display: none;
    }

    @media (max-width: 768px) {
      .links,
      .register {
        display: none;
      }
      .ticker-right {
        display: none;
      }
      .mobile-toggle {
        display: flex;
      }

      .mobile-menu {
        display: flex;
        flex-direction: column;
        gap: 2px;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        padding: 12px 16px 16px;
        background: rgba(4, 4, 10, 0.97);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--vesa-line);
        transform: translateY(-8px);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.22s ease, opacity 0.22s ease, visibility 0.22s;
      }
      .mobile-menu.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      .mobile-menu a:not(.btn) {
        font-family: var(--font-mono);
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--vesa-dim);
        text-decoration: none;
        padding: 12px 10px;
        border-bottom: 1px solid var(--vesa-line);
      }
      .mobile-menu a:not(.btn):hover,
      .mobile-menu a.active {
        color: var(--vesa-text);
      }
      .mobile-menu a.active {
        box-shadow: inset 2px 0 0 var(--vesa-red);
      }
      .mobile-menu .btn {
        margin-top: 12px;
      }
    }
  `]
})
export class HeaderComponent {
  protected readonly environment = environment;
  protected readonly season = CURRENT_SEASON;
  protected readonly signupsOpenDate = formatTickerDate(SIGNUPS_OPEN);
  isNavOpen = false;

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    this.isNavOpen = false;
  }
}
