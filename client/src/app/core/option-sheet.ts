import { Component, DestroyRef, ElementRef, HostListener, PLATFORM_ID, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MenuItem, OptionChoice, OptionGroup, money } from '../services/order-service';

/**
 * The choices for a dish that has options ("Choose a size", "Add extras"): a sheet that rises from the bottom
 * of the screen on a phone and sits in the middle on a larger screen. It shows each group's rule ("Choose 1",
 * "Up to 3", "Optional"), keeps the diner inside the group's minimum and maximum, shows the running price,
 * and only lets the dish be added once every required group is answered.
 * It is only ever opened for dishes that carry option groups, so a menu without options never reaches it.
 */
@Component({
  selector: 'odm-option-sheet',
  template: `
    <div class="scrim" (click)="closed.emit()"></div>
    <section #sheet class="sheet" role="dialog" aria-modal="true" tabindex="-1" [attr.aria-label]="'Choose options for ' + item().name">
      <header class="head">
        <h2>{{ item().name }}</h2>
        <button class="x" type="button" (click)="closed.emit()">Close</button>
      </header>

      <div class="body">
        @for (g of groups(); track g.id) {
          <div class="group" role="group" [attr.aria-label]="g.name + ', ' + rule(g)">
            <h3>{{ g.name }} <small>{{ rule(g) }}</small></h3>
            @for (o of g.options; track o.id) {
              <button type="button" class="opt" [class.on]="has(g, o)" [attr.role]="g.max === 1 ? 'radio' : 'checkbox'"
                      [attr.aria-checked]="has(g, o)" [disabled]="blocked(g, o)" (click)="toggle(g, o)">
                <span class="mark" [class.round]="g.max === 1" aria-hidden="true"></span>
                <span class="n">{{ o.name }}</span>
                @if (o.priceCents) { <span class="p">+{{ price(o.priceCents) }}</span> }
              </button>
            }
          </div>
        }
      </div>

      <footer class="foot">
        @if (missing(); as m) { <p class="need" role="status">{{ m }}</p> }
        <button class="add" type="button" [disabled]="!!missing()" (click)="add()">Add to order <span>{{ price(total()) }}</span></button>
      </footer>
    </section>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 60; display: block; }
    .scrim { position: absolute; inset: 0; background: rgba(7, 24, 54, 0.62); }
    .sheet {
      position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column;
      max-height: min(86vh, 86dvh); border-radius: 14px 14px 0 0; background: var(--site-white); color: var(--site-text);
      box-shadow: 0 -12px 34px rgba(7, 24, 54, 0.45); outline: none; animation: rise 0.2s ease-out;
    }
    @media (min-width: 640px) {
      .sheet { left: 50%; right: auto; top: 50%; bottom: auto; width: min(30rem, calc(100% - 2rem)); transform: translate(-50%, -50%); border-radius: 14px; animation: none; }
    }
    @keyframes rise { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.8rem 1rem; border-bottom: 1px solid var(--site-line); background: var(--site-tint); border-radius: 14px 14px 0 0; }
    h2 { margin: 0; min-width: 0; color: var(--site-midnight); font-size: 1.15rem; overflow-wrap: anywhere; }
    .x { flex: none; padding: 0.4rem 0.8rem; border: 0; border-radius: 6px; background: var(--site-midnight); color: var(--site-white); font: 700 0.85rem/1 'Exo 2', Roboto, sans-serif; cursor: pointer; }
    .body { flex: 1 1 auto; min-height: 0; padding: 0.4rem 1rem 0.8rem; overflow-y: auto; overscroll-behavior: contain; }
    .group { padding: 0.6rem 0 0.2rem; }
    h3 { margin: 0 0 0.4rem; color: var(--site-midnight); font-size: 1rem; }
    h3 small { margin-left: 0.4rem; color: var(--site-muted); font-size: 0.8rem; font-weight: 600; }
    .opt {
      display: grid; grid-template-columns: 1.4rem minmax(0, 1fr) auto; align-items: center; gap: 0.7rem; width: 100%; min-height: 3rem; margin: 0 0 6px; padding: 0.4rem 0.75rem;
      border: 1.5px solid var(--site-line); border-radius: 8px; background: var(--site-white); color: var(--site-midnight); font: 600 1rem/1.25 'Exo 2', Roboto, sans-serif; text-align: left; cursor: pointer;
    }
    .opt.on { border-color: var(--site-navy); background: var(--site-tint); }
    .opt[disabled] { opacity: 0.5; cursor: default; }
    .n { min-width: 0; overflow-wrap: anywhere; }
    .p { color: var(--site-navy); font-variant-numeric: tabular-nums; font-weight: 700; }
    .mark { width: 1.2rem; height: 1.2rem; border: 2px solid var(--site-navy); border-radius: 4px; background: var(--site-white); box-sizing: border-box; }
    .mark.round { border-radius: 50%; }
    .on .mark { background: var(--site-accent); box-shadow: inset 0 0 0 3px var(--site-white); }
    .foot { padding: 0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--site-line); background: var(--site-tint); }
    .need { margin: 0 0 0.5rem; color: var(--site-text); font-size: 0.9rem; }
    .add {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%; padding: 0.85rem 1rem; border: 0; border-radius: 8px;
      background: var(--site-accent); color: var(--site-on-accent); font: 800 1.05rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.04em; cursor: pointer;
    }
    .add[disabled] { opacity: 0.55; cursor: default; }
    .opt:focus-visible, .x:focus-visible, .add:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 2px; }
  `],
})
export class OptionSheet {
  readonly item = input.required<MenuItem>();
  readonly groups = input.required<OptionGroup[]>();
  /** The diner's choices, when they press "Add to order". */
  readonly chosen = output<OptionChoice[]>();
  readonly closed = output<void>();

  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');
  private readonly inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly picked = signal<Record<string, string[]>>({});

