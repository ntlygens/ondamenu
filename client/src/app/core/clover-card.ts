import { Component, effect, inject, input, output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TillService, TillStatus } from '../services/till-service';

/** What the address says after Clover sends the person back: /merchant?clover=connected | error | taken. */
const RETURN_MESSAGES: Record<string, string> = {
  connected: 'Clover is connected and your menu has been brought in.',
  error: 'We could not connect Clover this time. Please try again.',
  taken: 'That Clover account is already connected to another restaurant.',
};

/**
 * One restaurant's Clover connection: connect (or reconnect), update the menu now, disconnect.
 * Administrators also get the switch for dish options (the quick way back if options ever cause trouble)
 * and, outside production, a way to connect a Clover test merchant with a test token.
 * Used on the restaurant's own menu tools and on the administrator's restaurant screen.
 */
@Component({
  selector: 'odm-clover-card',
  template: `
    <section class="card" aria-label="Clover till connection">
      <h3>Clover till</h3>
      @if (loadError()) {
        <p class="msg" role="alert">{{ loadError() }}</p>
      } @else if (status(); as s) {
        <p class="state">{{ headline(s) }}</p>
        @if (s.note) { <p class="note">{{ s.note }}</p> }
        <p class="msg" role="status">{{ message() }}</p>

        <div class="actions">
          @if (!s.connected || s.needsReconnect) {
            <button type="button" class="mini mini--on" [disabled]="busy() || !s.configured" (click)="connect()">{{ s.needsReconnect ? 'Reconnect Clover' : 'Connect Clover' }}</button>
          }
          @if (s.connected) {
            <button type="button" class="mini mini--on" [disabled]="busy()" (click)="sync()">Update menu from Clover</button>
            @if (confirming()) {
              <button type="button" class="mini" [disabled]="busy()" (click)="disconnect()">Yes, disconnect</button>
              <button type="button" class="mini" (click)="confirming.set(false)">Keep it</button>
            } @else {
              <button type="button" class="mini" [disabled]="busy()" (click)="confirming.set(true)">Disconnect</button>
            }
          }
        </div>
        @if (!s.configured && !s.connected) { <p class="note">Connecting to Clover is not switched on yet.</p> }
        @if (s.connected) { <p class="note">Dish names, prices and categories come from Clover. Descriptions and photos are yours and are never overwritten.</p> }

        @if (s.canToggleOptions) {
          <div class="admin">
            <label class="tick">
              <input type="checkbox" [checked]="s.optionsOn" [disabled]="busy() || s.optionsSiteOff" (change)="setOptions($any($event.target).checked)" />
              Dish options (extras and choices from Clover) are shown to diners
            </label>
            @if (s.optionsSiteOff) { <small>Switched off for the whole site (MODIFIERS is “off”).</small> }
            @else { <small>Untick to hide every option for this restaurant right away; dishes then order exactly as plain dishes.</small> }
          </div>
        }
        @if (s.canTestToken) {
          <details class="admin">
            <summary>Connect a Clover test merchant ({{ s.environment }})</summary>
            <p class="note">For the Clover sandbox only. Paste the merchant id and an API token made for that test merchant in the Clover developer dashboard. The token is stored locked and never shown again.</p>
            <label>Merchant id <input #mid type="text" autocomplete="off" maxlength="20" placeholder="e.g. QG3TN01W93MJ6" /></label>
            <label>API token <input #tok type="password" autocomplete="off" maxlength="200" /></label>
            <button type="button" class="mini mini--on" [disabled]="busy()" (click)="testToken(mid, tok)">Connect and import</button>
          </details>
        }
      } @else {
        <p class="note" role="status">Loading…</p>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .card { margin: 1rem 0; padding: 0.9rem 1rem; border: 1px solid var(--site-line); border-radius: 12px; background: var(--site-tint); }
    h3 { margin: 0 0 0.4rem; color: var(--site-midnight); font-size: 1.05rem; }
    .state { margin: 0 0 0.3rem; color: var(--site-midnight); font-weight: 700; }
    .note { margin: 0.4rem 0; color: var(--site-text); font-size: 0.92rem; overflow-wrap: anywhere; }
    .msg { min-height: 1.3em; margin: 0.3rem 0; color: var(--site-accent-deep); font-weight: 600; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.4rem 0; }
    .mini {
      display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; height: 2.4rem; padding: 0 0.95rem;
      border: 1px solid var(--site-navy); border-radius: 999px; background: var(--site-white); color: var(--site-navy);
      font: inherit; font-size: 0.92rem; font-weight: 700; white-space: nowrap; cursor: pointer;
    }
    .mini--on { background: var(--site-navy); color: var(--site-white); }
    .mini[disabled] { opacity: 0.6; cursor: default; }
    .admin { margin: 0.8rem 0 0; padding-top: 0.7rem; border-top: 1px dashed var(--site-line); }
    .admin small { display: block; margin-top: 0.2rem; color: var(--site-muted); }
    .tick { display: flex; align-items: flex-start; gap: 0.5rem; color: var(--site-midnight); font-weight: 600; }
    .tick input { margin-top: 0.25rem; }
    summary { cursor: pointer; color: var(--site-navy); font-weight: 700; }
    label { display: grid; gap: 0.3rem; margin: 0.5rem 0; font-weight: 600; color: var(--site-midnight); }
    input[type=text], input[type=password] { box-sizing: border-box; width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--site-muted); border-radius: 10px; font: inherit; color: var(--site-navy); background: var(--site-white); }
    .mini:focus-visible, input:focus-visible, summary:focus-visible { outline: 3px solid var(--site-blue); outline-offset: 2px; }
  `],
})
export class CloverCard {
  readonly restaurantId = input.required<string>();
  /** Told whenever the menu may have changed, so the screen can reload its dish list. */
  readonly menuChanged = output<void>();

