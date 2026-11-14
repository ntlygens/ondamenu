import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CloverCard } from './clover-card';
import { firstValueFrom } from 'rxjs';

type Status = 'draft' | 'live' | 'paused';
interface Staff { id: string; email: string | null; name: string; last_login: number | null; }
interface AdminRestaurant {
  id: string; slug: string; name: string; cuisine: string; tagline: string; phone: string;
  address: string; city: string; state: string; zip: string; camis: string;
  offersDelivery: boolean; isOpen: boolean; status: Status; grade: string | null; dishes: number; staff: Staff[];
}
/** What the form holds while a restaurant is being added or edited. */
interface Draft {
  name: string; cuisine: string; tagline: string; phone: string; address: string; city: string; state: string; zip: string;
  camis: string; offersDelivery: boolean; status: Status;
}
const EMPTY: Draft = {
  name: '', cuisine: '', tagline: '', phone: '', address: '', city: '', state: 'NY', zip: '', camis: '', offersDelivery: false, status: 'draft',
};
const TEXT_FIELDS: { key: keyof Draft; label: string; max: number; hint?: string; mode?: string }[] = [
  { key: 'name', label: 'Name', max: 80 },
  { key: 'cuisine', label: 'Food type', max: 40, hint: 'For example Caribbean' },
  { key: 'tagline', label: 'Short line under the name', max: 140 },
  { key: 'phone', label: 'Phone', max: 20, mode: 'tel' },
  { key: 'address', label: 'Street address', max: 120 },
  { key: 'city', label: 'City', max: 60 },
  { key: 'state', label: 'State', max: 2 },
  { key: 'zip', label: 'ZIP code', max: 5, mode: 'numeric' },
  { key: 'camis', label: 'NYC Health Department id (CAMIS)', max: 10, mode: 'numeric', hint: 'Used to look up the inspection grade' },
];
const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', live: 'Live', paused: 'Paused' };

/**
 * Administrators add restaurants, change their details, decide whether diners can see them,
 * and say which accounts may manage each one (worker/admin.mjs).
 */
