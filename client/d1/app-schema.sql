-- OnDaMenu app data (Cloudflare D1: ondamenu-app for production, ondamenu-app-staging for preview).
-- Kept apart from the site-content database so reseeding page text can never touch accounts or orders.
-- Times are Unix seconds.

-- One row per person. A person signs in with an email address or a mobile number.
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE,
  phone      TEXT UNIQUE,                 -- E.164, e.g. +13475550100
  name       TEXT NOT NULL DEFAULT '',
  created    INTEGER NOT NULL,
  last_login INTEGER,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- What each person may do. Everyone is a diner; merchant, courier and admin are granted.
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('diner','merchant','courier','admin')),
  granted INTEGER NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- One-time sign-in codes. Only a hash of the code is stored.
CREATE TABLE IF NOT EXISTS login_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  destination TEXT NOT NULL,              -- the email address or phone number the code was sent to
  channel     TEXT NOT NULL CHECK (channel IN ('email','sms')),
  code_hash   TEXT NOT NULL,
  created     INTEGER NOT NULL,
  expires     INTEGER NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  consumed    INTEGER NOT NULL DEFAULT 0,
  ip_hash     TEXT                        -- hash of the requester's network address, for abuse limits
);
CREATE INDEX IF NOT EXISTS login_codes_dest ON login_codes (destination, created);
CREATE INDEX IF NOT EXISTS login_codes_ip ON login_codes (ip_hash, created);
CREATE INDEX IF NOT EXISTS login_codes_created ON login_codes (created);

-- Signed-in sessions. Only a hash of the cookie value is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created    INTEGER NOT NULL,
  expires    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);

-- ---------------------------------------------------------------------------
-- Restaurants and menus (app stage 2). Money is stored in cents.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,          -- used in the address: /order/r/<slug>
  name            TEXT NOT NULL,
  cuisine         TEXT NOT NULL DEFAULT '',      -- short line under the name, e.g. "Caribbean"
  tagline         TEXT NOT NULL DEFAULT '',
  photo           TEXT NOT NULL DEFAULT '',      -- header photo
  phone           TEXT NOT NULL DEFAULT '',
  address         TEXT NOT NULL DEFAULT '',
  city            TEXT NOT NULL DEFAULT '',
  state           TEXT NOT NULL DEFAULT '',
  zip             TEXT NOT NULL DEFAULT '',
  latitude        REAL,                          -- used for the one-mile delivery check
  longitude       REAL,
  offers_pickup   INTEGER NOT NULL DEFAULT 1,
  offers_delivery INTEGER NOT NULL DEFAULT 0,
  is_open         INTEGER NOT NULL DEFAULT 0,    -- set by the restaurant; opening hours come later
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','paused')),  -- only 'live' is shown to diners
  camis           TEXT,                          -- NYC Health Department id, for the inspection grade
  grade           TEXT,                          -- A, B, C ... as published by the city; NULL = not yet graded
  grade_date      TEXT,
  grade_checked   INTEGER,
  clover_merchant_id TEXT,
  created         INTEGER NOT NULL,
  updated         INTEGER NOT NULL
);

-- Which accounts may manage a restaurant.
CREATE TABLE IF NOT EXISTS restaurant_staff (
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, user_id)
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS menu_categories_restaurant ON menu_categories (restaurant_id, position);

CREATE TABLE IF NOT EXISTS menu_items (
  id             TEXT PRIMARY KEY,
  restaurant_id  TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  price_cents    INTEGER NOT NULL CHECK (price_cents >= 0),
  photo          TEXT NOT NULL DEFAULT '',
  available      INTEGER NOT NULL DEFAULT 1,     -- 0 = sold out for now (shown, cannot be ordered)
  hidden         INTEGER NOT NULL DEFAULT 0,     -- 1 = not on the menu
  position       INTEGER NOT NULL DEFAULT 0,
  clover_item_id TEXT,
  updated        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS menu_items_restaurant ON menu_items (restaurant_id, position);

CREATE TABLE IF NOT EXISTS menu_item_categories (
  item_id     TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, category_id)
);
