import { Routes } from '@angular/router';

/** Every page is lazy-loaded. `title` and `data.description` feed the tab title and search/share tags (core/seo.ts). */
export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Local Restaurant Menus & Online Ordering',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePage),
  },
  {
    path: 'diners',
    title: 'For Diners',
    data: { page: 'diners', description: 'Browse full menus from local restaurants, build your order and pay online with OnDaMenu.' },
    loadComponent: () => import('./pages/audience-page').then((m) => m.AudiencePage),
  },
  {
    path: 'restaurants',
    title: 'For Restaurants',
    data: { page: 'restaurants', description: 'Put your menu online and take orders from local diners with OnDaMenu, connected to your Clover point of sale.' },
    loadComponent: () => import('./pages/audience-page').then((m) => m.AudiencePage),
  },
  {
    path: 'contact',
    title: 'Contact',
    data: { description: 'Get in touch with OnDaMenu about ordering or listing your restaurant.' },
    loadComponent: () => import('./pages/contact-page').then((m) => m.ContactPage),
  },
  {
    path: 'account',
    title: 'Your Account',
    data: { description: 'Sign in to OnDaMenu with a one-time code sent by email or text.' },
    loadComponent: () => import('./pages/account-page').then((m) => m.AccountPage),
  },
  { path: '**', redirectTo: '' },
];