@Component({
  selector: 'odm-admin-restaurants',
  imports: [RouterLink, CloverCard],
  template: `
    <h2>Restaurants</h2>
    <p class="lede">Add a restaurant, set whether diners can see it, and choose who may manage its menu.</p>

    <div class="top">
      <button type="button" class="btn btn--primary" [disabled]="busy()" (click)="startNew()">Add a restaurant</button>
      <span class="msg" role="status">{{ message() }}</span>
    </div>

    @if (openId() === 'new') {
      <form class="editor editor--new" (submit)="save($event)" novalidate>
        <h3>New restaurant</h3>
        <div class="fields">
          @for (f of fields; track f.key) {
            @if (f.key !== 'tagline') {
              <label [class.wide]="f.key === 'name' || f.key === 'address' || f.key === 'camis'">{{ f.label }}
                <input type="text" autocomplete="off" [attr.inputmode]="f.mode ?? null" [attr.maxlength]="f.max" [attr.placeholder]="f.hint ?? null"
                       [value]="draft()[f.key]" (input)="patch(f.key, $any($event.target).value)" />
              </label>
            }
          }
        </div>
        <label class="tick"><input type="checkbox" [checked]="draft().offersDelivery" (change)="patch('offersDelivery', $any($event.target).checked)" /> Offers delivery</label>
        <p class="note">A new restaurant starts as a draft: diners cannot see it until you set it live.</p>
        <p class="msg" role="status">{{ formMessage() }}</p>
        <div class="buttons">
          <button class="btn btn--primary" type="submit" [disabled]="busy()">Create</button>
          <button class="btn btn--ghost" type="button" (click)="openId.set('')">Cancel</button>
        </div>
      </form>
    }

    <ul class="list">
      @for (r of restaurants(); track r.id) {
        <li class="item" [class.item--open]="openId() === r.id">
          <button type="button" class="row" [attr.aria-expanded]="openId() === r.id" (click)="toggle(r)">
            <span class="name">{{ r.name }}</span>
            <span class="facts">{{ facts(r) }}</span>
            <span class="status status--{{ r.status }}">{{ statusLabel[r.status] }}</span>
            <span class="edit">{{ openId() === r.id ? 'Close' : 'Edit' }}</span>
          </button>

          @if (openId() === r.id) {
            <form class="editor" (submit)="save($event, r)" novalidate>
              <div class="fields">
                @for (f of fields; track f.key) {
                  <label [class.wide]="f.key === 'name' || f.key === 'address' || f.key === 'tagline' || f.key === 'camis'">{{ f.label }}
                    <input type="text" autocomplete="off" [attr.inputmode]="f.mode ?? null" [attr.maxlength]="f.max" [attr.placeholder]="f.hint ?? null"
                           [value]="draft()[f.key]" (input)="patch(f.key, $any($event.target).value)" />
                  </label>
                }
                <label>Listing
                  <select (change)="patch('status', $any($event.target).value)">
                    <option value="draft" [selected]="draft().status === 'draft'">Draft: hidden from diners</option>
                    <option value="live" [selected]="draft().status === 'live'">Live: diners can see it</option>
                    <option value="paused" [selected]="draft().status === 'paused'">Paused: hidden for now</option>
                  </select>
                </label>
              </div>
              <label class="tick"><input type="checkbox" [checked]="draft().offersDelivery" (change)="patch('offersDelivery', $any($event.target).checked)" /> Offers delivery</label>
              <p class="note">Menu address: /order/r/{{ r.slug }} · Health grade: {{ r.grade ?? 'not yet graded' }} · {{ r.isOpen ? 'Open' : 'Closed' }} (the restaurant sets this)</p>
              <p class="msg" role="status">{{ formMessage() }}</p>
              <div class="buttons">
                <button class="btn btn--primary" type="submit" [disabled]="busy()">Save</button>
                <a class="btn btn--ghost" routerLink="/merchant">Menu tools</a>
              </div>

              <odm-clover-card [restaurantId]="r.id" />

              <h3>Who may manage this restaurant</h3>
              <ul class="staff">
                @for (s of r.staff; track s.id) {
                  <li>
                    <span class="who"><strong>{{ s.email }}</strong><small>{{ s.name || 'No name yet' }} · {{ s.last_login ? 'has signed in' : 'has not signed in yet' }}</small></span>
                    <button type="button" class="mini" [disabled]="busy()" (click)="setStaff(r, s.email ?? '', false)">Remove</button>
                  </li>
                } @empty {
                  <li class="none">Nobody yet. Administrators can always manage it.</li>
                }
              </ul>
              <div class="add">
                <label [attr.for]="'staff-' + r.id">Add a person by email</label>
                <div class="add-row">
                  <input #email [id]="'staff-' + r.id" type="email" autocomplete="off" placeholder="owner@restaurant.com" (keydown.enter)="$event.preventDefault(); addStaff(r, email)" />
                  <button type="button" class="mini mini--on" [disabled]="busy()" (click)="addStaff(r, email)">Add</button>
                </div>
                <small>They sign in with this address and find the restaurant under their account. No account yet? One is made for them.</small>
              </div>
            </form>
          }
        </li>
      } @empty {
        @if (loaded()) { <li class="none">No restaurants yet.</li> }
      }
    </ul>
  `,
  styles: [`
    h2 { margin: 0 0 0.4rem; color: var(--site-navy); font-size: 1.5rem; }
    h3 { margin: 0.6rem 0 0; color: var(--site-navy); font-size: 1.05rem; }
    label { color: var(--site-navy); font-weight: 600; }
    input[type=text], input[type=email], select {
      box-sizing: border-box; width: 100%; height: 2.8rem; padding: 0 0.85rem; border: 1px solid var(--site-muted); border-radius: 10px;
      font: inherit; font-size: 1rem; color: var(--site-navy); background: var(--site-white);
    }
    input:focus-visible, select:focus-visible, .row:focus-visible, .mini:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 1px; }
    .top { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1rem; margin: 0 0 0.75rem; }
    .msg { min-height: 1.3em; margin: 0; color: var(--site-accent-deep); font-weight: 600; }
    .btn { border: 0; cursor: pointer; font-family: inherit; }
    .btn--ghost { border: 1px solid var(--site-navy); }
    .btn[disabled], .mini[disabled] { opacity: 0.6; cursor: default; transform: none; }
    .mini {
      display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; height: 2.4rem; padding: 0 0.95rem;
      border: 1px solid var(--site-navy); border-radius: 999px; background: var(--site-white); color: var(--site-navy);
      font: inherit; font-size: 0.92rem; font-weight: 700; white-space: nowrap; cursor: pointer;
    }
    .mini--on { background: var(--site-navy); color: var(--site-white); }

    /* One restaurant per row; every row is the same height. */
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .item { border: 1px solid var(--site-line); border-radius: 12px; background: var(--site-white); overflow: hidden; }
    .item--open { border-color: var(--site-navy); }
    .row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "name status edit" "facts status edit";
      column-gap: 0.75rem; align-items: center; align-content: center; box-sizing: border-box; width: 100%; height: 4.5rem; padding: 0 0.9rem;
      border: 0; background: none; font: inherit; text-align: left; cursor: pointer;
    }
    .row:hover { background: var(--site-tint); }
    .name { grid-area: name; min-width: 0; color: var(--site-midnight); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .facts { grid-area: facts; min-width: 0; color: var(--site-muted); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status { grid-area: status; box-sizing: border-box; width: 4.4rem; padding: 0.2rem 0; border-radius: 5px; background: #e4e8ee; color: var(--site-midnight); font-size: 0.8rem; font-weight: 700; text-align: center; }
    .status--live { background: var(--site-good); color: var(--site-white); }
    .status--paused { background: #ffe9cf; color: var(--site-warning-text); }
    .edit { grid-area: edit; color: var(--site-accent-deep); font-weight: 700; }

    .editor { display: grid; gap: 0.7rem; padding: 0.9rem; border-top: 1px solid var(--site-line); background: var(--site-cloud); }
    .editor--new { margin: 0 0 0.75rem; border: 1px solid var(--site-navy); border-radius: 12px; }
    .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem 0.9rem; }
    .fields label { display: grid; gap: 0.3rem; align-content: start; }
    .fields .wide { grid-column: 1 / -1; }
    .tick { display: flex; align-items: center; gap: 0.5rem; color: var(--site-text); cursor: pointer; }
    .tick input { width: 1.15rem; height: 1.15rem; margin: 0; accent-color: var(--site-accent); }
    .note, .add small, .who small { margin: 0; color: var(--site-muted); font-size: 0.9rem; font-weight: 600; overflow-wrap: anywhere; }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .staff { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .staff li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; min-height: 3.4rem; padding: 0.3rem 0.75rem; border: 1px solid var(--site-line); border-radius: 10px; background: var(--site-white); }
    .staff li.none, .none { display: block; padding: 0.9rem; color: var(--site-muted); }
    .who { min-width: 0; display: grid; }
    .who strong { color: var(--site-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .add { display: grid; gap: 0.35rem; }
    .add-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.5rem; align-items: center; }
    @media (max-width: 560px) { .fields { grid-template-columns: minmax(0, 1fr); } }
  `],
})
export class AdminRestaurants {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/admin/restaurants';

