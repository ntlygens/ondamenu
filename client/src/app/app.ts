import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderBar } from './core/header-bar';
import { FooterBar } from './core/footer-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderBar, FooterBar],
  template: `
    <main class="app">
      <odm-header-bar />
      <router-outlet />
      <odm-footer-bar />
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
    }
    /* Header host uses display: contents (see header-bar.ts) so its nav can stick to the top of the page. */
    odm-footer-bar {
      /* full-bleed: cancel .app side padding */
      width: calc(100% + 40px);
      margin: 3rem -20px 0;
    }
  `],
})
export class App {}
