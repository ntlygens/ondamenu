/**
 * OnDaMenu restaurant (merchant) API: a restaurant's own people edit its menu.
 * Every route needs a signed-in account with the merchant role that is on that restaurant's staff list.
 * Administrators may manage every restaurant.
 *
 *   GET    /api/merchant/restaurants               restaurants this account manages
 *   GET    /api/merchant/restaurants/<id>          one restaurant with every dish, hidden ones included
 *   POST   /api/merchant/restaurants/<id>          { isOpen }
 *   PUT    /api/merchant/restaurants/<id>/photo    header photo (image bytes)      DELETE removes it
 *   POST   /api/merchant/items/<id>                { description, priceCents, available, hidden } (any of them)
 *   PUT    /api/merchant/items/<id>/photo          dish photo (image bytes)        DELETE removes it
 *
 * Photos live in one Cloudflare R2 bucket (binding MEDIA), in a folder per restaurant:
 *   restaurants/<restaurant id>/header-<random>.webp
 *   restaurants/<restaurant id>/items/<dish id>-<random>.webp
 * The dish or restaurant row keeps the photo's address (/media/<that path>), which GET /media/... serves.
 * The browser shrinks a photo before sending it, and anything over MAX_PHOTO_BYTES is refused.
 */
import { currentUser, json, sameOrigin } from './auth.mjs';

export const MAX_PHOTO_BYTES = 400 * 1024;
const MAX_DESCRIPTION = 300;
const MAX_PRICE_CENTS = 100000;   // $1,000.00
const ID = /^[A-Za-z0-9_-]{1,64}$/;
/** Paths GET /media/ will serve. Nothing else in the bucket can be read from outside. */
const MEDIA_KEY = /^restaurants\/[A-Za-z0-9_-]{1,64}\/(?:items\/)?[A-Za-z0-9_-]{1,96}\.(?:webp|jpg)$/;
const MEDIA_PREFIX = '/media/';

const now = () => Math.floor(Date.now() / 1000);

/** Plain text: no control characters, single spaces, trimmed, cut to a length. */
function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function randomPart() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

/** 'webp' or 'jpg' when the bytes really are that kind of picture, else null. */
function photoKind(bytes) {
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  return null;
}

/** The restaurant if this person may manage it, else null. */
async function managed(db, user, restaurantId) {
  if (!ID.test(restaurantId)) return null;
  if (user.roles.includes('admin')) {
    return db.prepare('SELECT * FROM restaurants WHERE id = ?1').bind(restaurantId).first();
  }
  return db.prepare(
    'SELECT r.* FROM restaurants r JOIN restaurant_staff s ON s.restaurant_id = r.id WHERE r.id = ?1 AND s.user_id = ?2',
  ).bind(restaurantId, user.id).first();
}

function restaurantView(r) {
  return {
    id: r.id, slug: r.slug, name: r.name, cuisine: r.cuisine, city: r.city, photo: r.photo,
    isOpen: r.is_open === 1, status: r.status,
  };
}

function itemView(i, categoryIds) {
  return {
    id: i.id, name: i.name, description: i.description, priceCents: i.price_cents, photo: i.photo,
    available: i.available === 1, hidden: i.hidden === 1, categoryIds,
  };
}

async function listRestaurants(db, user) {
  const { results } = user.roles.includes('admin')
    ? await db.prepare('SELECT * FROM restaurants ORDER BY name').all()
    : await db.prepare(
      'SELECT r.* FROM restaurants r JOIN restaurant_staff s ON s.restaurant_id = r.id WHERE s.user_id = ?1 ORDER BY r.name',
    ).bind(user.id).all();
  return json({ restaurants: results.map(restaurantView) });
}

