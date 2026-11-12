import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The ordering app's entrance, modelled on the original app's splash screen:
 * the logo, "Get Started" for diners and "Merchant" for restaurants.
 * Restaurant browsing is not built yet, so "Get Started" explains that ordering opens soon.
 */
@Component({
  selector: 'odm-order-page',
  imports: [RouterLink],
  host: { class: 'page' },
  template: `
    <section class="splash" aria-labelledby="orderTitle">
      <h1 id="orderTitle" class="visually-hidden">Order with OnDaMenu</h1>
      <img class="logo" src="/assets/core/logo/odm-wordmark.png" alt="On Da Menu" width="469" height="283" />

      @if (!started()) {
        <div class="actions">
          <button class="go go--start" type="button" (click)="started.set(true)">Get Started</button>
          <a class="go go--merchant" routerLink="/merchant">Merchant</a>
        </div>
      } @else {
        <div class="soon" role="status">
          <h2>Ordering opens soon</h2>
          <p>We are adding local restaurants now. Check back shortly to browse menus and place your first order.</p>
          <div class="soon-links">
            <a class="btn btn--primary" routerLink="/diners">See how ordering works</a>
            <a class="btn btn--ghost" routerLink="/contact">Suggest a restaurant</a>
          </div>
          <button class="back" type="button" (click)="started.set(false)">Back</button>
        </div>
      }
    </section>
  `,
  styles: [`
    .splash {
      display: flex; flex-direction: column; align-items: center; gap: clamp(2rem, 8vh, 4.5rem);
      min-height: min(70vh, 640px); padding: clamp(1.5rem, 6vh, 4rem) 0 1rem; text-align: center;
    }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .logo { width: min(78vw, 340px); height: auto; filter: drop-shadow(0 8px 18px rgba(7, 24, 54, 0.35)); }
    .actions { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; margin-top: auto; }
    .go {
      display: inline-flex; align-items: center; justify-content: center; min-width: 190px; padding: 0.9rem 1.6rem;
      border: 0; border-radius: 6px; font: 600 1.15rem/1 'Exo 2', Roboto, sans-serif; letter-spacing: 0.06em;
      text-decoration: none; cursor: pointer; box-shadow: 0 6px 16px rgba(7, 24, 54, 0.3);
      transition: transform 0.2s, background 0.2s;
    }
    .go:hover { transform: translateY(-2px); }
    .go:focus-visible, .back:focus-visible { outline: 3px solid var(--site-white); outline-offset: 3px; }
    .go--start { background: var(--site-accent); color: var(--site-on-accent); }
    .go--start:hover { background: var(--site-accent-hover); }
    .go--merchant { background: var(--site-white); color: var(--site-midnight); }
    .soon {
      width: 100%; max-width: 520px; box-sizing: border-box; padding: clamp(1.25rem, 4vw, 2rem); border-radius: 16px;
      background: var(--site-cloud); box-shadow: 0 10px 30px rgba(7, 24, 54, 0.3); text-align: left;
    }
    .soon h2 { margin: 0 0 0.5rem; color: var(--site-navy); font-size: 1.5rem; }
    .soon p { margin: 0 0 1.25rem; line-height: 1.65; }
    .soon-links { display: flex; flex-wrap: wrap; gap: 0.7rem; }
    .back { margin-top: 1.1rem; padding: 0; border: 0; background: none; color: var(--site-blue); font: inherit; font-weight: 600; text-decoration: underline; cursor: pointer; }
  `],
})
export class OrderPage {
  /** True once the visitor has pressed Get Started. */
  protected readonly started = signal(false);
}
