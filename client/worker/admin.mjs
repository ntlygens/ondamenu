/**
 * OnDaMenu administration API. Every route requires a signed-in administrator.
 *
 *   GET  /api/admin/users?q=text                     find accounts by email, phone or name (up to 50)
 *   POST /api/admin/roles   { userId, role, grant }  give or remove the merchant, courier or admin role
 *   GET  /api/admin/restaurants                      every restaurant with its staff and number of dishes
 *   POST /api/admin/restaurants                      create a restaurant (starts as a draft, not shown to diners)
 *   POST /api/admin/restaurants/<id>                 change its details or status (draft, live, paused)
 *   POST /api/admin/restaurants/<id>/staff  { email, add }   put a person on, or take them off, its staff list
 *
 * Adding staff by email also gives that account the restaurant role. If nobody has signed in with the address yet,
 * the account is created now, so the person finds their restaurant waiting the first time they sign in.
 *
 * The first administrator is whoever signs in with an address listed in ADMIN_EMAILS (worker/auth.mjs).
 */
import { currentUser, json, normalizeDestination, sameOrigin } from './auth.mjs';

/** Roles an administrator can give or remove. Everyone keeps "diner". */
const GRANTABLE = ['merchant', 'courier', 'admin'];

async function listUsers(url, db) {
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  // Treat the search text literally: % and _ are not wildcards.
  const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
  const { results } = await db.prepare(
    `SELECT u.id, u.name, u.email, u.phone, u.created, u.last_login,
            (SELECT group_concat(role) FROM user_roles r WHERE r.user_id = u.id) AS roles
       FROM users u
      WHERE ?1 = '%%' OR u.email LIKE ?1 ESCAPE '\\' OR u.phone LIKE ?1 ESCAPE '\\' OR u.name LIKE ?1 ESCAPE '\\'
      ORDER BY u.last_login DESC, u.created DESC
      LIMIT 50`,
  ).bind(like).all();
  return json({ users: results.map((u) => ({ ...u, roles: (u.roles ?? '').split(',').filter(Boolean).sort() })) });
}

async function setRole(body, admin, db) {
  const userId = String(body.userId ?? '');
  const role = String(body.role ?? '');
  const grant = body.grant === true;
  if (!GRANTABLE.includes(role)) return json({ error: 'That role cannot be changed here.' }, 400);
  const target = await db.prepare('SELECT id FROM users WHERE id = ?1').bind(userId).first();
  if (!target) return json({ error: 'That account no longer exists.' }, 404);
  if (!grant && role === 'admin' && userId === admin.id) {
    return json({ error: 'You cannot remove your own administrator role.' }, 400);
  }
  if (grant) {
    await db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role, granted) VALUES (?1, ?2, ?3)')
      .bind(userId, role, Math.floor(Date.now() / 1000)).run();
  } else {
    await db.prepare('DELETE FROM user_roles WHERE user_id = ?1 AND role = ?2').bind(userId, role).run();
  }
  const { results } = await db.prepare('SELECT role FROM user_roles WHERE user_id = ?1 ORDER BY role').bind(userId).all();
  return json({ userId, roles: results.map((r) => r.role) });
}

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const STATUSES = ['draft', 'live', 'paused'];
const now = () => Math.floor(Date.now() / 1000);

/** Plain text: no control characters, single spaces, trimmed. */
const clean = (value) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();

/** Restaurant details an administrator may set: [body key, column, longest length, extra rule + its message]. */
const TEXT_FIELDS = [
  ['name', 'name', 80],
  ['cuisine', 'cuisine', 40],
  ['tagline', 'tagline', 140],
  ['phone', 'phone', 20],
  ['address', 'address', 120],
  ['city', 'city', 60],
  ['state', 'state', 2, /^([A-Za-z]{2})?$/, 'Use the two-letter state, for example NY.'],
  ['zip', 'zip', 5, /^(\d{5})?$/, 'Use a five-digit ZIP code.'],
  ['camis', 'camis', 10, /^(\d{6,10})?$/, 'The NYC Health Department id (CAMIS) is 6 to 10 digits.'],
];

