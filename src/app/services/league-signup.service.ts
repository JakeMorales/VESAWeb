import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

/**
 * Same-origin Cloudflare Worker route (worker/index.js) that appends the row
 * to the signup sheet using a service-account credential held server-side.
 * See DEPLOYMENT.md "League signup -> Google Sheet".
 */
const LEAGUE_SIGNUP_ENDPOINT = '/api/league-signup';

/**
 * Choice lists mirror the Discord bot's PlayerRank / VesaDivision / Platform enums
 * (theheuman/scrim-bot src/models/league-models.ts) exactly. The `value` of each
 * option is written to the "Discord Submittals" sheet tab and must match the
 * enum key string the bot writes (e.g. "LowDiamond", "Division3", "pc") so both
 * signup paths produce identical rows.
 */
export const RANKS = [
  { value: 'Bronze', label: 'Bronze' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Plat', label: 'Platinum' },
  { value: 'LowDiamond', label: 'Low Diamond' },
  { value: 'HighDiamond', label: 'High Diamond' },
  { value: 'Masters', label: 'Masters' },
  { value: 'Pred', label: 'Predator' },
];

export const VESA_DIVISIONS = [
  { value: 'None', label: 'None' },
  { value: 'Division1', label: 'Division 1 — Pinnacle' },
  { value: 'Division2', label: 'Division 2 — Vanguard' },
  { value: 'Division3', label: 'Division 3 — Ascendant' },
  { value: 'Division4', label: 'Division 4 — Emergent' },
  { value: 'Division5', label: 'Division 5 — Challenger' },
  { value: 'Division6', label: 'Division 6 — Prospect' },
  { value: 'Division7', label: 'Division 7 — Aspirant' },
  { value: 'Division8', label: 'Division 8 — Contenders' },
];

export const PLATFORMS = [
  { value: 'pc', label: 'PC' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'switch', label: 'Switch' },
];

export interface SignupPlayer {
  discordUsername: string;
  discordId: string;
  rank: string;
  vesaDivision: string;
  overstatLink: string;
  platform: string;
  elo?: number;
}

export interface SignupPayload {
  teamName: string;
  compExperience: string;
  daysUnableToPlay: string;
  additionalComments: string;
  players: [SignupPlayer, SignupPlayer, SignupPlayer];
}

/** Same validation as scrim-bot's OverstatService.validateLinkUrl. */
export function validateOverstatLink(link: string): string {
  const url = new URL(link);
  if (url.hostname !== 'overstat.gg') {
    throw new Error('Not an overstat.gg link');
  }
  const pathParts = url.pathname.slice(1).split('/');
  if (pathParts[0] !== 'player') {
    throw new Error('Not a link to a player overview');
  }
  const match = /[0-9]+/.exec(pathParts[1] ?? '');
  if (!match) {
    throw new Error('No player ID found in link');
  }
  return match[0];
}

@Injectable({ providedIn: 'root' })
export class LeagueSignupService {
  submit(payload: SignupPayload): Observable<void> {
    const returningPlayers = payload.players.filter(p => p.vesaDivision !== 'None').length;

    // Column order matches the "Discord Submittals" sheet tab exactly (minus
    // Timestamp, which the Worker stamps on receipt): Team Name, Scheduling,
    // Comp Exp, Returning Players, then 7 columns per player (Discord,
    // Discord ID, OS, Division, Rank, Platform, ELO), then comments.
    const row = [
      ...teamRow(payload, returningPlayers),
      ...payload.players.flatMap(playerRow),
      payload.additionalComments || '',
    ];

    return from(
      fetch(LEAGUE_SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row }),
      }).then(async res => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? `Signup submission failed (${res.status})`);
        }
      }),
    );
  }
}

function teamRow(payload: SignupPayload, returningPlayers: number): string[] {
  return [
    payload.teamName,
    payload.daysUnableToPlay || 'Open schedule',
    payload.compExperience,
    `${returningPlayers} returning players`,
  ];
}

function playerRow(player: SignupPlayer): (string | number)[] {
  return [
    player.discordUsername,
    player.discordId || '',
    player.overstatLink || 'No overstat',
    player.vesaDivision,
    player.rank,
    player.platform,
    player.elo ?? 'No elo on record',
  ];
}
