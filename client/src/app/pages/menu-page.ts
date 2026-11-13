import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { CartBar } from '../core/cart-bar';
import { GradeBadge } from '../core/grade-badge';
import { CartService } from '../services/cart-service';
import { ChromeService } from '../services/chrome-service';
import { Menu, MenuItem, OrderService, Restaurant, money } from '../services/order-service';

/**
 * A restaurant's menu: photo header, category buttons, dishes in alternating rows
 * (photo on the right, then on the left), a price and Order button on every dish, and the cart bar.
 *
 * While scrolling: the photo and the "Restaurants" button scroll away; the name strip and category buttons
 * stay under the site header with the photo faded into the strip; and "Restaurants" reappears in the site header.
 */
@Component({
  selector: 'odm-menu-page',
  imports: [RouterLink, NgTemplateOutlet, MatIconModule, CartBar, GradeBadge],
  host: { class: 'page app-screen' },
  template: `
    <a #backTab class="app-tab app-tab--link" routerLink="/order/restaurants"><span aria-hidden="true">‹</span> Restaurants</a>

    @if (restaurant(); as r) {
      <div class="photo" [style.view-transition-name]="'r-' + r.slug">
        @if (r.photo) { <img [src]="r.photo" alt="" /> }
        <odm-grade-badge class="grade" [grade]="r.grade" />
      </div>
      <!-- Marks the point where the strip below reaches the site header and stays there. -->
      <span #stuckMark class="stuck-mark" aria-hidden="true"></span>
      <div #stack class="stack" [class.stuck]="stuck()">
        <header class="info rest-label" [style.--strip-photo]="r.photo ? 'url(' + r.photo + ')' : 'none'">
          <!-- The health grade moves here from the photo once the photo has scrolled away. -->
          <odm-grade-badge class="mini-grade" [compact]="true" [grade]="r.grade" />
          <h1 class="rest-name">{{ r.name }}</h1>
          <span class="rest-place">{{ place(r) }}</span>
          <span class="rest-tags">
            <span class="tag" [class.tag--open]="r.isOpen">{{ r.isOpen ? 'Open' : 'Closed' }}</span>
            @if (r.delivery) { <span class="tag tag--delivery">Delivery</span> }
          </span>
        </header>
        @if (menu(); as m) {
          @if (m.items.length) {
            <div class="cats" role="group" aria-label="Menu categories">
              <button type="button" class="cat" [class.on]="category() === ''" [class.has]="cartTotal()" [attr.aria-pressed]="category() === ''" (click)="pick('')">
                All
                @if (cartTotal(); as n) { <span class="badge"><span class="visually-hidden">, </span>{{ n }}<span class="visually-hidden"> in cart</span></span> }
              </button>
              @for (c of m.categories; track c.id) {
                <button type="button" class="cat" [class.on]="category() === c.id" [class.has]="inCart().get(c.id)" [attr.aria-pressed]="category() === c.id" (click)="pick(c.id)">
                  {{ c.name }}
                  @if (inCart().get(c.id); as n) { <span class="badge"><span class="visually-hidden">, </span>{{ n }}<span class="visually-hidden"> in cart</span></span> }
                </button>
              }
            </div>
          }
        }
      </div>
    }

    @if (error()) {
      <div class="app-note" role="alert">
        <p>{{ error() }}</p>
        <a class="btn btn--primary" routerLink="/order/restaurants">See all restaurants</a>
      </div>
    } @else if (menu(); as m) {
      @if (m.items.length) {
        <ul class="rows">
          @for (item of visible(); track item.id) {
            <li class="row" [id]="'dish-' + item.id" [class.row--out]="!item.available" [class.row--open]="openId() === item.id">
              @if (openId() === item.id) {
                <!-- Opened: two cards tall, laid out like the restaurant card (photo above, details below). -->
                <div class="big-pic" (click)="toggle(item.id)">
                  @if (item.photo) { <img [src]="item.photo" alt="" /> } @else { <mat-icon aria-hidden="true">restaurant</mat-icon> }
                  <button class="less" type="button" (click)="toggle(item.id); $event.stopPropagation()">Close <span aria-hidden="true">▴</span></button>
                </div>
                <div class="big-info">
                  <div class="text" (click)="toggle(item.id)">
                    <h2><button type="button" class="name" aria-expanded="true">{{ item.name }}</button></h2>
                    @if (item.description) { <p>{{ item.description }}</p> }
                  </div>
                  <ng-container *ngTemplateOutlet="buy; context: { $implicit: item }" />
                </div>
              } @else {
                <div class="text" (click)="toggle(item.id)">
                  <h2><button type="button" class="name" aria-expanded="false">{{ item.name }}</button></h2>
                  @if (item.description) { <p>{{ item.description }}</p> }
                </div>
                <ng-container *ngTemplateOutlet="buy; context: { $implicit: item }" />
                <span class="pic" aria-hidden="true" (click)="toggle(item.id)">
                  @if (item.photo) { <img [src]="item.photo" alt="" loading="lazy" /> } @else { <mat-icon>restaurant</mat-icon> }
                </span>
              }
            </li>
          }
        </ul>
      } @else {
        <div class="app-note"><p>This restaurant's menu is on its way. Please check back soon.</p></div>
      }

      <odm-cart-bar [slug]="slug()" [anchor]="stackEl()?.nativeElement" />

      <!-- Price and Order control, shared by the small and the opened dish card. -->
      <ng-template #buy let-item>
        <div class="buy">
          <span class="price">{{ price(item) }}</span>
          @if (!item.available) {
            <span class="soldout">Sold out</span>
          } @else if (qty(item); as n) {
            <span class="stepper">
              <button type="button" (click)="cart.remove(slug(), item.id)" [attr.aria-label]="'Remove one ' + item.name">−</button>
              <span aria-live="polite">{{ n }}</span>
              <button type="button" (click)="cart.add(slug(), item)" [attr.aria-label]="'Add one more ' + item.name">+</button>
            </span>
          } @else {
            <button class="order" type="button" (click)="cart.add(slug(), item)" [attr.aria-label]="'Order ' + item.name">Order</button>
          }
        </div>
      </ng-template>
    } @else {
      <p class="app-loading" role="status">Loading the menu…</p>
    }
  `,
  styles: [`
    /* No site footer on this screen (see app.ts): the screen fills the rest of the window and the cart bar is its foot,
       resting on the bottom edge even when the menu is short. */
    :host(.app-screen) { flex: 1 0 auto; display: flex; flex-direction: column; }
    :host(.app-screen) > .app-tab { align-self: flex-start; }
    :host(.app-screen) > odm-cart-bar { margin-top: auto; }
    .app-note { margin-bottom: 1rem; }
    /* The photo scrolls away; the name strip and category buttons below it stay under the site header. */
    .photo { position: relative; display: block; aspect-ratio: 16 / 8; max-height: 320px; width: 100%; overflow: hidden; border-radius: 12px 12px 0 0; background: var(--site-midnight); }
    .photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .grade { position: absolute; top: 10px; right: 10px; }
    .stuck-mark { display: block; height: 1px; margin-bottom: -1px; }
    .stack { position: sticky; top: var(--site-header-h); z-index: 15; margin: 0 0 0.5rem; }
    /* Once stuck, a blue backing hides the dishes passing underneath. */
    .stack.stuck { margin-inline: -6px; padding: 0 6px 2px; border-radius: 0 0 12px 12px; background: rgba(27, 87, 159, 0.94); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); box-shadow: 0 10px 18px -8px rgba(7, 24, 54, 0.6); }
    /* The strip's layout is the shared .rest-label (styles.scss), the same as on the restaurant list cards. */
    .info {
      position: relative; isolation: isolate; overflow: hidden;
      margin: 0 0 0.6rem; border-radius: 0 0 12px 12px;
      background: var(--site-cloud); box-shadow: 0 8px 22px rgba(7, 24, 54, 0.35);
    }
    /* The restaurant's photo, faded into the strip once the photo itself has scrolled away. */
    .info::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--strip-photo) center / cover no-repeat; opacity: 0; transition: opacity 0.35s ease; }
    .stuck .info::before { opacity: 0.22; }
    /* The small health grade: hidden while the photo (and its badge) is in view; slides in at the left once the strip is stuck. */
    .info { transition: padding 0.3s ease; }
    .rest-name, .rest-place { transition: font-size 0.3s ease; }
    .mini-grade { position: absolute; left: 0.6rem; top: 50%; opacity: 0; visibility: hidden; transform: translateY(-50%) scale(0.6); transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s 0.3s; }
    /* The text gives up a little size so the name still fits beside the grade on a phone. */
    .stuck .info { padding-left: calc(0.6rem + 2.5rem + 0.55rem); padding-right: 0.7rem; }
    .stuck .rest-name { font-size: 1.15rem; }
    .stuck .rest-place { font-size: 0.72rem; }
    .stuck .mini-grade { opacity: 1; visibility: visible; transform: translateY(-50%) scale(1); transition-delay: 0s; }
    @media (prefers-reduced-motion: reduce) { .info, .mini-grade, .rest-name, .rest-place { transition: none; } }

    /* Category buttons: one row that scrolls sideways when there are many. */
    .cats { display: flex; gap: 0.4rem; margin: 0; padding: 2px 2px 6px; overflow-x: auto; scrollbar-width: thin; }
    .cat {
      flex: 1 0 auto; min-width: 4.5rem; padding: 0.75rem 0.9rem; border: 0; border-radius: 6px;
      background: #e4e8ee; color: var(--site-midnight); font: 600 0.85rem/1 'Exo 2', Roboto, sans-serif;
      letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; cursor: pointer;
    }
    .cat.on { background: var(--site-accent); color: var(--site-on-accent); }
    /* A category holding something from the cart: coral edge plus a count, so it shows at a glance. */
    .cat { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; }
    .cat.has { box-shadow: inset 0 -4px 0 var(--site-pop); }
    .cat.has.on { box-shadow: inset 0 -4px 0 var(--site-accent-soft); }
    /* position: relative keeps the badge's screen-reader-only text inside the scrolling category bar.
       Without it that hidden text sat outside the bar and made the whole page wider than the screen. */
    .badge {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center; min-width: 1.35rem; height: 1.35rem; padding: 0 0.3rem;
      border-radius: 999px; background: var(--site-accent); color: var(--site-on-accent);
      font-size: 0.78rem; font-weight: 800; letter-spacing: 0; line-height: 1; font-variant-numeric: tabular-nums;
    }
    .cat.on .badge { background: var(--site-white); color: var(--site-accent-deep); }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .cat:focus-visible, .order:focus-visible, .stepper button:focus-visible, .app-tab--link:focus-visible { outline: 3px solid var(--site-white); outline-offset: 2px; }

    /* Dishes. The photo sits on the right, then on the left, row after row. The text column takes
       whatever width is left and wraps, so nothing runs off a narrow screen. */
    .rows { list-style: none; margin: 0 0 1rem; padding: 0; display: grid; gap: 4px; }
    .row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto 84px; grid-template-areas: "text buy pic";
      gap: 0.75rem; align-items: center; padding: 0.7rem 0.75rem; border-radius: 8px;
      /* Every dish card is the same height, however long its name or description. */
      height: 7.25rem; box-sizing: border-box; overflow: hidden;
      background: linear-gradient(to bottom right, var(--site-white), var(--site-tint));
    }
    .row:nth-child(even) { grid-template-columns: 84px auto minmax(0, 1fr); grid-template-areas: "pic buy text"; background: linear-gradient(to bottom left, var(--site-white), var(--site-tint)); }
    .text { grid-area: text; min-width: 0; text-align: right; cursor: pointer; }
    .row:nth-child(even) .text { text-align: left; }
    h2 { margin: 0; color: var(--site-midnight); font-size: 1rem; font-weight: 800; line-height: 1.25; text-transform: uppercase; overflow-wrap: anywhere; }
    .text p { margin: 0.25rem 0 0; color: var(--site-text); font-size: 0.92rem; line-height: 1.4; }
    /* Names and descriptions show two lines at most; anything longer ends in three dots. Pressing a dish opens it. */
    .name { all: unset; cursor: pointer; }
    .name:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 2px; border-radius: 3px; }
    .name, .text p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; padding-inline: 0.2em; }

    /* An opened dish: exactly two cards tall (plus the gap between them), photo above and details below, like the restaurant card. */
    .row.row--open, .row.row--open:nth-child(even) { display: flex; flex-direction: column; align-items: stretch; gap: 0; padding: 0; height: calc(14.5rem + 4px); box-shadow: 0 8px 20px rgba(7, 24, 54, 0.4); }
    .big-pic { position: relative; flex: 0 0 6rem; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #dfe6ef; cursor: pointer; }
    .big-pic img { width: 100%; height: 100%; object-fit: cover; }
    .big-pic mat-icon { color: var(--site-muted); font-size: 40px; width: 40px; height: 40px; }
    .less { position: absolute; top: 8px; right: 8px; padding: 0.35rem 0.65rem; border: 0; border-radius: 6px; background: var(--site-midnight); color: var(--site-white); font: 700 0.8rem/1 'Exo 2', Roboto, sans-serif; cursor: pointer; }
    .less:focus-visible { outline: 3px solid var(--site-white); outline-offset: 2px; }
    .big-info { flex: 1 1 auto; min-height: 0; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; padding: 0.6rem 0.75rem 0.7rem; }
    .row--open .text, .row.row--open:nth-child(even) .text { grid-area: auto; text-align: left; }
    .row--open .buy { grid-area: auto; }
    .row--open .text p { -webkit-line-clamp: 3; line-clamp: 3; }
    .buy { grid-area: buy; display: flex; flex-direction: column; align-items: stretch; gap: 0.4rem; min-width: 5.4rem; }
    .price { padding: 0.3rem 0.6rem; border: 1.5px solid var(--site-blue); border-radius: 8px; background: var(--site-white); color: var(--site-navy); font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
    .order { padding: 0.6rem 0.8rem; border: 1.5px solid var(--site-navy); border-radius: 6px; background: var(--site-white); color: var(--site-midnight); font: 700 1rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.06em; cursor: pointer; }
    .order:hover { background: var(--site-tint); }
    .stepper { display: grid; grid-template-columns: 2.1rem 1fr 2.1rem; align-items: center; border: 1.5px solid var(--site-accent); border-radius: 6px; background: var(--site-white); overflow: hidden; }
    .stepper span { color: var(--site-navy); font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; }
    .stepper button { height: 2.3rem; border: 0; background: var(--site-accent); color: var(--site-on-accent); font-size: 1.2rem; font-weight: 700; line-height: 1; cursor: pointer; }
    .soldout { color: var(--site-muted); font-size: 0.85rem; font-weight: 700; text-align: center; }
    .row--out h2, .row--out .price { color: var(--site-muted); }
    .pic { grid-area: pic; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 84px; height: 64px; overflow: hidden; border-radius: 8px; background: #dfe6ef; box-shadow: 0 3px 8px rgba(7, 24, 54, 0.25); }
    .pic img { width: 100%; height: 100%; object-fit: cover; }
    .pic mat-icon { color: var(--site-muted); }
    @media (max-width: 380px) {
      .row { grid-template-columns: minmax(0, 1fr) auto 64px; gap: 0.5rem; padding: 0.6rem; }
      .row:nth-child(even) { grid-template-columns: 64px auto minmax(0, 1fr); }
      .pic { width: 64px; height: 56px; }
      .buy { min-width: 4.9rem; }
    }
  `],
})
export class MenuPage {
  private readonly order = inject(OrderService);
  protected readonly cart = inject(CartService);

