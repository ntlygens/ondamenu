import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, TitleStrategy } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { ROUTES } from './app.routes';
import { SiteTitleStrategy } from './core/seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    // View transitions let a tapped restaurant card grow into its menu header (browsers without them just switch pages).
    provideRouter(ROUTES, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withViewTransitions()),
    { provide: TitleStrategy, useClass: SiteTitleStrategy },
    provideClientHydration(withEventReplay()),
  ],
};
