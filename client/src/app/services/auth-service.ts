import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Role = 'diner' | 'merchant' | 'courier' | 'admin';
export interface AccountUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  roles: Role[];
}
export interface CodeSent {
  channel: 'email' | 'sms';
  minutes: number;
  /** Preview and local runs only: the code, shown on screen because nothing is sent. */
  devCode?: string;
}

/**
 * Sign-in by one-time code (worker/auth.mjs). The signed-in user is loaded in the browser only,
 * never during server rendering, so cached pages stay the same for everyone.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/auth';

  /** The signed-in user, or null. */
  readonly user = signal<AccountUser | null>(null);
  /** Cloudflare Turnstile site key when the "I am human" check is on, otherwise ''. */
  readonly challengeKey = signal('');
  /** False until the first check with the server has finished. */
  readonly ready = signal(false);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<{ user: AccountUser | null; challengeKey?: string }>(`${this.api}/me`));
      this.user.set(res.user);
      this.challengeKey.set(res.challengeKey ?? '');
    } catch {
      this.user.set(null);
    } finally {
      this.ready.set(true);
    }
  }

  /** Sends a code to an email address. Throws an Error with a message to show. */
  async sendCode(destination: string, humanToken = ''): Promise<CodeSent> {
    return this.post<CodeSent>('start', { destination, humanToken });
  }

  /** Checks the code and signs the person in. Throws an Error with a message to show. */
  async verify(destination: string, code: string): Promise<void> {
    const res = await this.post<{ user: AccountUser }>('verify', { destination, code });
    this.user.set(res.user);
  }

  /** Saves the person's name. Throws an Error with a message to show. */
  async saveName(name: string): Promise<void> {
    const res = await this.post<{ user: AccountUser }>('profile', { name });
    this.user.set(res.user);
  }

  hasRole(role: Role): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }

  async signOut(): Promise<void> {
    try { await this.post('signout', {}); } finally { this.user.set(null); }
  }

  private async post<T>(action: string, body: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.post<T>(`${this.api}/${action}`, body));
    } catch (e) {
      const message = e instanceof HttpErrorResponse && typeof e.error?.error === 'string'
        ? e.error.error
        : 'We could not reach OnDaMenu. Check your connection and try again.';
      throw new Error(message);
    }
  }
}
