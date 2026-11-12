import { Component, computed, inject, input, signal } from '@angular/core';
import { CartService } from '../services/cart-service';
import { money } from '../services/order-service';

/**
 * The shopping cart bar that stays at the bottom of a restaurant's menu: item count, running total and Submit.
 * Checkout itself is not built yet, so Submit explains that it opens soon.
 */
@Component({
  selector: 'odm-cart-bar',
  template: `
    @if (notice()) {
      <p class="notice" role="status">
        Checkout opens soon. Your cart is saved while this tab stays open.
        <button type="button" (click)="notice.set(false)">OK</button>
      </p>
    }
    <div class="bar">
      <span class="title">Shopping Cart <span class="count">{{ count() === 1 ? '1 item' : count() + ' items' }}</span></span>
      <span class="total" aria-label="Cart total">{{ total() }}</span>
      <button class="submit" type="button" [disabled]="count() === 0" (click)="notice.set(true)">Submit</button>
    </div>
  `,
  styles: [`
    /* Sticks to the bottom of the screen while the menu is in view, then rests at the end of the menu. */
    :host { position: sticky; bottom: 0; z-index: 20; display: block; margin-top: 1rem; padding-bottom: env(safe-area-inset-bottom, 0px); }
    .bar {
      display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.75rem;
      padding: 0.6rem 0.75rem 0.6rem 1rem; border-top: 4px solid var(--site-accent); border-radius: 10px 10px 0 0;
      background: var(--site-pop); color: var(--site-on-pop); box-shadow: 0 -6px 18px rgba(7, 24, 54, 0.35);
    }
    .title { min-width: 0; font-weight: 700; }
    .count { display: block; font-size: 0.82rem; font-weight: 600; }
    .total { font-size: 1.25rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .submit {
      padding: 0.7rem 1.3rem; border: 0; border-radius: 6px; background: var(--site-good); color: var(--site-white);
      font: 700 1rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.04em; cursor: pointer;
    }
    .submit[disabled] { opacity: 0.55; cursor: default; }
    .submit:focus-visible, .notice button:focus-visible { outline: 3px solid var(--site-white); outline-offset: 2px; }
    .notice {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin: 0 0 0.4rem; padding: 0.7rem 0.9rem;
      border-radius: 10px; background: var(--site-cloud); color: var(--site-text); box-shadow: 0 6px 18px rgba(7, 24, 54, 0.35);
    }
    .notice button { flex: none; padding: 0.4rem 0.9rem; border: 1px solid var(--site-navy); border-radius: 6px; background: var(--site-white); color: var(--site-navy); font: inherit; font-weight: 700; cursor: pointer; }
  `],
})
export class CartBar {
  readonly slug = input.required<string>();
  private readonly cart = inject(CartService);

  protected readonly count = computed(() => this.cart.count(this.slug()));
  protected readonly total = computed(() => money(this.cart.totalCents(this.slug())));
  protected readonly notice = signal(false);
}
