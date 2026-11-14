/**
 * Clover connection (the first "till", see worker/till.mjs for the neutral part).
 *
 *   GET  /api/clover/restaurants/<id>/status       connection state (staff of that restaurant, or an administrator)
 *   POST /api/clover/restaurants/<id>/connect      -> { url } where the restaurant signs in to Clover and approves OnDaMenu
 *   GET  /api/clover/callback                      Clover sends the person back here with a one-time code
 *   POST /api/clover/restaurants/<id>/sync         read the menu from Clover now
 *   POST /api/clover/restaurants/<id>/disconnect   forget the stored tokens (the menu stays)
 *   POST /api/clover/restaurants/<id>/options      { on }  administrators only: dish options on or off for this restaurant
 *   POST /api/clover/restaurants/<id>/test-token   { merchantId, token }  administrators only, not in production:
 *                                                  connect a Clover SANDBOX test merchant with a token made in the Clover dashboard
 *   POST /api/clover/webhook                       Clover tells us something changed on a till
 *
 * Settings (wrangler.jsonc vars; secrets set with `wrangler secret put`):
 *   CLOVER_ENV          "sandbox" | "production"            (var)
 *   CLOVER_APP_ID       the Clover app id                    (var, public)
 *   CLOVER_APP_SECRET   the Clover app secret                (secret)
 *   CLOVER_TOKEN_KEY    any long random text; locks stored tokens (secret; a throwaway value in the preview)
 *   CLOVER_WEBHOOK_CODE the code Clover shows when the webhook is verified (secret); without it webhooks are ignored
 *   MODIFIERS           "off" hides every dish option on the whole site (var)
 *
 * Clover tokens expire after about 30 minutes; each refresh token works once. We refresh when needed, one at a time.
 * Tokens are stored only encrypted (AES-GCM) and are never sent to the browser or written to logs.
 * Card details are never handled here: payment will use Clover's hosted card form (stage 4).
 */
import { currentUser, json, sameOrigin } from './auth.mjs';
import { syncMenu, optionsEnabled } from './till.mjs';

const now = () => Math.floor(Date.now() / 1000);
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const MERCHANT_ID = /^[A-Za-z0-9]{8,20}$/;
const TEST_TOKEN = /^[A-Za-z0-9._-]{20,200}$/;
const STATE_MINUTES = 10;
const SYNC_GAP_SECONDS = 15;

class TillError extends Error {
  constructor(message, kind = 'failed') { super(message); this.kind = kind; }
}

// ---- settings ----
const production = (env) => String(env.CLOVER_ENV ?? 'sandbox').toLowerCase() === 'production';
const bases = (env) => (production(env)
  ? { auth: 'https://www.clover.com', api: 'https://api.clover.com' }
  : { auth: 'https://sandbox.dev.clover.com', api: 'https://apisandbox.dev.clover.com' });
const configured = (env) => Boolean(env.CLOVER_APP_ID && env.CLOVER_APP_SECRET && env.CLOVER_TOKEN_KEY);

// ---- small helpers ----
const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function aesKey(env) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(env.CLOVER_TOKEN_KEY)));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

/** Locks a token so it is useless without CLOVER_TOKEN_KEY and without belonging to this restaurant. */
export async function lock(env, plain, restaurantId) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(restaurantId) }, await aesKey(env), new TextEncoder().encode(plain));
  return bytesToBase64(new Uint8Array([...iv, ...new Uint8Array(data)]));
}
export async function unlock(env, locked, restaurantId) {
  const bytes = base64ToBytes(locked);
  const data = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.slice(0, 12), additionalData: new TextEncoder().encode(restaurantId) }, await aesKey(env), bytes.slice(12));
  return new TextDecoder().decode(data);
}

/** The restaurant if this person may manage it (administrator, or merchant on its staff list), else null. */
async function managed(db, user, restaurantId) {
  if (!ID.test(restaurantId)) return null;
  if (user.roles.includes('admin')) return db.prepare('SELECT id, name FROM restaurants WHERE id = ?1').bind(restaurantId).first();
  if (!user.roles.includes('merchant')) return null;
  return db.prepare(
    'SELECT r.id, r.name FROM restaurants r JOIN restaurant_staff s ON s.restaurant_id = r.id WHERE r.id = ?1 AND s.user_id = ?2',
  ).bind(restaurantId, user.id).first();
}

