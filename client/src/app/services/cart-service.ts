import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Menu, MenuItem, OptionChoice } from './order-service';

/**
 * One line of the cart. A plain dish has id = the dish id and nothing else (exactly as before dish options existed).
 * A dish with chosen options has its own line per combination: id = dish id + the option ids, with `itemId`,
 * `optionIds` and `extra` (the choices in words) set, and priceCents already including the options.
 */
export interface CartLine { id: string; name: string; priceCents: number; qty: number; itemId?: string; optionIds?: string[]; extra?: string; }
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
  /** How many of a dish are in the cart, whatever options they were chosen with. */
  qty(slug: string, itemId: string): number {
    return this.lines(slug).filter((l) => (l.itemId ?? l.id) === itemId).reduce((n, l) => n + l.qty, 0);
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

  /** Adds one of a dish with chosen options (its own line per combination of choices). */
  addWithOptions(slug: string, item: MenuItem, chosen: OptionChoice[]): void {
    const ids = chosen.map((c) => c.id).sort();
    const id = `${item.id}~${ids.join('.')}`;
    const lines = this.lines(slug);
    const line = lines.find((l) => l.id === id);
    if (line && line.qty >= MAX_PER_DISH) return;
    const price = item.priceCents + chosen.reduce((sum, c) => sum + c.priceCents, 0);
    this.save(slug, line
      ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
      : [...lines, { id, itemId: item.id, name: item.name, priceCents: price, qty: 1, optionIds: ids, extra: chosen.map((c) => c.name).join(', ') }]);
  }

  /**
   * Called when a menu loads: makes the cart agree with it. Lines whose options are no longer offered (switched off,
   * removed at the till, or a choice now required) are dropped, and option prices are refreshed. Plain dishes are untouched,
   * so turning dish options off never leaves a cart that cannot be ordered.
   */
  reconcile(slug: string, menu: Menu): void {
    const lines = this.lines(slug);
    if (!lines.length) return;
    const items = new Map(menu.items.map((i) => [i.id, i] as const));
    const groups = new Map((menu.groups ?? []).map((g) => [g.id, g] as const));
    const options = new Map((menu.groups ?? []).flatMap((g) => g.options.map((o) => [o.id, o] as const)));
    const next: CartLine[] = [];
    for (const line of lines) {
      const item = items.get(line.itemId ?? line.id);
      if (!item) { next.push(line); continue; }   // a dish the menu no longer lists: leave it, checkout will say so
      const required = (item.groupIds ?? []).some((gid) => (groups.get(gid)?.min ?? 0) > 0);
      if (line.optionIds?.length) {
        const chosen = line.optionIds.map((id) => options.get(id));
        if (!item.groupIds?.length || chosen.some((o) => !o)) continue;
        next.push({ ...line, priceCents: item.priceCents + chosen.reduce((sum, o) => sum + (o?.priceCents ?? 0), 0) });
      } else if (required) {
        continue;
      } else {
        next.push(line);
      }
    }
    if (next.length !== lines.length || next.some((l, n) => l !== lines[n])) this.save(slug, next);
  }

  /** Adds one more of a dish that is already in the cart. */
  increment(slug: string, itemId: string): void {
    this.save(slug, this.lines(slug).map((l) => (l.id === itemId && l.qty < MAX_PER_DISH ? { ...l, qty: l.qty + 1 } : l)));
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
