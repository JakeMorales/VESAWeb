import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent, SectionHeaderComponent } from '../../components/ui';

@Component({
  selector: 'app-league-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, SectionHeaderComponent],
  template: `
    <div class="overview">

      <section class="hero">
        <div class="wrap">
          <p class="eyebrow"><span class="tick">▸</span> VESA // COMPETITIVE LEAGUE</p>
          <h1>Competitive league play<span class="dot">.</span></h1>
          <p class="lede">
            VESA League is the premier structured competition for Apex Legends teams — featuring
            scheduled matches, tracked standings, and a tiered division system from Contenders
            all the way up to Pinnacle.
          </p>
          <div class="actions">
            <a routerLink="/league/signup" class="btn primary">Sign Up / Join Waitlist</a>
            <a routerLink="/league/current-season" class="btn ghost">Season 14 Results</a>
          </div>
        </div>
      </section>

      <section class="wrap block">
        <app-section-header index="01" title="How it works" />
        <div class="modules">
          <div class="module">
            <app-icon name="trophy" [size]="30" />
            <h3>What is VESA League?</h3>
            <p>
              VESA League is a structured, season-based competitive format where teams are placed
              into divisions and compete in scheduled weekly matches. Each season culminates in a
              championship finals. Teams build a recorded competitive history and can move between
              divisions at the discretion of league admins between seasons.
            </p>
          </div>
          <div class="module">
            <app-icon name="bolt" [size]="30" />
            <h3>League vs Scrims</h3>
            <p>
              Scrims are casual, self-organized practice matches with no official standings or
              recorded results. League play is the opposite — matches are scheduled, officiated,
              and recorded. Results count toward standings that define your team's standing in
              the VESA competitive ecosystem. If you want stakes and a record, League is it.
            </p>
          </div>
          <div class="module">
            <app-icon name="users" [size]="30" />
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

      <section class="wrap block">
        <app-section-header index="02" title="Divisions" />
        <p class="section-sub">
          The number of active divisions varies each season based on signups.
          Division placement is determined by league admins.
        </p>
        <div class="divisions-list">
          <a routerLink="/league/pinnacle"   class="division-pill" style="--div-color:#ff2c5c">I · Pinnacle</a>
          <a routerLink="/league/vanguard"   class="division-pill" style="--div-color:#2c9cff">II · Vanguard</a>
          <a routerLink="/league/ascendant"  class="division-pill" style="--div-color:#00d4ff">III · Ascendant</a>
          <a routerLink="/league/emergent"   class="division-pill" style="--div-color:#7c3aed">IV · Emergent</a>
          <a routerLink="/league/challenger" class="division-pill" style="--div-color:#f59e0b">V · Challenger</a>
          <a routerLink="/league/prospect"   class="division-pill" style="--div-color:#ec4899">VI · Prospect</a>
          <a routerLink="/league/aspirant"   class="division-pill" style="--div-color:#14b8a6">VII · Aspirant</a>
          <a routerLink="/league/contenders" class="division-pill" style="--div-color:#10b981">VIII · Contenders</a>
        </div>
      </section>

      <section class="wrap block">
        <app-section-header index="03" title="Get involved" />
        <div class="cta-row">
          <div class="cta-card">
            <app-icon name="chat" [size]="30" />
            <div class="cta-body">
              <h3>League Discord</h3>
              <p>Announcements, scheduling, rule updates, and the full VESA League community.</p>
            </div>
            <a href="https://discord.gg/vesaleague" target="_blank" rel="noopener noreferrer" class="btn primary small">
              Join Discord
            </a>
          </div>
          <div class="cta-card">
            <app-icon name="calendar" [size]="30" />
            <div class="cta-body">
              <h3>Season 14 — Complete</h3>
              <p>View final standings, match results, and division brackets for Season 14.</p>
            </div>
            <a routerLink="/league/current-season" class="btn ghost small">
              View Season 14
            </a>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .overview {
      min-height: 100vh;
      width: 100%;
      background: var(--vesa-void);
      color: var(--vesa-text);
      padding-bottom: 24px;
    }

    .hero {
      padding: 72px 0 8px;
      text-align: center;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(40px, 6vw, 68px);
      line-height: 1;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin: 18px 0 20px;
      color: var(--vesa-text);
      text-wrap: balance;
    }
    .hero h1 .dot { color: var(--vesa-red); }
    .lede {
      max-width: 620px;
      margin: 0 auto 32px;
      color: var(--vesa-dim);
      font-size: 16px;
    }
    .actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .block { padding-top: 80px; }

    .modules {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--vesa-line);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      overflow: hidden;
    }
    .module {
      background: var(--vesa-panel);
      padding: 28px;
      transition: background 0.15s;
    }
    .module:hover { background: var(--vesa-raised); }
    .module app-icon {
      color: var(--vesa-blue);
      display: inline-flex;
      margin-bottom: 18px;
    }
    .module h3 {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 8px;
    }
    .module p {
      color: var(--vesa-dim);
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
    }

    .section-sub {
      color: var(--vesa-dim);
      font-size: 14px;
      margin: -12px 0 24px;
      max-width: 520px;
    }

    .divisions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .division-pill {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 9px 16px;
      border: 1px solid var(--div-color);
      border-radius: 4px;
      color: var(--div-color);
      background: transparent;
      transition: background 0.15s, box-shadow 0.15s;
    }
    .division-pill:hover,
    .division-pill:focus-visible {
      background: rgba(235, 235, 245, 0.06);
      box-shadow: inset 0 -2px 0 var(--div-color);
    }

    .cta-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .cta-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 24px 28px;
      transition: border-color 0.15s;
    }
    .cta-card:hover { border-color: var(--vesa-line-strong); }
    .cta-card app-icon {
      color: var(--vesa-blue);
      flex-shrink: 0;
    }
    .cta-body { flex: 1; }
    .cta-body h3 {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vesa-text);
      margin: 0 0 4px;
    }
    .cta-body p {
      color: var(--vesa-dim);
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
    .cta-card .btn { flex-shrink: 0; white-space: nowrap; }

    @media (max-width: 860px) {
      .modules { grid-template-columns: 1fr; }
      .cta-row { grid-template-columns: 1fr; }
      .cta-card { flex-direction: column; align-items: flex-start; }
      .block { padding-top: 56px; }
      .hero { padding-top: 48px; }
    }
  `]
})
export class LeagueOverviewComponent {}