  protected readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')), { initialValue: '' });
  protected readonly menu = signal<Menu | undefined>(undefined);
  protected readonly error = signal('');
  /** The chosen category's id; '' shows every dish. */
  protected readonly category = signal('');

  /** Header details: from the loaded menu, or from the list the visitor just came from. */
  protected readonly restaurant = computed<Restaurant | undefined>(() => this.menu()?.restaurant ?? this.order.known(this.slug()));
  protected readonly visible = computed<MenuItem[]>(() => {
    const items = this.menu()?.items ?? [];
    const chosen = this.category();
    return chosen ? items.filter((i) => i.categoryIds.includes(chosen)) : items;
  });

  /** The dish whose card is opened (two cards tall); '' when none is. */
  protected readonly openId = signal('');

  /** True once the name strip has reached the site header and is staying there. */
  protected readonly stuck = signal(false);
  protected readonly stackEl = viewChild<ElementRef<HTMLElement>>('stack');
  private readonly backTab = viewChild<ElementRef<HTMLElement>>('backTab');
  private readonly stuckMark = viewChild<ElementRef<HTMLElement>>('stuckMark');
  private readonly chrome = inject(ChromeService);

  /** How many cart items sit in each category (by category id), for the marks on the category buttons. */
  protected readonly inCart = computed(() => {
    const perCategory = new Map<string, number>();
    const items = new Map((this.menu()?.items ?? []).map((i) => [i.id, i] as const));
    for (const line of this.cart.lines(this.slug())) {
      for (const categoryId of items.get(line.id)?.categoryIds ?? []) {
        perCategory.set(categoryId, (perCategory.get(categoryId) ?? 0) + line.qty);
      }
    }
    return perCategory;
  });
  protected readonly cartTotal = computed(() => this.cart.count(this.slug()));

