import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { CartLine, CartService } from '../services/cart-service';
import { money } from '../services/order-service';

/**
 * The shopping cart on a restaurant's menu.
 * Closed, it is a bar at the bottom of the screen with the item count and running total.
 * Pressed, it rises to just under the category buttons and lists everything in the cart to scroll through,
 * with the total and Submit at the end. Checkout itself is not built yet, so Submit says it opens soon.
 */
@Component({
  selector: 'odm-cart-bar',
  template: `
    @if (open()) {
      <section class="sheet" role="dialog" aria-label="Shopping cart"
               [style.top.px]="box().top" [style.left.px]="box().left" [style.width.px]="box().width">
        <header class="sheet-head">
          <h2>Shopping Cart <span class="count">{{ countLabel() }}</span></h2>
          <button class="close" type="button" (click)="close()">Close <span aria-hidden="true">▾</span></button>
        </header>

        @if (lines().length) {
          <ul class="lines">
            @for (line of lines(); track line.id) {
              <li class="line">
                <span class="dish">{{ line.name }}<small>{{ price(line.priceCents) }} each</small></span>
                <span class="stepper">
                  <button type="button" (click)="cart.remove(slug(), line.id)" [attr.aria-label]="'Remove one ' + line.name">−</button>
                  <span aria-live="polite">{{ line.qty }}</span>
                  <button type="button" (click)="cart.increment(slug(), line.id)" [attr.aria-label]="'Add one more ' + line.name">+</button>
                </span>
                <span class="sum">{{ lineTotal(line) }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">Your cart is empty. Press Order on a dish to add it.</p>
        }

        <footer class="sheet-foot">
          @if (notice()) {
            <p class="notice" role="status">Checkout opens soon. Your cart is saved while this tab stays open.</p>
          }
          <span class="total-label">Total<small>before tax and fees</small></span>
          <span class="total">{{ total() }}</span>
          <button class="submit" type="button" [disabled]="count() === 0" (click)="notice.set(true)">Submit</button>
        </footer>
      </section>
    } @else {
      <button class="bar" type="button" aria-haspopup="dialog" (click)="show()">
        <span class="title">Shopping Cart <span class="count">{{ countLabel() }}</span></span>
        <span class="total">{{ total() }}</span>
        <span class="view">View <span aria-hidden="true">▴</span></span>
      </button>
    }
  `,
  styles: [`
    /* Closed: sticks to the bottom of the screen while the menu is in view, then rests at the end of the menu. */
    :host { position: sticky; bottom: 0; z-index: 20; display: block; margin-top: 1rem; padding-bottom: env(safe-area-inset-bottom, 0px); }
    .bar {
      display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.9rem; width: 100%;
      padding: 0.7rem 1rem; border: 0; border-top: 4px solid var(--site-accent); border-radius: 10px 10px 0 0;
      background: var(--site-pop); color: var(--site-on-pop); font: inherit; text-align: left; cursor: pointer;
      box-shadow: 0 -6px 18px rgba(7, 24, 54, 0.35);
    }
    .bar:hover { background: var(--site-pop-hover); }
    .title { min-width: 0; font-weight: 700; }
    .count { display: block; font-size: 0.82rem; font-weight: 600; }
    .total { font-size: 1.25rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .view { padding: 0.55rem 0.9rem; border-radius: 6px; background: var(--site-on-pop); color: var(--site-white); font-weight: 700; letter-spacing: 0.04em; }

    /* Open: a panel from just under the category buttons to the bottom of the screen. */
    .sheet {
      position: fixed; bottom: 0; z-index: 30; display: flex; flex-direction: column; box-sizing: border-box;
      border-top: 4px solid var(--site-accent); border-radius: 10px 10px 0 0; overflow: hidden;
      background: var(--site-cloud); box-shadow: 0 -10px 30px rgba(7, 24, 54, 0.5);
      padding-bottom: env(safe-area-inset-bottom, 0px); animation: rise 0.28s ease-out;
    }
    @keyframes rise { from { transform: translateY(40%); opacity: 0; } to { transform: none; opacity: 1; } }
    .sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 1rem; background: var(--site-pop); color: var(--site-on-pop); }
    .sheet-head h2 { margin: 0; font-size: 1.05rem; font-weight: 700; }
    .close { padding: 0.5rem 0.9rem; border: 0; border-radius: 6px; background: var(--site-on-pop); color: var(--site-white); font: inherit; font-weight: 700; cursor: pointer; }
    .lines { flex: 1 1 auto; min-height: 0; margin: 0; padding: 0.4rem 0.75rem; list-style: none; overflow-y: auto; overscroll-behavior: contain; }
    .line { display: grid; grid-template-columns: minmax(0, 1fr) auto 4.6rem; align-items: center; gap: 0.75rem; padding: 0.7rem 0.25rem; border-bottom: 1px solid var(--site-line); }
    .line:last-child { border-bottom: 0; }
    .dish { min-width: 0; color: var(--site-midnight); font-weight: 800; text-transform: uppercase; overflow-wrap: anywhere; line-height: 1.25; }
    .dish small, .total-label small { display: block; color: var(--site-muted); font-size: 0.8rem; font-weight: 600; text-transform: none; }
    .sum { color: var(--site-navy); font-weight: 800; text-align: right; font-variant-numeric: tabular-nums; }
    .stepper { display: grid; grid-template-columns: 2.2rem 2rem 2.2rem; align-items: center; border: 1.5px solid var(--site-accent); border-radius: 6px; overflow: hidden; background: var(--site-white); }
    .stepper span { color: var(--site-navy); font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; }
    .stepper button { height: 2.3rem; border: 0; background: var(--site-accent); color: var(--site-on-accent); font-size: 1.2rem; font-weight: 700; line-height: 1; cursor: pointer; }
    .empty { flex: 1 1 auto; margin: 0; padding: 2rem 1.25rem; color: var(--site-text); font-size: 1.05rem; }
    .sheet-foot { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.9rem; padding: 0.7rem 1rem; border-top: 1px solid var(--site-line); background: var(--site-tint); }
    .notice { grid-column: 1 / -1; margin: 0; padding: 0.6rem 0.8rem; border-radius: 8px; background: var(--site-white); color: var(--site-text); border: 1px solid var(--site-line); }
    .total-label { color: var(--site-navy); font-weight: 700; }
    .sheet-foot .total { color: var(--site-navy); }
    .submit { padding: 0.75rem 1.4rem; border: 0; border-radius: 6px; background: var(--site-good); color: var(--site-white); font: 700 1rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.04em; cursor: pointer; }
    .submit[disabled] { opacity: 0.55; cursor: default; }
    .bar:focus-visible, .close:focus-visible, .submit:focus-visible, .stepper button:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
  `],
})
export class CartBar {
  readonly slug = input.required<string>();
  /** The open cart starts just under this element (the sticky restaurant strip and category buttons). */
  readonly anchor = input<HTMLElement>();