  protected readonly fields = TEXT_FIELDS;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly restaurants = signal<AdminRestaurant[]>([]);
  protected readonly loaded = signal(false);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly formMessage = signal('');
  /** '' = nothing open, 'new' = the add form, otherwise the restaurant being edited. */
  protected readonly openId = signal('');
  protected readonly draft = signal<Draft>({ ...EMPTY });

  constructor() {
    // This component is only shown to a confirmed administrator (admin-page.ts), in the browser.
    void this.run(this.message, async () => {
      const res = await firstValueFrom(this.http.get<{ restaurants: AdminRestaurant[] }>(this.api));
      this.restaurants.set(res.restaurants);
      this.loaded.set(true);
    });
  }

  protected facts(r: AdminRestaurant): string {
    const place = [r.cuisine, r.city].filter(Boolean).join(' · ');
    const people = r.staff.length === 1 ? '1 manager' : `${r.staff.length} managers`;
    const dishes = r.dishes === 1 ? '1 dish' : `${r.dishes} dishes`;
    return [place, dishes, people].filter(Boolean).join(' · ');
  }

  protected startNew(): void {
    this.formMessage.set('');
    this.draft.set({ ...EMPTY });
    this.openId.set('new');
  }

  protected toggle(r: AdminRestaurant): void {
    this.formMessage.set('');
    if (this.openId() === r.id) {
      this.openId.set('');
      return;
    }
    this.draft.set({
      name: r.name, cuisine: r.cuisine, tagline: r.tagline, phone: r.phone, address: r.address, city: r.city, state: r.state,
      zip: r.zip, camis: r.camis, offersDelivery: r.offersDelivery, status: r.status,
    });
    this.openId.set(r.id);
  }

  protected patch<K extends keyof Draft>(key: K, value: Draft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected async save(event: Event, existing?: AdminRestaurant): Promise<void> {
    event.preventDefault();
    const d = this.draft();
    if (!d.name.trim()) {
      this.formMessage.set('The restaurant needs a name.');
      return;
    }
    await this.run(this.formMessage, async () => {
      if (existing) {
        const res = await firstValueFrom(this.http.post<{ restaurant: AdminRestaurant }>(`${this.api}/${existing.id}`, d));
        this.put(res.restaurant);
        this.formMessage.set('Saved.');
      } else {
        const { status: _starts_as_draft, ...details } = d;
        const res = await firstValueFrom(this.http.post<{ restaurant: AdminRestaurant }>(this.api, details));
        this.restaurants.update((list) => [...list, res.restaurant].sort((a, b) => a.name.localeCompare(b.name)));
        this.message.set(`Added ${res.restaurant.name}. Open it to add the people who manage it.`);
        this.openId.set('');
      }
    });
  }

  protected async addStaff(r: AdminRestaurant, input: HTMLInputElement): Promise<void> {
    const email = input.value.trim();
    if (!email) return;
    if (await this.setStaff(r, email, true)) input.value = '';
  }

  protected async setStaff(r: AdminRestaurant, email: string, add: boolean): Promise<boolean> {
    let done = false;
    await this.run(this.formMessage, async () => {
      const res = await firstValueFrom(this.http.post<{ restaurant: AdminRestaurant }>(`${this.api}/${r.id}/staff`, { email, add }));
      this.put(res.restaurant);
      this.formMessage.set(add ? `${email} can now manage ${r.name}.` : `${email} was removed.`);
      done = true;
    });
    return done;
  }

  private put(restaurant: AdminRestaurant): void {
    this.restaurants.update((list) => list.map((r) => (r.id === restaurant.id ? restaurant : r)));
  }

  private async run(target: { set(value: string): void }, task: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    target.set('');
    try {
      await task();
    } catch (e) {
      target.set(e instanceof HttpErrorResponse && typeof e.error?.error === 'string' ? e.error.error : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