  constructor() {
    this.watchScroll();
    // Load the menu whenever the address names a different restaurant.
    effect(() => {
      const slug = this.slug();
      this.menu.set(undefined);
      this.error.set('');
      this.category.set('');
      this.openId.set('');
      if (slug) void this.load(slug);
    });
  }

  /**
   * Follows two points as the page scrolls (browser only):
   *  - the "Restaurants" button: once it is 10px past the site header, the header shows "Restaurants" instead;
   *  - the top of the name strip: once it reaches the header, the strip is "stuck" and takes on the faded photo;
   *  - an opened dish: once it has gone 10px past the category buttons, it closes.
   */
  private watchScroll(): void {
    inject(DestroyRef).onDestroy(() => this.chrome.title.set(null));
    if (typeof IntersectionObserver === 'undefined') return;
    const HEADER = 73;   // matches --site-header-h
    const passed = (line: number, onChange: (isPast: boolean) => void) =>
      new IntersectionObserver(
        ([entry]) => onChange(!entry.isIntersecting && entry.boundingClientRect.bottom <= line + 1),
        { rootMargin: `-${line}px 0px 0px 0px` },
      );

    effect((onCleanup) => {
      const tab = this.backTab()?.nativeElement;
      if (!tab) return;
      const watcher = passed(HEADER - 10, (isPast) => this.chrome.title.set(
        isPast ? { lead: 'Resta', accent: 'urants', route: '/order/restaurants', label: 'Back to restaurants' } : null,
      ));
      watcher.observe(tab);
      onCleanup(() => watcher.disconnect());
    });
    effect((onCleanup) => {
      const mark = this.stuckMark()?.nativeElement;
      if (!mark) { this.stuck.set(false); return; }
      const watcher = passed(HEADER, (isPast) => this.stuck.set(isPast));
      watcher.observe(mark);
      onCleanup(() => watcher.disconnect());
    });
    // An opened dish closes by itself once it has scrolled 10px out of sight under the category buttons.
    effect((onCleanup) => {
      const row = this.openId() ? document.getElementById('dish-' + this.openId()) : null;
      if (!row) return;
      const underButtons = HEADER + Math.round(this.stackEl()?.nativeElement.getBoundingClientRect().height ?? 0);
      const watcher = passed(underButtons - 10, (isPast) => { if (isPast) this.closeAbove(row); });
      watcher.observe(row);
      onCleanup(() => watcher.disconnect());
    });
  }

