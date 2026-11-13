/**
 * OnDaMenu's plans for restaurants. Prices and terms were set by the owner on 2026-11-13:
 * $100 / $150 / $200 a month, 5% of the order on delivery orders (every plan), nothing on pickup orders,
 * first two weeks free (cancel any time in the trial), no setup fee for restaurants on Clover. Change them here only; the For Restaurants page reads this file.
 */
export interface Plan {
  id: string;
  name: string;
  /** Whole dollars per month. */
  price: number;
  /** One line on who the plan suits. */
  fit: string;
  /** What the plan lets the restaurant do about the diner's delivery fee. */
  delivery: string;
  /** What is included, in the order shown. */
  includes: string[];
  /** The plan shown as the dark, highlighted card. */
  featured?: boolean;
}

/** Days a new restaurant uses OnDaMenu before the first monthly charge. */
export const TRIAL_DAYS = 14;
/** Percent of the food and drink total a restaurant pays on a delivery order. Pickup orders pay nothing. */
export const DELIVERY_SHARE_PERCENT = 5;
/** The flat fee a diner pays for delivery, in dollars. */
export const DINER_DELIVERY_FEE = 7.5;

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 100,
    fit: 'Everything you need to take online orders.',
    delivery: 'Diners pay the flat $7.50 delivery fee.',
    includes: [
      'Your restaurant page and full menu',
      'Menu tools: dishes, prices, photos, sold-out switch',
      'Orders sent to your Clover point of sale',
      'Pickup and one-mile delivery',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 150,
    fit: 'Bring in more orders with offers and a better spot.',
    delivery: 'Cover part of the delivery fee so your diners pay less.',
    includes: [
      'Everything in Basic',
      'Promotions on your menu',
      'Sales reports',
      'Higher placement in the restaurant list',
      'Faster email support',
    ],
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 200,
    fit: 'Our best service, for busy kitchens and groups.',
    delivery: 'Offer your diners free delivery.',
    includes: [
      'Everything in Pro',
      'Top placement with a "Free delivery" tag',
      'Priority couriers',
      'Several locations on one account',
      'A named contact at OnDaMenu',
    ],
  },
];
