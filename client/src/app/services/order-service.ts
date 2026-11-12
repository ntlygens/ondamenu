import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Restaurant {
  slug: string;
  name: string;
  cuisine: string;
  tagline: string;
  photo: string;
  city: string;
  isOpen: boolean;
  pickup: boolean;
  delivery: boolean;
  /** NYC health inspection letter grade, or null when the city has not graded the restaurant yet. */
  grade: string | null;
}
export interface MenuCategory { id: string; name: string; }
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  photo: string;
  /** False when the dish is sold out for now: shown, but it cannot be ordered. */
  available: boolean;
  categoryIds: string[];
}
export interface Menu { restaurant: Restaurant; categories: MenuCategory[]; items: MenuItem[]; }

/** "$4.00" from 400. */
export const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

/**
 * Restaurants and menus for the ordering app (worker/order.mjs).
 * Loaded in the browser only, never during server rendering, so prices on screen are current
 * and cached pages stay the same for everyone.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly api = '/api/order';

  /** The restaurant list; null until it has loaded. */
  readonly restaurants = signal<Restaurant[] | null>(null);
  private readonly menus = new Map<string, Menu>();

  /** Loads the restaurant list. Throws an Error with a message to show. */
  async loadRestaurants(): Promise<void> {
    if (!this.inBrowser) return;
    const res = await this.get<{ restaurants: Restaurant[] }>('restaurants');
    this.restaurants.set(res.restaurants);
  }

  /** A restaurant's details if the list already has them, so its menu header can appear at once. */
  known(slug: string): Restaurant | undefined {
    return this.menus.get(slug)?.restaurant ?? this.restaurants()?.find((r) => r.slug === slug);
  }

  /** Loads one restaurant's menu (kept for the visit). Throws an Error with a message to show. */
  async loadMenu(slug: string): Promise<Menu | undefined> {
    if (!this.inBrowser) return undefined;
    const kept = this.menus.get(slug);
    if (kept) return kept;
    const menu = await this.get<Menu>(`restaurants/${encodeURIComponent(slug)}`);
    this.menus.set(slug, menu);
    return menu;
  }

  private async get<T>(path: string): Promise<T> {
    try {
      return await firstValueFrom(this.http.get<T>(`${this.api}/${path}`));
    } catch (e) {
      const message = e instanceof HttpErrorResponse && typeof e.error?.error === 'string'
        ? e.error.error
        : 'We could not reach OnDaMenu. Check your connection and try again.';
      throw new Error(message);
    }
  }
}
