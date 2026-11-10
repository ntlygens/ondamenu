/** Shapes of the site content stored in Cloudflare D1 (source: content/content.json). */
export interface LinkRef { label: string; route: string; }

export interface Panel {
  title: string;
  subtitle?: string;
  body: string;
  link?: LinkRef;
}

export interface PhotoBanner {
  title: string;
  text: string;
  img: string;
  cta?: LinkRef;
}

export interface ClosingCta {
  title: string;
  text: string;
  primary: LinkRef;
  secondary?: LinkRef;
}

/** One record per page (collection "pages"); _id is the page key: home, diners, restaurants. */
export interface PageDoc {
  _id: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Two "why us" panels: the first is wide and light, the second narrow and dark. */
  panels: Panel[];
  featuresTitle?: string;
  stepsTitle?: string;
  banner?: PhotoBanner;
  closing: ClosingCta;
}

/** Illustrated feature card (collection "features"). */
export interface FeatureDoc {
  _id: string;
  page: string;
  title: string;
  text: string;
  icon: string;      // Material icon name shown in the card's icon band
  img?: string;      // optional photo; replaces the icon band
}

/** How-it-works step (collection "steps"). */
export interface StepDoc {
  _id: string;
  page: string;
  title: string;
  text: string;
}
