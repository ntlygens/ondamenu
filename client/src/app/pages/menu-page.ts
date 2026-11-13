import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
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
  imports: [RouterLink, MatIconModule, CartBar, GradeBadge],
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
        <header class="info" [style.--strip-photo]="r.photo ? 'url(' + r.photo + ')' : 'none'">
          <h1>{{ r.name }}</h1>
          <span class="cuisine">{{ r.cuisine }}@if (r.city) { · {{ r.city }} }</span>
          <span class="tags">
            <span class="tag" [class.tag--open]="r.isOpen">{{ r.isOpen ? 'Open' : 'Closed' }}</span>
            @if (r.delivery) { <span class="tag tag--delivery">Delivery</span> }
            @if (r.pickup) { <span class="tag">Pickup</span> }
          </span>
        </header>
        @if (menu(); as m) {
          @if (m.items.length) {
            <div class="cats" role="group" aria-label="Menu categories">
              <button type="button" class="cat" [class.on]="category() === ''" [attr.aria-pressed]="category() === ''" (click)="category.set('')">All</button>
              @for (c of m.categories; track c.id) {
                <button type="button" class="cat" [class.on]="category() === c.id" [attr.aria-pressed]="category() === c.id" (click)="category.set(c.id)">{{ c.name }}</button>
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
            <li class="row" [class.row--out]="!item.available">
              <div class="text">
                <h2>{{ item.name }}</h2>
                @if (item.description) { <p>{{ item.description }}</p> }
              </div>
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
              <span class="pic" aria-hidden="true">
                @if (item.photo) { <img [src]="item.photo" alt="" loading="lazy" /> } @else { <mat-icon>restaurant</mat-icon> }
              </span>
            </li>
          }
        </ul>
      } @else {
        <div class="app-note"><p>This restaurant's menu is on its way. Please check back soon.</p></div>
      }

      <odm-cart-bar [slug]="slug()" [anchor]="stackEl()?.nativeElement" />
    } @else {
      <p class="app-loading" role="status">Loading the menu…</p>
    }
  `,
  styles: [`
    /* The photo scrolls away; the name strip and category buttons below it stay under the site header. */
    .photo { position: relative; display: block; aspect-ratio: 16 / 8; max-height: 320px; width: 100%; overflow: hidden; border-radius: 12px 12px 0 0; background: var(--site-midnight); }
    .photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .grade { position: absolute; top: 10px; right: 10px; }
    .stuck-mark { display: block; height: 1px; margin-bottom: -1px; }
    .stack { position: sticky; top: var(--site-header-h); z-index: 15; margin: 0 0 0.5rem; }
    /* Once stuck, a blue backing hides the dishes passing underneath. */
    .stack.stuck { margin-inline: -6px; padding: 0 6px 2px; border-radius: 0 0 12px 12px; background: rgba(27, 87, 159, 0.94); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); box-shadow: 0 10px 18px -8px rgba(7, 24, 54, 0.6); }
    .info {
      position: relative; isolation: isolate; overflow: hidden;
      display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.15rem 0.75rem; align-items: end;
      margin: 0 0 0.6rem; padding: 0.8rem 1rem 0.9rem; border-radius: 0 0 12px 12px;
      background: var(--site-cloud); box-shadow: 0 8px 22px rgba(7, 24, 54, 0.35);
    }
    /* The restaurant's photo, faded into the strip once the photo itself has scrolled away. */
    .info::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--strip-photo) center / cover no-repeat; opacity: 0; transition: opacity 0.35s ease; }
    .stuck .info::before { opacity: 0.22; }
    h1 { grid-column: 1 / -1; margin: 0; color: var(--site-navy); font-size: 1.5rem; line-height: 1.2; overflow-wrap: anywhere; }
    .cuisine { color: var(--site-accent-deep); font-style: italic; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; justify-content: flex-end; }

    /* Category buttons: one row that scrolls sideways when there are many. */
    .cats { display: flex; gap: 0.4rem; margin: 0; padding: 2px 2px 6px; overflow-x: auto; scrollbar-width: thin; }
    .cat {
      flex: 1 0 auto; min-width: 4.5rem; padding: 0.75rem 0.9rem; border: 0; border-radius: 6px;
      background: #e4e8ee; color: var(--site-midnight); font: 600 0.85rem/1 'Exo 2', Roboto, sans-serif;
      letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; cursor: pointer;
    }
    .cat.on { background: var(--site-accent); color: var(--site-on-accent); }
    .cat:focus-visible, .order:focus-visible, .stepper button:focus-visible, .app-tab--link:focus-visible { outline: 3px solid var(--site-white); outline-offset: 2px; }

    /* Dishes. The photo sits on the right, then on the left, row after row. The text column takes
       whatever width is left and wraps, so nothing runs off a narrow screen. */
    .rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto 84px; grid-template-areas: "text buy pic";
      gap: 0.75rem; align-items: center; padding: 0.7rem 0.75rem; border-radius: 8px;
      background: linear-gradient(to bottom right, var(--site-white), var(--site-tint));
    }
    .row:nth-child(even) { grid-template-columns: 84px auto minmax(0, 1fr); grid-template-areas: "pic buy text"; background: linear-gradient(to bottom left, var(--site-white), var(--site-tint)); }
    .text { grid-area: text; min-width: 0; text-align: right; }
    .row:nth-child(even) .text { text-align: left; }
    h2 { margin: 0; color: var(--site-midnight); font-size: 1rem; font-weight: 800; line-height: 1.25; text-transform: uppercase; overflow-wrap: anywhere; }
    .text p { margin: 0.25rem 0 0; color: var(--site-text); font-size: 0.92rem; line-height: 1.4; }
    .buy { grid-area: buy; display: flex; flex-direction: column; align-items: stretch; gap: 0.4rem; min-width: 5.4rem; }
    .price { padding: 0.3rem 0.6rem; border: 1.5px solid var(--site-blue); border-radius: 8px; background: var(--site-white); color: var(--site-navy); font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
    .order { padding: 0.6rem 0.8rem; border: 1.5px solid var(--site-navy); border-radius: 6px; background: var(--site-white); color: var(--site-midnight); font: 700 1rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.06em; cursor: pointer; }
    .order:hover { background: var(--site-tint); }
    .stepper { display: grid; grid-template-columns: 2.1rem 1fr 2.1rem; align-items: center; border: 1.5px solid var(--site-accent); border-radius: 6px; background: var(--site-white); overflow: hidden; }
    .stepper span { color: var(--site-navy); font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; }
    .stepper button { height: 2.3rem; border: 0; background: var(--site-accent); color: var(--site-on-accent); font-size: 1.2rem; font-weight: 700; line-height: 1; cursor: pointer; }
    .soldout { color: var(--site-muted); font-size: 0.85rem; font-weight: 700; text-align: center; }
    .row--out h2, .row--out .price { color: var(--site-muted); }
    .pic { grid-area: pic; display: flex; align-items: center; justify-content: center; width: 84px; height: 64px; overflow: hidden; border-radius: 8px; background: #dfe6ef; box-shadow: 0 3px 8px rgba(7, 24, 54, 0.25); }
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

  /** True once the name strip has reached the site header and is staying there. */
  protected readonly stuck = signal(false);
  protected readonly stackEl = viewChild<ElementRef<HTMLElement>>('stack');
  private readonly backTab = viewChild<ElementRef<HTMLElement>>('backTab');
  private readonly stuckMark = viewChild<ElementRef<HTMLElement>>('stuckMark');
  private readonly chrome = inject(ChromeService);

  constructor() {
    this.watchScroll();
    // Load the menu whenever the address names a different restaurant.
    effect(() => {
      const slug = this.slug();
      this.menu.set(undefined);
      this.error.set('');
      this.category.set('');
      if (slug) void this.load(slug);
    });
  }

  /**
   * Follows two points as the page scrolls (browser only):
   *  - the "Restaurants" button: once it is 10px past the site header, the header shows "Restaurants" instead;
   *  - the top of the name strip: once it reaches the header, the strip is "stuck" and takes on the faded photo.
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
