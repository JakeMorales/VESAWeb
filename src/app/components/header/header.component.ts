import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <nav class="nav" [class.nav-open]="isNavOpen">
          <a routerLink="/home" class="nav-logo-link" aria-label="Home">
            <img
              src="WhiteVesaLogoTransparent.png"
              alt="VESA Logo Icon"
              class="nav-logo-img"
            />
          </a>
          <a routerLink="/league" routerLinkActive="active" (click)="closeNav()">League</a>
          <a routerLink="/scrims" routerLinkActive="active" (click)="closeNav()">Scrims</a>
          @if (environment.features.playerStats) {
            <a routerLink="/players" routerLinkActive="active" (click)="closeNav()">Player Stats</a>
          }
          <a routerLink="/games" routerLinkActive="active" (click)="closeNav()">Games</a>
          @if (environment.features.ratingsLeaderboard) {
            <a routerLink="/ratings" routerLinkActive="active" (click)="closeNav()">Ratings</a>
          }
        </nav>

        <button class="mobile-toggle" (click)="toggleNav()" [attr.aria-expanded]="isNavOpen">
          <span class="hamburger"></span>
          <span class="hamburger"></span>
          <span class="hamburger"></span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .nav-logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1.2rem;
    }
    .header {
      background: transparent !important;
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: none !important;
      border: none !important;
      width: 100vw;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      pointer-events: none;
      backdrop-filter: none;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      margin: 0 auto;
      padding: 1.5rem 0 0.5rem 0;
      flex-direction: column;
      gap: 1.2rem;
      background: transparent !important;
      box-shadow: none !important;
      pointer-events: auto;
    }

    @media (min-width: 700px) {
      .header-content {
        flex-direction: row;
        gap: 2.5rem;
        justify-content: center;
        align-items: center;
      }
    }

    .nav-logo-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 104px;
      height: 104px;
      min-width: 104px;
      min-height: 104px;
      border-radius: 50%;
      background: transparent;
      text-decoration: none;
      margin: 0 0.18rem 0 0;
      padding: 0;
      border: none;
      box-shadow: none;
      transition: box-shadow 0.2s, background 0.2s;
    }

    .nav-logo-img {
      width: 96px;
      height: 96px;
      object-fit: cover;
      border-radius: 50%;
      display: block;
      margin: 0 auto;
      background: transparent;
      transition: transform 0.2s;
    }

    .nav-logo-link:hover .nav-logo-img {
      transform: scale(1.08);
      box-shadow: 0 0 12px rgba(44,156,255,0.18);
    }

    .nav > .nav-logo-link {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      min-width: unset;
      margin-left: 0;
      margin-right: 0.18rem;
      padding: 0;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .logo-link {
      display: block;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .logo-image {
      height: 80px;
      width: auto;
      filter: drop-shadow(0 0 10px rgba(255, 44, 92, 0.3));
      transition: all 0.3s ease;
      display: block;
    }

    .logo-link:hover .logo-image {
      filter: drop-shadow(0 0 15px rgba(255, 44, 92, 0.5)) drop-shadow(0 0 15px rgba(44, 156, 255, 0.3));
      transform: scale(1.02);
    }

    .nav {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 2.2rem 0.5rem 1.2rem;
      background: rgba(20, 20, 30, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 2.5rem;
      box-shadow: none;
      border: none;
      margin: 0 auto;
      width: fit-content;
      min-width: 340px;
      max-width: 95vw;
      position: relative;
      z-index: 10;
    }

    .nav a {
      color: #e3e6f3;
      text-decoration: none;
      padding: 0.5rem 1.5rem;
      border-radius: 2rem;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
      font-weight: 500;
      font-size: 1.08rem;
      letter-spacing: 0.04em;
      border: none;
      position: relative;
      overflow: visible;
      background: linear-gradient(90deg, #3e4e6a 0%, #4a5d7a 100%);
      box-shadow: 0 1px 6px 0 rgba(30,40,60,0.08);
      text-transform: uppercase;
      display: inline-block;
      min-width: 90px;
      margin: 0 0.1rem;
    }

    .nav > a.active, .nav > a:focus {
      background: linear-gradient(90deg, #5e6cff 0%, #b45cff 100%);
      color: #fff;
      box-shadow: 0 2px 12px 0 rgba(90,80,200,0.13);
    }

    .nav > a:hover:not(.active) {
      background: linear-gradient(90deg, #4a5d7a 0%, #5e6cff 100%);
      color: #fff;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }

    .hamburger {
      width: 25px;
      height: 3px;
      background-color: white;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999;
        background: rgba(10, 10, 20, 0.97);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        flex-direction: column;
        align-items: center;
        padding: 5rem 2rem 2rem;
        gap: 0.75rem;
        border-radius: 0 0 1.5rem 1.5rem;
        min-width: unset;
        width: 100%;
        max-width: 100%;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
      }

      .nav.nav-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav a {
        text-align: center;
        width: 100%;
        min-width: unset;
        padding: 0.875rem 1rem;
        border-radius: 0.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }

      .mobile-toggle {
        display: flex;
      }

      .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }

      .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(2) {
        opacity: 0;
      }

      .mobile-toggle[aria-expanded="true"] .hamburger:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0.75rem;
      }

      .logo-image {
        height: 60px;
      }
    }
  `]
})
export class HeaderComponent {
  protected readonly environment = environment;
  isNavOpen = false;

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    this.isNavOpen = false;
  }
}
