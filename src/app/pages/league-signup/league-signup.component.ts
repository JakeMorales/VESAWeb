import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NhostService, Player } from '../../services/nhost.service';
import { DiscordService } from '../../services/discord.service';

interface RosterPlayer {
  discordUsername: string;
  rank: string;
  vesaDivision: string;
  overstatLink: string;
  platform: string;
}

interface PlayerMeta {
  overstatLocked: boolean;
  overstatLoading: boolean;
}

interface SubPlayer {
  discordUsername: string;
  rank: string;
  platform: string;
}

interface SignupForm {
  teamName: string;
  compExperience: string;
  players: RosterPlayer[];
  subs: SubPlayer[];
}

interface DiscordUser {
  id: string;
  displayName: string;
  avatarUrl: string;
}

const RANKS = [
  { value: 'predator-masters', label: 'Predator / Masters' },
  { value: 'diamond',          label: 'Diamond' },
  { value: 'platinum',         label: 'Platinum' },
  { value: 'gold',             label: 'Gold' },
  { value: 'silver',           label: 'Silver' },
  { value: 'bronze',           label: 'Bronze' },
];

const VESA_DIVISIONS = [
  { value: 'none',       label: 'None' },
  { value: 'pinnacle',   label: 'Pinnacle (I)' },
  { value: 'vanguard',   label: 'Vanguard (II)' },
  { value: 'ascendant',  label: 'Ascendant (III)' },
  { value: 'emergent',   label: 'Emergent (IV)' },
  { value: 'challenger', label: 'Challenger (V)' },
  { value: 'prospect',   label: 'Prospect (VI)' },
  { value: 'aspirant',   label: 'Aspirant (VII)' },
  { value: 'contenders', label: 'Contenders (VIII)' },
];

