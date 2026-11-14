/**
 * The till connection, written so Clover is one plug-in and Square (or another) can be the next.
 *
 * A "till" (worker/clover.mjs is the first) answers one question: what does this restaurant sell?
 * It hands back a plain, till-neutral menu:
 *
 *   {
 *     categories: [{ externalId, name }],
 *     items:      [{ externalId, name, priceCents, hidden, fixedPrice, categoryIds: [externalId], groupIds: [externalId] }],
 *     groups:     [{ externalId, name, min, max, options: [{ externalId, name, priceCents, available }] }],   // dish options
 *   }
 *
 * syncMenu() below writes that into our own tables. What the till owns (name, price, categories, options) is
 * overwritten on every sync; what OnDaMenu owns (description, photo, sold-out flag, our hidden flag) is never touched.
 *
 * EXIT STRATEGY for dish options (Clover "modifiers"), three independent switches, quickest first:
 *   1. Per restaurant, no deploy:  restaurant_settings.options_on = 0   (Admin screen toggle). Diners see the menu exactly as before.
 *   2. Whole site, one line:       MODIFIERS = "off" in wrangler.jsonc vars, then deploy. Same effect for every restaurant.
 *   3. Automatic:                  if the option tables are missing or a query fails, the menu API answers without options.
 * The option data lives in its own tables and is never needed by dishes, so it can also simply be left dormant or dropped.
 * Syncing the options can never fail the dish import: it runs last, on its own, and its errors are only noted.
 */

const now = () => Math.floor(Date.now() / 1000);
const uid = (prefix) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/** True when options may be shown for this restaurant (site switch AND restaurant switch). */
export async function optionsEnabled(env, db, restaurantId) {
  if (String(env.MODIFIERS ?? '').toLowerCase() === 'off') return false;
  try {
    const row = await db.prepare('SELECT options_on FROM restaurant_settings WHERE restaurant_id = ?1').bind(restaurantId).first();
    return row ? row.options_on === 1 : true;
  } catch {
    return false;
  }
}

/** Runs statements in chunks so one sync never builds an oversized batch. */
async function runBatch(db, statements) {
  for (let i = 0; i < statements.length; i += 40) await db.batch(statements.slice(i, i + 40));
}

/**
 * Writes a till menu into our tables for one restaurant. Returns counts for the restaurant to read.
 * { items, added, categories, hidden, skipped, groups, options, optionsNote }
 */