  protected readonly total = computed(() => this.item().priceCents
    + this.groups().flatMap((g) => g.options.filter((o) => this.has(g, o))).reduce((sum, o) => sum + o.priceCents, 0));

  /** What is still needed before the dish can be added, in words; '' when everything required is answered. */
  protected readonly missing = computed(() => {
    for (const g of this.groups()) {
      const n = (this.picked()[g.id] ?? []).length;
      if (n < g.min) return g.min === 1 ? `Choose one in “${g.name}”.` : `Choose at least ${g.min} in “${g.name}”.`;
    }
    return '';
  });

  constructor() {
    afterNextRender(() => {
      this.sheet()?.nativeElement.focus();
      if (this.inBrowser) document.body.style.overflow = 'hidden';
    });
    // The page behind must scroll again once the sheet is gone.
    inject(DestroyRef).onDestroy(() => { if (this.inBrowser) document.body.style.overflow = ''; });
  }

  @HostListener('document:keydown.escape')
  protected escape(): void {
    this.closed.emit();
  }

  protected price(cents: number): string {
    return money(cents);
  }

  /** "Choose 1", "Choose up to 3", "Optional", "Choose 2 to 3". */
  protected rule(g: OptionGroup): string {
    const many = g.max !== 1;
    if (g.min === 0) return g.max === 0 || !many ? 'Optional' : `Optional, up to ${g.max}`;
    if (g.max === g.min) return `Choose ${g.min}`;
    if (g.max === 0) return `Choose at least ${g.min}`;
    return `Choose ${g.min} to ${g.max}`;
  }

  protected has(g: OptionGroup, o: OptionChoice): boolean {
    return (this.picked()[g.id] ?? []).includes(o.id);
  }

  /** A group at its maximum cannot take another pick (a single-pick group swaps instead, so it is never blocked). */
  protected blocked(g: OptionGroup, o: OptionChoice): boolean {
    return g.max > 1 && !this.has(g, o) && (this.picked()[g.id] ?? []).length >= g.max;
  }

  protected toggle(g: OptionGroup, o: OptionChoice): void {
    const now = this.picked()[g.id] ?? [];
    let next: string[];
    if (now.includes(o.id)) next = g.max === 1 && g.min >= 1 ? now : now.filter((id) => id !== o.id);
    else if (g.max === 1) next = [o.id];
    else if (g.max > 0 && now.length >= g.max) next = now;
    else next = [...now, o.id];
    this.picked.update((p) => ({ ...p, [g.id]: next }));
  }

  protected add(): void {
    if (this.missing()) return;
    this.chosen.emit(this.groups().flatMap((g) => g.options.filter((o) => this.has(g, o))));
  }
}
