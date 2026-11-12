import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { ACCOUNT_ROUTE, AUDIENCE_LINKS, CONTACT_LINK, HEADER_CTA, HOME_LINK } from './site';
import { AuthService } from '../services/auth-service';
import { HeroBanner } from './hero-banner';
import { HERO_PAGES, HeroPage } from './hero-scenes';

/** Task pages skip the marketing banner. */
const NO_HERO_PATHS = [ACCOUNT_ROUTE, '/order', '/merchant', '/courier', '/admin'];

/** Sticky site header (desktop links, dropdown, mobile menu) plus the page's animated banner. */
@Component({
  selector: 'odm-header-bar',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, HeroBanner],
  template: `
    <header class="site-nav" [class.scrolled]="scrolled()">
      <div class="nav-inner">
        <a class="brand" routerLink="/" (click)="closeMenu()" aria-label="OnDaMenu home">
          <span class="mark"><img src="/assets/core/logo/odm-mark.png" alt="" width="34" height="38" /></span>
          <span>OnDa<strong>Menu</strong></span>
        </a>

        <!-- Desktop links -->
        <nav class="links" aria-label="Main">
          <a [routerLink]="home.route" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ home.label }}</a>

          <button class="link-btn" [class.active]="audienceActive()" [matMenuTriggerFor]="audienceMenu">
            How It Works <mat-icon>expand_more</mat-icon>
          </button>
          <mat-menu #audienceMenu="matMenu" class="site-nav-menu" xPosition="after">
            @for (a of audienceLinks; track a.route) {
              <a mat-menu-item [routerLink]="a.route" routerLinkActive="menu-active">
                <mat-icon>{{ a.icon }}</mat-icon>
                <span class="menu-text">
                  <span class="menu-label">{{ a.label }}</span>
                  <span class="menu-desc">{{ a.desc }}</span>
                </span>
              </a>
            }
          </mat-menu>

          <a [routerLink]="contact.route" routerLinkActive="active">{{ contact.label }}</a>
          <a [routerLink]="accountRoute" routerLinkActive="active">{{ accountLabel() }}</a>
        </nav>

        <a class="cta" [routerLink]="cta.route">{{ cta.label }}</a>

        <!-- Mobile toggle -->
        <button class="burger" mat-icon-button
          [attr.aria-expanded]="menuOpen()" aria-controls="mobile-menu"
          [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          (click)="menuOpen.set(!menuOpen())">
          <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile panel -->
      @if (menuOpen()) {
        <nav id="mobile-menu" class="mobile" aria-label="Mobile">
          <a [routerLink]="home.route" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenu()">
            <mat-icon>{{ home.icon }}</mat-icon>{{ home.label }}
          </a>
          <span class="mobile-group">How It Works</span>
          @for (a of audienceLinks; track a.route) {
            <a class="sub" [routerLink]="a.route" routerLinkActive="active" (click)="closeMenu()">
              <mat-icon>{{ a.icon }}</mat-icon>{{ a.label }}
            </a>
          }
          <a [routerLink]="contact.route" routerLinkActive="active" (click)="closeMenu()">
            <mat-icon>{{ contact.icon }}</mat-icon>{{ contact.label }}
          </a>
          <a [routerLink]="accountRoute" routerLinkActive="active" (click)="closeMenu()">
            <mat-icon>account_circle</mat-icon>{{ accountLabel() }}
          </a>
          <a class="cta mobile-cta" [routerLink]="cta.route" (click)="closeMenu()">{{ cta.label }}</a>
        </nav>
      }
    </header>

    @if (showHero()) {
      <odm-hero-banner [page]="heroPage()" />
    }
  `,
  styles: [`
    /* contents: lets .site-nav stick relative to the whole page, not just this host */
    :host { display: contents; }

    .site-nav {
      /* full-bleed: cancel .app padding */
      width: calc(100% + 40px);
      margin: -10px -20px 0;
      box-sizing: border-box;
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(11, 42, 87, 0.94);
      /* the app's brick-red top edge */
      border-top: 4px solid var(--site-accent);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      transition: box-shadow 0.25s, background 0.25s;
    }
    .site-nav.scrolled { background: rgba(11, 42, 87, 0.99); box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25); }
    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      height: 68px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fff;
      text-decoration: none;
      font-size: 1.4rem;
      letter-spacing: 0.01em;
      white-space: nowrap;
      /* the logo is drawn for a light background, so it sits on a white tile as it does in the app */
      .mark { display: inline-flex; padding: 3px 7px; border-radius: 9px; background: var(--site-white); }
      .mark img { display: block; height: 38px; width: auto; }
      strong { color: var(--site-pop); font-weight: 700; }
    }

    .links { display: flex; align-items: center; gap: 0.25rem; margin-left: auto; }
    .links a, .link-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 0.55rem 0.9rem;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font: 500 0.98rem/1 'Exo 2', Roboto, 'Helvetica Neue', sans-serif;
      background: none;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: color 0.2s, background 0.2s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .links a:hover, .link-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
    .links a.active, .link-btn.active { color: #fff; }
    .links a.active::after, .link-btn.active::after {
      content: '';
      position: absolute;
      left: 0.9rem; right: 0.9rem; bottom: 2px;
      height: 2px;
      border-radius: 2px;
      background: var(--site-pop);
    }

    .cta {
      padding: 0.6rem 1.15rem;
      background: var(--site-pop);
      color: var(--site-on-pop);
      text-decoration: none;
      font-weight: 700;
      border-radius: 999px;
      white-space: nowrap;
      transition: background 0.2s, transform 0.2s;
    }
    .cta:hover { background: var(--site-pop-hover); transform: translateY(-1px); }

    .burger { display: none; color: #fff; margin-left: auto; }

    .mobile {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 20px 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      animation: slideDown 0.2s ease-out;
      a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.8rem 0.5rem;
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        font-size: 1.05rem;
        border-radius: 8px;
      }
      a.sub { padding-left: 1.5rem; font-size: 1rem; }
      a.active { color: var(--site-accent-soft); background: rgba(234, 106, 94, 0.14); }
      mat-icon { color: var(--site-pop); }
    }
    .mobile-group {
      margin: 0.75rem 0.5rem 0.25rem;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .mobile .mobile-cta { justify-content: center; margin-top: 0.75rem; color: var(--site-on-pop); }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

    @media (max-width: 960px) {
      .links, .nav-inner > .cta { display: none; }
      .burger { display: inline-flex; }
    }
  `],
})
export class HeaderBar implements OnInit {
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly audienceActive = signal(false);
  /** Animated banner for the current page (falls back to the home banner). */
  protected readonly heroPage = signal<HeroPage>(HERO_PAGES['/']);

  protected readonly home = HOME_LINK;
  protected readonly contact = CONTACT_LINK;
  protected readonly audienceLinks = AUDIENCE_LINKS;
  protected readonly cta = HEADER_CTA;
  protected readonly accountRoute = ACCOUNT_ROUTE;

  private readonly auth = inject(AuthService);
  /** "Sign in" until the browser has confirmed a session, then "Account". */
  protected readonly accountLabel = computed(() => (this.auth.user() ? 'Account' : 'Sign in'));
  /** Task pages (the account page) skip the banner. */
  protected readonly showHero = signal(true);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.closeMenu();
        const path = this.router.url.split(/[?#]/)[0] || '/';
        this.audienceActive.set(AUDIENCE_LINKS.some((a) => path.startsWith(a.route)));
        this.heroPage.set(HERO_PAGES[path] ?? HERO_PAGES['/']);
        this.showHero.set(!NO_HERO_PATHS.includes(path));
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(typeof window !== 'undefined' && window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
