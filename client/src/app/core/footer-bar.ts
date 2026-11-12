import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AUDIENCE_LINKS, CONTACT_EMAIL, CONTACT_LINK, HOME_LINK } from './site';

@Component({
  selector: 'odm-footer-bar',
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="col brand-col">
          <a class="brand" routerLink="/">
            <span class="mark"><img src="/assets/core/logo/odm-mark.png" alt="" width="30" height="33" /></span>
            <span>OnDa<strong>Menu</strong></span>
          </a>
          <p>Local restaurant menus in one place, with simple online ordering for diners and restaurants.</p>
        </div>

        <nav class="col" aria-label="How it works">
          <h4>How It Works</h4>
          @for (a of audienceLinks; track a.route) {
            <a [routerLink]="a.route">{{ a.label }}</a>
          }
        </nav>

        <nav class="col" aria-label="Company">
          <h4>Company</h4>
          <a [routerLink]="home.route">{{ home.label }}</a>
          <a [routerLink]="contact.route">{{ contact.label }}</a>
        </nav>

        <div class="col">
          <h4>Contact</h4>
          @if (email) {
            <a [href]="'mailto:' + email"><mat-icon>mail</mat-icon>{{ email }}</a>
          }
          <a [routerLink]="contact.route"><mat-icon>chat</mat-icon>Get in touch</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© {{ year }} OnDaMenu. All rights reserved.</span>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
    .site-footer {
      background: var(--site-midnight);
      color: rgba(255, 255, 255, 0.78);
      padding: 3.5rem 20px 1.5rem;
      border-top: 3px solid var(--site-accent);
    }
    .footer-grid {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 2.5rem;
    }
    .col { display: flex; flex-direction: column; gap: 0.6rem; }
    h4 { color: #fff; margin: 0 0 0.4rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; }
    a {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.78);
      text-decoration: none;
      transition: color 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--site-pop); }
    }
    a:hover { color: var(--site-accent-soft); }
    .brand {
      color: #fff;
      font-size: 1.35rem;
      .mark { display: inline-flex; padding: 3px 6px; border-radius: 8px; background: var(--site-white); }
      .mark img { display: block; height: 33px; width: auto; }
      strong { color: var(--site-pop); }
    }
    .brand-col p { line-height: 1.6; margin: 0.25rem 0 0; max-width: 34ch; }
    .footer-bottom {
      max-width: 1280px;
      margin: 2.5rem auto 0;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.6);
    }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr; gap: 2rem; } }
  `],
})
export class FooterBar {
  protected readonly audienceLinks = AUDIENCE_LINKS;
  protected readonly home = HOME_LINK;
  protected readonly contact = CONTACT_LINK;
  protected readonly email = CONTACT_EMAIL;
  protected readonly year = new Date().getFullYear();
}
