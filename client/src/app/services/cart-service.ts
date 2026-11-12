import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MenuItem } from './order-service';

export interface CartLine { id: string; name: string; priceCents: number; qty: number; }
type Carts = Record<string, CartLine[]>;

const STORAGE_KEY = 'odm-cart-v1';
const MAX_PER_DISH = 20;

/**
 * The shopping cart: one cart per restaurant, kept in this browser tab until it is closed.
 * Prices here are for display; the server works out the real total at checkout.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly carts = signal<Carts>(this.restore());

  lines(slug: string): CartLine[] {
    return this.carts()[slug] ?? [];
  }
  qty(slug: string, itemId: string): number {
    return this.lines(slug).find((l) => l.id === itemId)?.qty ?? 0;
  }
  count(slug: string): number {
    return this.lines(slug).reduce((n, l) => n + l.qty, 0);
  }
  totalCents(slug: string): number {
    return this.lines(slug).reduce((sum, l) => sum + l.qty * l.priceCents, 0);
  }

  /** Adds one of a dish. */
  add(slug: string, item: MenuItem): void {
    const lines = this.lines(slug);
    const line = lines.find((l) => l.id === item.id);
    if (line && line.qty >= MAX_PER_DISH) return;
    this.save(slug, line
      ? lines.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
      : [...lines, { id: item.id, name: item.name, priceCents: item.priceCents, qty: 1 }]);
  }

  /** Takes one of a dish out; the line goes when none are left. */
  remove(slug: string, itemId: string): void {
    this.save(slug, this.lines(slug)
      .map((l) => (l.id === itemId ? { ...l, qty: l.qty - 1 } : l))
      .filter((l) => l.qty > 0));
  }

  clear(slug: string): void {
    this.save(slug, []);
  }

  private save(slug: string, lines: CartLine[]): void {
    const next = { ...this.carts(), [slug]: lines };
    if (!lines.length) delete next[slug];
    this.carts.set(next);
    if (!this.inBrowser) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable: the cart still works for this page */ }
  }

  private restore(): Carts {
    if (!this.inBrowser) return {};
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
      return saved && typeof saved === 'object' ? (saved as Carts) : {};
    } catch {
      return {};
    }
  }
}
