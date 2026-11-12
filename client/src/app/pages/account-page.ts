import { Component, computed, inject, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, Role } from '../services/auth-service';
import { HumanCheck } from '../core/human-check';

/** What each kind of account will be able to do. Shown on the signed-in page. */
const AREAS: Record<Role, { icon: string; title: string; text: string }> = {
  diner:    { icon: 'restaurant_menu', title: 'Ordering',        text: 'Your orders and saved details will appear here when ordering opens.' },
  merchant: { icon: 'storefront',      title: 'Your restaurant', text: 'Menu, prices and incoming orders for your restaurant will appear here.' },
  courier:  { icon: 'delivery_dining', title: 'Deliveries',      text: 'Delivery jobs and your weekly pay summary will appear here.' },
  admin:    { icon: 'shield_person',   title: 'Administration',  text: 'Restaurant, courier and account management will appear here.' },
};

/** Sign in with a one-time code sent by email, and see your account. */
@Component({
  selector: 'odm-account-page',
  imports: [RouterLink, MatIconModule, HumanCheck],
  host: { class: 'page' },
  template: `
    <section class="account">
      @if (!auth.ready()) {
        <p class="status" role="status">Checking your account…</p>
      } @else if (auth.user(); as user) {
        <p class="eyebrow">Your account</p>
        <h1>You're signed in</h1>
        <p class="who"><mat-icon aria-hidden="true">{{ user.email ? 'mail' : 'smartphone' }}</mat-icon>{{ user.email ?? formatPhone(user.phone) }}</p>

        <div class="areas">
          @for (area of areas(); track area.title) {
            <article class="area">
              <span class="area-icon" aria-hidden="true"><mat-icon>{{ area.icon }}</mat-icon></span>
              <h2>{{ area.title }}</h2>
              <p>{{ area.text }}</p>
            </article>
          }
        </div>

        <button class="btn btn--ghost" type="button" [disabled]="busy()" (click)="signOut()">Sign out</button>
      } @else if (!sentTo()) {
        <p class="eyebrow">Sign in</p>
        <h1>Sign in or create your account</h1>
        <p class="lede">Enter your email address and we'll send you a 6-digit code. No password needed.</p>

        <form class="card" (submit)="send($event, dest.value)" novalidate>
          <label for="acct-dest">Email address</label>
          <input #dest id="acct-dest" name="destination" type="email" inputmode="email" autocomplete="email"
                 autocapitalize="none" spellcheck="false" placeholder="you@example.com"
                 [attr.aria-invalid]="error() ? 'true' : null" aria-describedby="acct-msg" />
          @if (challengeKey()) {
            <odm-human-check [siteKey]="challengeKey()" (token)="humanToken.set($event)" />
          }
          <button class="btn btn--primary" type="submit" [disabled]="busy()">{{ busy() ? 'Sending…' : 'Send my code' }}</button>
          <p id="acct-msg" class="error" role="alert">{{ error() }}</p>
        </form>
      } @else {
        <p class="eyebrow">Sign in</p>
        <h1>Enter your code</h1>
        <p class="lede">
          We sent a 6-digit code {{ channel() === 'sms' ? 'by text' : 'by email' }} to <strong>{{ sentTo() }}</strong>.
          It works for {{ minutes() }} minutes.
        </p>
        @if (devCode()) {
          <p class="preview-note">Preview only, nothing was sent. Your code is <strong>{{ devCode() }}</strong>.</p>
        }

        <form class="card" (submit)="check($event, code.value)" novalidate>
          <label for="acct-code">6-digit code</label>
          <input #code id="acct-code" name="code" class="code" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6"
                 autocomplete="one-time-code" placeholder="000000"
                 [attr.aria-invalid]="error() ? 'true' : null" aria-describedby="acct-code-msg" />
          <button class="btn btn--primary" type="submit" [disabled]="busy()">{{ busy() ? 'Checking…' : 'Sign in' }}</button>
          <p id="acct-code-msg" class="error" role="alert">{{ error() }}</p>
        </form>
        @if (challengeKey()) {
          <odm-human-check class="resend-check" [siteKey]="challengeKey()" (token)="humanToken.set($event)" />
        }
        <p class="fine">
          <button class="link" type="button" [disabled]="busy()" (click)="resend()">Send a new code</button>
          ·
          <button class="link" type="button" (click)="startOver()">Use a different email address</button>
        </p>
      }

      <p class="fine"><a routerLink="/">Back to OnDaMenu</a></p>
    </section>
  `,
  styles: [`
    .account { max-width: 520px; margin: 1rem auto 0; text-align: left; }
    h1 { margin: 0 0 0.6rem; color: var(--site-navy); font-size: clamp(1.6rem, 4vw, 2.1rem); line-height: 1.2; }
    .lede { margin: 0 0 1.4rem; font-size: 1.05rem; line-height: 1.65; }
    .status { color: var(--site-muted); }
    .card {
      display: flex; flex-direction: column; gap: 0.7rem;
      padding: 1.5rem; border: 1px solid var(--site-line); border-radius: 14px;
      background: var(--site-white); box-shadow: 0 4px 14px rgba(15, 31, 58, 0.06);
    }
    label { color: var(--site-navy); font-weight: 600; }
    input {
      width: 100%; box-sizing: border-box; padding: 0.8rem 0.9rem;
      border: 1px solid var(--site-muted); border-radius: 10px;
      font: inherit; font-size: 1.05rem; color: var(--site-navy); background: var(--site-white);
    }
    input:focus-visible { outline: 3px solid var(--site-accent); outline-offset: 1px; border-color: var(--site-navy); }
    input[aria-invalid="true"] { border-color: var(--site-alert); }
    input.code { font-size: 1.6rem; letter-spacing: 0.35em; text-align: center; font-variant-numeric: tabular-nums; }
    .card .btn { justify-content: center; border: 0; cursor: pointer; font-family: inherit; }
    .btn[disabled] { opacity: 0.6; cursor: default; transform: none; }
    .error { min-height: 1.3em; margin: 0; color: var(--site-alert); font-weight: 600; }
    .preview-note {
      margin: 0 0 1rem; padding: 0.7rem 0.9rem; border-radius: 10px;
      background: var(--site-tint); color: var(--site-warning-text); border: 1px dashed var(--site-warning-text);
      strong { font-size: 1.15rem; letter-spacing: 0.12em; }
    }
    .resend-check { margin-top: 1rem; }
    .fine { margin: 1rem 0 0; color: var(--site-muted); font-size: 0.92rem; }
    .fine a, .link { color: var(--site-blue); font-weight: 600; }
    .link { padding: 0; border: 0; background: none; font: inherit; font-weight: 600; text-decoration: underline; cursor: pointer; }
    .link[disabled] { opacity: 0.6; cursor: default; }
    .who { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1.5rem; color: var(--site-navy); font-size: 1.1rem; font-weight: 600; overflow-wrap: anywhere; }
    .who mat-icon { color: var(--site-accent-deep); flex: none; }
    .areas { display: grid; gap: 1rem; margin: 0 0 1.5rem; }
    .area { padding: 1.25rem; border: 1px solid var(--site-line); border-radius: 14px; background: var(--site-cloud); }
    .area-icon {
      display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px;
      border-radius: 10px; background: var(--site-midnight);
      mat-icon { color: var(--site-accent); }
    }
    .area h2 { margin: 0.8rem 0 0.3rem; color: var(--site-navy); font-size: 1.15rem; }
    .area p { margin: 0; line-height: 1.6; }
    button.btn--ghost { cursor: pointer; font-family: inherit; background: transparent; }
  `],
})
export class AccountPage {
  protected readonly auth = inject(AuthService);

  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Where the code went, as the person typed it. Empty until a code has been sent. */
  protected readonly sentTo = signal('');
  protected readonly channel = signal<'email' | 'sms'>('email');
  protected readonly minutes = signal(10);
  protected readonly devCode = signal('');

