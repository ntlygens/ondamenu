# OnDaMenu

Website for ondamenu.com, built on the same template as DairecVision.com.

| Folder | What it is |
|---|---|
| `client/` | The site: Angular (server-rendered) + Cloudflare Worker |
| `content/content.json` | All page text. Edit here, then `npm run content:seed` in `client/` |
| `scripts/` | Helper scripts used by the npm commands |
| `legacy/` | The original OnDaMenu ordering app (Angular + PHP backend + Clover), kept for the phase 2 rebuild |
| `DEPLOY-CLOUDFLARE.md` | Setup, preview and deploy steps |

Branches: `staging` is the preview environment, `main` is production. Work on `staging`, check the preview,
then merge into `main` and deploy. `master` and `ng20-upgrade` hold the original app as it was.

Phase 1 (now): public site — Home, For Diners, For Restaurants, Contact.
Phase 2 (next): rebuild the ordering app in this project on Cloudflare (D1 + Worker API), keeping Clover.
