/**
 * OnDaMenu sign-in: a one-time code sent by email, then a session cookie.
 * Text-message codes are built in but switched off (see SIGN_IN_CHANNELS) until a text sender is connected.
 *
 *   POST /api/auth/start    { destination }         send a 6-digit code to an email address
 *   POST /api/auth/verify   { destination, code }   check the code, sign the person in (creates the account on first use)
 *   GET  /api/auth/me                                who is signed in (or null)
 *   POST /api/auth/signout                           end the session
 *   POST /api/auth/profile  { name }                 change the signed-in person's name
 *
 * No passwords exist. Codes and session tokens are stored only as hashes.
 * Email goes out through Cloudflare Email Service when the Worker has an EMAIL binding (wrangler.jsonc).
 * Where DEV_SHOW_CODES is "1" (preview and local) the code is shown on screen and nothing is sent.
 * Without either, sign-in is refused, so production can never hand out a code it did not deliver.
 *
 * Abuse protection on requesting codes:
 *   - limits per email address, per network address and for the whole site (constants below);
 *   - a Cloudflare Turnstile "are you human" check, enforced whenever TURNSTILE_SECRET and TURNSTILE_SITE_KEY are set.
 */
/** Ways people may sign in today. Add 'sms' once a text-message sender exists in sendCode(). */
const SIGN_IN_CHANNELS = ['email'];
/** Sender shown on sign-in emails. The domain must be set up for Email Sending in Cloudflare. */
const MAIL_FROM = { email: 'no-reply@ondamenu.com', name: 'OnDaMenu' };
const CODE_MINUTES = 10;         // how long a code is valid
const MAX_ATTEMPTS = 5;          // wrong guesses allowed per code
const MAX_CODES_PER_HOUR = 5;    // codes one address or number may request per hour
const MAX_CODES_PER_IP_HOUR = 10;   // codes one network address may request per hour, across all email addresses
const MAX_CODES_SITE_HOUR = 200;    // codes the whole site may issue per hour (protects the daily email allowance)
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SESSION_DAYS = 30;
const COOKIE = 'odm_session';

const now = () => Math.floor(Date.now() / 1000);

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

/** True when a change request comes from this site's own pages (or from a non-browser client). */
export function sameOrigin(request, url) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === url.host; } catch { return false; }
}