const connectionOf = (db, restaurantId) => db.prepare('SELECT * FROM till_connections WHERE restaurant_id = ?1').bind(restaurantId).first();

async function saveTokens(env, db, restaurantId, tokens, merchantId) {
  const t = now();
  const accessEnc = await lock(env, tokens.access_token, restaurantId);
  const refreshEnc = tokens.refresh_token ? await lock(env, tokens.refresh_token, restaurantId) : null;
  const accessExp = Number.isFinite(tokens.access_token_expiration) ? tokens.access_token_expiration : null;
  const refreshExp = Number.isFinite(tokens.refresh_token_expiration) ? tokens.refresh_token_expiration : null;
  if (merchantId) {
    await db.prepare(
      `INSERT INTO till_connections (restaurant_id, till, merchant_id, access_enc, refresh_enc, access_exp, refresh_exp, lease_until, status, connected)
       VALUES (?1, 'clover', ?2, ?3, ?4, ?5, ?6, 0, 'connected', ?7)
       ON CONFLICT(restaurant_id) DO UPDATE SET merchant_id = excluded.merchant_id, access_enc = excluded.access_enc, refresh_enc = excluded.refresh_enc,
         access_exp = excluded.access_exp, refresh_exp = excluded.refresh_exp, lease_until = 0, status = 'connected', connected = excluded.connected`,
    ).bind(restaurantId, merchantId, accessEnc, refreshEnc, accessExp, refreshExp, t).run();
  } else {
    await db.prepare(
      `UPDATE till_connections SET access_enc = ?2, refresh_enc = ?3, access_exp = ?4, refresh_exp = ?5, lease_until = 0, status = 'connected' WHERE restaurant_id = ?1`,
    ).bind(restaurantId, accessEnc, refreshEnc, accessExp, refreshExp).run();
  }
}

const markReconnect = (db, restaurantId) =>
  db.prepare("UPDATE till_connections SET status = 'needs_reconnect', lease_until = 0 WHERE restaurant_id = ?1").bind(restaurantId).run();

/** A usable access token, refreshed first when it is about to expire. */
async function accessToken(env, db, conn, f) {
  const t = now();
  if (conn.access_exp == null || conn.access_exp - 60 > t) return unlock(env, conn.access_enc, conn.restaurant_id);
  if (!conn.refresh_enc || (conn.refresh_exp != null && conn.refresh_exp <= t)) {
    await markReconnect(db, conn.restaurant_id);
    throw new TillError('Clover needs the restaurant to connect again.', 'reconnect');
  }
  // A refresh token works once, so only one request may use it at a time.
  const lease = await db.prepare('UPDATE till_connections SET lease_until = ?2 WHERE restaurant_id = ?1 AND lease_until < ?3')
    .bind(conn.restaurant_id, t + 30, t).run();
  if (lease.meta?.changes !== 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const fresh = await connectionOf(db, conn.restaurant_id);
    if (fresh && (fresh.access_exp == null || fresh.access_exp - 60 > now())) return unlock(env, fresh.access_enc, fresh.restaurant_id);
    throw new TillError('Clover is refreshing the connection. Please try again in a moment.', 'busy');
  }
  const res = await f(`${bases(env).api}/oauth/v2/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ client_id: env.CLOVER_APP_ID, refresh_token: await unlock(env, conn.refresh_enc, conn.restaurant_id) }),
  });
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) await markReconnect(db, conn.restaurant_id);
    else await db.prepare('UPDATE till_connections SET lease_until = 0 WHERE restaurant_id = ?1').bind(conn.restaurant_id).run();
    throw new TillError('Clover would not renew the connection.', res.status < 500 ? 'reconnect' : 'failed');
  }
  const tokens = await res.json();
  if (!tokens.access_token) throw new TillError('Clover sent an unexpected answer.');
  await saveTokens(env, db, conn.restaurant_id, tokens, null);
  return tokens.access_token;
}

/** One page-by-page read from Clover's REST API. Returns the list of elements. */
async function readAll(env, db, conn, path, f, token) {
  const out = [];
  for (let page = 0; page < 20; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await f(`${bases(env).api}/v3/merchants/${encodeURIComponent(conn.merchant_id)}/${path}${sep}limit=1000&offset=${page * 1000}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    });
    if (res.status === 401) { await markReconnect(db, conn.restaurant_id); throw new TillError('Clover needs the restaurant to connect again.', 'reconnect'); }
    if (!res.ok) throw new TillError(`Clover answered ${res.status}.`);
    const body = await res.json();
    const elements = Array.isArray(body.elements) ? body.elements : [];
    out.push(...elements);
    if (elements.length < 1000) break;
  }
  return out;
}

