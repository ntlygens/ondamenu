import { Injectable, signal } from '@angular/core';

/** A two-tone title for the site header, written like the OnDaMenu name: plain start, coloured end. */
export interface HeaderTitle {
  lead: string;     // shown in white, e.g. "Resta"
  accent: string;   // shown in coral, e.g. "urants"
  route: string;    // where pressing it goes
  label: string;    // spoken name for screen readers
}

/**
 * Lets an app screen change what the site header shows beside the logo.
 * The menu screen uses it to put its "Restaurants" way-back into the header once its own button has scrolled away.
 */
@Injectable({ providedIn: 'root' })
export class ChromeService {
  /** The title to show in place of the OnDaMenu name, or null for the normal header. */
  readonly title = signal<HeaderTitle | null>(null);
}