  private readonly till = inject(TillService);
  protected readonly status = signal<TillStatus | undefined>(undefined);
  protected readonly loadError = signal('');
  protected readonly message = signal('');
  protected readonly busy = signal(false);
  protected readonly confirming = signal(false);
  private readonly returned = inject(ActivatedRoute).snapshot.queryParamMap.get('clover');

  constructor() {
    effect(() => {
      const id = this.restaurantId();
      this.status.set(undefined);
      this.loadError.set('');
      this.confirming.set(false);
      this.message.set(this.returned ? (RETURN_MESSAGES[this.returned] ?? '') : '');
      void this.load(id);
    });
  }

  protected headline(s: TillStatus): string {
    if (s.needsReconnect) return 'Clover needs you to connect again.';
    if (!s.connected) return 'Not connected to Clover.';
    return s.lastSync ? `Connected to Clover. Menu updated ${new Date(s.lastSync * 1000).toLocaleString()}.` : 'Connected to Clover.';
  }

  private async load(id: string): Promise<void> {
    try {
      const s = await this.till.status(id);
      if (id === this.restaurantId()) this.status.set(s);
    } catch (e) {
      if (id === this.restaurantId()) this.loadError.set(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  /** Runs an action with the busy flag and a message; refreshes the status afterwards. */
  private async act(work: () => Promise<string | void>, changesMenu = false): Promise<void> {
    this.busy.set(true);
    this.message.set('');
    try {
      const note = await work();
      if (note) this.message.set(note);
      if (changesMenu) this.menuChanged.emit();
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
      try { this.status.set(await this.till.status(this.restaurantId())); } catch { /* keep what is shown */ }
    }
  }

  protected connect(): Promise<void> {
    return this.act(async () => {
      const url = await this.till.connect(this.restaurantId());
      // Clover asks the restaurant to sign in and approve OnDaMenu, then sends them back to /merchant.
      window.location.assign(url);
      return 'Taking you to Clover…';
    });
  }
  protected sync(): Promise<void> {
    return this.act(async () => `Menu updated: ${await this.till.sync(this.restaurantId())}`, true);
  }
  protected disconnect(): Promise<void> {
    this.confirming.set(false);
    return this.act(async () => { await this.till.disconnect(this.restaurantId()); return 'Disconnected. The menu stays as it is.'; });
  }
  protected setOptions(on: boolean): Promise<void> {
    return this.act(async () => { await this.till.setOptions(this.restaurantId(), on); return on ? 'Dish options are on.' : 'Dish options are off.'; });
  }
  protected testToken(mid: HTMLInputElement, tok: HTMLInputElement): Promise<void> {
    return this.act(async () => {
      const note = await this.till.testToken(this.restaurantId(), mid.value.trim(), tok.value.trim());
      tok.value = '';
      return `Connected. ${note}`;
    }, true);
  }
}