/** Clover's menu, in the till-neutral shape that till.mjs understands. */
export async function fetchCloverMenu(env, db, conn, f = fetch) {
  // One token for the whole read: a refresh token works only once, so it must not be renewed again part-way through.
  const token = await accessToken(env, db, conn, f);
  const [items, categories] = await Promise.all([
    readAll(env, db, conn, 'items?expand=categories,modifierGroups', f, token),
    readAll(env, db, conn, 'categories', f, token),
  ]);
  let groups = null;   // null = could not be read: the options already stored are kept
  try {
    const rows = await readAll(env, db, conn, 'modifier_groups?expand=modifiers', f, token);
    groups = rows.map((g) => ({
      externalId: String(g.id),
      name: g.name,
      min: g.minRequired,
      max: g.maxAllowed,
      options: (g.modifiers?.elements ?? []).map((m) => ({
        externalId: String(m.id), name: m.name, priceCents: Number.isInteger(m.price) ? m.price : 0, available: m.available !== false,
      })),
    }));
  } catch (error) {
    if (error instanceof TillError && error.kind === 'reconnect') throw error;
    console.error('[clover] modifier groups unavailable', error instanceof Error ? error.message : error);
  }
  const sorted = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.name).localeCompare(String(b.name)));
  return {
    categories: sorted.map((c) => ({ externalId: String(c.id), name: c.name })),
    items: items.map((i) => ({
      externalId: String(i.id),
      name: i.name,
      priceCents: i.price,
      fixedPrice: (i.priceType ?? 'FIXED') === 'FIXED',
      hidden: i.hidden === true,
      categoryIds: (i.categories?.elements ?? []).map((c) => String(c.id)),
      groupIds: (i.modifierGroups?.elements ?? []).map((g) => String(g.id)),
    })),
    groups,
  };
}

/** Reads the menu from the till and stores it. Returns the counts; the short summary is saved for the restaurant to read. */
export async function runSync(env, db, restaurantId, f = fetch) {
  const conn = await connectionOf(db, restaurantId);
  if (!conn) throw new TillError('This restaurant is not connected to Clover.', 'none');
  try {
    const menu = await fetchCloverMenu(env, db, conn, f);
    const result = await syncMenu(env, db, restaurantId, menu);
    const note = `${result.items} dishes (${result.added} new), ${result.categories} categories`
      + (result.groups ? `, ${result.options} options in ${result.groups} groups` : '')
      + (result.skipped ? `. ${result.skipped} left off the menu (no fixed price or no name)` : '')
      + (result.optionsNote ? `. ${result.optionsNote}` : '') + '.';
    await db.prepare('UPDATE till_connections SET last_sync = ?2, last_note = ?3 WHERE restaurant_id = ?1').bind(restaurantId, now(), note.slice(0, 300)).run();
    return { ...result, note };
  } catch (error) {
    const message = error instanceof TillError ? error.message : 'The menu could not be read from Clover.';
    if (!(error instanceof TillError)) console.error('[clover] sync failed', error instanceof Error ? error.message : error);
    await db.prepare('UPDATE till_connections SET last_note = ?2 WHERE restaurant_id = ?1').bind(restaurantId, `Last sync failed: ${message}`.slice(0, 300)).run();
    throw error instanceof TillError ? error : new TillError(message);
  }
}

// ---- screens' API ----
async function status(env, db, user, restaurantId) {
  const conn = await connectionOf(db, restaurantId);
  const admin = user.roles.includes('admin');
  return json({
    configured: configured(env),
    environment: production(env) ? 'production' : 'sandbox',
    connected: Boolean(conn),
    needsReconnect: conn?.status === 'needs_reconnect',
    merchantId: conn && admin ? conn.merchant_id : undefined,
    lastSync: conn?.last_sync ?? null,
    note: conn?.last_note ?? '',
    optionsOn: await optionsEnabled(env, db, restaurantId),
    optionsSiteOff: String(env.MODIFIERS ?? '').toLowerCase() === 'off',
    canTestToken: admin && !production(env),
    canToggleOptions: admin,
  });
}

