import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NhostService, Player } from '../../services/nhost.service';
import { DiscordService } from '../../services/discord.service';
import { LeagueScheduleComponent } from '../../components/league/league-schedule.component';
import { CURRENT_SEASON, SEASON_SCHEDULE } from '../../config/season';
import {
  RANKS,
  VESA_DIVISIONS,
  PLATFORMS,
  SignupPlayer,
  SignupPayload,
  LeagueSignupService,
  validateOverstatLink,
} from '../../services/league-signup.service';
import { environment } from '../../../environments/environment';

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

interface SignupForm {
  teamName: string;
  compExperience: string;
  daysUnableToPlay: string;
  additionalComments: string;
  players: RosterPlayer[];
}

const DISCORD_JOINED_KEY = 'vesa-league-discord-joined';

function emptyRosterPlayer(): RosterPlayer {
  return { discordUsername: '', rank: '', vesaDivision: '', overstatLink: '', platform: '' };
}

@Component({
  selector: 'app-league-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LeagueScheduleComponent],
  template: `
    <div class="signup-container">
      <div class="signup-header">
        <a routerLink="/league" class="back-link">← League Overview</a>
        <span class="badge">Season {{ season }}</span>
        <h1>League Signup & Waitlist</h1>
        <p class="sub">
          Register your team for VESA League play. Provide accurate rank and experience info —
          it directly affects division placement for all 60 players in a lobby.
          If spots are full or a season is underway, your team is added to the waitlist automatically.
        </p>
      </div>

      <div class="signup-body">

        <!-- Discord join gate -->
        <div *ngIf="!discordJoined && !submitted" class="discord-gate">
          <div class="auth-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <h2>Join the League Discord First</h2>
          <p>
            Admins coordinate placements, waitlist updates, and roster changes over Discord.
            Join the server before registering — your team can't be reached otherwise.
          </p>
          <a class="btn-discord-signin" [href]="discordInviteUrl" target="_blank" rel="noopener noreferrer">
            <svg class="discord-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join VESA League Discord
          </a>
          <button class="btn-continue" (click)="acknowledgeDiscordJoined()">I've joined — Continue to signup</button>
        </div>

        <!-- Form -->
        <div *ngIf="discordJoined && !submitted" class="form-card">

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
              <div class="field-group">
                <label for="daysUnableToPlay">Scheduling Conflicts</label>
                <input id="daysUnableToPlay" type="text" [(ngModel)]="form.daysUnableToPlay" name="daysUnableToPlay"
                  placeholder="e.g. Tuesdays, or leave blank" class="input" />
                <span class="field-hint">Days your team can't play due to scheduling conflicts for one or more players. Leave blank for an open schedule.</span>
              </div>
            </div>

            <!-- Players -->
            <div class="form-section" *ngFor="let idx of playerIndices">
              <h3>
                Player {{ idx + 1 }}
                <span *ngIf="idx === 0" class="captain-tag">Captain</span>
              </h3>

              <div class="field-group">
                <label [for]="'disc-' + idx">VESA Display Name <span class="required">*</span></label>
                <div *ngIf="playerSelections[idx]" class="player-chip">
                  <img *ngIf="playerAvatarUrls[idx]" [src]="playerAvatarUrls[idx]" class="chip-avatar" alt="" />
                  <div *ngIf="!playerAvatarUrls[idx]" class="chip-avatar-placeholder">{{ (playerSelections[idx]!.display_name || '?')[0] }}</div>
                  <span class="chip-name">{{ playerSelections[idx]!.display_name }}</span>
                  <button type="button" class="chip-clear" (click)="clearPlayerSelection(idx)">Change</button>
                </div>
                <div *ngIf="!playerSelections[idx]" class="autocomplete-wrap">
                  <input [id]="'disc-' + idx" type="text" [ngModel]="form.players[idx].discordUsername" [name]="'disc' + idx"
                    required placeholder="Start typing a name…" class="input" autocomplete="off"
                    (input)="onDiscordInput(idx, $any($event.target).value)"
                    (blur)="onDiscordBlur(idx)"
                    (focus)="playerSearchVisible[idx] = playerSearchResults[idx].length > 0" />
                  <div *ngIf="playerSearchVisible[idx]" class="search-dropdown">
                    <div *ngFor="let p of playerSearchResults[idx]" class="search-result"
                      (mousedown)="selectPlayer(idx, p)">
                      <span class="result-name">{{ p.display_name }}</span>
                      <span *ngIf="p.overstat_id" class="result-overstat-dot" title="Has Overstat"></span>
                    </div>
                  </div>
                  <span *ngIf="idx === 0" class="field-hint">Not in the database yet? Just type your name — admins will match it up.</span>
                </div>
              </div>

              <div class="field-grid-2">
                <div class="field-group">
                  <label [for]="'rank-' + idx">Rank <span class="required">*</span></label>
                  <select [id]="'rank-' + idx" [(ngModel)]="form.players[idx].rank" [name]="'rank' + idx" required class="input">
                    <option value="">Select…</option>
                    <option *ngFor="let r of ranks" [value]="r.value">{{ r.label }}</option>
                  </select>
                  <span class="field-hint">Highest rank achieved in the most recent ranked split with a decent number of games played.</span>
                </div>
                <div class="field-group">
                  <label [for]="'div-' + idx">Previous VESA Division <span class="required">*</span></label>
                  <select [id]="'div-' + idx" [(ngModel)]="form.players[idx].vesaDivision" [name]="'div' + idx" required class="input">
                    <option value="">Select…</option>
                    <option *ngFor="let d of vesaDivisions" [value]="d.value">{{ d.label }}</option>
                  </select>
                  <span class="field-hint">Select "None" if this player hasn't been on a VESA roster (subbing doesn't count).</span>
                </div>
              </div>
              <div class="field-grid-2">
                <div class="field-group">
                  <label [for]="'overstat-' + idx">
                    Overstat Link <span *ngIf="!playerMeta[idx].overstatLocked" class="required">*</span>
                  </label>
                  <ng-container *ngIf="!playerMeta[idx].overstatLocked">
                    <div class="overstat-wrap">
                      <input
                        [id]="'overstat-' + idx"
                        type="text"
                        [(ngModel)]="form.players[idx].overstatLink"
                        [name]="'overstat' + idx"
                        required
                        placeholder="https://overstat.gg/… or None"
                        class="input"
                        [class.input-loading]="playerMeta[idx].overstatLoading"
                        [readonly]="playerMeta[idx].overstatLoading"
                        (blur)="onOverstatBlur(idx)"
                      />
                      <span *ngIf="playerMeta[idx].overstatLoading" class="overstat-spinner" aria-label="Looking up…"></span>
                    </div>
                    <span *ngIf="overstatErrors[idx]" class="field-error">{{ overstatErrors[idx] }}</span>
                  </ng-container>
                  <div *ngIf="playerMeta[idx].overstatLocked" class="linked-pill">
                    <span class="linked-badge">Linked</span>
                  </div>
                </div>
                <div class="field-group">
                  <label [for]="'platform-' + idx">Platform <span class="required">*</span></label>
                  <select [id]="'platform-' + idx" [(ngModel)]="form.players[idx].platform" [name]="'platform' + idx" required class="input">
                    <option value="">Select…</option>
                    <option *ngFor="let p of platforms" [value]="p.value">{{ p.label }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Additional comments -->
            <div class="form-section">
              <h3>Anything Else? <span class="section-note">— optional</span></h3>
              <div class="field-group">
                <textarea [(ngModel)]="form.additionalComments" name="additionalComments" rows="3" class="input"
                  placeholder="Anything that could help admins sort or prioritize your team"></textarea>
              </div>
            </div>

            <div class="form-footer">
              <p class="form-note">
                Inaccurate rank or experience info affects division placement for every team in
                your lobby. Admins will reach out via Discord once your signup is reviewed.
                Teams are waitlisted automatically if spots are full or the season is underway.
              </p>
              <p *ngIf="submitError" class="error-banner">{{ submitError }}</p>
              <button type="submit" class="btn-submit" [disabled]="signupForm.invalid || submitting">
                {{ submitting ? 'Submitting…' : 'Submit Registration' }}
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
            from <strong>{{ form.players[0].discordUsername }}</strong>.
            League admins will reach out via Discord once your team has been reviewed and placed.
          </p>
          <p>Make sure your full roster is in the League Discord for announcements.</p>
          <div class="success-actions">
            <a [href]="discordInviteUrl" target="_blank" rel="noopener noreferrer" class="btn-discord">
              Join League Discord
            </a>
            <a routerLink="/league" class="btn-outline">Back to League Overview</a>
          </div>
        </div>

      </div>

      <app-league-schedule [dates]="scheduleEntries"></app-league-schedule>

    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      width: 100%;
      background: var(--vesa-void);
      color: var(--vesa-text);
      padding-bottom: 5rem;
    }

    .signup-header {
      text-align: center;
      padding: 48px 24px 8px;
    }

    .back-link {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vesa-faint);
      text-decoration: none;
      margin-bottom: 20px;
      transition: color 0.15s;
    }
    .back-link:hover { color: var(--vesa-text); }

    .badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background: var(--vesa-red-dim);
      color: var(--vesa-red);
      padding: 5px 12px;
      border-radius: 4px;
      margin-bottom: 14px;
      margin-left: 0.5rem;
    }

    .signup-header h1 {
      font-family: var(--font-display);
      font-size: clamp(32px, 5vw, 52px);
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1;
      margin: 0 0 14px;
      color: var(--vesa-text);
      text-wrap: balance;
    }

    .sub {
      color: var(--vesa-dim);
      font-size: 15px;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.7;
    }

    .signup-body {
      max-width: 760px;
      margin: 2.5rem auto 0;
      padding: 0 1.5rem;
    }

    /* Discord join gate */
    .discord-gate {
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 3.5rem 2rem;
      text-align: center;
    }

    .auth-icon {
      color: #5865f2;
      margin-bottom: 1rem;
    }
    .auth-icon svg { width: 44px; height: 44px; }
    .discord-gate h2 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 0.6rem;
      color: var(--vesa-text);
    }
    .discord-gate p {
      color: var(--vesa-dim);
      margin: 0 auto 2rem;
      max-width: 380px;
      line-height: 1.6;
      font-size: 14px;
    }

    .btn-discord-signin {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      background: #5865f2;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 12px 24px;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }
    .btn-discord-signin:hover { background: #4752c4; }

    .discord-logo { width: 1.2rem; height: 1.2rem; flex-shrink: 0; }

    .btn-continue {
      display: block;
      margin: 1.1rem auto 0;
      background: none;
      border: none;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-dim);
      text-decoration: underline;
      cursor: pointer;
      transition: color 0.15s;
    }
    .btn-continue:hover { color: var(--vesa-text); }

    /* Form card */
    .form-card {
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--vesa-line);
    }
    .form-section:last-of-type { border-bottom: none; }

    .form-section h3 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--vesa-faint);
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--vesa-line);
    }

    .captain-tag {
      background: var(--vesa-red-dim);
      color: var(--vesa-red);
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 3px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }

    .section-note {
      font-family: var(--font-body);
      text-transform: none;
      letter-spacing: 0;
      color: rgba(235, 235, 245, 0.3);
    }

    /* Field layouts */
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }

    .field-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vesa-dim);
    }

    .required { color: var(--vesa-red); }

    .field-hint {
      font-size: 0.76rem;
      color: var(--vesa-faint);
      line-height: 1.5;
    }

    .field-error {
      font-size: 0.76rem;
      color: var(--vesa-red);
      line-height: 1.5;
    }

    .input {
      background: var(--vesa-raised);
      border: 1px solid var(--vesa-line-strong);
      border-radius: 4px;
      padding: 0.65rem 0.9rem;
      color: var(--vesa-text);
      font-size: 0.93rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.15s, background 0.15s;
      font-family: inherit;
      resize: vertical;
    }
    .input:focus { outline: none; border-color: var(--vesa-blue); background: var(--vesa-blue-dim); }
    .input option { background: #12121e; color: var(--vesa-text); }
    .input::placeholder { color: var(--vesa-faint); }

    /* Autocomplete */
    .autocomplete-wrap { position: relative; }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0; right: 0;
      background: var(--vesa-raised);
      border: 1px solid var(--vesa-blue);
      border-radius: 4px;
      overflow: hidden;
      z-index: 100;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    .search-result {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      transition: background 0.12s;
      border-bottom: 1px solid var(--vesa-line);
    }
    .search-result:last-child { border-bottom: none; }
    .search-result:hover { background: var(--vesa-blue-dim); }

    .result-name { font-size: 0.92rem; color: var(--vesa-text); flex: 1; }

    .result-overstat-dot {
      width: 0.55rem; height: 0.55rem;
      border-radius: 50%;
      background: #10b981;
      flex-shrink: 0;
    }

    .player-chip {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: var(--vesa-blue-dim);
      border: 1px solid rgba(61, 155, 255, 0.35);
      border-radius: 4px;
      padding: 0.35rem 0.5rem;
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
      background: #5865f2;
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
      color: var(--vesa-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chip-clear {
      background: transparent;
      border: 1px solid var(--vesa-line-strong);
      border-radius: 3px;
      color: var(--vesa-dim);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .chip-clear:hover {
      border-color: var(--vesa-red);
      color: var(--vesa-red);
    }

    .input-loading {
      border-color: rgba(61, 155, 255, 0.35) !important;
      color: var(--vesa-faint);
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
      border: 2px solid rgba(61, 155, 255, 0.25);
      border-top-color: var(--vesa-blue);
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
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 4px;
    }

    .linked-badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 3px;
    }

    /* Footer */
    .form-footer { display: flex; flex-direction: column; gap: 1rem; }

    .form-note {
      font-size: 0.81rem;
      color: var(--vesa-faint);
      line-height: 1.65;
      margin: 0;
    }

    .error-banner {
      font-size: 0.85rem;
      color: var(--vesa-red);
      background: var(--vesa-red-dim);
      border: 1px solid rgba(255, 44, 92, 0.35);
      border-radius: 4px;
      padding: 0.65rem 0.9rem;
      margin: 0;
    }

    .btn-submit {
      background: var(--vesa-red);
      color: #fff; border: none; border-radius: 4px;
      padding: 12px 26px;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
      align-self: flex-end;
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--vesa-red-bright);
      box-shadow: 0 0 24px rgba(255, 44, 92, 0.35);
    }
    .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Success */
    .success-card {
      background: var(--vesa-panel);
      border: 1px solid var(--vesa-line);
      border-radius: 6px;
      padding: 3rem 2rem;
      text-align: center;
    }

    .success-icon {
      width: 3.5rem; height: 3.5rem; border-radius: 6px;
      background: var(--vesa-red-dim);
      border: 1px solid var(--vesa-red);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--vesa-red); margin: 0 auto 1.5rem;
    }

    .success-card h2 {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 1rem;
      color: var(--vesa-text);
    }
    .success-card p { color: var(--vesa-dim); line-height: 1.7; margin: 0 0 0.75rem; }

    .success-actions {
      display: flex; gap: 1rem; justify-content: center;
      flex-wrap: wrap; margin-top: 1.5rem;
    }

    .btn-discord {
      display: inline-block; background: #5865f2; color: #fff;
      padding: 10px 20px; border-radius: 4px; text-decoration: none;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: background 0.15s;
    }
    .btn-discord:hover { background: #4752c4; }

    .btn-outline {
      display: inline-block; background: transparent; color: var(--vesa-text);
      border: 1px solid var(--vesa-line-strong); padding: 10px 20px;
      border-radius: 4px; text-decoration: none;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: border-color 0.15s, color 0.15s;
    }
    .btn-outline:hover { border-color: var(--vesa-blue); color: var(--vesa-blue); }

    @media (max-width: 600px) {
      .field-grid-2 { grid-template-columns: 1fr; }
      .form-card { padding: 1.5rem 1rem; }
      .btn-submit { align-self: stretch; }
    }
  `]
})
export class LeagueSignupComponent implements OnInit {
  submitted = false;
  submitting = false;
  submitError: string | null = null;
  discordJoined = false;

