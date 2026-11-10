/**
 * Animated page banners: per-photo overlay maps + per-page copy.
 *
 * Overlay coordinates are in each photo's own pixel space (w x h below), so they stay
 * locked to the image at any screen size. To highlight something in a photo, add a glow
 * or dot at its x / y here. To add a page, add a HERO_PAGES entry keyed by its route.
 */
export interface HeroGlow { x: number; y: number; w: number; h: number; rx: number; color: string; dur: number; }
export interface HeroDot { x: number; y: number; color: string; }
export interface HeroParticle { x: number; y: number; r: number; c: string; dur: number; delay: number; }
export interface HeroScene {
  img: string;
  w: number;              // photo width in pixels
  h: number;              // photo height in pixels
  viewBox: string;        // visible crop of the photo
  align: string;          // SVG preserveAspectRatio alignment (used with "slice")
  glows: HeroGlow[];      // soft pulsing light over part of the photo (an oven, a window, a plate)
  dots: HeroDot[];        // small blinking indicator lights
  particles: HeroParticle[];  // warm motes that drift upward
  sweep: { y: number; h: number };  // band the light sheen travels across
}
export interface HeroLink { label: string; route: string; }
export interface HeroPage {
  scene: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  text: string;
  chip: string;
  primary: HeroLink;
  secondary?: HeroLink;
}

const WARM = ['#ffd58a', '#ffe2a3', '#ffb37a', '#fff1cf'];
/** Evenly scattered drifting motes for a photo of the given size (fixed pattern, so server and browser match). */
function motes(w: number, h: number, count: number): HeroParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(w * (0.3 + 0.68 * ((i * 0.618) % 1))),
    y: Math.round(h * (0.55 + 0.4 * ((i * 0.377) % 1))),
    r: 1.8 + (i % 4) * 0.8,
    c: WARM[i % WARM.length],
    dur: 9 + (i % 6) * 1.3,
    delay: (i * 1.7) % 10,
  }));
}

export const HERO_SCENES: Record<string, HeroScene> = {
  kitchen: {
    img: '/assets/backgrounds/kitchen-Bnr.webp',
    w: 1351, h: 900,
    viewBox: '0 150 1351 600',
    align: 'xMidYMid',
    glows: [],
    dots: [],
    particles: motes(1351, 900, 16),
    sweep: { y: 150, h: 600 },
  },
  plate: {
    img: '/assets/backgrounds/plate-Bnr.webp',
    w: 943, h: 532,
    viewBox: '0 57 943 418',
    align: 'xMidYMid',
    glows: [],
    dots: [],
    particles: motes(943, 532, 12),
    sweep: { y: 57, h: 418 },
  },
};

const LIST_RESTAURANT: HeroLink = { label: 'List Your Restaurant', route: '/contact' };

export const HERO_PAGES: Record<string, HeroPage> = {
  '/': {
    scene: 'kitchen',
    eyebrow: 'Local menus, one place',
    titleLead: 'Your neighborhood is',
    titleAccent: 'on the menu.',
    text: 'Browse menus from local restaurants, build your order and pay online in a few taps.',
    chip: 'LOCAL MENUS',
    primary: LIST_RESTAURANT,
    secondary: { label: 'How it works', route: '/diners' },
  },
  '/diners': {
    scene: 'plate',
    eyebrow: 'For diners',
    titleLead: 'Find it. Order it.',
    titleAccent: 'Enjoy it.',
    text: 'See the full menu from restaurants near you, order exactly what you want and pay online.',
    chip: 'FOR DINERS',
    primary: { label: 'See how ordering works', route: '/diners' },
    secondary: { label: 'For restaurants', route: '/restaurants' },
  },
  '/restaurants': {
    scene: 'kitchen',
    eyebrow: 'For restaurants',
    titleLead: 'Put your menu in front of',
    titleAccent: 'local diners.',
    text: 'Take online orders through OnDaMenu, connected to your Clover point of sale.',
    chip: 'FOR RESTAURANTS',
    primary: LIST_RESTAURANT,
    secondary: { label: 'For diners', route: '/diners' },
  },
  '/contact': {
    scene: 'plate',
    eyebrow: 'Contact',
    titleLead: 'Let\u2019s get you',
    titleAccent: 'on the menu.',
    text: 'Questions about ordering, or about listing your restaurant? We are glad to help.',
    chip: 'CONTACT',
    primary: LIST_RESTAURANT,
  },
};
