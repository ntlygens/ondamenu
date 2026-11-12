import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, output } from '@angular/core';

/** The parts of Cloudflare Turnstile's browser API this component uses. */
interface TurnstileApi {
  render(container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}
declare global {
  interface Window { turnstile?: TurnstileApi; }
}

let loading: Promise<TurnstileApi> | undefined;
/** Loads Turnstile's script once per page. */
function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) { resolve(window.turnstile); return; }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not start')));
    script.onerror = () => { loading = undefined; reject(new Error('Turnstile could not be loaded')); };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Cloudflare Turnstile "I am human" check. Emits a proof token when the visitor passes,
 * and '' when that proof expires or the check fails. The server verifies the token (worker/auth.mjs).
 */
@Component({
  selector: 'odm-human-check',
  template: '',
  styles: [':host { display: block; min-height: 65px; }'],
})
export class HumanCheck {
  readonly siteKey = input.required<string>();
  readonly token = output<string>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private api?: TurnstileApi;
  private widgetId?: string;

  constructor() {
    const destroyRef = inject(DestroyRef);
    let destroyed = false;
    destroyRef.onDestroy(() => {
      destroyed = true;
      if (this.api && this.widgetId) this.api.remove(this.widgetId);
    });
    // Browser only.
    afterNextRender(async () => {
      try {
        const api = await loadTurnstile();
        if (destroyed) return;
        this.api = api;
        this.widgetId = api.render(this.host, {
          sitekey: this.siteKey(),
          callback: (token) => this.token.emit(token),
          'expired-callback': () => this.token.emit(''),
          'error-callback': () => this.token.emit(''),
        });
      } catch {
        this.token.emit('');
      }
    });
  }

  /** Asks for a fresh proof (each one works once). */
  reset(): void {
    if (this.api && this.widgetId) this.api.reset(this.widgetId);
  }
}
