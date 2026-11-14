/**
 * OnDaMenu ordering API, public and read-only: what diners see before they sign in.
 *
 *   GET /api/order/restaurants          restaurants that are live, for the list screen
 *   GET /api/order/restaurants/<slug>   one restaurant with its categories and menu
 *
 * Only restaurants with status 'live' are ever returned, and hidden dishes are left out.
 */
import { loadOptions } from './till.mjs';

const CACHE = 'public, max-age=60';   // menus may be up to a minute old

function json(body, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  });
}

/** The fields the app shows for a restaurant. */
function restaurantView(r) {
  return {
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    tagline: r.tagline,
    photo: r.photo,
    city: r.city,
    isOpen: r.is_open === 1,
    pickup: r.offers_pickup === 1,
    delivery: r.offers_delivery === 1,
    grade: r.grade ?? null,   // null = not yet graded; the app never shows a made-up grade
  };
}

const RESTAURANT_COLUMNS = 'id, slug, name, cuisine, tagline, photo, city, is_open, offers_pickup, offers_delivery, grade';

async function listRestaurants(db) {
  const { results } = await db.prepare(
    `SELECT ${RESTAURANT_COLUMNS} FROM restaurants WHERE status = 'live' ORDER BY is_open DESC, name`,
  ).all();
  return json({ restaurants: results.map(restaurantView) }, 200, CACHE);
}

async function getRestaurant(env, db, slug) {
  const r = await db.prepare(`SELECT ${RESTAURANT_COLUMNS} FROM restaurants WHERE slug = ?1 AND status = 'live'`).bind(slug).first();
  if (!r) return json({ error: 'We could not find that restaurant.' }, 404);

  const [categories, items, links] = await Promise.all([
    db.prepare('SELECT id, name FROM menu_categories WHERE restaurant_id = ?1 ORDER BY position, name').bind(r.id).all(),
    db.prepare(
      'SELECT id, name, description, price_cents, photo, available FROM menu_items WHERE restaurant_id = ?1 AND hidden = 0 ORDER BY position, name',
    ).bind(r.id).all(),
    db.prepare(
      'SELECT l.item_id, l.category_id FROM menu_item_categories l JOIN menu_items i ON i.id = l.item_id WHERE i.restaurant_id = ?1',
    ).bind(r.id).all(),
  ]);

  const byItem = new Map();
  for (const l of links.results) {
    if (!byItem.has(l.item_id)) byItem.set(l.item_id, []);
    byItem.get(l.item_id).push(l.category_id);
  }
  // Dish options (Clover modifiers). Empty whenever they are switched off or unavailable: the menu then works exactly as before.
  const options = await loadOptions(env, db, r.id);
  const groupOrder = new Map(options.groups.map((g, n) => [g.id, n]));
  const menu = items.results.map((i) => {
    const groupIds = [...(options.byItem.get(i.id) ?? [])].sort((a, b) => groupOrder.get(a) - groupOrder.get(b));
    return {
      id: i.id,
      name: i.name,
      description: i.description,
      priceCents: i.price_cents,
      photo: i.photo,
      available: i.available === 1,
      categoryIds: byItem.get(i.id) ?? [],
      ...(groupIds.length ? { groupIds } : {}),
    };
  });
  const usedGroups = new Set(menu.flatMap((i) => i.groupIds ?? []));
  // Leave out categories with nothing in them.
  const used = new Set(menu.flatMap((i) => i.categoryIds));
  return json({
    restaurant: restaurantView(r),
    categories: categories.results.filter((c) => used.has(c.id)),
    items: menu,
    ...(usedGroups.size ? { groups: options.groups.filter((g) => usedGroups.has(g.id)) } : {}),
  }, 200, CACHE);
}

/** Answers /api/order requests. Returns null for any other path. */
export async function handleOrder(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/order/')) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  const db = env.APP_DB;
  if (!db) return json({ error: 'Ordering is not set up yet.' }, 503);

  const parts = url.pathname.slice('/api/order/'.length).split('/').filter(Boolean);
  try {
    if (parts[0] === 'restaurants' && parts.length === 1) return await listRestaurants(db);
    if (parts[0] === 'restaurants' && parts.length === 2 && /^[a-z0-9-]{1,64}$/.test(parts[1])) {
      return await getRestaurant(env, db, parts[1]);
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[order]', error instanceof Error ? error.message : error);
    return json({ error: 'The menu is unavailable right now. Please try again.' }, 502);
  }
}
