import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

export interface TillStatus {
  /** False until the Clover app settings are in place on the server. */
  configured: boolean;
  environment: 'sandbox' | 'production';
  connected: boolean;
  needsReconnect: boolean;
  /** Shown to administrators only. */
  merchantId?: string;
  /** Unix seconds of the last menu update, or null. */
  lastSync: number | null;
  /** A short plain summary of the last update, or why it failed. */
  note: string;
  /** Whether diners see dish options for this restaurant. */
  optionsOn: boolean;
  /** True when options are switched off for the whole site. */
  optionsSiteOff: boolean;
  canTestToken: boolean;
  canToggleOptions: boolean;
}

/** The restaurant's till connection (worker/clover.mjs). Every call throws an Error with a message to show. */
@Injectable({ providedIn: 'root' })
export class TillService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/clover/restaurants';
  private url(id: string, action: string): string { return `${this.api}/${encodeURIComponent(id)}/${action}`; }

  status(id: string): Promise<TillStatus> {
    return this.run(this.http.get<TillStatus>(this.url(id, 'status')));
  }
  async connect(id: string): Promise<string> {
    return (await this.run(this.http.post<{ url: string }>(this.url(id, 'connect'), {}))).url;
  }
  async sync(id: string): Promise<string> {
    return (await this.run(this.http.post<{ note: string }>(this.url(id, 'sync'), {}))).note;
  }
  async disconnect(id: string): Promise<void> {
    await this.run(this.http.post(this.url(id, 'disconnect'), {}));
  }
  async setOptions(id: string, on: boolean): Promise<void> {
    await this.run(this.http.post(this.url(id, 'options'), { on }));
  }
  async testToken(id: string, merchantId: string, token: string): Promise<string> {
    return (await this.run(this.http.post<{ note: string }>(this.url(id, 'test-token'), { merchantId, token }))).note;
  }

  private async run<T>(call: Observable<T>): Promise<T> {
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