const PLATFORMS = [
  { value: 'pc',          label: 'PC' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox',        label: 'Xbox' },
];

function emptyRosterPlayer(): RosterPlayer {
  return { discordUsername: '', rank: '', vesaDivision: '', overstatLink: '', platform: '' };
}

@Component({
  selector: 'app-league-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-header">
        <a routerLink="/league" class="back-link">← League Overview</a>
        <span class="badge">Season 14</span>
        <h1>League Signup & Waitlist</h1>
        <p class="sub">
          Register your team for VESA League play. Provide accurate rank and experience info —
          it directly affects division placement for all 60 players in a lobby.
          If spots are full or a season is underway, your team is added to the waitlist automatically.
        </p>
      </div>

      <div class="signup-body">

        <!-- Auth gate -->
        <div *ngIf="!currentUser && !submitted" class="auth-gate">
          <div class="auth-icon">💬</div>
          <h2>Sign in with Discord</h2>
          <p>We use your Discord account to identify your signup. No extra contact info needed.</p>
          <button class="btn-discord-signin" (click)="signInWithDiscord()" [disabled]="signingIn">
            <svg class="discord-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            {{ signingIn ? 'Redirecting to Discord…' : 'Sign in with Discord' }}
          </button>
          <button class="btn-dev-bypass" (click)="devBypass()">Dev bypass</button>
        </div>

        <!-- Form -->
        <div *ngIf="currentUser && !submitted" class="form-card">

          <!-- Signed-in user banner -->
          <div class="user-banner">
            <img *ngIf="currentUser.avatarUrl" [src]="currentUser.avatarUrl" [alt]="currentUser.displayName" class="user-avatar" />
            <div *ngIf="!currentUser.avatarUrl" class="user-avatar-placeholder">{{ currentUser.displayName[0] }}</div>
            <span class="user-name">{{ currentUser.displayName }}</span>
            <button class="sign-out-btn" (click)="signOut()">Sign out</button>
          </div>

          <form (ngSubmit)="onSubmit()" #signupForm="ngForm">

            <!-- Team Info -->
            <div class="form-section">
              <h3>Team</h3>
              <div class="field-group">
                <label for="teamName">Team Name <span class="required">*</span></label>
                <input id="teamName" type="text" [(ngModel)]="form.teamName" name="teamName"
                  required placeholder="e.g. Night Owls" class="input" />
              </div>
              <div class="field-group">
                <label for="compExperience">Competitive Experience <span class="required">*</span></label>
                <input id="compExperience" type="text" [(ngModel)]="form.compExperience" name="compExperience"
                  required placeholder="e.g. ~2 days/wk for 2 yrs, EEC" class="input" />
                <span class="field-hint">Scrim frequency, how long you've been playing competitively, main servers (EEC, NAE, NAW, etc.)</span>
              </div>
            </div>

            <!-- Player 1 — Captain (identity from Discord auth) -->
            <div class="form-section">
              <h3>Player 1 <span class="captain-tag">Captain</span></h3>
              <div class="captain-id">
                <img *ngIf="currentUser.avatarUrl" [src]="currentUser.avatarUrl" [alt]="currentUser.displayName" class="mini-avatar" />
                <div *ngIf="!currentUser.avatarUrl" class="mini-avatar-placeholder">{{ currentUser.displayName[0] }}</div>
                <span>{{ currentUser.displayName }}</span>
              </div>
              <ng-container *ngTemplateOutlet="playerFields; context: { player: form.players[0], idx: 0, meta: playerMeta[0] }"></ng-container>
            </div>

            <!-- Player 2 -->
            <div class="form-section">
              <h3>Player 2</h3>
              <div class="field-group">
                <label [for]="'disc-1'">VESA Display Name <span class="required">*</span></label>
                <div *ngIf="playerSelections[1]" class="player-chip">
                  <img *ngIf="playerAvatarUrls[1]" [src]="playerAvatarUrls[1]" class="chip-avatar" alt="" />
                  <div *ngIf="!playerAvatarUrls[1]" class="chip-avatar-placeholder">{{ (playerSelections[1].display_name || '?')[0] }}</div>
                  <span class="chip-name">{{ playerSelections[1].display_name }}</span>
                  <button type="button" class="chip-clear" (click)="clearPlayerSelection(1)">Change</button>
                </div>
                <div *ngIf="!playerSelections[1]" class="autocomplete-wrap">
                  <input [id]="'disc-1'" type="text" [ngModel]="form.players[1].discordUsername" name="disc1"
                    required placeholder="Start typing a name…" class="input" autocomplete="off"
                    (input)="onDiscordInput(1, $any($event.target).value)"
                    (blur)="onDiscordBlur(1)"
                    (focus)="playerSearchVisible[1] = playerSearchResults[1].length > 0" />
                  <div *ngIf="playerSearchVisible[1]" class="search-dropdown">
                    <div *ngFor="let p of playerSearchResults[1]" class="search-result"
                      (mousedown)="selectPlayer(1, p)">
                      <span class="result-name">{{ p.display_name }}</span>
                      <span *ngIf="p.overstat_id" class="result-overstat-dot" title="Has Overstat"></span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-container *ngTemplateOutlet="playerFields; context: { player: form.players[1], idx: 1, meta: playerMeta[1] }"></ng-container>
            </div>

            <!-- Player 3 -->
            <div class="form-section">
              <h3>Player 3</h3>
              <div class="field-group">
                <label [for]="'disc-2'">VESA Display Name <span class="required">*</span></label>
                <div *ngIf="playerSelections[2]" class="player-chip">
                  <img *ngIf="playerAvatarUrls[2]" [src]="playerAvatarUrls[2]" class="chip-avatar" alt="" />
                  <div *ngIf="!playerAvatarUrls[2]" class="chip-avatar-placeholder">{{ (playerSelections[2].display_name || '?')[0] }}</div>
                  <span class="chip-name">{{ playerSelections[2].display_name }}</span>
                  <button type="button" class="chip-clear" (click)="clearPlayerSelection(2)">Change</button>
                </div>
                <div *ngIf="!playerSelections[2]" class="autocomplete-wrap">
                  <input [id]="'disc-2'" type="text" [ngModel]="form.players[2].discordUsername" name="disc2"
                    required placeholder="Start typing a name…" class="input" autocomplete="off"
                    (input)="onDiscordInput(2, $any($event.target).value)"
                    (blur)="onDiscordBlur(2)"
                    (focus)="playerSearchVisible[2] = playerSearchResults[2].length > 0" />
                  <div *ngIf="playerSearchVisible[2]" class="search-dropdown">
                    <div *ngFor="let p of playerSearchResults[2]" class="search-result"
                      (mousedown)="selectPlayer(2, p)">
                      <span class="result-name">{{ p.display_name }}</span>
                      <span *ngIf="p.overstat_id" class="result-overstat-dot" title="Has Overstat"></span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-container *ngTemplateOutlet="playerFields; context: { player: form.players[2], idx: 2, meta: playerMeta[2] }"></ng-container>
            </div>

            <!-- Alternates / Subs -->
            <div class="form-section">
              <h3>Alternates / Subs <span class="section-note">— optional</span></h3>
              <div *ngFor="let sub of form.subs; let i = index" class="player-row sub-row">
                <span class="player-label">Sub {{ i + 1 }}</span>
                <div class="field-grid-3">
                  <div class="field-group">
                    <label [for]="'s-disc-' + i">Discord Username</label>
                    <input [id]="'s-disc-' + i" type="text" [(ngModel)]="sub.discordUsername" [name]="'sDisc' + i" placeholder="username" class="input" />
                  </div>
                  <div class="field-group">
                    <label [for]="'s-rank-' + i">Rank</label>
                    <select [id]="'s-rank-' + i" [(ngModel)]="sub.rank" [name]="'sRank' + i" class="input">
                      <option value="">Select…</option>
                      <option *ngFor="let r of ranks" [value]="r.value">{{ r.label }}</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label [for]="'s-plat-' + i">Platform</label>
                    <select [id]="'s-plat-' + i" [(ngModel)]="sub.platform" [name]="'sPlat' + i" class="input">
                      <option value="">Select…</option>
                      <option *ngFor="let p of platforms" [value]="p.value">{{ p.label }}</option>
                    </select>
                  </div>
                </div>
                <button type="button" class="remove-btn" (click)="removeSub(i)" aria-label="Remove sub">✕</button>
              </div>
              <button type="button" class="add-sub-btn" (click)="addSub()">+ Add Alternate</button>
            </div>

            <div class="form-footer">
              <p class="form-note">
                Inaccurate rank or experience info affects division placement for every team in
                your lobby. Admins will reach out via Discord once your signup is reviewed.
                Teams are waitlisted automatically if spots are full or the season is underway.
              </p>
              <button type="submit" class="btn-submit" [disabled]="signupForm.invalid">
                Submit Registration
              </button>
            </div>

          </form>
        </div>

        <!-- Success -->
        <div *ngIf="submitted" class="success-card">
          <div class="success-icon">✓</div>
          <h2>Registration Received</h2>
          <p>
            We've received the signup for <strong>{{ form.teamName }}</strong>
            from <strong>{{ currentUser?.displayName }}</strong>.
            League admins will reach out via Discord once your team has been reviewed and placed.
          </p>
          <p>Make sure your full roster is in the League Discord for announcements.</p>
          <div class="success-actions">
            <a href="https://discord.gg/RyvVJqnXbe" target="_blank" rel="noopener noreferrer" class="btn-discord">
              Join League Discord
            </a>
            <a routerLink="/league" class="btn-outline">Back to League Overview</a>
          </div>
        </div>

      </div>
    </div>

    <!-- Reusable per-player fields template -->
    <ng-template #playerFields let-player="player" let-idx="idx" let-meta="meta">
      <div class="field-grid-2">
        <div class="field-group">
          <label [for]="'rank-' + idx">Rank <span class="required">*</span></label>
          <select [id]="'rank-' + idx" [(ngModel)]="player.rank" [name]="'rank' + idx" required class="input">
            <option value="">Select…</option>
            <option *ngFor="let r of ranks" [value]="r.value">{{ r.label }}</option>
          </select>
          <span class="field-hint">Highest rank achieved in the most recent ranked split with a decent number of games played.</span>
        </div>
        <div class="field-group">
          <label [for]="'div-' + idx">Previous VESA Division <span class="required">*</span></label>
          <select [id]="'div-' + idx" [(ngModel)]="player.vesaDivision" [name]="'div' + idx" required class="input">
            <option value="">Select…</option>
            <option *ngFor="let d of vesaDivisions" [value]="d.value">{{ d.label }}</option>
          </select>
          <span class="field-hint">Select "None" if this player hasn't been on a VESA roster (subbing doesn't count).</span>
        </div>
      </div>
      <div class="field-grid-2">
        <div class="field-group">
          <label [for]="'overstat-' + idx">
            Overstat Link <span *ngIf="!meta?.overstatLocked" class="required">*</span>
          </label>
          <ng-container *ngIf="!meta?.overstatLocked">
            <div class="overstat-wrap">
              <input
                [id]="'overstat-' + idx"
                type="text"
                [(ngModel)]="player.overstatLink"
                [name]="'overstat' + idx"
                required
                placeholder="https://overstat.gg/… or None"
                class="input"
                [class.input-loading]="meta?.overstatLoading"
                [readonly]="meta?.overstatLoading"
              />
              <span *ngIf="meta?.overstatLoading" class="overstat-spinner" aria-label="Looking up…"></span>
            </div>
          </ng-container>
          <div *ngIf="meta?.overstatLocked" class="linked-pill">
            <span class="linked-badge">Linked</span>
          </div>
        </div>
        <div class="field-group">
          <label [for]="'platform-' + idx">Platform <span class="required">*</span></label>
          <select [id]="'platform-' + idx" [(ngModel)]="player.platform" [name]="'platform' + idx" required class="input">
            <option value="">Select…</option>
            <option *ngFor="let p of platforms" [value]="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      width: 100vw;
      background: linear-gradient(135deg, var(--color-primary-dark, #0a0a1a) 0%, #000 100%);
      color: #e3e6f3;
      padding-bottom: 5rem;
    }

    .signup-header {
      text-align: center;
      padding: 4rem 2rem 2rem;
      background: radial-gradient(ellipse at 50% 0%, rgba(94,108,255,0.15) 0%, transparent 65%);
    }

    .back-link {
      display: inline-block;
      color: rgba(227,230,243,0.55);
      text-decoration: none;
      font-size: 0.88rem;
      margin-bottom: 1.2rem;
      transition: color 0.18s;
    }
    .back-link:hover { color: #e3e6f3; }

    .badge {
      display: inline-block;
      background: linear-gradient(90deg, #5e6cff, #b45cff);
      color: #fff;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.28rem 0.9rem;
      border-radius: 2rem;
      margin-bottom: 1rem;
      margin-left: 0.5rem;
    }

    .signup-header h1 {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      margin: 0 0 0.75rem;
      background: linear-gradient(90deg, #fff 60%, #b45cff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sub {
      color: rgba(227,230,243,0.65);
      font-size: 1rem;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .signup-body {
      max-width: 760px;
      margin: 2.5rem auto 0;
      padding: 0 1.5rem;
    }

    /* Auth gate */
    .auth-gate {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(88,101,242,0.3);
      border-radius: 1.2rem;
      padding: 3.5rem 2rem;
      text-align: center;
    }

    .auth-icon { font-size: 2.8rem; margin-bottom: 1rem; }
    .auth-gate h2 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.6rem; }
    .auth-gate p {
      color: rgba(227,230,243,0.62);
      margin: 0 0 2rem;
      max-width: 380px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .btn-discord-signin {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      background: #5865f2;
      color: #fff;
      border: none;
      border-radius: 2rem;
      padding: 0.85rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.18s, transform 0.18s, opacity 0.18s;
      font-family: inherit;
    }
    .btn-discord-signin:hover:not(:disabled) { background: #4752c4; transform: translateY(-2px); }
    .btn-discord-signin:disabled { opacity: 0.6; cursor: not-allowed; }

    .discord-logo { width: 1.2rem; height: 1.2rem; flex-shrink: 0; }

    .btn-dev-bypass {
      display: block;
      margin: 0.75rem auto 0;
      background: none;
      border: none;
      color: rgba(227,230,243,0.25);
      font-size: 0.78rem;
      cursor: pointer;
      font-family: inherit;
      transition: color 0.15s;
    }
    .btn-dev-bypass:hover { color: rgba(227,230,243,0.55); }

    /* User banner */
    .user-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(88,101,242,0.12);
      border: 1px solid rgba(88,101,242,0.25);
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .user-avatar { width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; }

    .user-avatar-placeholder {
      width: 2rem; height: 2rem; border-radius: 50%;
      background: linear-gradient(135deg, #5e6cff, #b45cff);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .user-name { font-weight: 600; font-size: 0.95rem; flex: 1; }

    .sign-out-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(227,230,243,0.55);
      border-radius: 1rem;
      padding: 0.3rem 0.8rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      font-family: inherit;
    }
    .sign-out-btn:hover { color: #e3e6f3; border-color: rgba(255,255,255,0.3); }

    /* Form card */
    .form-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1.2rem;
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .form-section:last-of-type { border-bottom: none; }

    .form-section h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(227,230,243,0.5);
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .captain-tag {
      background: linear-gradient(90deg, #5e6cff, #b45cff);
      color: #fff;
      font-size: 0.68rem;
      padding: 0.15rem 0.55rem;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .section-note {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      color: rgba(227,230,243,0.35);
    }

    /* Captain identity row */
    .captain-id {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1rem;
      padding: 0.6rem 0.9rem;
      background: rgba(94,108,255,0.08);
      border: 1px solid rgba(94,108,255,0.2);
      border-radius: 0.6rem;
      font-size: 0.92rem;
      font-weight: 600;
    }

    .mini-avatar { width: 1.5rem; height: 1.5rem; border-radius: 50%; object-fit: cover; }
    .mini-avatar-placeholder {
      width: 1.5rem; height: 1.5rem; border-radius: 50%;
      background: linear-gradient(135deg, #5e6cff, #b45cff);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    /* Field layouts */
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .field-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    label {
      font-size: 0.85rem;
      font-weight: 500;
      color: rgba(227,230,243,0.75);
    }

    .required { color: #ff2c5c; }

    .field-hint {
      font-size: 0.76rem;
      color: rgba(227,230,243,0.38);
      line-height: 1.5;
    }

    .input {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.6rem;
      padding: 0.65rem 0.9rem;
      color: #e3e6f3;
      font-size: 0.93rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.18s, background 0.18s;
      font-family: inherit;
    }
    .input:focus { outline: none; border-color: #5e6cff; background: rgba(94,108,255,0.08); }
    .input option { background: #1a1a2e; color: #e3e6f3; }

    /* Autocomplete */
    .autocomplete-wrap { position: relative; }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0; right: 0;
      background: #1a1a2e;
      border: 1px solid rgba(94,108,255,0.35);
      border-radius: 0.6rem;
      overflow: hidden;
      z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    .search-result {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      transition: background 0.12s;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .search-result:last-child { border-bottom: none; }
    .search-result:hover { background: rgba(94,108,255,0.15); }

    .result-name { font-size: 0.92rem; color: #e3e6f3; flex: 1; }

    .result-overstat-dot {
      width: 0.55rem; height: 0.55rem;
      border-radius: 50%;
      background: #10b981;
      flex-shrink: 0;
      title: "Has Overstat";
    }

    .player-chip {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(94,108,255,0.12);
      border: 1px solid rgba(94,108,255,0.35);
      border-radius: 2rem;
      padding: 0.35rem 0.5rem 0.35rem 0.35rem;
      width: fit-content;
      max-width: 100%;
    }

    .chip-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .chip-avatar-placeholder {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #5e6cff, #b45cff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .chip-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: #e3e6f3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chip-clear {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 1rem;
      color: rgba(227,230,243,0.7);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.65rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .chip-clear:hover {
      background: rgba(255,80,80,0.18);
      border-color: rgba(255,80,80,0.4);
      color: #ff8080;
    }

    .input-loading {
      border-color: rgba(94,108,255,0.3) !important;
      color: rgba(227,230,243,0.4);
      cursor: wait;
    }

    .overstat-wrap {
      position: relative;
    }

    .overstat-spinner {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.9rem;
      height: 0.9rem;
      border: 2px solid rgba(94,108,255,0.25);
      border-top-color: #5e6cff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      pointer-events: none;
    }

    @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

    .linked-pill {
      display: flex;
      align-items: center;
      height: 2.3rem;
      padding: 0 0.9rem;
      background: rgba(16,185,129,0.06);
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 0.6rem;
    }

    .linked-badge {
      display: inline-block;
      background: rgba(16,185,129,0.15);
      border: 1px solid rgba(16,185,129,0.4);
      color: #10b981;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.1rem 0.45rem;
      border-radius: 1rem;
    }

    /* Sub rows */
    .player-row {
      position: relative;
      margin-bottom: 1.2rem;
      padding: 1rem 1rem 0.25rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(94,108,255,0.15);
      border-radius: 0.75rem;
    }

    .player-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(227,230,243,0.38);
      margin-bottom: 0.6rem;
    }

    .remove-btn {
      position: absolute;
      top: 0.75rem; right: 0.75rem;
      background: none; border: none;
      color: rgba(227,230,243,0.3);
      font-size: 0.85rem; cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 0.3rem;
      transition: color 0.15s, background 0.15s;
      line-height: 1;
    }
    .remove-btn:hover { color: #ff2c5c; background: rgba(255,44,92,0.1); }

    .add-sub-btn {
      background: transparent;
      border: 1px dashed rgba(94,108,255,0.4);
      color: rgba(94,108,255,0.85);
      border-radius: 0.6rem;
      padding: 0.6rem 1.2rem;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: border-color 0.18s, color 0.18s, background 0.18s;
      font-family: inherit;
    }
    .add-sub-btn:hover { border-color: #5e6cff; color: #fff; background: rgba(94,108,255,0.1); }

    /* Footer */
    .form-footer { display: flex; flex-direction: column; gap: 1rem; }

    .form-note {
      font-size: 0.81rem;
      color: rgba(227,230,243,0.42);
      line-height: 1.65;
      margin: 0;
    }

    .btn-submit {
      background: linear-gradient(90deg, #5e6cff, #b45cff);
      color: #fff; border: none; border-radius: 2rem;
      padding: 0.8rem 2.2rem; font-size: 0.98rem; font-weight: 700;
      cursor: pointer; letter-spacing: 0.04em; transition: all 0.2s;
      align-self: flex-end;
      box-shadow: 0 4px 18px rgba(94,108,255,0.35);
      font-family: inherit;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(94,108,255,0.5); }
    .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Success */
    .success-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(94,108,255,0.35);
      border-radius: 1.2rem;
      padding: 3rem 2rem;
      text-align: center;
    }

    .success-icon {
      width: 3.5rem; height: 3.5rem; border-radius: 50%;
      background: linear-gradient(135deg, #5e6cff, #b45cff);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: #fff; margin: 0 auto 1.5rem;
    }

    .success-card h2 { font-size: 1.6rem; font-weight: 800; margin: 0 0 1rem; }
    .success-card p { color: rgba(227,230,243,0.72); line-height: 1.7; margin: 0 0 0.75rem; }

    .success-actions {
      display: flex; gap: 1rem; justify-content: center;
      flex-wrap: wrap; margin-top: 1.5rem;
    }

    .btn-discord {
      display: inline-block; background: #5865f2; color: #fff;
      padding: 0.7rem 1.6rem; border-radius: 2rem; text-decoration: none;
      font-weight: 600; font-size: 0.92rem; transition: background 0.18s, transform 0.18s;
    }
    .btn-discord:hover { background: #4752c4; transform: translateY(-2px); }

    .btn-outline {
      display: inline-block; background: transparent; color: #e3e6f3;
      border: 1px solid rgba(255,255,255,0.2); padding: 0.7rem 1.6rem;
      border-radius: 2rem; text-decoration: none; font-weight: 600; font-size: 0.92rem;
      transition: background 0.18s, transform 0.18s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }

    @media (max-width: 600px) {
      .field-grid-2, .field-grid-3 { grid-template-columns: 1fr; }
      .form-card { padding: 1.5rem 1rem; }
      .btn-submit { align-self: stretch; }
    }
  `]
})
export class LeagueSignupComponent implements OnInit, OnDestroy {
  submitted = false;
  signingIn = false;
  currentUser: DiscordUser | null = null;

  readonly ranks = RANKS;
  readonly vesaDivisions = VESA_DIVISIONS;
  readonly platforms = PLATFORMS;

  form: SignupForm = {
    teamName: '',
    compExperience: '',
    players: [emptyRosterPlayer(), emptyRosterPlayer(), emptyRosterPlayer()],
    subs: []
  };

  playerMeta: PlayerMeta[] = [
    { overstatLocked: false, overstatLoading: false },
    { overstatLocked: false, overstatLoading: false },
    { overstatLocked: false, overstatLoading: false },
  ];

  playerSearchResults: Player[][] = [[], [], []];
  playerSearchVisible: boolean[] = [false, false, false];
  playerSelections: (Player | null)[] = [null, null, null];
  playerAvatarUrls: (string | null)[] = [null, null, null];

  private searchTimers: (ReturnType<typeof setTimeout> | null)[] = [null, null, null];
  private hideTimers:   (ReturnType<typeof setTimeout> | null)[] = [null, null, null];

  // eslint-disable-next-line @typescript-eslint/ban-types
  private unsubscribeAuth?: Function;

  constructor(private nhostService: NhostService, private discordService: DiscordService) {}

  ngOnInit() {
    const auth = this.nhostService.auth;
    const user = auth.getUser();
    if (user) {
      this.currentUser = {
        id: user.id,
        displayName: user.displayName ?? user.email ?? 'Discord User',
        avatarUrl: user.avatarUrl ?? ''
      };
      this.lookupOverstat(0, this.currentUser.displayName);
    }
    this.unsubscribeAuth = auth.onAuthStateChanged((_event: string, session: any) => {
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          displayName: session.user.displayName ?? session.user.email ?? 'Discord User',
          avatarUrl: session.user.avatarUrl ?? ''
        };
        this.lookupOverstat(0, this.currentUser.displayName);
      } else {
        this.currentUser = null;
        this.playerMeta[0] = { overstatLocked: false, overstatLoading: false };
        this.form.players[0].overstatLink = '';
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribeAuth?.();
  }

  lookupOverstat(playerIdx: number, displayName: string) {
    if (!displayName.trim()) return;
    this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: true };
    this.nhostService.getPlayerByDisplayName(displayName.trim()).subscribe({
      next: player => {
        if (player?.overstat_id) {
          this.form.players[playerIdx].overstatLink = player.overstat_id;
          this.playerMeta[playerIdx] = { overstatLocked: true, overstatLoading: false };
        } else {
          this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
        }
        if (player && playerIdx > 0) {
          this.form.players[playerIdx].discordUsername = player.display_name ?? displayName;
          this.playerSelections[playerIdx] = player;
          if (player.discord_id) this.fetchAvatar(playerIdx, player.discord_id);
        }
      },
      error: () => {
        this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
      }
    });
  }

  onDiscordBlur(playerIdx: number) {
    this.scheduleHideSearch(playerIdx);
    const name = this.form.players[playerIdx].discordUsername;
    this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
    this.form.players[playerIdx].overstatLink = '';
    this.lookupOverstat(playerIdx, name);
  }

  fetchAvatar(playerIdx: number, discordId: string) {
    this.discordService.getUserById(discordId).subscribe(profile => {
      this.playerAvatarUrls[playerIdx] = profile?.avatarUrl ?? null;
    });
  }

  clearPlayerSelection(playerIdx: number) {
    this.playerSelections[playerIdx] = null;
    this.playerAvatarUrls[playerIdx] = null;
    this.form.players[playerIdx].discordUsername = '';
    this.form.players[playerIdx].overstatLink = '';
    this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
    this.playerSearchResults[playerIdx] = [];
    this.playerSearchVisible[playerIdx] = false;
  }

  onDiscordInput(playerIdx: number, value: string) {
    if (this.searchTimers[playerIdx] !== null) clearTimeout(this.searchTimers[playerIdx]!);
    this.form.players[playerIdx].discordUsername = value;
    if (!value.trim()) {
      this.playerSearchResults[playerIdx] = [];
      this.playerSearchVisible[playerIdx] = false;
      return;
    }
    this.searchTimers[playerIdx] = setTimeout(() => {
      this.nhostService.searchPlayersByName(value.trim()).subscribe(players => {
        this.playerSearchResults[playerIdx] = players;
        this.playerSearchVisible[playerIdx] = true;
      });
    }, 250);
  }

  scheduleHideSearch(playerIdx: number) {
    this.hideTimers[playerIdx] = setTimeout(() => {
      this.playerSearchVisible[playerIdx] = false;
    }, 150);
  }

  selectPlayer(playerIdx: number, player: Player) {
    if (this.hideTimers[playerIdx] !== null) clearTimeout(this.hideTimers[playerIdx]!);
    this.form.players[playerIdx].discordUsername = player.display_name ?? '';
    this.playerSearchVisible[playerIdx] = false;
    this.playerSearchResults[playerIdx] = [];
    this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
    this.form.players[playerIdx].overstatLink = '';
    this.playerSelections[playerIdx] = player;
    if (player.discord_id) this.fetchAvatar(playerIdx, player.discord_id);
    this.lookupOverstat(playerIdx, player.display_name ?? '');
  }

  devBypass() {
    this.currentUser = { id: 'dev', displayName: 'Dev User', avatarUrl: '' };
    this.lookupOverstat(0, 'Dev User');
  }

  signInWithDiscord() {
    this.signingIn = true;
    this.nhostService.auth.signIn({
      provider: 'discord',
      options: { redirectTo: window.location.href }
    });
  }

  signOut() {
    this.nhostService.auth.signOut();
  }

  addSub() {
    this.form.subs.push({ discordUsername: '', rank: '', platform: '' });
  }

  removeSub(index: number) {
    this.form.subs.splice(index, 1);
  }

  onSubmit() {
    this.submitted = true;
  }
}
