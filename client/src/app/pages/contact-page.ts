import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CONTACT_EMAIL } from '../core/site';

/** Contact page. The email link appears once CONTACT_EMAIL is set in core/site.ts. */
@Component({
  selector: 'odm-contact-page',
  imports: [RouterLink, MatIconModule],
  host: { class: 'page' },
  template: `
    <section class="intro" aria-labelledby="contactTitle">
      <p class="eyebrow">Contact</p>
      <h2 id="contactTitle">Tell us what you need and we will point you the right way.</h2>
      <p class="lede">
        Whether you want your restaurant on OnDaMenu or have a question about ordering,
        a short note is all it takes to get started.
      </p>
    </section>

    <section class="whyUsData" aria-label="How to reach us">
      <article class="svc-card">
        <h3>Restaurants</h3>
        <p class="svc-sub">Listing your menu</p>
        <p class="svc-body">Send us your restaurant's name, address and the best way to reach you. It also helps to know whether you already use a Clover point of sale, since OnDaMenu connects to it for online orders.</p>
        <a class="svc-link" routerLink="/restaurants">See how it works for restaurants <span aria-hidden="true">→</span></a>
      </article>
      <article class="svc-card svc-card--dark">
        <h3>Diners</h3>
        <p class="svc-sub">Questions about ordering</p>
        <p class="svc-body">Let us know what you were trying to do and which restaurant you were ordering from, and we will help.</p>
        <a class="svc-link" routerLink="/diners">See how ordering works <span aria-hidden="true">→</span></a>
      </article>
    </section>

    <section class="closing-cta">
      @if (email) {
        <h2>Email us</h2>
        <p>We read every message.</p>
        <div class="cta-row">
          <a class="btn btn--primary" [href]="'mailto:' + email"><mat-icon aria-hidden="true">mail</mat-icon>{{ email }}</a>
        </div>
      } @else {
        <h2>Contact details are on the way</h2>
        <p>Our contact address is being set up and will appear here shortly.</p>
      }
    </section>
  `,
})
export class ContactPage {
  protected readonly email = CONTACT_EMAIL;
}