async function getMenu(db, r) {
  const [categories, items, links] = await Promise.all([
    db.prepare('SELECT id, name FROM menu_categories WHERE restaurant_id = ?1 ORDER BY position, name').bind(r.id).all(),
    db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?1 ORDER BY position, name').bind(r.id).all(),
    db.prepare(
      'SELECT l.item_id, l.category_id FROM menu_item_categories l JOIN menu_items i ON i.id = l.item_id WHERE i.restaurant_id = ?1',
    ).bind(r.id).all(),
  ]);
  const byItem = new Map();
  for (const l of links.results) {
    if (!byItem.has(l.item_id)) byItem.set(l.item_id, []);
    byItem.get(l.item_id).push(l.category_id);
  }
  return json({
    restaurant: restaurantView(r),
    categories: categories.results,
    items: items.results.map((i) => itemView(i, byItem.get(i.id) ?? [])),
    photos: { maxBytes: MAX_PHOTO_BYTES },
  });
}

async function saveRestaurant(db, r, body) {
  if (typeof body.isOpen !== 'boolean') return json({ error: 'Nothing to save.' }, 400);
  await db.prepare('UPDATE restaurants SET is_open = ?1, updated = ?2 WHERE id = ?3').bind(body.isOpen ? 1 : 0, now(), r.id).run();
  return json({ restaurant: restaurantView({ ...r, is_open: body.isOpen ? 1 : 0 }) });
}

/** The dish and its restaurant if this person may manage it, else null. */
async function managedItem(db, user, itemId) {
  if (!ID.test(itemId)) return null;
  const item = await db.prepare('SELECT * FROM menu_items WHERE id = ?1').bind(itemId).first();
  if (!item) return null;
  const restaurant = await managed(db, user, item.restaurant_id);
  return restaurant ? { item, restaurant } : null;
}

async function saveItem(db, item, body) {
  const next = { ...item };
  if ('description' in body) {
    if (typeof body.description !== 'string') return json({ error: 'The description must be text.' }, 400);
    if (body.description.trim().length > MAX_DESCRIPTION) {
      return json({ error: `Keep the description to ${MAX_DESCRIPTION} characters or fewer.` }, 400);
    }
    next.description = clean(body.description, MAX_DESCRIPTION);
  }
  if ('priceCents' in body) {
    const cents = body.priceCents;
    if (!Number.isInteger(cents) || cents < 0 || cents > MAX_PRICE_CENTS) {
      return json({ error: 'Enter a price between $0.00 and $1,000.00.' }, 400);
    }
    next.price_cents = cents;
  }
  for (const [key, column] of [['available', 'available'], ['hidden', 'hidden']]) {
    if (key in body) {
      if (typeof body[key] !== 'boolean') return json({ error: 'That setting must be on or off.' }, 400);
      next[column] = body[key] ? 1 : 0;
    }
  }
  await db.prepare(
    'UPDATE menu_items SET description = ?1, price_cents = ?2, available = ?3, hidden = ?4, updated = ?5 WHERE id = ?6',
  ).bind(next.description, next.price_cents, next.available, next.hidden, now(), item.id).run();
  const { results } = await db.prepare('SELECT category_id FROM menu_item_categories WHERE item_id = ?1').bind(item.id).all();
  return json({ item: itemView(next, results.map((l) => l.category_id)) });
}

/** The bucket path behind a stored photo address, when it is one of this restaurant's own uploads. */
function ownKey(photo, restaurantId) {
  const prefix = `${MEDIA_PREFIX}restaurants/${restaurantId}/`;
  return typeof photo === 'string' && photo.startsWith(prefix) ? photo.slice(MEDIA_PREFIX.length) : null;
}

/** Stores an uploaded photo and returns its address, or a Response that says why not. */
async function storePhoto(request, env, key) {
  if (!env.MEDIA) return json({ error: 'Photo storage is not switched on yet.' }, 503);
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_PHOTO_BYTES) return json({ error: 'That photo is too large.' }, 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0) return json({ error: 'No photo was sent.' }, 400);
  if (bytes.length > MAX_PHOTO_BYTES) return json({ error: 'That photo is too large.' }, 413);
  const kind = photoKind(bytes);
  if (!kind) return json({ error: 'Please choose a photo (JPEG, PNG or WebP).' }, 415);
  const path = `${key}-${randomPart()}.${kind}`;
  await env.MEDIA.put(path, bytes, {
    httpMetadata: { contentType: kind === 'webp' ? 'image/webp' : 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' },
  });
  return MEDIA_PREFIX + path;
}

