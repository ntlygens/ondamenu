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
  consumed    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS login_codes_dest ON login_codes (destination, created);

-- Signed-in sessions. Only a hash of the cookie value is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created    INTEGER NOT NULL,
  expires    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);