  readonly ranks = RANKS;
  readonly vesaDivisions = VESA_DIVISIONS;
  readonly platforms = PLATFORMS;
  readonly scheduleEntries = SEASON_SCHEDULE;
  readonly season = CURRENT_SEASON;
  readonly playerIndices = [0, 1, 2];
  readonly discordInviteUrl = environment.discord.inviteUrl;

  form: SignupForm = {
    teamName: '',
    compExperience: '',
    daysUnableToPlay: '',
    additionalComments: '',
    players: [emptyRosterPlayer(), emptyRosterPlayer(), emptyRosterPlayer()]
  };

  playerMeta: PlayerMeta[] = [
    { overstatLocked: false, overstatLoading: false },
    { overstatLocked: false, overstatLoading: false },
    { overstatLocked: false, overstatLoading: false },
  ];

  overstatErrors: (string | null)[] = [null, null, null];

  playerSearchResults: Player[][] = [[], [], []];
  playerSearchVisible: boolean[] = [false, false, false];
  playerSelections: (Player | null)[] = [null, null, null];
  playerAvatarUrls: (string | null)[] = [null, null, null];

  private searchTimers: (ReturnType<typeof setTimeout> | null)[] = [null, null, null];
  private hideTimers:   (ReturnType<typeof setTimeout> | null)[] = [null, null, null];