export async function syncMenu(env, db, restaurantId, menu) {
  const t = now();
  const result = { items: 0, added: 0, categories: 0, hidden: 0, skipped: 0, groups: 0, options: 0, optionsNote: '' };

  // ---- categories ----
  const catMap = new Map((await db.prepare('SELECT external_id, category_id FROM till_category_map WHERE restaurant_id = ?1')
    .bind(restaurantId).all()).results.map((r) => [r.external_id, r.category_id]));
  const catStatements = [];
  menu.categories.forEach((c, position) => {
    const name = clean(c.name, 60) || 'Menu';
    let id = catMap.get(c.externalId);
    if (id) {
      catStatements.push(db.prepare('UPDATE menu_categories SET name = ?2, position = ?3 WHERE id = ?1').bind(id, name, position));
    } else {
      id = uid('c');
      catMap.set(c.externalId, id);
      catStatements.push(db.prepare('INSERT INTO menu_categories (id, restaurant_id, name, position) VALUES (?1, ?2, ?3, ?4)').bind(id, restaurantId, name, position));
      catStatements.push(db.prepare('INSERT INTO till_category_map (restaurant_id, external_id, category_id) VALUES (?1, ?2, ?3)').bind(restaurantId, c.externalId, id));
    }
  });
  await runBatch(db, catStatements);
  result.categories = menu.categories.length;

  // ---- items ----
  const existing = new Map((await db.prepare('SELECT id, clover_item_id FROM menu_items WHERE restaurant_id = ?1 AND clover_item_id IS NOT NULL')
    .bind(restaurantId).all()).results.map((r) => [r.clover_item_id, r.id]));
  const itemIds = new Map();   // external id -> our id, for the items we keep
  const itemStatements = [];
  const seen = new Set();
  menu.items.forEach((it, position) => {
    seen.add(it.externalId);
    const name = clean(it.name, 80);
    if (!name) { result.skipped++; return; }
    // A dish with no fixed price (priced by weight or asked at the till) cannot be ordered online: keep it off the menu.
    const orderable = it.fixedPrice && Number.isInteger(it.priceCents) && it.priceCents >= 0 && it.priceCents <= 100000;
    const hide = it.hidden || !orderable;
    if (!orderable) result.skipped++;
    let id = existing.get(it.externalId);
    if (id) {
      // Name, price and place come from the till. Hidden: the till can hide a dish; it never un-hides one the restaurant hid.
      itemStatements.push(db.prepare(
        `UPDATE menu_items SET name = ?2, price_cents = ?3, position = ?4, updated = ?5, hidden = CASE WHEN ?6 = 1 THEN 1 ELSE hidden END WHERE id = ?1`,
      ).bind(id, name, orderable ? it.priceCents : 0, position, t, hide ? 1 : 0));
    } else {
      id = uid('i');
      result.added++;
      itemStatements.push(db.prepare(
        `INSERT INTO menu_items (id, restaurant_id, name, description, price_cents, photo, available, hidden, position, clover_item_id, updated)
         VALUES (?1, ?2, ?3, '', ?4, '', 1, ?5, ?6, ?7, ?8)`,
      ).bind(id, restaurantId, name, orderable ? it.priceCents : 0, hide ? 1 : 0, position, it.externalId, t));
    }
    itemIds.set(it.externalId, id);
    if (hide) result.hidden++;
  });
  // Dishes the till no longer has: off the menu, but their description and photo are kept in case they come back.
  for (const [external, id] of existing) {
    if (!seen.has(external)) {
      itemStatements.push(db.prepare('UPDATE menu_items SET hidden = 1, updated = ?2 WHERE id = ?1').bind(id, t));
      result.hidden++;
    }
  }
  await runBatch(db, itemStatements);
  result.items = itemIds.size;

  // ---- which categories each dish is in ----
  const linkStatements = [];
  for (const it of menu.items) {
    const id = itemIds.get(it.externalId);
    if (!id) continue;
    linkStatements.push(db.prepare('DELETE FROM menu_item_categories WHERE item_id = ?1').bind(id));
    for (const ext of new Set(it.categoryIds)) {
      const categoryId = catMap.get(ext);
      if (categoryId) linkStatements.push(db.prepare('INSERT OR IGNORE INTO menu_item_categories (item_id, category_id) VALUES (?1, ?2)').bind(id, categoryId));
    }
  }
  await runBatch(db, linkStatements);

  // ---- dish options: last, on their own, never able to fail the import ----
  if (String(env.MODIFIERS ?? '').toLowerCase() === 'off') {
    result.optionsNote = 'Dish options are switched off for the whole site.';
  } else if (menu.groups == null) {
    // The till could not give us its options this time (for example a permission is missing): keep what we have.
    result.optionsNote = 'Dish options could not be read from the till; they were left as they were.';
  } else {
    try {
      Object.assign(result, await syncOptions(db, restaurantId, menu, itemIds));
    } catch (error) {
      console.error('[till] options sync failed', error instanceof Error ? error.message : error);
      result.optionsNote = 'Dish options could not be updated; the menu itself was.';
    }
  }
  return result;
}

