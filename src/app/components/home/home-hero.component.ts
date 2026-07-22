import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatStripComponent, StatItem } from '../ui';
import { CURRENT_SEASON, SIGNUPS_OPEN } from '../../config/season';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, StatStripComponent],
  template: `
    <section class="hero">
      <canvas #stars class="stars" aria-hidden="true"></canvas>
      <div class="glow" aria-hidden="true"></div>
      <div class="gridfloor" aria-hidden="true"></div>
      <div class="wrap hero-content">
        <p class="eyebrow rise"><span class="tick">▸</span> APEX LEGENDS · COMPETITIVE LEAGUE &amp; SCRIMS</p>
        <h1 class="rise d1">Season 15 is<br />go for launch<span class="dot">.</span></h1>
        <p class="lede rise d2">
          {{ divisionCount ?? '—' }} divisions. Six weeks. Every kill, every
          placement, and every rating point tracked from lobby to Match Point.
        </p>
        <div class="actions rise d3">
          <a
            class="btn primary"
            routerLink="/league/signup"
          >Register your team</a>
          <a class="btn ghost" routerLink="/league">Season 14 results</a>
        </div>
      </div>
    </section>
    <div class="wrap telemetry rise d4">
      <app-stat-strip [stats]="heroStats" />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .hero {
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--vesa-line);
    }
    .stars {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .glow {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background:
        radial-gradient(560px 300px at 30% 100%, rgba(255, 44, 92, 0.16), transparent 70%),
        radial-gradient(560px 300px at 70% 100%, rgba(61, 155, 255, 0.14), transparent 70%);
    }
    .gridfloor {
      position: absolute;
      z-index: 2;
      left: -20%;
      right: -20%;
      bottom: -30px;
      height: 300px;
      background:
        repeating-linear-gradient(90deg, rgba(255, 44, 92, 0.28) 0 1px, transparent 1px 72px),
        repeating-linear-gradient(0deg, rgba(61, 155, 255, 0.24) 0 1px, transparent 1px 40px);
      transform: perspective(400px) rotateX(63deg);
      transform-origin: top center;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 34%, transparent 96%);
      mask-image: linear-gradient(to bottom, transparent 0%, #000 34%, transparent 96%);
      pointer-events: none;
    }
    .hero-content {
      position: relative;
      z-index: 3;
      padding-top: 96px;
      padding-bottom: 190px;
      text-align: center;
    }

    h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(56px, 9vw, 112px);
      line-height: 0.96;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      margin: 20px 0 24px;
      color: var(--vesa-text);
      text-wrap: balance;
    }
    h1 .dot {
      color: var(--vesa-red);
    }
    .lede {
      max-width: 560px;
      margin: 0 auto 36px;
      color: var(--vesa-dim);
      font-size: 17px;
    }
    .actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .telemetry {
      position: relative;
      z-index: 4;
      margin-top: -60px;
    }

    @media (prefers-reduced-motion: no-preference) {
      .rise {
        opacity: 0;
        transform: translateY(16px);
        animation: rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
      }
      .rise.d1 { animation-delay: 0.08s; }
      .rise.d2 { animation-delay: 0.18s; }
      .rise.d3 { animation-delay: 0.3s; }
      .rise.d4 { animation-delay: 0.42s; }
      @keyframes rise {
        to {
          opacity: 1;
          transform: none;
        }
      }
    }

    @media (max-width: 768px) {
      .hero-content {
        padding-top: 64px;
        padding-bottom: 150px;
      }
      .lede {
        font-size: 15px;
      }
    }
  `]
})
export class HomeHeroComponent implements AfterViewInit, OnDestroy {
  @Input() totalPlayers!: number;
  @Input() totalGames!: number;
  @Input() totalMatches!: number;
  @Input() divisionCount: number | null = null;

  @ViewChild('stars') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private stars: Star[] = [];
  private rafId = 0;
  private reducedMotion = false;
  private readonly onResize = () => {
    this.sizeCanvas();
    if (this.reducedMotion) {
      this.draw(0);
    }
  };

  get heroStats(): StatItem[] {
    return [
      { label: 'Players tracked', value: this.totalPlayers?.toLocaleString() ?? '—' },
      { label: 'Games logged', value: this.totalGames?.toLocaleString() ?? '—' },
      { label: 'League matches', value: this.totalMatches?.toLocaleString() ?? '—' },
      { label: 'Next season', value: `S${CURRENT_SEASON}`, suffix: this.countdown }
    ];
  }

  private get countdown(): string {
    const days = Math.ceil((SIGNUPS_OPEN.getTime() - Date.now()) / 86_400_000);
    return days > 0 ? `T-${days} DAYS` : 'SIGNUPS OPEN';
  }

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.sizeCanvas();
    window.addEventListener('resize', this.onResize);
    if (this.reducedMotion) {
      this.draw(0);
    } else {
      this.rafId = requestAnimationFrame(t => this.loop(t));
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
  }

  private sizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const hero = canvas.parentElement as HTMLElement;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    this.stars = [];
    const count = Math.floor(canvas.width / 9);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.85,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2
      });
    }
  }

  private loop(t: number): void {
    this.draw(t);
    this.rafId = requestAnimationFrame(next => this.loop(next));
  }

  private draw(t: number): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.stars.forEach((star, i) => {
      const alpha = this.reducedMotion
        ? 0.5
        : 0.3 + 0.35 * (1 + Math.sin(star.phase + t * 0.001 * star.speed));
      ctx.globalAlpha = Math.min(alpha * 0.8, 1);
      ctx.fillStyle = i % 7 === 0 ? '#3d9bff' : '#f2f2f7';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