  /** Site key for the "I am human" check; empty when the check is off (preview, local). */
  protected readonly challengeKey = this.auth.challengeKey;
  /** Proof from the check. Each one can be used for a single code request. */
  protected readonly humanToken = signal('');
  private readonly checks = viewChildren(HumanCheck);

  protected readonly areas = computed(() => (this.auth.user()?.roles ?? []).map((role) => AREAS[role]));

  protected async send(event: Event, destination: string): Promise<void> {
    event.preventDefault();
    await this.requestCode(destination.trim());
  }

  protected async resend(): Promise<void> {
    await this.requestCode(this.sentTo());
  }

  protected async check(event: Event, code: string): Promise<void> {
    event.preventDefault();
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) { this.error.set('Enter the 6-digit code.'); return; }
    await this.run(async () => {
      await this.auth.verify(this.sentTo(), digits);
      this.startOver();
    });
  }

  protected async signOut(): Promise<void> {
    await this.run(() => this.auth.signOut());
  }

  protected startOver(): void {
    this.sentTo.set('');
    this.devCode.set('');
    this.error.set('');
  }

  protected formatPhone(phone: string | null): string {
    const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(phone ?? '');
    return m ? `(${m[1]}) ${m[2]}-${m[3]}` : (phone ?? '');
  }

  private async requestCode(destination: string): Promise<void> {
    if (!destination) { this.error.set('Enter your email address.'); return; }
    if (this.challengeKey() && !this.humanToken()) { this.error.set('Please complete the "I am human" check first.'); return; }
    await this.run(async () => {
      try {
        const sent = await this.auth.sendCode(destination, this.humanToken());
        this.channel.set(sent.channel);
        this.minutes.set(sent.minutes);
        this.devCode.set(sent.devCode ?? '');
        this.sentTo.set(destination);
      } finally {
        // The proof is spent either way: clear it and ask the check for a fresh one.
        this.humanToken.set('');
        this.checks().forEach((check) => check.reset());
      }
    });
  }

  /** Runs one request at a time and shows its error message, if any. */
  private async run(task: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await task();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
