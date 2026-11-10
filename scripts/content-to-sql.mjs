/**
 * Builds client/d1/seed.sql from content/content.json, the single source of page content.
 *
 *   node scripts/content-to-sql.mjs [path/to/content.json]
 *
 * content.json maps each collection to an array of records:
 *   { "pages": [ { "_id": "home", "title": "...", ... }, ... ], ... }
 * The seed replaces every row of each collection it contains.
 * Then: npm run content:seed (remote) or npm run content:seed:local (wrangler dev).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(process.argv[2] ?? path.join(root, 'content', 'content.json'));
const out = path.join(root, 'client', 'd1', 'seed.sql');

const COLLECTIONS = new Set(['pages', 'features', 'steps']);

const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const idOf = (doc, i) => {
  const raw = doc._id && typeof doc._id === 'object' ? doc._id.$oid ?? String(doc._id) : doc._id;
  return raw ? String(raw) : `row-${i + 1}`;
};

const lines = [fs.readFileSync(path.join(root, 'client', 'd1', 'schema.sql'), 'utf8').trim(), ''];
let total = 0;
for (const [key, records] of Object.entries(data)) {
  const coll = key.includes('.') ? key.split('.').pop() : key;
  if (!COLLECTIONS.has(coll)) { console.warn(`skipping unknown collection "${key}"`); continue; }
  if (!Array.isArray(records)) throw new Error(`"${key}" must be an array of records`);
  lines.push(`DELETE FROM content WHERE coll = ${q(coll)};`);
  records.forEach((doc, i) => {
    const id = idOf(doc, i);
    const clean = { ...doc, _id: id };
    lines.push(`INSERT INTO content (coll, id, position, doc) VALUES (${q(coll)}, ${q(id)}, ${i}, ${q(JSON.stringify(clean))});`);
    total++;
  });
  console.log(`${coll}: ${records.length} records`);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n') + '\n');
console.log(`wrote ${total} records to ${path.relative(root, out)}`);
