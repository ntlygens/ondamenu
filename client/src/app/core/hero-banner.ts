import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_SCENES, HeroPage } from './hero-scenes';

/**
 * Animated page banner built on a real photo.
 * Subtle overlays (slow zoom, soft glows, indicator dots, drifting warm motes, a light sheen)
 * are drawn in the photo's own coordinate space from hero-scenes.ts, so they stay aligned at any size.
 * All motion is CSS and is switched off for prefers-reduced-motion.
 */
@Component({
  selector: 'odm-hero-banner',
  imports: [RouterLink],
  template: `
<section class="hero" [attr.aria-label]="page().eyebrow">
  <svg class="stage" [attr.viewBox]="scene().viewBox" [attr.preserveAspectRatio]="scene().align + ' slice'" aria-hidden="true">
    <defs>
      <filter id="hb-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
      <linearGradient id="hb-sheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#ffe9c2" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <g class="kenburns">
      <image [attr.href]="scene().img" x="0" y="0" [attr.width]="scene().w" [attr.height]="scene().h"/>

      @for (g of scene().glows; track $index) {
        <rect class="glow" [attr.x]="g.x" [attr.y]="g.y" [attr.width]="g.w" [attr.height]="g.h" [attr.rx]="g.rx"
              [attr.fill]="g.color" filter="url(#hb-blur)" [style.animation-duration.s]="g.dur"/>
      }
      @for (d of scene().dots; track $index) {
        <circle class="dot" [attr.cx]="d.x" [attr.cy]="d.y" r="4.5" [attr.fill]="d.color" [style.color]="d.color"/>
      }
      @for (p of scene().particles; track $index) {
        <circle class="mote" [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="p.r" [attr.fill]="p.c"
                [style.animation-duration.s]="p.dur" [style.animation-delay.s]="-p.delay"/>
      }
      <rect class="sweep" x="-400" [attr.y]="scene().sweep.y" width="300" [attr.height]="scene().sweep.h" fill="url(#hb-sheen)"/>
    </g>
  </svg>

  <div class="status-chip" aria-hidden="true">
    <span class="live"><i></i>ONLINE</span>
    <span class="sep"></span>
    <span class="extra">{{ page().chip }}</span>
    <span class="sep extra"></span>
    <span class="clock">{{ clock() }}</span>
  </div>

  <div class="copy">
    <span class="eyebrow"><span class="pulse"></span>{{ page().eyebrow }}</span>
    <h1>{{ page().titleLead }} <span>{{ page().titleAccent }}</span></h1>
    <p>{{ page().text }}</p>
    <div class="actions">
      <a class="hbtn primary" [routerLink]="page().primary.route">{{ page().primary.label }}</a>
      @if (page().secondary; as second) {
        <a class="hbtn ghost" [routerLink]="second.route">{{ second.label }}</a>
      }
    </div>
  </div>
</section>
`,
  styles: [`
:host { display: block; width: calc(100% + 40px); margin: -1rem -20px 0; }
.hero { position: relative; width: 100%; aspect-ratio: 1536 / 680; min-height: 440px; max-height: 720px; overflow: hidden; background: #0a1326; color: #fff; isolation: isolate; }
.stage { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
.kenburns { transform-origin: 60% 55%; transform-box: view-box; animation: kenburns 28s ease-in-out infinite alternate; }

/* readability shade for the headline */
.hero::before { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(90deg, rgba(8,16,34,.88) 0%, rgba(8,16,34,.66) 28%, rgba(8,16,34,.2) 50%, rgba(8,16,34,0) 66%),
    linear-gradient(180deg, rgba(8,16,34,.35) 0%, rgba(8,16,34,0) 30%, rgba(8,16,34,0) 75%, rgba(8,16,34,.55) 100%); }

.copy { position: absolute; z-index: 3; left: clamp(20px, 5vw, 96px); top: 48%; transform: translateY(-50%); max-width: min(580px, 46%); }
.eyebrow { display: inline-flex; align-items: center; gap: .5rem; padding: .35rem .8rem; border: 1px solid rgba(246,176,46,.5); border-radius: 999px; color: var(--site-accent-soft); font: 600 .78rem/1 monospace; letter-spacing: .12em; text-transform: uppercase; background: rgba(246,176,46,.1); backdrop-filter: blur(6px); }
.eyebrow .pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--site-accent); animation: pulse 1.8s ease-out infinite; }
h1 { margin: 1rem 0 .75rem; font-size: clamp(2.1rem, 3.6vw, 4rem); line-height: 1.05; font-weight: 800; letter-spacing: -.02em; text-shadow: 0 4px 30px rgba(0,0,0,.6); }
h1 span { display: block; background: linear-gradient(90deg, #fff, var(--site-accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
p { margin: 0 0 1.6rem; font-size: clamp(1rem, 1.2vw, 1.22rem); line-height: 1.55; color: rgba(255,255,255,.9); max-width: 36ch; text-shadow: 0 2px 12px rgba(0,0,0,.6); }
.actions { display: flex; gap: .8rem; flex-wrap: wrap; }
.hbtn { display: inline-flex; align-items: center; padding: .85rem 1.5rem; border-radius: 999px; font-weight: 600; text-decoration: none; font-size: 1rem; transition: transform .2s, box-shadow .2s, background .2s; }
.hbtn.primary { background: var(--site-accent); color: var(--site-on-accent); box-shadow: 0 8px 30px rgba(246,176,46,.35); }
.hbtn.primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(246,176,46,.5); }
.hbtn.ghost { color: #fff; border: 1px solid rgba(255,255,255,.4); background: rgba(255,255,255,.08); backdrop-filter: blur(6px); }
.hbtn.ghost:hover { background: rgba(255,255,255,.16); }

.status-chip { position: absolute; z-index: 3; top: 22px; right: clamp(16px, 3vw, 48px); display: flex; align-items: center; gap: .6rem; padding: .5rem .9rem; border-radius: 10px; font: 500 .74rem/1 'Roboto Mono', monospace; letter-spacing: .06em; color: #f3e9d6; background: rgba(10,19,38,.55); border: 1px solid rgba(255,226,163,.3); backdrop-filter: blur(8px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
.status-chip .live { display: inline-flex; align-items: center; gap: .35rem; color: var(--site-accent); font-weight: 700; }
.status-chip .live i { width: 7px; height: 7px; border-radius: 50%; background: var(--site-accent); box-shadow: 0 0 6px var(--site-accent); animation: blink 1.4s ease-in-out infinite; }
.status-chip .sep { width: 1px; height: 12px; background: rgba(255,255,255,.25); }
.status-chip .clock { color: #fff; min-width: 7ch; }

.glow { opacity: .05; mix-blend-mode: screen; animation: glow 3.6s ease-in-out infinite; }
.dot { animation: blink 2s ease-in-out infinite; filter: drop-shadow(0 0 5px currentColor); }
.mote { mix-blend-mode: screen; opacity: 0; animation: rise 12s linear infinite; }
.sweep { mix-blend-mode: screen; transform: skewX(-18deg); animation: sweep 11s ease-in-out infinite; }

@keyframes kenburns { from { transform: scale(1) translate(0,0); } to { transform: scale(1.06) translate(-14px, -6px); } }
@keyframes glow { 0%,100% { opacity: .05 } 50% { opacity: .32 } }
@keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(246,176,46,.7) } 100% { box-shadow: 0 0 0 10px rgba(246,176,46,0) } }
@keyframes rise { 0% { opacity: 0; transform: translateY(0) } 15% { opacity: .7 } 85% { opacity: .45 } 100% { opacity: 0; transform: translateY(-120px) } }
@keyframes sweep { 0%, 55% { transform: skewX(-18deg) translateX(0) } 100% { transform: skewX(-18deg) translateX(2300px) } }

@media (max-width: 900px) {
  .status-chip .extra { display: none; }
  .copy { max-width: 72%; }
}
@media (max-width: 640px) {
  .hero { aspect-ratio: auto; min-height: 540px; }
  .hero::before { background: linear-gradient(180deg, rgba(8,16,34,.88) 0%, rgba(8,16,34,.72) 55%, rgba(8,16,34,.3) 100%); }
  .copy { top: auto; bottom: 36px; transform: none; max-width: none; right: 20px; }
  .status-chip { top: 14px; right: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero *, .hero *::before { animation: none !important; }
}
  `],
})
export class HeroBanner {
  readonly page = input.required<HeroPage>();
  protected readonly scene = computed(() => HERO_SCENES[this.page().scene]);
  protected readonly clock = signal('--:--:--');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Browser only (skipped during server rendering).
    afterNextRender(() => {
      const tick = () => this.clock.set(new Date().toLocaleTimeString('en-US', { hour12: false }));
      tick();
      const id = setInterval(tick, 1000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }
}
