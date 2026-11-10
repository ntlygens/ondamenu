-- OnDaMenu site content (Cloudflare D1).
-- One row per content record; doc holds the record as JSON, exactly as the site reads it.
CREATE TABLE IF NOT EXISTS content (
  coll     TEXT    NOT NULL,              -- pages, features, steps
  id       TEXT    NOT NULL,              -- the record's _id
  position INTEGER NOT NULL DEFAULT 0,    -- display order within the collection
  doc      TEXT    NOT NULL CHECK (json_valid(doc)),
  updated  TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (coll, id)
);
