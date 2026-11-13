import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuCategory } from './order-service';

export interface MerchantRestaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  city: string;
  photo: string;
  isOpen: boolean;
  /** Only 'live' restaurants are shown to diners. */
  status: 'draft' | 'live' | 'paused';
}
export interface MerchantItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  photo: string;
  /** False = sold out for now: shown to diners, but it cannot be ordered. */
  available: boolean;
  /** True = not on the menu at all. */
  hidden: boolean;
  categoryIds: string[];
}
export interface MerchantMenu { restaurant: MerchantRestaurant; categories: MenuCategory[]; items: MerchantItem[]; }
export type ItemChanges = Partial<Pick<MerchantItem, 'description' | 'priceCents' | 'available' | 'hidden'>>;

/** A restaurant's own menu tools (worker/merchant.mjs). Every call throws an Error with a message to show. */
@Injectable({ providedIn: 'root' })
export class MerchantService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/merchant';

  async restaurants(): Promise<MerchantRestaurant[]> {
    return (await this.run(this.http.get<{ restaurants: MerchantRestaurant[] }>(`${this.api}/restaurants`))).restaurants;
  }
  menu(restaurantId: string): Promise<MerchantMenu> {
    return this.run(this.http.get<MerchantMenu>(`${this.api}/restaurants/${encodeURIComponent(restaurantId)}`));
  }
  async setOpen(restaurantId: string, isOpen: boolean): Promise<MerchantRestaurant> {
    const url = `${this.api}/restaurants/${encodeURIComponent(restaurantId)}`;
    return (await this.run(this.http.post<{ restaurant: MerchantRestaurant }>(url, { isOpen }))).restaurant;
  }
  async saveItem(itemId: string, changes: ItemChanges): Promise<MerchantItem> {
    const url = `${this.api}/items/${encodeURIComponent(itemId)}`;
    return (await this.run(this.http.post<{ item: MerchantItem }>(url, changes))).item;
  }
  /** Sends a (already shrunk) photo, or removes the current one when `photo` is null. Returns the new address ('' = none). */
  async setPhoto(kind: 'items' | 'restaurants', id: string, photo: Blob | null): Promise<string> {
    const url = `${this.api}/${kind}/${encodeURIComponent(id)}/photo`;
    const call = photo
      ? this.http.put<{ photo: string }>(url, photo, { headers: { 'content-type': photo.type } })
      : this.http.delete<{ photo: string }>(url);
    return (await this.run(call)).photo;
  }

  private async run<T>(call: import('rxjs').Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(call);
    } catch (e) {
      const message = e instanceof HttpErrorResponse && typeof e.error?.error === 'string'
        ? e.error.error
        : 'We could not reach OnDaMenu. Check your connection and try again.';
      throw new Error(message);
    }
  }
}
