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
    path: 'order',
    title: 'Order',
    data: { description: 'Start an order with OnDaMenu: browse local restaurant menus and order online.' },
    loadComponent: () => import('./pages/order-page').then((m) => m.OrderPage),
  },
  {
    path: 'account',
    title: 'Your Account',
    data: { description: 'Sign in to OnDaMenu with a one-time code sent to your email.' },
    loadComponent: () => import('./pages/account-page').then((m) => m.AccountPage),
  },
  {
    path: 'merchant',
    title: 'Your Restaurant',
    data: {
      role: 'merchant', eyebrow: 'Restaurant account', heading: 'Your restaurant',
      text: 'This is where you will manage your menu, prices and incoming orders. Menu tools arrive in the next stage of the build.',
      denied: 'This area is for restaurant accounts. If you run a restaurant and want to join OnDaMenu, get in touch and we will set you up.',
      description: 'Restaurant account area for OnDaMenu merchants.',
    },
    loadComponent: () => import('./pages/area-page').then((m) => m.AreaPage),
  },
  {
    path: 'courier',
    title: 'Deliveries',
    data: {
      role: 'courier', eyebrow: 'Courier account', heading: 'Your deliveries',
      text: 'This is where delivery jobs and your weekly pay summary will appear once delivery opens.',
      denied: 'This area is for OnDaMenu couriers.',
      description: 'Courier account area for OnDaMenu delivery people.',
    },
    loadComponent: () => import('./pages/area-page').then((m) => m.AreaPage),
  },
  {
    path: 'admin',
    title: 'Administration',
    data: { description: 'OnDaMenu administration.' },
    loadComponent: () => import('./pages/admin-page').then((m) => m.AdminPage),
  },
  { path: '**', redirectTo: '' },
];
