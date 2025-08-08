import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <a routerLink="/home" class="logo-link">
            <img 
              src="vesa-logo.png" 
              alt="VESA - Virtual Esports Association" 
              class="logo-image"
            />
          </a>
        </div>
        
        <nav class="nav" [class.nav-open]="isNavOpen">
          <a routerLink="/home" routerLinkActive="active" (click)="closeNav()">Home</a>
          <div class="nav-dropdown">
            <a routerLink="/league" routerLinkActive="active" (click)="closeNav()">
              League <span class="dropdown-arrow">▼</span>
            </a>
            <div class="dropdown-menu">
              <a routerLink="/league/pinnacle" (click)="closeNav()">Pinnacle (I)</a>
              <a routerLink="/league/vanguard" (click)="closeNav()">Vanguard (II)</a>
              <a routerLink="/league/ascendant" (click)="closeNav()">Ascendant (III)</a>
              <a routerLink="/league/emergent" (click)="closeNav()">Emergent (IV)</a>
              <a routerLink="/league/challengers" (click)="closeNav()">Challengers (V)</a>
              <a routerLink="/league/contenders" (click)="closeNav()">Contenders (VI)</a>
            </div>
          </div>
          <a routerLink="/scrims" routerLinkActive="active" (click)="closeNav()">Scrims</a>
          <a routerLink="/players" routerLinkActive="active" (click)="closeNav()">Player Stats</a>
          <a routerLink="/games" routerLinkActive="active" (click)="closeNav()">Games</a>
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
    .header {
      background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(255, 44, 92, 0.2), 0 4px 20px rgba(44, 156, 255, 0.2);
      border-bottom: 1px solid rgba(255, 44, 92, 0.3);
      width: 100%;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
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
      gap: 2rem;
      align-items: center;
    }

    .nav a {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .nav a::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 44, 92, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav a:hover::before,
    .nav a.active::before {
      left: 100%;
    }

    /* General nav link hover styles - but not for dropdown containers */
    .nav > a:hover,
    .nav > a.active {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.2), rgba(44, 156, 255, 0.2));
      border-color: rgba(255, 44, 92, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 44, 92, 0.3);
    }

    .nav-dropdown {
      position: relative;
      display: flex;
      align-items: center;
    }

    .nav-dropdown > a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      justify-content: center;
    }

    .dropdown-arrow {
      font-size: 0.7rem;
      transition: all 0.3s ease;
      opacity: 0;
      transform: scale(0.8);
    }

    .nav-dropdown:hover .dropdown-arrow {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }

    /* Apply hover effects to the dropdown link */
    .nav-dropdown > a:hover {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.2), rgba(44, 156, 255, 0.2));
      border-color: rgba(255, 44, 92, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 44, 92, 0.3);
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
  isNavOpen = false;

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    this.isNavOpen = false;
  }
}