  protected readonly cart = inject(CartService);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly open = signal(false);
  protected readonly notice = signal(false);
  /** Where the open cart sits on screen, in pixels. */
  protected readonly box = signal({ top: 0, left: 0, width: 0 });

  protected readonly lines = computed<CartLine[]>(() => this.cart.lines(this.slug()));
  protected readonly count = computed(() => this.cart.count(this.slug()));
  protected readonly countLabel = computed(() => (this.count() === 1 ? '1 item' : `${this.count()} items`));
  protected readonly total = computed(() => money(this.cart.totalCents(this.slug())));

  protected price(cents: number): string {
    return money(cents);
  }
  protected lineTotal(line: CartLine): string {
    return money(line.priceCents * line.qty);
  }

  protected show(): void {
    this.measure();
    this.open.set(true);
  }

  @HostListener('document:keydown.escape')
  protected close(): void {
    this.open.set(false);
    this.notice.set(false);
  }

  /** Keeps the open cart lined up with the menu column while the page scrolls or the window changes size. */
  @HostListener('window:resize')
  @HostListener('window:scroll')
  protected onViewportChange(): void {
    if (this.open()) this.measure();
  }

  private measure(): void {
    if (typeof window === 'undefined') return;
    const column = this.host.getBoundingClientRect();
    const under = this.anchor()?.getBoundingClientRect().bottom ?? 0;
    // Never higher than the site header, never so low that the cart has no room.
    const top = Math.min(Math.max(under, 73), window.innerHeight - 220);
    this.box.set({ top: Math.round(top), left: Math.round(column.left), width: Math.round(column.width) });
  }
}
