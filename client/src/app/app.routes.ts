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
    path: 'order/restaurants',
    title: 'Restaurants',
    data: { description: 'Choose a local restaurant and order online with OnDaMenu.' },
    loadComponent: () => import('./pages/restaurants-page').then((m) => m.RestaurantsPage),
  },
  {
    path: 'order/r/:slug',
    title: 'Menu',
    data: { description: 'Browse the menu and order online with OnDaMenu.' },
    loadComponent: () => import('./pages/menu-page').then((m) => m.MenuPage),
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
    data: { description: 'Restaurant account area for OnDaMenu merchants.' },
    loadComponent: () => import('./pages/merchant-page').then((m) => m.MerchantPage),
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
