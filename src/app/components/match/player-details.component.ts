import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface PlayerStats {
  playerName: string;
  kills: number;
  damage: number;
  downs: number;
  headshots?: number;
  assists?: number;
  shots?: number;
  hits?: number;
  revives: number;
  respawns: number;
}

export interface OverallPlayerStats {
  playerName: string;
  totalKills: number;
  totalDamage: number;
  totalDowns: number;
  totalHeadshots?: number;
  totalAssists?: number;
  totalShots?: number;
  totalHits?: number;
  totalRevives: number;
  totalRespawns: number;
  gamesPlayed: number;
  avgKills: number;
  avgDamage: number;
}

@Component({
  selector: 'app-player-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-details" [@slideDown]>
      <div class="player-header">
        <div class="player-header-cell player-name-col">Player</div>
        <div class="player-header-cell">Kills</div>
        <div class="player-header-cell">Damage</div>
        <div class="player-header-cell">Downs</div>
        <div class="player-header-cell">Headshots</div>
        <div class="player-header-cell">Assists</div>
        <div class="player-header-cell">Shots</div>
        <div class="player-header-cell">Hits</div>
        <div class="player-header-cell">Respawns</div>
        <div class="player-header-cell">Revives</div>
      </div>
      
      <div *ngFor="let player of players" class="player-row">
        <div class="player-cell player-name-col">{{ player.playerName }}</div>
        <div class="player-cell">{{ getKills(player) }}</div>
        <div class="player-cell">{{ getDamage(player) | number:'1.0-0' }}</div>
        <div class="player-cell">{{ getDowns(player) }}</div>
        <div class="player-cell">{{ getHeadshots(player) }}</div>
        <div class="player-cell">{{ getAssists(player) }}</div>
        <div class="player-cell">{{ getShots(player) }}</div>
        <div class="player-cell">{{ getHits(player) }}</div>
        <div class="player-cell">{{ getRespawns(player) }}</div>
        <div class="player-cell">{{ getRevives(player) }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./player-details.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ height: '0', opacity: '0' }))
      ])
    ])
  ]
})
export class PlayerDetailsComponent {
  @Input() players: (PlayerStats | OverallPlayerStats)[] = [];
  @Input() isOverallStats: boolean = false;

  getKills(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats ? (player as OverallPlayerStats).totalKills : (player as PlayerStats).kills;
  }

  getDamage(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats ? (player as OverallPlayerStats).totalDamage : (player as PlayerStats).damage;
  }

  getDowns(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats ? (player as OverallPlayerStats).totalDowns : (player as PlayerStats).downs;
  }

  getHeadshots(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats 
      ? (player as OverallPlayerStats).totalHeadshots || 0 
      : (player as PlayerStats).headshots || 0;
  }

  getAssists(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats 
      ? (player as OverallPlayerStats).totalAssists || 0 
      : (player as PlayerStats).assists || 0;
  }

  getShots(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats 
      ? (player as OverallPlayerStats).totalShots || 0 
      : (player as PlayerStats).shots || 0;
  }

  getHits(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats 
      ? (player as OverallPlayerStats).totalHits || 0 
      : (player as PlayerStats).hits || 0;
  }

  getRespawns(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats ? (player as OverallPlayerStats).totalRespawns : (player as PlayerStats).respawns;
  }

  getRevives(player: PlayerStats | OverallPlayerStats): number {
    return this.isOverallStats ? (player as OverallPlayerStats).totalRevives : (player as PlayerStats).revives;
  }
}
