/** Single source of truth for site identity and navigation (header, mobile menu, footer). */
export const SITE_NAME = 'OnDaMenu';
export const SITE_URL = 'https://ondamenu.com';

/**
 * Public contact email. Leave empty until the owner confirms the address:
 * the contact page and footer only show an email link when this is set.
 */
export const CONTACT_EMAIL = '';

export interface NavLink {
  label: string;
  route: string;
  icon: string;      // Material icon name
  desc?: string;     // short line shown in the dropdown and on the home tiles
}

/** The two audience pages, shown in the "How It Works" dropdown. */
export const AUDIENCE_LINKS: NavLink[] = [
  { label: 'For Diners',      route: '/diners',      icon: 'restaurant_menu', desc: 'Browse local menus and order online' },
  { label: 'For Restaurants', route: '/restaurants', icon: 'storefront',      desc: 'Take online orders from nearby diners' },
];

export const HOME_LINK: NavLink = { label: 'Home', route: '/', icon: 'home' };
export const CONTACT_LINK: NavLink = { label: 'Contact', route: '/contact', icon: 'mail' };

/** Header button. Points at the contact page until online ordering is live. */
export const HEADER_CTA = { label: 'List Your Restaurant', route: '/contact' };
