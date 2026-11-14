import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminRestaurants } from '../core/admin-restaurants';
import { RoleGate } from '../core/role-gate';
import { AuthService, Role } from '../services/auth-service';

interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created: number;
  last_login: number | null;
  roles: Role[];
}

/** Roles an administrator can switch on or off for an account. */
const GRANTABLE: { role: Role; label: string }[] = [
  { role: 'merchant', label: 'Restaurant' },
  { role: 'courier', label: 'Courier' },
  { role: 'admin', label: 'Administrator' },
];

/** Administrators manage restaurants (core/admin-restaurants.ts), find accounts and mark them as restaurant, courier or administrator. */
@Component({
  selector: 'odm-admin-page',
  imports: [RouterLink, RoleGate, DatePipe, AdminRestaurants],
  host: { class: 'page' },
  template: `
    <section class="panel panel--wide">
      <odm-role-gate role="admin" denied="This area is for OnDaMenu administrators.">
        <p class="eyebrow">Administration</p>
        <h1>Administration</h1>
        <!-- Created only for a confirmed administrator: content inside the gate would otherwise start loading for anyone. -->
        @if (isAdmin()) { <odm-admin-restaurants class="block" /> }

        <h2>Accounts</h2>
        <p class="lede">Find an account, then switch on what it may do. Changes apply the next time that person loads a page.</p>

        <form class="search" (submit)="search($event, q.value)" novalidate>
          <label for="admin-q">Search by email, phone or name</label>
          <div class="search-row">
            <input #q id="admin-q" name="q" type="search" autocomplete="off" placeholder="Leave empty to list the most recent accounts" />
            <button class="btn btn--primary" type="submit" [disabled]="busy()">Search</button>
          </div>
        </form>
        <p class="msg" role="status">{{ message() }}</p>

        <ul class="users">
          @for (u of users(); track u.id) {
            <li class="user">
              <div class="who">
                <strong>{{ u.email ?? u.phone }}</strong>
                <span>{{ u.name || 'No name yet' }} · last signed in {{ u.last_login ? (u.last_login * 1000 | date: 'mediumDate') : 'never' }}</span>
              </div>
              <div class="roles">
                @for (g of grantable; track g.role) {
                  <label class="role" [class.on]="u.roles.includes(g.role)">
                    <input type="checkbox" [checked]="u.roles.includes(g.role)" [disabled]="busy() || (g.role === 'admin' && u.id === myId())"
                           (change)="setRole(u, g.role, $any($event.target))" />
                    {{ g.label }}
                  </label>
                }
              </div>
            </li>
          } @empty {
            @if (loaded()) { <li class="none">No accounts match.</li> }
          }
        </ul>

        <p class="fine"><a routerLink="/account">Back to your account</a></p>
      </odm-role-gate>
    </section>
  `,
  styles: [`
    .block { display: block; margin: 0 0 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--site-line); }
    h2 { margin: 0 0 0.4rem; color: var(--site-navy); font-size: 1.5rem; }
    .search { display: flex; flex-direction: column; gap: 0.5rem; }
    .search label { color: var(--site-navy); font-weight: 600; }
    .search-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .search-row input {
      flex: 1 1 240px; min-width: 0; box-sizing: border-box; padding: 0.75rem 0.9rem;
      border: 1px solid var(--site-muted); border-radius: 10px; font: inherit; font-size: 1rem;
      color: var(--site-navy); background: var(--site-white);
    }
    .search-row input:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 1px; }
    .search-row .btn { border: 0; cursor: pointer; font-family: inherit; }
    .btn[disabled] { opacity: 0.6; cursor: default; transform: none; }
    .msg { min-height: 1.3em; margin: 0.6rem 0; color: var(--site-accent-deep); font-weight: 600; }
    .users { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
    .user {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem;
      padding: 1rem 1.1rem; border: 1px solid var(--site-line); border-radius: 12px; background: var(--site-white);
    }
    .who { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .who strong { color: var(--site-navy); overflow-wrap: anywhere; }
    .who span { color: var(--site-muted); font-size: 0.9rem; }
    .roles { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .role {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem;
      border: 1px solid var(--site-line); border-radius: 999px; background: var(--site-cloud);
      color: var(--site-text); font-weight: 600; font-size: 0.92rem; cursor: pointer;
    }
    .role.on { border-color: var(--site-navy); background: var(--site-tint); color: var(--site-navy); }
    .role input { accent-color: var(--site-accent); width: 1rem; height: 1rem; margin: 0; }
    .none { color: var(--site-muted); }
  `],
})
export class AdminPage {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  protected readonly grantable = GRANTABLE;
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loaded = signal(false);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly myId = () => this.auth.user()?.id ?? '';
  protected readonly isAdmin = () => this.auth.hasRole('admin');

  constructor() {
    // Load the most recent accounts once an administrator is confirmed.
    let started = false;
    effect(() => {
      if (!started && this.auth.hasRole('admin')) {
        started = true;
        void this.load('');
      }
    });
  }

  protected async search(event: Event, text: string): Promise<void> {
    event.preventDefault();
    await this.load(text.trim());
  }

  protected async setRole(user: AdminUser, role: Role, box: HTMLInputElement): Promise<void> {
    let saved = false;
    await this.run(async () => {
      const res = await firstValueFrom(
        this.http.post<{ userId: string; roles: Role[] }>('/api/admin/roles', { userId: user.id, role, grant: box.checked }),
      );
      this.users.update((list) => list.map((u) => (u.id === res.userId ? { ...u, roles: res.roles } : u)));
      this.message.set('Saved.');
      saved = true;
    });
    // If the change was refused, put the tick box back to what the server holds.
    if (!saved) box.checked = user.roles.includes(role);
  }

  private async load(q: string): Promise<void> {
    await this.run(async () => {
      const res = await firstValueFrom(this.http.get<{ users: AdminUser[] }>('/api/admin/users', { params: { q } }));
      this.users.set(res.users);
      this.loaded.set(true);
    });
  }

  private async run(task: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.message.set('');
    try {
      await task();
    } catch (e) {
      this.message.set(e instanceof HttpErrorResponse && typeof e.error?.error === 'string' ? e.error.error : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
