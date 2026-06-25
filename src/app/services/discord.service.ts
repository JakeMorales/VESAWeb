import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DiscordProfile {
  username: string;
  avatarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class DiscordService {
  constructor(private http: HttpClient) {}

  getUserById(discordId: string): Observable<DiscordProfile | null> {
    return this.http.get<any>(`/discord-api/users/${discordId}`).pipe(
      map(user => ({
        username: user.global_name ?? user.username,
        avatarUrl: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
          : this.defaultAvatar(user.id)
      })),
      catchError(() => of(null))
    );
  }

  private defaultAvatar(discordId: string): string {
    const index = Number(BigInt(discordId) >> 22n) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
}