async function startConnect(request, env, db, user, restaurantId) {
  if (!configured(env)) return json({ error: 'The Clover connection is not set up yet.' }, 503);
  const raw = crypto.getRandomValues(new Uint8Array(24));
  const state = Array.from(raw, (b) => b.toString(16).padStart(2, '0')).join('');
  const t = now();
  await db.prepare('DELETE FROM till_oauth_state WHERE expires < ?1').bind(t).run();
  await db.prepare('INSERT INTO till_oauth_state (state_hash, restaurant_id, user_id, expires) VALUES (?1, ?2, ?3, ?4)')
    .bind(await sha256Hex(state), restaurantId, user.id, t + STATE_MINUTES * 60).run();
  const redirect = `${new URL(request.url).origin}/api/clover/callback`;
  const url = `${bases(env).auth}/oauth/v2/authorize?client_id=${encodeURIComponent(env.CLOVER_APP_ID)}`
    + `&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`;
  return json({ url });
}

async function callback(request, env, db, f) {
  const url = new URL(request.url);
  const back = (result) => new Response(null, { status: 302, headers: { location: `/merchant?clover=${result}`, 'cache-control': 'no-store' } });
  const code = url.searchParams.get('code') ?? '';
  const state = url.searchParams.get('state') ?? '';
  const merchantId = url.searchParams.get('merchant_id') ?? '';
  const user = await currentUser(request, env);
  if (!user || !/^[A-Za-z0-9._~-]{4,200}$/.test(code) || !/^[0-9a-f]{48}$/.test(state) || !MERCHANT_ID.test(merchantId)) return back('error');
  const row = await db.prepare('SELECT restaurant_id, user_id, expires FROM till_oauth_state WHERE state_hash = ?1').bind(await sha256Hex(state)).first();
  await db.prepare('DELETE FROM till_oauth_state WHERE state_hash = ?1').bind(await sha256Hex(state)).run();   // one use only
  if (!row || row.expires < now() || row.user_id !== user.id || !(await managed(db, user, row.restaurant_id))) return back('error');
  // One Clover merchant belongs to one restaurant.
  const taken = await db.prepare('SELECT restaurant_id FROM till_connections WHERE merchant_id = ?1 AND restaurant_id <> ?2').bind(merchantId, row.restaurant_id).first();
  if (taken) return back('taken');
  const res = await f(`${bases(env).api}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ client_id: env.CLOVER_APP_ID, client_secret: env.CLOVER_APP_SECRET, code }),
  });
  if (!res.ok) return back('error');
  const tokens = await res.json();
  if (!tokens.access_token) return back('error');
  await saveTokens(env, db, row.restaurant_id, tokens, merchantId);
  await db.prepare('UPDATE restaurants SET clover_merchant_id = ?2, updated = ?3 WHERE id = ?1').bind(row.restaurant_id, merchantId, now()).run();
  try { await runSync(env, db, row.restaurant_id, f); } catch { /* the connection is saved; the restaurant can press Sync */ }
  return back('connected');
}

async function webhook(request, env, db, ctx, f) {
  let body;
  try { body = await request.json(); } catch { return new Response('ok', { status: 200 }); }
  // Clover's first message after "Send Verification Code" carries the code to copy into the Clover dashboard.
  if (body && typeof body.verificationCode === 'string') {
    console.log('[clover] webhook verification code received:', body.verificationCode);
    return new Response('ok', { status: 200 });
  }
  if (!env.CLOVER_WEBHOOK_CODE) return new Response('ok', { status: 200 });   // not switched on: ignore
  const sent = request.headers.get('x-clover-auth') ?? '';
  if ((await sha256Hex(sent)) !== (await sha256Hex(String(env.CLOVER_WEBHOOK_CODE)))) return new Response('Forbidden', { status: 403 });
  const merchants = body && typeof body.merchants === 'object' && body.merchants ? Object.keys(body.merchants).slice(0, 20) : [];
  const work = (async () => {
    for (const mid of merchants) {
      if (!MERCHANT_ID.test(mid)) continue;
      const conn = await db.prepare('SELECT restaurant_id, last_sync FROM till_connections WHERE merchant_id = ?1').bind(mid).first();
      if (!conn || (conn.last_sync && now() - conn.last_sync < 30)) continue;
      try { await runSync(env, db, conn.restaurant_id, f); } catch { /* noted on the connection */ }
    }
  })();
  if (ctx?.waitUntil) ctx.waitUntil(work); else await work;
  return new Response('ok', { status: 200 });
}

/** Answers /api/clover requests. Returns null for any other path. `opts.fetchFn` lets tests stand in for Clover. */
export async function handleClover(request, env, ctx, opts = {}) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/clover/')) return null;
  const db = env.APP_DB;
  const f = opts.fetchFn ?? fetch;
  if (!db) return json({ error: 'Not set up yet.' }, 503);
  const parts = url.pathname.slice('/api/clover/'.length).split('/').filter(Boolean);

  try {
    if (parts[0] === 'webhook' && parts.length === 1) {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
      return await webhook(request, env, db, ctx, f);
    }
    if (parts[0] === 'callback' && parts.length === 1) {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET' } });
      return await callback(request, env, db, f);
    }
    if (parts[0] !== 'restaurants' || parts.length !== 3) return json({ error: 'Not found' }, 404);

    const user = await currentUser(request, env);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const restaurantId = parts[1];
    const action = parts[2];
    if (!(await managed(db, user, restaurantId))) return json({ error: 'You cannot manage that restaurant.' }, 404);

    if (action === 'status') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET' } });
      return await status(env, db, user, restaurantId);
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, POST' } });
    if (!sameOrigin(request, url)) return json({ error: 'That request did not come from this site.' }, 403);
    const body = await request.json().catch(() => ({}));
    const admin = user.roles.includes('admin');

    if (action === 'connect') return await startConnect(request, env, db, user, restaurantId);
    if (action === 'sync') {
      const conn = await connectionOf(db, restaurantId);
      if (!conn) return json({ error: 'This restaurant is not connected to Clover yet.' }, 409);
      if (conn.last_sync && now() - conn.last_sync < SYNC_GAP_SECONDS) return json({ error: 'The menu was just updated. Please wait a few seconds.' }, 429);
      try {
        const result = await runSync(env, db, restaurantId, f);
        return json({ ok: true, note: result.note });
      } catch (error) {
        const kind = error instanceof TillError ? error.kind : 'failed';
        return json({ error: error.message, needsReconnect: kind === 'reconnect' }, kind === 'reconnect' ? 409 : 502);
      }
    }
    if (action === 'disconnect') {
      await db.prepare('DELETE FROM till_connections WHERE restaurant_id = ?1').bind(restaurantId).run();
      return json({ ok: true });
    }
    if (action === 'options') {
      if (!admin) return json({ error: 'Only an administrator can change this.' }, 403);
      const on = body.on === true ? 1 : 0;
      await db.prepare('INSERT INTO restaurant_settings (restaurant_id, options_on) VALUES (?1, ?2) ON CONFLICT(restaurant_id) DO UPDATE SET options_on = excluded.options_on')
        .bind(restaurantId, on).run();
      return json({ ok: true, optionsOn: on === 1 });
    }
    if (action === 'test-token') {
      if (!admin || production(env)) return json({ error: 'Not available.' }, 403);
      if (!env.CLOVER_TOKEN_KEY) return json({ error: 'The Clover connection is not set up yet.' }, 503);
      const merchantId = String(body.merchantId ?? '').trim();
      const token = String(body.token ?? '').trim();
      if (!MERCHANT_ID.test(merchantId) || !TEST_TOKEN.test(token)) return json({ error: 'Enter the Clover merchant id and an API token.' }, 400);
      const taken = await db.prepare('SELECT restaurant_id FROM till_connections WHERE merchant_id = ?1 AND restaurant_id <> ?2').bind(merchantId, restaurantId).first();
      if (taken) return json({ error: 'That Clover merchant is already connected to another restaurant.' }, 409);
      await saveTokens(env, db, restaurantId, { access_token: token }, merchantId);
      await db.prepare('UPDATE restaurants SET clover_merchant_id = ?2, updated = ?3 WHERE id = ?1').bind(restaurantId, merchantId, now()).run();
      try {
        const result = await runSync(env, db, restaurantId, f);
        return json({ ok: true, note: result.note });
      } catch (error) {
        return json({ error: error.message, needsReconnect: error instanceof TillError && error.kind === 'reconnect' }, 502);
      }
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[clover]', error instanceof Error ? error.message : error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
