import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CloverCard } from '../core/clover-card';
import { RoleGate } from '../core/role-gate';
import { shrinkPhoto } from '../core/shrink-photo';
import { AuthService, Role } from '../services/auth-service';
import { ItemChanges, MerchantItem, MerchantMenu, MerchantRestaurant, MerchantService } from '../services/merchant-service';
import { money } from '../services/order-service';

/** Photos are shrunk to these sizes in the browser before upload (the server refuses anything over 400 KB). */
const DISH_PHOTO = { side: 1000, bytes: 200 * 1024 };
const HEADER_PHOTO = { side: 1600, bytes: 350 * 1024 };
const MAX_DESCRIPTION = 300;

interface Draft { description: string; price: string; soldOut: boolean; hidden: boolean; }

/**
 * A restaurant's menu tools: open or close for orders, change the header photo, and for each dish
 * edit the description, price and photo, mark it sold out or take it off the menu.
 * Dish names and categories are not edited here: they will come from the restaurant's till (Clover).
 */
@Component({
  selector: 'odm-merchant-page',
  imports: [RouterLink, MatIconModule, RoleGate, CloverCard],
  host: { class: 'page' },
  template: `
    <section class="panel panel--wide">
      <odm-role-gate [role]="roles" denied="This area is for restaurant accounts. If you run a restaurant and want to join OnDaMenu, get in touch and we will set you up.">
        <p class="eyebrow">Restaurant account</p>

        @if (restaurants(); as list) {
          @if (!list.length) {
            <h1>Your restaurant</h1>
            <p class="lede">No restaurant is linked to this account yet. Get in touch and we will connect it.</p>
            <a class="btn btn--primary" routerLink="/contact">Get in touch</a>
          } @else {
            <h1>{{ menu()?.restaurant?.name ?? 'Your restaurant' }}</h1>
            @if (list.length > 1) {
              <label class="pick">Restaurant
                <select (change)="choose($any($event.target).value)">
                  @for (r of list; track r.id) { <option [value]="r.id" [selected]="r.id === currentId()">{{ r.name }}</option> }
                </select>
              </label>
            }

            @if (menu(); as m) {
              <div class="shop">
                <span class="shop-photo">
                  @if (m.restaurant.photo) { <img [src]="m.restaurant.photo" alt="" /> } @else { <mat-icon aria-hidden="true">storefront</mat-icon> }
                </span>
                <div class="shop-info">
                  <strong>{{ m.restaurant.isOpen ? 'Open for orders' : 'Closed' }}</strong>
                  <span>{{ statusNote(m.restaurant) }}</span>
                </div>
                <div class="shop-actions">
                  <button type="button" class="mini" [class.mini--on]="m.restaurant.isOpen" [disabled]="busy()" (click)="toggleOpen(m.restaurant)">
                    {{ m.restaurant.isOpen ? 'Close for now' : 'Open for orders' }}
                  </button>
                  <label class="mini" [class.mini--off]="busy()">
                    Header photo
                    <input class="visually-hidden" type="file" accept="image/*" [disabled]="busy()" (change)="headerPhoto($any($event.target))" />
                  </label>
                  @if (m.restaurant.status === 'live') { <a class="mini" [routerLink]="['/order/r', m.restaurant.slug]">View menu page</a> }
                </div>
              </div>
              <p class="msg" role="status">{{ message() }}</p>
              <odm-clover-card [restaurantId]="m.restaurant.id" (menuChanged)="reloadMenu()" />

              <div class="filters">
                <label>Find a dish
                  <input type="search" autocomplete="off" placeholder="Type part of a name" [value]="search()" (input)="search.set($any($event.target).value)" />
                </label>
                <label>Category
                  <select (change)="category.set($any($event.target).value)">
                    <option value="">All</option>
                    @for (c of m.categories; track c.id) { <option [value]="c.id" [selected]="c.id === category()">{{ c.name }}</option> }
                  </select>
                </label>
              </div>
              <p class="count">{{ shown().length }} of {{ m.items.length }} dishes</p>

              <ul class="dishes">
                @for (item of shown(); track item.id) {
                  <li class="dish" [class.dish--open]="openId() === item.id">
                    <button type="button" class="row" [attr.aria-expanded]="openId() === item.id" (click)="toggle(item)">
                      <span class="thumb">
                        @if (item.photo) { <img [src]="item.photo" alt="" loading="lazy" /> } @else { <mat-icon aria-hidden="true">restaurant</mat-icon> }
                      </span>
                      <span class="name">{{ item.name }}</span>
                      <span class="facts">
                        <span>{{ price(item.priceCents) }}</span>
                        @if (item.hidden) { <span class="flag flag--off">Off the menu</span> }
                        @else if (!item.available) { <span class="flag flag--warn">Sold out</span> }
                        @if (!item.description) { <span class="flag">No description</span> }
                        @if (!item.photo) { <span class="flag">No photo</span> }
                      </span>
                      <span class="edit">{{ openId() === item.id ? 'Close' : 'Edit' }}</span>
                    </button>

                    @if (openId() === item.id) {
                      <form class="editor" (submit)="save($event, item)" novalidate>
                        <label [attr.for]="'d-' + item.id">Description <small>{{ draft().description.length }} / {{ maxDescription }}</small></label>
                        <textarea [id]="'d-' + item.id" rows="3" [attr.maxlength]="maxDescription" [value]="draft().description"
                                  (input)="patch({ description: $any($event.target).value })"
                                  placeholder="What is in it, how it is cooked, what it comes with."></textarea>

                        <div class="pair">
                          <label [attr.for]="'p-' + item.id">Price
                            <span class="money"><span aria-hidden="true">$</span>
                              <input [id]="'p-' + item.id" type="text" inputmode="decimal" autocomplete="off" [value]="draft().price"
                                     (input)="patch({ price: $any($event.target).value })" />
                            </span>
                          </label>
                          <div class="ticks">
                            <label class="tick"><input type="checkbox" [checked]="draft().soldOut" (change)="patch({ soldOut: $any($event.target).checked })" /> Sold out for now</label>
                            <label class="tick"><input type="checkbox" [checked]="draft().hidden" (change)="patch({ hidden: $any($event.target).checked })" /> Take off the menu</label>
                          </div>
                        </div>

                        <div class="photo-row">
                          <span class="big-thumb">
                            @if (item.photo) { <img [src]="item.photo" alt="" /> } @else { <mat-icon aria-hidden="true">photo_camera</mat-icon> }
                          </span>
                          <div class="photo-actions">
                            <label class="mini" [class.mini--off]="busy()">
                              {{ item.photo ? 'Replace photo' : 'Add a photo' }}
                              <input class="visually-hidden" type="file" accept="image/*" [disabled]="busy()" (change)="dishPhoto(item, $any($event.target))" />
                            </label>
                            @if (item.photo) { <button type="button" class="mini" [disabled]="busy()" (click)="removeDishPhoto(item)">Remove photo</button> }
                            <small>Any photo from your phone or computer. We shrink it for you before it is saved.</small>
                          </div>
                        </div>

                        <p class="msg" role="status">{{ itemMessage() }}</p>
                        <div class="buttons">
                          <button class="btn btn--primary" type="submit" [disabled]="busy()">Save</button>
                          <button class="btn btn--ghost" type="button" (click)="openId.set('')">Cancel</button>
                        </div>
                      </form>
                    }
                  </li>
                } @empty {
                  <li class="none">No dishes match.</li>
                }
              </ul>
            } @else {
              <p class="lede" role="status">{{ message() || 'Loading your menu…' }}</p>
            }
          }
        } @else {
          <h1>Your restaurant</h1>
          <p class="lede" role="status">{{ message() || 'Loading…' }}</p>
        }

        <p class="fine"><a routerLink="/account">Back to your account</a></p>
      </odm-role-gate>
    </section>
  `,
  styles: [`
    label { color: var(--site-navy); font-weight: 600; }
    input[type=search], input[type=text], select, textarea {
      box-sizing: border-box; width: 100%; padding: 0.7rem 0.85rem; border: 1px solid var(--site-muted); border-radius: 10px;
      font: inherit; font-size: 1rem; color: var(--site-navy); background: var(--site-white);
    }
    input:focus-visible, select:focus-visible, textarea:focus-visible, .row:focus-visible, .mini:focus-visible, .mini:focus-within { outline: 3px solid var(--site-blue); outline-offset: 1px; }
    textarea { resize: vertical; min-height: 5.2rem; line-height: 1.45; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .fine { margin: 1rem 0 0; color: var(--site-muted); font-size: 0.92rem; }
    .fine a { color: var(--site-blue); font-weight: 600; }
    .pick { display: grid; gap: 0.35rem; max-width: 22rem; margin: 0 0 1rem; }
    .msg { min-height: 1.3em; margin: 0.6rem 0; color: var(--site-accent-deep); font-weight: 600; }
    .btn { border: 0; cursor: pointer; font-family: inherit; }
    .btn--ghost { border: 1px solid var(--site-navy); }
    .btn[disabled], .mini[disabled], .mini--off { opacity: 0.6; cursor: default; transform: none; }

    /* Small buttons: restaurant actions and photo actions. One size everywhere. */
    .mini {
      /* position: the hidden file input inside a label stays within its button */
      position: relative; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; height: 2.4rem; padding: 0 0.95rem;
      border: 1px solid var(--site-navy); border-radius: 999px; background: var(--site-white); color: var(--site-navy);
      font: inherit; font-size: 0.92rem; font-weight: 700; text-decoration: none; white-space: nowrap; cursor: pointer;
    }
    .mini--on { background: var(--site-navy); color: var(--site-white); }

    /* The restaurant: photo, open or closed, actions. */
    .shop { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 0.75rem 1rem; align-items: center; padding: 0.9rem; border: 1px solid var(--site-line); border-radius: 12px; background: var(--site-tint); }
    .shop-photo, .thumb, .big-thumb { display: grid; place-items: center; overflow: hidden; border-radius: 8px; background: var(--site-midnight); color: var(--site-accent-soft); }
    .shop-photo { width: 72px; height: 72px; }
    .shop-photo img, .thumb img, .big-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .shop-info { min-width: 0; display: grid; gap: 0.15rem; }
    .shop-info strong { color: var(--site-navy); font-size: 1.15rem; }
    .shop-info span { color: var(--site-muted); font-size: 0.9rem; }
    .shop-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 14rem); gap: 0.75rem; margin-top: 0.5rem; }
    .filters label { display: grid; gap: 0.35rem; }
    .count { margin: 0.6rem 0; color: var(--site-muted); font-size: 0.9rem; }

    /* One dish per row; every row is the same height whatever the dish holds. */
    .dishes { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .dish { border: 1px solid var(--site-line); border-radius: 12px; background: var(--site-white); overflow: hidden; }
    .dish--open { border-color: var(--site-navy); }
    .row {
      display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; grid-template-areas: "pic name edit" "pic facts edit";
      column-gap: 0.75rem; align-items: center; align-content: center; box-sizing: border-box; width: 100%; height: 4.5rem; padding: 0 0.75rem 0 0.5rem;
      border: 0; background: none; font: inherit; text-align: left; cursor: pointer;
    }
    .row:hover { background: var(--site-tint); }
    .thumb { grid-area: pic; width: 56px; height: 56px; }
    .name { grid-area: name; min-width: 0; color: var(--site-midnight); font-weight: 800; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .facts { grid-area: facts; min-width: 0; display: flex; gap: 0.4rem; align-items: center; color: var(--site-text); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; }
    .flag { flex: 0 0 auto; padding: 0.12rem 0.45rem; border-radius: 5px; background: #e4e8ee; color: var(--site-midnight); font-size: 0.74rem; font-weight: 700; }
    .flag--warn { background: #ffe9cf; color: var(--site-warning-text); }
    .flag--off { background: var(--site-midnight); color: var(--site-white); }
    .edit { grid-area: edit; color: var(--site-accent-deep); font-weight: 700; }

    .editor { display: grid; gap: 0.6rem; padding: 0.9rem; border-top: 1px solid var(--site-line); background: var(--site-cloud); }
    .editor label small, .photo-actions small { color: var(--site-muted); font-weight: 600; }
    .editor > label { display: flex; justify-content: space-between; gap: 1rem; }
    .pair { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 1rem; align-items: end; }
    .pair > label { display: grid; gap: 0.35rem; }
    .money { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 0.4rem; }
    .ticks { display: grid; gap: 0.45rem; padding-bottom: 0.2rem; }
    .tick { display: flex; align-items: center; gap: 0.5rem; color: var(--site-text); cursor: pointer; }
    .tick input { width: 1.15rem; height: 1.15rem; margin: 0; accent-color: var(--site-accent); }
    .photo-row { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 0.9rem; align-items: center; }
    .big-thumb { width: 96px; height: 96px; }
    .photo-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .photo-actions small { flex: 1 0 100%; }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .none { padding: 1rem; color: var(--site-muted); }

    @media (max-width: 560px) {
      .filters, .pair { grid-template-columns: minmax(0, 1fr); }
      .pair { align-items: stretch; }
    }
    @media (max-width: 400px) { .photo-row { grid-template-columns: minmax(0, 1fr); } }
  `],
})
export class MerchantPage {
  private readonly api = inject(MerchantService);
  private readonly auth = inject(AuthService);

