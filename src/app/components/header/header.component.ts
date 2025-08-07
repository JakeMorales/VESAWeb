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
          <h1 class="logo-text">VESA</h1>
          <span class="tagline">Virtual Esports Association</span>
        </div>
        
        <nav class="nav" [class.nav-open]="isNavOpen">
          <a routerLink="/home" routerLinkActive="active" (click)="closeNav()">Home</a>
          <a routerLink="/league" routerLinkActive="active" (click)="closeNav()">League</a>
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
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(255, 44, 92, 0.2), 0 4px 20px rgba(44, 156, 255, 0.2);
      border-bottom: 1px solid rgba(255, 44, 92, 0.3);
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
    }

    .logo-text {
      font-size: 2.5rem;
      font-weight: 900;
      margin: 0;
      background: linear-gradient(135deg, #ff2c5c 0%, #2c9cff 50%, #00d4ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(255, 44, 92, 0.5);
      letter-spacing: 2px;
      font-family: 'Inter', sans-serif;
    }

    .tagline {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      margin-top: -5px;
      font-weight: 300;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .nav {
      display: flex;
      gap: 2rem;
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

    .nav a:hover,
    .nav a.active {
      background: linear-gradient(135deg, rgba(255, 44, 92, 0.2), rgba(44, 156, 255, 0.2));
      border-color: rgba(255, 44, 92, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 44, 92, 0.3);
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

      .tagline {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0.75rem;
      }
      
      .logo-text {
        font-size: 1.5rem;
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
