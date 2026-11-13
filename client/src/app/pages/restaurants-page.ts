import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GradeBadge } from '../core/grade-badge';
import { OrderService, Restaurant } from '../services/order-service';

/** The restaurant list: a photo card per restaurant. Tapping one opens its menu. */
@Component({
  selector: 'odm-restaurants-page',
  imports: [RouterLink, GradeBadge],
  host: { class: 'page app-screen' },
  template: `
    <h1 class="app-tab app-tab--sticky">Restaurants</h1>

    @if (error()) {
      <div class="app-note" role="alert">
        <p>{{ error() }}</p>
        <button class="btn btn--primary" type="button" (click)="load()">Try again</button>
      </div>
    } @else if (order.restaurants(); as list) {
      @if (list.length) {
        <ul class="cards">
          @for (r of list; track r.slug) {
            <li>
              <a class="card" [routerLink]="['/order/r', r.slug]">
                <span class="photo" [style.view-transition-name]="'r-' + r.slug">
                  @if (r.photo) { <img [src]="r.photo" alt="" loading="lazy" /> }
                  <odm-grade-badge class="grade" [grade]="r.grade" />
                </span>
                <span class="info">
                  <span class="name">{{ r.name }}</span>
                  <span class="cuisine">{{ place(r) }}</span>
                  <span class="tags">
                    <span class="tag" [class.tag--open]="r.isOpen">{{ r.isOpen ? 'Open' : 'Closed' }}</span>
                    @if (r.delivery) { <span class="tag tag--delivery">Delivery</span> }
                    @if (r.pickup) { <span class="tag">Pickup</span> }
                  </span>
                </span>
              </a>
            </li>
          }
        </ul>
      } @else {
        <div class="app-note"><p>No restaurants are taking orders yet. Please check back soon.</p></div>
      }
    } @else {
      <p class="app-loading" role="status">Loading restaurants…</p>
    }

    <p class="app-back"><a routerLink="/order">Back to start</a></p>
  `,
  styles: [`
    .cards { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.25rem; }
    .card {
      display: block; overflow: hidden; border-radius: 12px; background: var(--site-cloud); color: inherit; text-decoration: none;
      box-shadow: 0 8px 22px rgba(7, 24, 54, 0.35); transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(7, 24, 54, 0.45); }
    .card:focus-visible { outline: 3px solid var(--site-white); outline-offset: 3px; }
    .photo { position: relative; display: block; aspect-ratio: 16 / 7; background: var(--site-midnight); }
    .photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .grade { position: absolute; top: 10px; right: 10px; }
    .info { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.15rem 0.75rem; align-items: end; padding: 0.8rem 1rem 0.9rem; }
    .name { grid-column: 1 / -1; color: var(--site-navy); font-size: 1.35rem; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
    .cuisine { color: var(--site-accent-deep); font-style: italic; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; justify-content: flex-end; }
  `],
})
export class RestaurantsPage {
  protected readonly order = inject(OrderService);
  protected readonly error = signal('');

  constructor() {
    void this.load();
  }

  /** "Caribbean · Brooklyn": the line under the restaurant's name. */
  protected place(r: Restaurant): string {
    return [r.cuisine, r.city].filter(Boolean).join(' · ');
  }

  protected async load(): Promise<void> {
    this.error.set('');
    try {
      await this.order.loadRestaurants();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }
}