async function removeStored(env, photo, restaurantId) {
  const key = ownKey(photo, restaurantId);
  if (key && env.MEDIA) {
    try { await env.MEDIA.delete(key); } catch (error) { console.error('[merchant] photo delete', error instanceof Error ? error.message : error); }
  }
}

async function setItemPhoto(request, env, db, item, restaurant) {
  let photo = '';
  if (request.method === 'PUT') {
    const stored = await storePhoto(request, env, `restaurants/${restaurant.id}/items/${item.id}`);
    if (stored instanceof Response) return stored;
    photo = stored;
  }
  await db.prepare('UPDATE menu_items SET photo = ?1, updated = ?2 WHERE id = ?3').bind(photo, now(), item.id).run();
  await removeStored(env, item.photo, restaurant.id);
  return json({ photo });
}

async function setRestaurantPhoto(request, env, db, restaurant) {
  let photo = '';
  if (request.method === 'PUT') {
    const stored = await storePhoto(request, env, `restaurants/${restaurant.id}/header`);
    if (stored instanceof Response) return stored;
    photo = stored;
  }
  await db.prepare('UPDATE restaurants SET photo = ?1, updated = ?2 WHERE id = ?3').bind(photo, now(), restaurant.id).run();
  await removeStored(env, restaurant.photo, restaurant.id);
  return json({ photo });
}

async function readBody(request) {
  try { return (await request.json()) ?? {}; } catch { return {}; }
}

/** Answers /api/merchant requests. Returns null for any other path. */
export async function handleMerchant(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/merchant/')) return null;
  const db = env.APP_DB;
  if (!db || !env.AUTH_PEPPER) return json({ error: 'Accounts are not set up yet.' }, 503);

  try {
    const user = await currentUser(request, env);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    if (!user.roles.includes('merchant') && !user.roles.includes('admin')) {
      return json({ error: 'This area is for restaurant accounts.' }, 403);
    }
    const method = request.method;
    if (method !== 'GET' && !sameOrigin(request, url)) return json({ error: 'Request not allowed.' }, 403);

    const [kind, id, extra, ...rest] = url.pathname.slice('/api/merchant/'.length).split('/').filter(Boolean);
    if (rest.length) return json({ error: 'Not found' }, 404);
    const notYours = () => json({ error: 'We could not find that on your account.' }, 404);

    if (kind === 'restaurants') {
      if (!id) return method === 'GET' ? await listRestaurants(db, user) : json({ error: 'Not found' }, 404);
      const restaurant = await managed(db, user, id);
      if (!restaurant) return notYours();
      if (!extra && method === 'GET') return await getMenu(db, restaurant);
      if (!extra && method === 'POST') return await saveRestaurant(db, restaurant, await readBody(request));
      if (extra === 'photo' && (method === 'PUT' || method === 'DELETE')) return await setRestaurantPhoto(request, env, db, restaurant);
    }
    if (kind === 'items' && id) {
      const found = await managedItem(db, user, id);
      if (!found) return notYours();
      if (!extra && method === 'POST') return await saveItem(db, found.item, await readBody(request));
      if (extra === 'photo' && (method === 'PUT' || method === 'DELETE')) return await setItemPhoto(request, env, db, found.item, found.restaurant);
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[merchant]', error instanceof Error ? error.message : error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}

/** Serves uploaded photos: GET /media/restaurants/<id>/... Returns null for any other path. */
export async function handleMedia(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(MEDIA_PREFIX)) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  const key = url.pathname.slice(MEDIA_PREFIX.length);
  if (!env.MEDIA || !MEDIA_KEY.test(key)) return new Response('Not found', { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(request.method === 'HEAD' ? null : object.body, {
    headers: {
      'content-type': key.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
      // The path changes whenever a photo is replaced, so a copy can be kept for a year.
      'cache-control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag,
    },
  });
}