  constructor(
    private nhostService: NhostService,
    private discordService: DiscordService,
    private leagueSignupService: LeagueSignupService,
  ) {}

  ngOnInit() {
    this.discordJoined = localStorage.getItem(DISCORD_JOINED_KEY) === 'true';
  }

  acknowledgeDiscordJoined() {
    this.discordJoined = true;
    localStorage.setItem(DISCORD_JOINED_KEY, 'true');
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
        if (player) {
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
    // Selecting a dropdown result removes this input from the DOM (swapped for
    // the chip), which fires a native blur on the element being removed.
    // selectPlayer() already ran the lookup for that click - running it again
    // here races the two requests and can leave the Overstat field's
    // loading/empty state flickering while the user tries to type into it.
    if (this.playerSelections[playerIdx]) return;
    const name = this.form.players[playerIdx].discordUsername;
    this.playerMeta[playerIdx] = { overstatLocked: false, overstatLoading: false };
    this.form.players[playerIdx].overstatLink = '';
    this.lookupOverstat(playerIdx, name);
  }

  onOverstatBlur(playerIdx: number) {
    this.overstatErrors[playerIdx] = null;
    // A locked/LINKED value came from the players table as a bare overstat ID,
    // not a URL - validating it as one throws, and since the URL input is
    // hidden while locked, that error had nowhere to render. onSubmit() was
    // silently bailing out on every team with a linked player as a result.
    if (this.playerMeta[playerIdx].overstatLocked) return;
    const link = this.form.players[playerIdx].overstatLink.trim();
    if (!link || link.toLowerCase() === 'none') return;
    try {
      validateOverstatLink(link);
    } catch (e) {
      this.overstatErrors[playerIdx] = (e as Error).message;
    }
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

  onSubmit() {
    if (this.submitting) return;
    this.submitError = null;

    for (let i = 0; i < 3; i++) {
      this.onOverstatBlur(i);
      if (this.overstatErrors[i]) return;
    }

    this.submitting = true;

    const players = this.playerIndices.map((idx): SignupPlayer => ({
      discordUsername: this.form.players[idx].discordUsername.trim(),
      discordId: this.playerSelections[idx]?.discord_id ?? '',
      rank: this.form.players[idx].rank,
      vesaDivision: this.form.players[idx].vesaDivision,
      overstatLink: this.form.players[idx].overstatLink.trim(),
      platform: this.form.players[idx].platform,
      elo: this.playerSelections[idx]?.elo,
    })) as [SignupPlayer, SignupPlayer, SignupPlayer];

    const payload: SignupPayload = {
      teamName: this.form.teamName.trim(),
      compExperience: this.form.compExperience.trim(),
      daysUnableToPlay: this.form.daysUnableToPlay.trim(),
      additionalComments: this.form.additionalComments.trim(),
      players,
    };

    this.leagueSignupService.submit(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = 'Something went wrong submitting your signup. Please try again, or reach out in Discord if it keeps failing.';
        console.error('League signup submission failed', err);
      }
    });
  }
}