  protected readonly roles: Role[] = ['merchant', 'admin'];
  protected readonly maxDescription = MAX_DESCRIPTION;

  /** Restaurants this account manages; null until loaded. */
  protected readonly restaurants = signal<MerchantRestaurant[] | null>(null);
  protected readonly currentId = signal('');
  protected readonly menu = signal<MerchantMenu | null>(null);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly itemMessage = signal('');

  protected readonly search = signal('');
  protected readonly category = signal('');
  /** The dish being edited ('' = none) and what has been typed for it. */
  protected readonly openId = signal('');
  protected readonly draft = signal<Draft>({ description: '', price: '', soldOut: false, hidden: false });

  protected readonly shown = computed(() => {
    const text = this.search().trim().toLowerCase();
    const category = this.category();
    return (this.menu()?.items ?? []).filter((item) =>
      (!text || item.name.toLowerCase().includes(text)) && (!category || item.categoryIds.includes(category)));
  });

  constructor() {
    // Load once a restaurant account (or an administrator) is confirmed.
    let started = false;
    effect(() => {
      if (!started && (this.auth.hasRole('merchant') || this.auth.hasRole('admin'))) {
        started = true;
        void this.start();
      }
    });
  }

  protected price(cents: number): string {
    return money(cents);
  }

  protected statusNote(r: MerchantRestaurant): string {
    if (r.status === 'draft') return 'Not yet listed: diners cannot see this restaurant.';
    if (r.status === 'paused') return 'Listing paused: diners cannot see this restaurant.';
    return r.isOpen ? 'Diners can see your menu and order.' : 'Diners can see your menu and that you are closed.';
  }