  /** "Caribbean · Brooklyn": the line under the restaurant's name. */
  protected place(r: Restaurant): string {
    return [r.cuisine, r.city].filter(Boolean).join(' · ');
  }

  /** Opens a dish card, or closes it if it is the open one. Only one is open at a time. */
  protected toggle(itemId: string): void {
    this.openId.update((open) => (open === itemId ? '' : itemId));
  }

  /** Shows one category ('' = all) and closes any open dish, since it may not be in the new list. */
  protected pick(categoryId: string): void {
    this.category.set(categoryId);
    this.openId.set('');
  }

  /** Closes an open dish that has scrolled out above the screen, without letting the page jump. */
  private closeAbove(row: HTMLElement): void {
    const before = row.getBoundingClientRect().height;
    this.openId.set('');
    // Most browsers hold the view steady when something above it shrinks; for those that don't, do it by hand.
    if (typeof CSS !== 'undefined' && CSS.supports('overflow-anchor', 'auto')) return;
    requestAnimationFrame(() => window.scrollBy(0, row.getBoundingClientRect().height - before));
  }

  protected price(item: MenuItem): string {
    return money(item.priceCents);
  }
  protected qty(item: MenuItem): number {
    return this.cart.qty(this.slug(), item.id);
  }

  private async load(slug: string): Promise<void> {
    try {
      const menu = await this.order.loadMenu(slug);
      if (slug === this.slug()) this.menu.set(menu);
    } catch (e) {
      if (slug === this.slug()) this.error.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }
}