async function syncOptions(db, restaurantId, menu, itemIds) {
  const groupRows = (await db.prepare('SELECT id, external_id FROM option_groups WHERE restaurant_id = ?1').bind(restaurantId).all()).results;
  const groupMap = new Map(groupRows.map((r) => [r.external_id, r.id]));
  const statements = [];
  let optionCount = 0;
  const keptGroups = new Set();

  const usable = menu.groups.filter((g) => g.options.length);
  usable.forEach((g, gPos) => {
    const name = clean(g.name, 60) || 'Options';
    const min = Math.max(0, Math.min(Number(g.min) || 0, 20));
    const max = Math.max(0, Math.min(Number(g.max) || 0, 20));
    let gid = groupMap.get(g.externalId);
    if (gid) {
      statements.push(db.prepare('UPDATE option_groups SET name = ?2, min_required = ?3, max_allowed = ?4, position = ?5 WHERE id = ?1').bind(gid, name, min, max, gPos));
    } else {
      gid = uid('g');
      groupMap.set(g.externalId, gid);
      statements.push(db.prepare('INSERT INTO option_groups (id, restaurant_id, external_id, name, min_required, max_allowed, position) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
        .bind(gid, restaurantId, g.externalId, name, min, max, gPos));
    }
    keptGroups.add(gid);
    // Replace this group's options wholesale: they hold nothing that belongs to OnDaMenu.
    statements.push(db.prepare('DELETE FROM options WHERE group_id = ?1').bind(gid));
    g.options.forEach((o, oPos) => {
      const price = Number.isInteger(o.priceCents) && o.priceCents >= 0 && o.priceCents <= 100000 ? o.priceCents : 0;
      statements.push(db.prepare('INSERT INTO options (id, group_id, external_id, name, price_cents, available, position) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
        .bind(uid('o'), gid, o.externalId, clean(o.name, 60) || 'Option', price, o.available === false ? 0 : 1, oPos));
      optionCount++;
    });
  });
  // Groups the till no longer has.
  for (const r of groupRows) if (!keptGroups.has(r.id)) statements.push(db.prepare('DELETE FROM option_groups WHERE id = ?1').bind(r.id));

  // Which dish offers which groups.
  for (const it of menu.items) {
    const id = itemIds.get(it.externalId);
    if (!id) continue;
    statements.push(db.prepare('DELETE FROM item_option_groups WHERE item_id = ?1').bind(id));
    for (const ext of new Set(it.groupIds)) {
      const gid = groupMap.get(ext);
      if (gid && keptGroups.has(gid)) statements.push(db.prepare('INSERT OR IGNORE INTO item_option_groups (item_id, group_id) VALUES (?1, ?2)').bind(id, gid));
    }
  }
  await runBatch(db, statements);
  return { groups: usable.length, options: optionCount, optionsNote: '' };
}

/** The option groups for a restaurant's dishes, as the menu API shows them. Never throws: no options is a safe answer. */
export async function loadOptions(env, db, restaurantId) {
  if (!(await optionsEnabled(env, db, restaurantId))) return { groups: [], byItem: new Map() };
  try {
    const [groups, options, links] = await Promise.all([
      db.prepare('SELECT id, name, min_required, max_allowed FROM option_groups WHERE restaurant_id = ?1 ORDER BY position').bind(restaurantId).all(),
      db.prepare('SELECT o.id, o.group_id, o.name, o.price_cents FROM options o JOIN option_groups g ON g.id = o.group_id WHERE g.restaurant_id = ?1 AND o.available = 1 ORDER BY o.position').bind(restaurantId).all(),
      db.prepare('SELECT l.item_id, l.group_id FROM item_option_groups l JOIN option_groups g ON g.id = l.group_id WHERE g.restaurant_id = ?1').bind(restaurantId).all(),
    ]);
    const optionsByGroup = new Map();
    for (const o of options.results) {
      if (!optionsByGroup.has(o.group_id)) optionsByGroup.set(o.group_id, []);
      optionsByGroup.get(o.group_id).push({ id: o.id, name: o.name, priceCents: o.price_cents });
    }
    const shown = groups.results
      .map((g) => ({ id: g.id, name: g.name, min: g.min_required, max: g.max_allowed, options: optionsByGroup.get(g.id) ?? [] }))
      // A group that must have a pick but has no option left to pick cannot be completed: leave it out.
      .filter((g) => g.options.length && g.min <= g.options.length);
    const ok = new Set(shown.map((g) => g.id));
    const byItem = new Map();
    for (const l of links.results) {
      if (!ok.has(l.group_id)) continue;
      if (!byItem.has(l.item_id)) byItem.set(l.item_id, []);
      byItem.get(l.item_id).push(l.group_id);
    }
    return { groups: shown, byItem };
  } catch (error) {
    console.error('[till] options unavailable, showing the menu without them', error instanceof Error ? error.message : error);
    return { groups: [], byItem: new Map() };
  }
}