  /** Reloads the dish list after the till brought in changes. */
  protected async reloadMenu(): Promise<void> {
    const id = this.currentId();
    if (id) await this.run(this.message, async () => this.menu.set(await this.api.menu(id)));
  }

  protected async choose(id: string): Promise<void> {
    this.currentId.set(id);
    this.menu.set(null);
    this.openId.set('');
    this.category.set('');
    this.search.set('');
    await this.run(this.message, async () => this.menu.set(await this.api.menu(id)));
  }

  protected async toggleOpen(r: MerchantRestaurant): Promise<void> {
    await this.run(this.message, async () => {
      const restaurant = await this.api.setOpen(r.id, !r.isOpen);
      this.menu.update((m) => (m ? { ...m, restaurant } : m));
      this.message.set(restaurant.isOpen ? 'You are open for orders.' : 'You are closed for now.');
    });
  }

  protected async headerPhoto(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    const r = this.menu()?.restaurant;
    if (!file || !r) return;
    await this.run(this.message, async () => {
      const photo = await this.api.setPhoto('restaurants', r.id, await shrinkPhoto(file, HEADER_PHOTO.side, HEADER_PHOTO.bytes));
      this.menu.update((m) => (m ? { ...m, restaurant: { ...m.restaurant, photo } } : m));
      this.message.set('Header photo saved.');
    });
  }

