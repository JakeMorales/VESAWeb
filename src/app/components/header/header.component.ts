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
          <div class="nav-dropdown">
            <a routerLink="/league" routerLinkActive="active" (click)="closeNav()">
              League <span class="dropdown-arrow">▼</span>
            </a>
            <div class="dropdown-menu">
              <a routerLink="/league/current-season" (click)="closeNav()" class="dropdown-featured">Current Season (S14)</a>
              <a routerLink="/league/signup" (click)="closeNav()" class="dropdown-featured">League Signup</a>
              <div class="dropdown-divider"></div>
              <a routerLink="/league/pinnacle"   (click)="closeNav()">Pinnacle (I)</a>
              <a routerLink="/league/vanguard"   (click)="closeNav()">Vanguard (II)</a>
              <a routerLink="/league/ascendant"  (click)="closeNav()">Ascendant (III)</a>
              <a routerLink="/league/emergent"   (click)="closeNav()">Emergent (IV)</a>
              <a routerLink="/league/challenger" (click)="closeNav()">Challenger (V)</a>
              <a routerLink="/league/prospect"   (click)="closeNav()">Prospect (VI)</a>
              <a routerLink="/league/aspirant"   (click)="closeNav()">Aspirant (VII)</a>
              <a routerLink="/league/contenders" (click)="closeNav()">Contenders (VIII)</a>
            </div>
          </div>
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


    /* General nav link hover styles - but not for dropdown containers */
    .nav > a.active, .nav > a:focus {
      background: linear-gradient(90deg, #5e6cff 0%, #b45cff 100%);
      color: #fff;
      box-shadow: 0 2px 12px 0 rgba(90,80,200,0.13);
    }

    .nav > a:hover:not(.active) {
      background: linear-gradient(90deg, #4a5d7a 0%, #5e6cff 100%);
      color: #fff;
    }


    .nav-dropdown {
      position: relative;
      display: flex;
      align-items: center;
      margin: 0 0.1rem;
    }

    .nav-dropdown > a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 90px;
      justify-content: center;
      border-radius: 2rem;
      font-weight: 500;
      font-size: 1.08rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: linear-gradient(90deg, #3e4e6a 0%, #4a5d7a 100%);
      box-shadow: 0 1px 6px 0 rgba(30,40,60,0.08);
      border: none;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
      position: relative;
      overflow: visible;
      margin: 0 0.1rem;
    }

    .dropdown-arrow {
  font-size: 0.7rem;
  transition: all 0.3s ease;
  opacity: 1;
  transform: scale(1);
    }

    .nav-dropdown:hover .dropdown-arrow {
  transform: scale(1) rotate(180deg);
    }

    /* Apply hover effects to the dropdown link */
    .nav-dropdown > a.active, .nav-dropdown > a:focus {
      background: linear-gradient(90deg, #5e6cff 0%, #b45cff 100%);
      color: #fff;
      box-shadow: 0 2px 12px 0 rgba(90,80,200,0.13);
    }

    .nav-dropdown > a:hover:not(.active) {
      background: linear-gradient(90deg, #4a5d7a 0%, #5e6cff 100%);
      color: #fff;
    }

    /* Also apply hover effects when hovering the dropdown container */
    .nav-dropdown:hover > a {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.2), rgba(44, 156, 255, 0.2));
      border-color: rgba(255, 44, 92, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 44, 92, 0.3);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      min-width: 180px;
      width: 180px;
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 44, 92, 0.3);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .nav-dropdown:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }

    .dropdown-menu a {
      display: block;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      font-size: 0.875rem;
      border-radius: 0;
    }

    .dropdown-menu a:last-child {
      border-bottom: none;
      border-radius: 0 0 8px 8px;
    }

    .dropdown-menu a:first-child {
      border-radius: 8px 8px 0 0;
    }

    .dropdown-menu a:hover {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.3), rgba(44, 156, 255, 0.3));
      color: white;
      transform: none;
      box-shadow: none;
      border-color: transparent;
    }

    .dropdown-featured {
      color: #b45cff !important;
      font-weight: 600 !important;
    }

    .dropdown-featured:hover {
      color: #fff !important;
    }

    .dropdown-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0.25rem 0;
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
        top: 100%;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
        flex-direction: column;
        padding: 2rem;
        gap: 1rem;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      }

      .nav.nav-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav a {
        text-align: center;
        padding: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .nav-dropdown .dropdown-menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        border: none;
        background: rgba(255, 255, 255, 0.05);
        margin-top: 0.5rem;
        border-radius: 4px;
        width: 100%;
        min-width: auto;
      }

      .nav-dropdown > a {
        min-width: auto;
        width: 100%;
      }

      .nav-dropdown:hover .dropdown-arrow {
        transform: none;
      }

      .dropdown-menu a {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
