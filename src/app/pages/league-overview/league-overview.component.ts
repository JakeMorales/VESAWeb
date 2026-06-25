import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-league-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overview-container">

      <section class="hero">
        <div class="hero-content">
          <span class="badge">VESA League</span>
          <h1>Competitive League Play</h1>
          <p class="hero-sub">
            VESA League is the premier structured competition for Apex Legends teams — featuring
            scheduled matches, tracked standings, and a tiered division system from Contenders
            all the way up to Pinnacle.
          </p>
          <div class="hero-actions">
            <a routerLink="/league/signup" class="btn btn-primary">Sign Up / Join Waitlist</a>
            <a routerLink="/league/current-season" class="btn btn-secondary">Current Season (S14)</a>
          </div>
        </div>
      </section>

      <section class="about">
        <div class="about-grid">
          <div class="about-card">
            <div class="card-icon">🏆</div>
            <h3>What is VESA League?</h3>
            <p>
              VESA League is a structured, season-based competitive format where teams are placed
              into divisions and compete in scheduled weekly matches. Each season culminates in a
              championship finals. Teams build a recorded competitive history and can move between
              divisions at the discretion of league admins between seasons.
            </p>
          </div>
          <div class="about-card">
            <div class="card-icon">⚡</div>
            <h3>League vs Scrims</h3>
            <p>
              Scrims are casual, self-organized practice matches with no official standings or
              recorded results. League play is the opposite — matches are scheduled, officiated,
              and recorded. Results count toward standings that define your team's standing in
              the VESA competitive ecosystem. If you want stakes and a record, League is it.
            </p>
          </div>
          <div class="about-card">
            <div class="card-icon">📋</div>
            <h3>How to Join</h3>
            <p>
              Teams sign up during the registration window before each season. After review,
              teams are placed into a division by league admins based on roster skill level.
              If spots are full or a season is already underway, your team is added to the
              waitlist. Check the League Discord for registration windows and announcements.
            </p>
          </div>
        </div>
      </section>

      <section class="divisions-preview">
        <h2>Divisions</h2>
        <p class="section-sub">
          The number of active divisions varies each season based on signups.
          Division placement is determined by league admins.
        </p>
        <div class="divisions-list">
          <a routerLink="/league/pinnacle"   class="division-pill" style="border-color:#ff2c5c;color:#ff2c5c">I · Pinnacle</a>
          <a routerLink="/league/vanguard"   class="division-pill" style="border-color:#2c9cff;color:#2c9cff">II · Vanguard</a>
          <a routerLink="/league/ascendant"  class="division-pill" style="border-color:#00d4ff;color:#00d4ff">III · Ascendant</a>
          <a routerLink="/league/emergent"   class="division-pill" style="border-color:#7c3aed;color:#7c3aed">IV · Emergent</a>
          <a routerLink="/league/challenger" class="division-pill" style="border-color:#f59e0b;color:#f59e0b">V · Challenger</a>
          <a routerLink="/league/prospect"   class="division-pill" style="border-color:#ec4899;color:#ec4899">VI · Prospect</a>
          <a routerLink="/league/aspirant"   class="division-pill" style="border-color:#14b8a6;color:#14b8a6">VII · Aspirant</a>
          <a routerLink="/league/contenders" class="division-pill" style="border-color:#10b981;color:#10b981">VIII · Contenders</a>
        </div>
      </section>

      <section class="cta-row">
        <div class="cta-card discord-card">
          <div class="cta-icon">💬</div>
          <div class="cta-body">
            <h3>League Discord</h3>
            <p>Announcements, scheduling, rule updates, and the full VESA League community.</p>
          </div>
          <a href="https://discord.gg/RyvVJqnXbe" target="_blank" rel="noopener noreferrer" class="btn btn-discord">
            Join Discord
          </a>
        </div>
        <div class="cta-card season-card">
          <div class="cta-icon">📅</div>
          <div class="cta-body">
            <h3>Season 14 — In Progress</h3>
            <p>View current standings, match results, and division brackets for Season 14.</p>
          </div>
          <a routerLink="/league/current-season" class="btn btn-secondary">
            View Season 14
          </a>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .overview-container {
      min-height: 100vh;
      width: 100vw;
      background: linear-gradient(135deg, var(--color-primary-dark, #0a0a1a) 0%, #000 100%);
      color: #e3e6f3;
    }

    .hero {
      padding: 5rem 2rem 4rem;
      text-align: center;
      background: radial-gradient(ellipse at 50% 0%, rgba(94,108,255,0.18) 0%, transparent 70%);
    }

    .badge {
      display: inline-block;
      background: linear-gradient(90deg, #5e6cff, #b45cff);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.3rem 1rem;
      border-radius: 2rem;
      margin-bottom: 1.2rem;
    }

    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      margin: 0 0 1rem;
      background: linear-gradient(90deg, #fff 60%, #b45cff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      max-width: 620px;
      margin: 0 auto 2rem;
      color: rgba(227,230,243,0.75);
      font-size: 1.08rem;
      line-height: 1.7;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.8rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
      letter-spacing: 0.03em;
    }

    .btn-primary {
      background: linear-gradient(90deg, #5e6cff, #b45cff);
      color: #fff;
      box-shadow: 0 4px 18px rgba(94,108,255,0.35);
    }

    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(94,108,255,0.5); }

    .btn-secondary {
      background: rgba(255,255,255,0.08);
      color: #e3e6f3;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .btn-secondary:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }

    .btn-discord {
      background: #5865f2;
      color: #fff;
      white-space: nowrap;
    }

    .btn-discord:hover { background: #4752c4; transform: translateY(-2px); }

    .about {
      padding: 3rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .about-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .about-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      transition: border-color 0.2s, background 0.2s;
    }

    .about-card:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(94,108,255,0.4);
    }

    .card-icon { font-size: 2rem; margin-bottom: 0.75rem; }

    .about-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.75rem;
    }

    .about-card p {
      color: rgba(227,230,243,0.72);
      font-size: 0.93rem;
      line-height: 1.7;
      margin: 0;
    }

    .divisions-preview {
      padding: 3rem 2rem;
      text-align: center;
    }

    .divisions-preview h2 {
      font-size: 1.6rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }

    .section-sub {
      color: rgba(227,230,243,0.65);
      font-size: 0.95rem;
      margin: 0 0 1.8rem;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }

    .divisions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .division-pill {
      display: inline-block;
      padding: 0.5rem 1.4rem;
      border: 1.5px solid;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: background 0.18s, transform 0.18s;
      background: transparent;
    }

    .division-pill:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }

    .cta-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 2rem 5rem;
    }

    .cta-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      transition: border-color 0.2s;
    }

    .discord-card { border-color: rgba(88,101,242,0.35); }
    .discord-card:hover { border-color: rgba(88,101,242,0.65); }
    .season-card { border-color: rgba(94,108,255,0.25); }
    .season-card:hover { border-color: rgba(94,108,255,0.55); }

    .cta-icon { font-size: 2.2rem; }

    .cta-body h3 { font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.4rem; }
    .cta-body p { color: rgba(227,230,243,0.65); font-size: 0.88rem; line-height: 1.6; margin: 0; }

    @media (max-width: 600px) {
      .hero { padding: 3.5rem 1.2rem 2.5rem; }
      .about, .cta-row { padding-left: 1.2rem; padding-right: 1.2rem; }
    }
  `]
})
export class LeagueOverviewComponent {}
