/**
 * OnDaMenu Cloudflare Worker (same design as the DaiRec Vision site).
 *
 *  - Static files (dist/client/browser) are served by Workers Static Assets before this code runs.
 *  - GET /api/<collection>[/<id>] returns page content from the D1 database (read-only).
 *  - /api/auth/... handles sign-in by one-time code and sessions (worker/auth.mjs, app database).
 *  - /api/admin/... lets administrators manage accounts and roles (worker/admin.mjs).
 *  - /api/order/... serves the restaurant list and menus to the ordering app (worker/order.mjs).
 *  - /api/merchant/... lets a restaurant's own people edit its menu and photos (worker/merchant.mjs).
 *  - /media/... serves the uploaded photos from the R2 bucket (worker/merchant.mjs).
 *  - Everything else is server-rendered by Angular (dist/client/server/server.mjs).
 *
 * During server rendering Angular fetches /api/... on this same site. A Worker can't make a
 * network request to itself, so those fetches are answered here, in-process, straight from D1.
 */
import { renderPage } from '../dist/client/server/server.mjs';
import { handleAuth } from './auth.mjs';
import { handleAdmin } from './admin.mjs';
import { handleOrder } from './order.mjs';
import { handleMedia, handleMerchant } from './merchant.mjs';
import { runGradeJob } from './grades.mjs';

/** Content collections the public site may read. */
const COLLECTIONS = new Set(['pages', 'features', 'steps']);

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

/** Answers /api requests from D1. Returns null for paths that aren't API paths. */
async function handleApi(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  if (!url.pathname.startsWith('/api/') && url.pathname !== '/api') return null;

  // Sign-in and sessions (the only API paths that accept changes).
  const auth = await handleAuth(request, env);
  if (auth) return auth;
  const admin = await handleAdmin(request, env);
  if (admin) return admin;
  const order = await handleOrder(request, env);
  if (order) return order;
  const merchant = await handleMerchant(request, env);
  if (merchant) return merchant;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  const [coll, id] = parts;
  if (!coll || !COLLECTIONS.has(coll) || parts.length > 2) {
    return new Response('Not found', { status: 404 });
  }

  try {
    if (id) {
      const row = await env.DB.prepare('SELECT doc FROM content WHERE coll = ?1 AND id = ?2').bind(coll, id).first();
      if (!row) return new Response('Not found', { status: 404 });
      return new Response(row.doc, { headers: { ...JSON_HEADERS, 'cache-control': 'public, max-age=60' } });
    }
    const { results } = await env.DB.prepare('SELECT doc FROM content WHERE coll = ?1 ORDER BY position, id').bind(coll).all();
    const body = '[' + results.map((r) => r.doc).join(',') + ']';
    return new Response(body, { headers: { ...JSON_HEADERS, 'cache-control': 'public, max-age=60' } });
  } catch (error) {
    console.error('[api]', error instanceof Error ? error.message : error);
    return new Response('Content service unavailable', { status: 502 });
  }
}

// ---- In-process answers for Angular's own /api fetches during server rendering ----
let apiEnv;
const siteHosts = new Set();
const networkFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input, init) => {
  const request = input instanceof Request ? input : new Request(input, init);
  const url = new URL(request.url);
  if (apiEnv && siteHosts.has(url.host) && url.pathname.startsWith('/api/')) {
    const response = await handleApi(request, apiEnv);
    if (response) return response;
  }
  return networkFetch(input, init);
};

/** Paths the Angular app serves. Anything else redirects home without rendering (saves CPU on bot scans). */
const PAGE_PATHS = new Set(['/', '/diners', '/restaurants', '/contact', '/order', '/order/restaurants', '/account', '/merchant', '/courier', '/admin']);
/** A restaurant's menu page: /order/r/<slug>. */
const MENU_PATH = /^\/order\/r\/[a-z0-9-]{1,64}$/;
const isPagePath = (path) => PAGE_PATHS.has(path) || MENU_PATH.test(path);

/** Rendered pages are cached at Cloudflare's edge for this long (seconds). Content edits show within this window.
 *  One hour keeps page builds rare on the Workers Free plan (10 ms CPU per request; a build takes ~300 ms). */
const PAGE_CACHE_SECONDS = 3600;
/** Ordering pages carry menus and prices, so their cached copies live only this long. */
const ORDER_PAGE_CACHE_SECONDS = 60;
const pageCacheSeconds = (path) => (path.startsWith('/order/') ? ORDER_PAGE_CACHE_SECONDS : PAGE_CACHE_SECONDS);

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

let isPreviewHost = false;

function withSecurityHeaders(response) {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  // Keep the staging preview (workers.dev) out of search engines.
  if (isPreviewHost) out.headers.set('x-robots-tag', 'noindex, nofollow');
  return out;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runGradeJob(env).catch((e) => console.error('grade job failed', e)));
  },
  async fetch(request, env, ctx) {
    apiEnv = env;
    const url = new URL(request.url);
    siteHosts.add(url.host);
    isPreviewHost = url.hostname.endsWith('.workers.dev');

    // One canonical host: www.ondamenu.com -> ondamenu.com
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    const api = await handleApi(request, env);
    if (api) return withSecurityHeaders(api);
    const media = await handleMedia(request, env);
    if (media) return withSecurityHeaders(media);

    // Unknown paths (including bot probes for .env, wp-admin, etc.) go home without rendering.
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : '/';
    if (!isPagePath(path)) {
      return withSecurityHeaders(Response.redirect(`${url.origin}/`, 301));
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }

    // Serve a cached copy of the rendered page when there is one.
    const cache = caches.default;
    // Keyed by deployment, so every deploy starts with fresh pages.
    const version = env.CF_VERSION_METADATA?.id ?? 'dev';
    const cacheKey = new Request(`${url.origin}${path}?__v=${version}`, { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const page = await renderPage(new Request(`${url.origin}${path}${url.search}`, request));
    if (!page) return new Response('Not found', { status: 404 });

    const response = withSecurityHeaders(page);
    if (response.status === 200 && (response.headers.get('content-type') || '').includes('text/html')) {
      response.headers.set('cache-control', `public, max-age=0, s-maxage=${pageCacheSeconds(path)}`);
      if (!url.search) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  },
};