/** Email addresses that become administrators when they sign in (ADMIN_EMAILS, comma-separated). */
const adminEmails = (env) => String(env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

/** Returns { channel: 'email' | 'sms', value } for a valid email address or US mobile number, else null. */
export function normalizeDestination(raw) {
  const text = String(raw ?? '').trim();
  if (!text || text.length > 254) return null;
  if (text.includes('@')) {
    const email = text.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? { channel: 'email', value: email } : null;
  }
  if (!/^[\d\s().+-]+$/.test(text)) return null;
  let digits = text.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  // US numbers: 10 digits, area code and exchange never start with 0 or 1.
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? { channel: 'sms', value: `+1${digits}` } : null;
}

async function sha256(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Six random digits, every value equally likely. */
function randomCode() {
  const box = new Uint32Array(1);
  do crypto.getRandomValues(box); while (box[0] >= 4294000000);
  return String(box[0] % 1000000).padStart(6, '0');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Compares two equal-length hex strings without stopping at the first difference. */
function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const codeHash = (env, destination, code) => sha256(`${env.AUTH_PEPPER}:${destination}:${code}`);

function readCookie(request) {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return rest.join('=');
  }
  return null;
}

function cookieHeader(url, value, maxAge) {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** True when this environment can deliver codes over the given channel. */
function canSend(env, channel) {
  return channel === 'email' && Boolean(env.EMAIL);
}

/** Delivers a code. Returns true once the sender has accepted it. */
async function sendCode(env, channel, destination, code) {
  if (!canSend(env, channel)) return false;
  const line = `Your OnDaMenu sign-in code is ${code}. It works for ${CODE_MINUTES} minutes.`;
  const ignore = 'If you did not ask for this code, you can ignore this email.';
  try {
    await env.EMAIL.send({
      from: MAIL_FROM,
      to: destination,
      subject: `${code} is your OnDaMenu sign-in code`,
      text: `${line}\n\n${ignore}\n`,
      html: `<p>Your OnDaMenu sign-in code is <strong style="font-size:1.4em;letter-spacing:.12em">${code}</strong>.</p>`
        + `<p>It works for ${CODE_MINUTES} minutes.</p><p style="color:#5f6b7a">${ignore}</p>`,
    });
    return true;
  } catch (error) {
    // Log the reason, never the code or the address.
    console.error('[auth] email not sent:', error?.code ?? (error instanceof Error ? error.message : 'unknown error'));
    return false;
  }
}

/** The Turnstile site key to show on the sign-in page, or '' when the human check is off. */
const challengeKey = (env) => (env.TURNSTILE_SECRET && env.TURNSTILE_SITE_KEY ? env.TURNSTILE_SITE_KEY : '');

/** Asks Cloudflare whether a Turnstile token is genuine. Any failure counts as "not confirmed". */
async function passedHumanCheck(env, token, ip) {
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    return res.ok && (await res.json()).success === true;
  } catch {
    return false;
  }
}

async function publicUser(db, row) {
  const { results } = await db.prepare('SELECT role FROM user_roles WHERE user_id = ?1 ORDER BY role').bind(row.id).all();
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, roles: results.map((r) => r.role) };
}

async function start(body, env, db, request) {
  const dest = normalizeDestination(body.destination);
  if (!dest) return json({ error: 'Enter a valid email address.' }, 400);
  if (!SIGN_IN_CHANNELS.includes(dest.channel)) {
    return json({ error: 'Please sign in with your email address. Sign-in by text message is coming later.' }, 400);
  }

  const showOnScreen = env.DEV_SHOW_CODES === '1';
  if (!showOnScreen && !canSend(env, dest.channel)) {
    return json({ error: 'Sign-in is not switched on yet. Please check back soon.' }, 503);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  if (challengeKey(env) && !(await passedHumanCheck(env, body.humanToken, ip))) {
    return json({ error: 'Please complete the "I am human" check and try again.' }, 400);
  }

  const t = now();
  const hourAgo = t - 3600;
  const recent = await db.prepare('SELECT COUNT(*) AS n FROM login_codes WHERE destination = ?1 AND created > ?2')
    .bind(dest.value, hourAgo).first();
  if (recent.n >= MAX_CODES_PER_HOUR) {
    return json({ error: 'Too many codes requested. Please try again in an hour.' }, 429);
  }
  // The network address is stored only as a hash.
  const ipHash = ip ? await sha256(`${env.AUTH_PEPPER}:ip:${ip}`) : null;
  if (ipHash) {
    const fromIp = await db.prepare('SELECT COUNT(*) AS n FROM login_codes WHERE ip_hash = ?1 AND created > ?2')
      .bind(ipHash, hourAgo).first();
    if (fromIp.n >= MAX_CODES_PER_IP_HOUR) {
      return json({ error: 'Too many sign-in requests from this connection. Please try again in an hour.' }, 429);
    }
  }
  const siteWide = await db.prepare('SELECT COUNT(*) AS n FROM login_codes WHERE created > ?1').bind(hourAgo).first();
  if (siteWide.n >= MAX_CODES_SITE_HOUR) {
    console.error('[auth] site-wide sign-in limit reached:', siteWide.n, 'codes in the last hour');
    return json({ error: 'Sign-in is very busy right now. Please try again in a few minutes.' }, 503);
  }

  const code = randomCode();
  // A new code replaces any earlier one.
  await db.prepare('UPDATE login_codes SET consumed = 1 WHERE destination = ?1 AND consumed = 0').bind(dest.value).run();
  await db.prepare('INSERT INTO login_codes (destination, channel, code_hash, created, expires, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(dest.value, dest.channel, await codeHash(env, dest.value, code), t, t + CODE_MINUTES * 60, ipHash).run();

  if (showOnScreen) return json({ ok: true, channel: dest.channel, minutes: CODE_MINUTES, devCode: code });
  if (!(await sendCode(env, dest.channel, dest.value, code))) {
    return json({ error: 'We could not send your code. Please try again.' }, 502);
  }
  return json({ ok: true, channel: dest.channel, minutes: CODE_MINUTES });
}

async function verify(body, env, db, url) {
  const dest = normalizeDestination(body.destination);
  const code = String(body.code ?? '').replace(/\D/g, '');
  if (!dest || !SIGN_IN_CHANNELS.includes(dest.channel) || code.length !== 6) {
    return json({ error: 'Enter the 6-digit code.' }, 400);
  }

  const t = now();
  const row = await db.prepare(
    'SELECT id, code_hash, attempts FROM login_codes WHERE destination = ?1 AND consumed = 0 AND expires > ?2 ORDER BY id DESC LIMIT 1',
  ).bind(dest.value, t).first();
  if (!row) return json({ error: 'That code has expired. Request a new one.' }, 400);

  if (row.attempts >= MAX_ATTEMPTS) {
    await db.prepare('UPDATE login_codes SET consumed = 1 WHERE id = ?1').bind(row.id).run();
    return json({ error: 'Too many wrong tries. Request a new code.' }, 429);
  }
  if (!sameHash(row.code_hash, await codeHash(env, dest.value, code))) {
    await db.prepare('UPDATE login_codes SET attempts = attempts + 1 WHERE id = ?1').bind(row.id).run();
    return json({ error: 'That code is not right. Check it and try again.' }, 400);
  }
  await db.prepare('UPDATE login_codes SET consumed = 1 WHERE id = ?1').bind(row.id).run();

  const column = dest.channel === 'email' ? 'email' : 'phone';
  let user = await db.prepare(`SELECT id, name, email, phone FROM users WHERE ${column} = ?1`).bind(dest.value).first();
  if (!user) {
    user = { id: crypto.randomUUID(), name: '', email: null, phone: null, [column]: dest.value };
    await db.prepare('INSERT INTO users (id, email, phone, created, last_login) VALUES (?1, ?2, ?3, ?4, ?4)')
      .bind(user.id, user.email, user.phone, t).run();
    await db.prepare("INSERT INTO user_roles (user_id, role, granted) VALUES (?1, 'diner', ?2)").bind(user.id, t).run();
  } else {
    await db.prepare('UPDATE users SET last_login = ?2 WHERE id = ?1').bind(user.id, t).run();
  }
  // The owner's address(es) get the administrator role, which is how the first admin comes to exist.
  if (dest.channel === 'email' && adminEmails(env).includes(dest.value)) {
    await db.prepare("INSERT OR IGNORE INTO user_roles (user_id, role, granted) VALUES (?1, 'admin', ?2)").bind(user.id, t).run();
  }

  const token = randomToken();
  const lifetime = SESSION_DAYS * 86400;
  await db.prepare('INSERT INTO sessions (token_hash, user_id, created, expires) VALUES (?1, ?2, ?3, ?4)')
    .bind(await sha256(token), user.id, t, t + lifetime).run();
  return json({ user: await publicUser(db, user) }, 200, { 'set-cookie': cookieHeader(url, token, lifetime) });
}

/** The signed-in user for a request, or null. Other parts of the Worker use this to protect their routes. */
export async function currentUser(request, env) {
  const token = readCookie(request);
  if (!token || !env.APP_DB) return null;
  const row = await env.APP_DB.prepare(
    'SELECT u.id, u.name, u.email, u.phone FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?1 AND s.expires > ?2',
  ).bind(await sha256(token), now()).first();
  return row ? publicUser(env.APP_DB, row) : null;
}

async function profile(request, body, env, db) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: 'Please sign in first.' }, 401);
  const name = String(body.name ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (name.length > 80) return json({ error: 'Please keep your name under 80 characters.' }, 400);
  await db.prepare('UPDATE users SET name = ?2 WHERE id = ?1').bind(user.id, name).run();
  return json({ user: { ...user, name } });
}

async function signout(request, db, url) {
  const token = readCookie(request);
  if (token) await db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': cookieHeader(url, '', 0) });
}

/** Answers /api/auth requests. Returns null for any other path. */
export async function handleAuth(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/auth/')) return null;
  const db = env.APP_DB;
  if (!db || !env.AUTH_PEPPER) return json({ error: 'Accounts are not set up yet.' }, 503);

  const action = url.pathname.slice('/api/auth/'.length);
  try {
    if (action === 'me' && request.method === 'GET') {
      return json({ user: await currentUser(request, env), challengeKey: challengeKey(env) });
    }
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { allow: 'POST' });

    // Only this site's own pages may make changes.
    if (!sameOrigin(request, url)) return json({ error: 'Request not allowed.' }, 403);

    let body = {};
    try { body = (await request.json()) ?? {}; } catch { /* empty or invalid body */ }
    if (action === 'start') return await start(body, env, db, request);
    if (action === 'verify') return await verify(body, env, db, url);
    if (action === 'signout') return await signout(request, db, url);
    if (action === 'profile') return await profile(request, body, env, db);
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[auth]', error instanceof Error ? error.message : error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
