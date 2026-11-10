import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_NAME, SITE_URL } from './site';

const DEFAULT_TITLE = `${SITE_NAME} | Local Restaurant Menus & Online Ordering`;
const DEFAULT_DESCRIPTION =
  'OnDaMenu puts local restaurant menus in one place: browse, order and pay online. ' +
  'Restaurants get a simple way to take orders from nearby diners.';
const SHARE_IMAGE = `${SITE_URL}/assets/backgrounds/kitchen-Bnr.webp`;

/**
 * Sets the tab title, meta description, canonical link and social-share tags from each
 * route's `title` and `data.description`. Runs during server rendering too, so search
 * engines and link previews see the right values.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  override updateTitle(state: RouterStateSnapshot): void {
    const path = state.url.split(/[?#]/)[0];
    const pageTitle = this.buildTitle(state);
    const title = pageTitle && path !== '/' ? `${pageTitle} | ${SITE_NAME}` : DEFAULT_TITLE;

    let route = state.root;
    while (route.firstChild) route = route.firstChild;
    let description: string | undefined;
    for (let r: typeof route | null = route; r && !description; r = r.parent) description = r.data?.['description'];
    description ??= DEFAULT_DESCRIPTION;

    const url = SITE_URL + (path === '/' ? '' : path);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: SHARE_IMAGE });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }
}
