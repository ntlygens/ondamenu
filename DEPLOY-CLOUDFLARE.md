# Deploying OnDaMenu to Cloudflare

The whole site runs as one Cloudflare Worker (same design as DairecVision.com):

| Piece | Where |
|---|---|
| Static files (JS, CSS, images, favicon, robots.txt, sitemap) | Workers Static Assets, from `client/dist/client/browser` |
| Server-rendered pages | Angular SSR inside the Worker (`client/src/server.ts`, platform-neutral build) |
| Page content API (`GET /api/<collection>`) | The Worker, reading Cloudflare D1 (`ondamenu-content`) |
| Page content source | `content/content.json` (edit, then `npm run content:seed`) |

The public API is read-only.

## Already done (2026-11-10)

- D1 database `ondamenu-content` created (id in `client/wrangler.jsonc`), schema applied, content loaded.
- Zone `ondamenu.com` added to Cloudflare with the DNS records copied from GoDaddy, including iCloud mail
  (MX, SPF, DKIM, DMARC). Always Use HTTPS on, minimum TLS 1.2, SSL Full.

## First-time setup on your Mac

All commands run in `client/`.

```
cd ~/StudioProjects/ondamenu/client
npm install
npx wrangler login          # skip if you are still logged in from DairecVision
npm run preview             # builds, then serves the full site at http://localhost:8787
```

## Environments

| Branch | Environment | Command (in `client/`) | Address |
|---|---|---|---|
| `staging` | Preview | `npm run deploy:staging` | https://ondamenu-staging.ntlygens.workers.dev |
| `main` | Production | `npm run deploy` | https://ondamenu.com |

Each command refuses to run from the wrong branch. Work on `staging`, preview it, then merge into `main`
and deploy production from `main`. Both environments read the same content database.
The preview address is kept out of search engines.

## Moving ondamenu.com from GoDaddy (when the site is approved)

1. At GoDaddy: turn off DNSSEC if it is on, then set the nameservers to
   `lee.ns.cloudflare.com` and `venus.ns.cloudflare.com`.
2. Wait for Cloudflare to show the zone as Active. Until step 3, ondamenu.com keeps showing the old
   site from the GoDaddy server, now passing through Cloudflare.
3. Claude deletes the two records that point the site at GoDaddy (`ondamenu.com` A and `www` CNAME);
   right after, on `main`: `npm run deploy`. Wrangler attaches ondamenu.com and www.ondamenu.com
   (www redirects to the bare domain).
4. `admin.ondamenu.com`, `mail`, `cpanel`, `webdisk` and `whm` keep pointing at the GoDaddy server.

## Everyday use

- **Change page text:** edit `content/content.json`, then `npm run content:seed`. Pages are cached for up
  to an hour, so run a deploy too if the change must show immediately.
- **Change code or design:** `npm run deploy:staging` to preview, then merge and `npm run deploy`.
- **Fast front-end work:** run `npx wrangler dev` (after one `npm run build`) in one terminal and
  `npm start` in another; `ng serve` forwards `/api` to the Wrangler server on port 8787.
