/**
 * OnDaMenu administration API. Every route requires a signed-in administrator.
 *
 *   GET  /api/admin/users?q=text                     find accounts by email, phone or name (up to 50)
 *   POST /api/admin/roles   { userId, role, grant }  give or remove the merchant, courier or admin role
 *
 * The first administrator is whoever signs in with an address listed in ADMIN_EMAILS (worker/auth.mjs).
 */
import { currentUser, json, sameOrigin } from './auth.mjs';

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
    if (action === 'roles' && request.method === 'POST') {
      if (!sameOrigin(request, url)) return json({ error: 'Request not allowed.' }, 403);
      let body = {};
      try { body = (await request.json()) ?? {}; } catch { /* empty or invalid body */ }
      return await setRole(body, admin, db);
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[admin]', error instanceof Error ? error.message : error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