/** Reads the restaurant fields present in a request body. Returns { values } or { error }. */
function readRestaurantFields(body) {
  const values = {};
  for (const [key, column, max, rule, message] of TEXT_FIELDS) {
    if (!(key in body)) continue;
    if (typeof body[key] !== 'string') return { error: 'That detail must be text.' };
    const text = clean(body[key]);
    if (text.length > max) return { error: `"${key}" is too long (${max} characters at most).` };
    if (rule && !rule.test(text)) return { error: message };
    values[column] = column === 'state' ? text.toUpperCase() : text;
  }
  if ('name' in values && !values.name) return { error: 'The restaurant needs a name.' };
  // The city's id is kept as "no value" rather than empty text.
  if ('camis' in values && !values.camis) values.camis = null;
  if ('offersDelivery' in body) {
    if (typeof body.offersDelivery !== 'boolean') return { error: 'Delivery must be on or off.' };
    values.offers_delivery = body.offersDelivery ? 1 : 0;
  }
  if ('status' in body) {
    if (!STATUSES.includes(body.status)) return { error: 'Status must be draft, live or paused.' };
    values.status = body.status;
  }
  return { values };
}

/** "Joe's Pizza & Grill" -> "joes-pizza-grill"; a number is added when the address is already taken. */
async function freeSlug(db, name) {
  const base = name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '') || 'restaurant';
  for (let n = 1; n < 200; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await db.prepare('SELECT 1 FROM restaurants WHERE slug = ?1').bind(slug).first())) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function adminRestaurantView(r, staff, dishes) {
  return {
    id: r.id, slug: r.slug, name: r.name, cuisine: r.cuisine, tagline: r.tagline, phone: r.phone,
    address: r.address, city: r.city, state: r.state, zip: r.zip, camis: r.camis ?? '',
    offersDelivery: r.offers_delivery === 1, isOpen: r.is_open === 1, status: r.status,
    grade: r.grade ?? null, dishes, staff,
  };
}

async function oneRestaurant(db, id) {
  const r = await db.prepare('SELECT * FROM restaurants WHERE id = ?1').bind(id).first();
  if (!r) return null;
  const [staff, count] = await Promise.all([
    db.prepare(
      'SELECT u.id, u.email, u.phone, u.name, u.last_login FROM restaurant_staff s JOIN users u ON u.id = s.user_id WHERE s.restaurant_id = ?1 ORDER BY u.email',
    ).bind(id).all(),
    db.prepare('SELECT count(*) AS n FROM menu_items WHERE restaurant_id = ?1').bind(id).first(),
  ]);
  return adminRestaurantView(r, staff.results, count?.n ?? 0);
}

async function listRestaurants(db) {
  const { results } = await db.prepare('SELECT id FROM restaurants ORDER BY name').all();
  const restaurants = [];
  for (const row of results) restaurants.push(await oneRestaurant(db, row.id));
  return json({ restaurants });
}

async function createRestaurant(body, db) {
  const { values, error } = readRestaurantFields(body);
  if (error) return json({ error }, 400);
  if (!values.name) return json({ error: 'The restaurant needs a name.' }, 400);
  if (values.status && values.status !== 'draft') return json({ error: 'A new restaurant starts as a draft.' }, 400);
  const id = `r_${crypto.randomUUID().replaceAll('-', '')}`;
  const row = { id, slug: await freeSlug(db, values.name), created: now(), updated: now(), ...values, status: 'draft' };
  const columns = Object.keys(row);
  await db.prepare(
    `INSERT INTO restaurants (${columns.join(', ')}) VALUES (${columns.map((_, i) => `?${i + 1}`).join(', ')})`,
  ).bind(...columns.map((c) => row[c])).run();
  return json({ restaurant: await oneRestaurant(db, id) }, 201);
}

