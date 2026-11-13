import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderBar } from './core/header-bar';
import { FooterBar } from './core/footer-bar';

/** Screens with no site footer: on a restaurant's menu the cart bar is the foot of the page. */
const NO_FOOTER_PREFIXES = ['/order/r/'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderBar, FooterBar],
  template: `
    <main class="app">
      <odm-header-bar />
      <router-outlet />
      @if (showFooter()) { <odm-footer-bar /> }
    </main>
  `,
  styles: [`
    .app {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 10px 20px 0;
      margin: 0;
      /* At least one screen tall, so a screen without the footer can reach the bottom edge (menu page). */
      box-sizing: border-box;
      min-height: 100vh;
      min-height: 100dvh;
    }
    /* Header host uses display: contents (see header-bar.ts) so its nav can stick to the top of the page. */
    odm-footer-bar {
      /* full-bleed: cancel .app side padding */
      width: calc(100% + 40px);
      margin: 3rem -20px 0;
    }
  `],
})
export class App {
  private readonly router = inject(Router);
  protected readonly showFooter = signal(true);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const path = this.router.url.split(/[?#]/)[0] || '/';
        this.showFooter.set(!NO_FOOTER_PREFIXES.some((prefix) => path.startsWith(prefix)));
      });
  }
}