  protected toggle(item: MerchantItem): void {
    this.itemMessage.set('');
    if (this.openId() === item.id) {
      this.openId.set('');
      return;
    }
    this.draft.set({
      description: item.description, price: (item.priceCents / 100).toFixed(2), soldOut: !item.available, hidden: item.hidden,
    });
    this.openId.set(item.id);
  }

  protected patch(change: Partial<Draft>): void {
    this.draft.update((d) => ({ ...d, ...change }));
  }

  protected async save(event: Event, item: MerchantItem): Promise<void> {
    event.preventDefault();
    const d = this.draft();
    const typed = d.price.trim().replace(/^\$/, '');
    if (!/^\d{1,4}(\.\d{1,2})?$/.test(typed)) {
      this.itemMessage.set('Enter the price as dollars and cents, for example 12.50.');
      return;
    }
    const changes: ItemChanges = {
      description: d.description, priceCents: Math.round(Number(typed) * 100), available: !d.soldOut, hidden: d.hidden,
    };
    await this.run(this.itemMessage, async () => {
      this.replace(await this.api.saveItem(item.id, changes));
      this.openId.set('');
      this.message.set(`Saved ${item.name}.`);
    });
  }

  protected async dishPhoto(item: MerchantItem, input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    await this.run(this.itemMessage, async () => {
      const photo = await this.api.setPhoto('items', item.id, await shrinkPhoto(file, DISH_PHOTO.side, DISH_PHOTO.bytes));
      this.replace({ ...item, photo });
      this.itemMessage.set('Photo saved.');
    });
  }

  protected async removeDishPhoto(item: MerchantItem): Promise<void> {
    await this.run(this.itemMessage, async () => {
      const photo = await this.api.setPhoto('items', item.id, null);
      this.replace({ ...item, photo });
      this.itemMessage.set('Photo removed.');
    });
  }

  private async start(): Promise<void> {
    await this.run(this.message, async () => {
      const list = await this.api.restaurants();
      this.restaurants.set(list);
      if (list.length) {
        this.currentId.set(list[0].id);
        this.menu.set(await this.api.menu(list[0].id));
      }
    });
  }

  /** Puts a changed dish back in the list, keeping what the photo calls did not return. */
  private replace(item: MerchantItem): void {
    this.menu.update((m) => (m ? { ...m, items: m.items.map((i) => (i.id === item.id ? { ...i, ...item } : i)) } : m));
  }

  private async run(target: { set(value: string): void }, task: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    target.set('');
    try {
      await task();
    } catch (e) {
      target.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