async function updateRestaurant(id, body, db) {
  const { values, error } = readRestaurantFields(body);
  if (error) return json({ error }, 400);
  const columns = Object.keys(values);
  if (!columns.length) return json({ error: 'Nothing to save.' }, 400);
  // Column names come from the fixed list above, never from the request.
  await db.prepare(
    `UPDATE restaurants SET ${columns.map((c, i) => `${c} = ?${i + 1}`).join(', ')}, updated = ?${columns.length + 1} WHERE id = ?${columns.length + 2}`,
  ).bind(...columns.map((c) => values[c]), now(), id).run();
  return json({ restaurant: await oneRestaurant(db, id) });
}

async function setStaff(id, body, db) {
  const dest = normalizeDestination(body.email);
  if (!dest || dest.channel !== 'email') return json({ error: 'Enter the person\'s email address.' }, 400);
  if (typeof body.add !== 'boolean') return json({ error: 'Say whether to add or remove this person.' }, 400);
  let user = await db.prepare('SELECT id FROM users WHERE email = ?1').bind(dest.value).first();
  const t = now();
  if (body.add) {
    if (!user) {
      user = { id: crypto.randomUUID() };
      await db.prepare('INSERT INTO users (id, email, created) VALUES (?1, ?2, ?3)').bind(user.id, dest.value, t).run();
      await db.prepare("INSERT INTO user_roles (user_id, role, granted) VALUES (?1, 'diner', ?2)").bind(user.id, t).run();
    }
    await db.prepare('INSERT OR IGNORE INTO restaurant_staff (restaurant_id, user_id) VALUES (?1, ?2)').bind(id, user.id).run();
    await db.prepare("INSERT OR IGNORE INTO user_roles (user_id, role, granted) VALUES (?1, 'merchant', ?2)").bind(user.id, t).run();
  } else if (user) {
    await db.prepare('DELETE FROM restaurant_staff WHERE restaurant_id = ?1 AND user_id = ?2').bind(id, user.id).run();
    // Someone on no staff list any more is no longer a restaurant account.
    const other = await db.prepare('SELECT 1 FROM restaurant_staff WHERE user_id = ?1').bind(user.id).first();
    if (!other) await db.prepare("DELETE FROM user_roles WHERE user_id = ?1 AND role = 'merchant'").bind(user.id).run();
  }
  return json({ restaurant: await oneRestaurant(db, id) });
}

/** Answers /api/admin requests. Returns null for any other path. */
export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/admin/')) return null;
  const db = env.APP_DB;
  if (!db || !env.AUTH_PEPPER) return json({ error: 'Accounts are not set up yet.' }, 503);

  try {
    const admin = await currentUser(request, env);
    if (!admin) return json({ error: 'Please sign in first.' }, 401);
    if (!admin.roles.includes('admin')) return json({ error: 'This area is for administrators.' }, 403);

    const action = url.pathname.slice('/api/admin/'.length);
    if (action === 'users' && request.method === 'GET') return await listUsers(url, db);
    if (action === 'restaurants' && request.method === 'GET') return await listRestaurants(db);
    if (request.method === 'POST') {
      if (!sameOrigin(request, url)) return json({ error: 'Request not allowed.' }, 403);
      let body = {};
      try { body = (await request.json()) ?? {}; } catch { /* empty or invalid body */ }
      if (body === null || typeof body !== 'object' || Array.isArray(body)) body = {};
      if (action === 'roles') return await setRole(body, admin, db);
      if (action === 'restaurants') return await createRestaurant(body, db);
      const [kind, id, extra, ...rest] = action.split('/');
      if (kind === 'restaurants' && ID.test(id ?? '') && !rest.length && (!extra || extra === 'staff')) {
        const exists = await db.prepare('SELECT 1 FROM restaurants WHERE id = ?1').bind(id).first();
        if (!exists) return json({ error: 'That restaurant no longer exists.' }, 404);
        return extra ? await setStaff(id, body, db) : await updateRestaurant(id, body, db);
      }
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[admin]', error instanceof Error ? error.message : error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
