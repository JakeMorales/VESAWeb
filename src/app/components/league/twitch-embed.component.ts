import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-twitch-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="twitch-wrapper" *ngIf="channel">
      <iframe [src]="embedUrl" [style.height]="height" allowfullscreen frameborder="0" scrolling="no"></iframe>
    </div>
  `,
  styles: [`
    .twitch-wrapper {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      background: #000;
    }
    iframe {
      width: 100%;
      border: none;
      display: block;
    }
  `]
})
export class TwitchEmbedComponent implements OnInit {
  @Input() channel: string = '';
  @Input() height: string = '400px';

  embedUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const hostname = window.location.hostname;
    const url = `https://player.twitch.tv/?channel=${this.channel}&parent=${hostname}&autoplay=false`;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
