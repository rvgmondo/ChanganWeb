# Changan Pretoria

The website for **Changan Pretoria**, 332 Middel Street, Brooklyn, Pretoria (012 023 3433,
info@changanpta.co.za). It runs on Next.js 16 with Payload 3 as the admin, and stores
everything in one SQLite database file. It deploys to cPanel the same way as the other Mondobase
Node sites (Rynet, Verboten, Amico).

Design direction: **Concept A, "Evolution Gallery"**. It is built from Changan South Africa's own
2026 "Driven to Evolve" campaign: the ChangAnunitype typeface, Changan Blue, and official
photography and colour cut-outs from changanmotors.co.za. The approved mock-ups are in
[`concepts/`](concepts/).

## What is built (round 1: the home page)

| Section | What it does |
|---|---|
| Hero | Each model's world photo is split into floating glass slats. They assemble on load, spread apart as the pointer moves, and scatter on scroll. They flip in a wave to the next model while its car drives in. Clicking opens that model full screen. |
| Range | A pinned 3D carousel of the five models (GSAP ScrollTrigger). The car and the details card update for each model. |
| Stock | Featured stock from the admin, with body-type filters and sorting animated by GSAP Flip, saved cars and an estimated monthly payment. |
| Inside | The Uni-S interior grows from a small panel to full screen as you scroll. |
| Finance | A live calculator in ZAR (deposit, term, rate, balloon), with defaults set in the admin. |
| Legacy, reviews | Real Changan facts with parallax and counters, and reviews managed in the admin. |
| Booking | A test-drive form. A server action validates it with zod, rate-limits it, saves it as a **Lead** in the admin and emails the dealership. |
| Shell | Lenis smooth scrolling synced to GSAP, a contextual cursor, magnetic buttons, a POPIA consent banner (GA4 and Meta Pixel load only after consent), AutoDealer JSON-LD, sitemap and robots, and a reduced-motion version. |

Also built: **/stock**, the inventory page with typo-tolerant search, URL-synced filters (model,
body, fuel, condition, transmission, price, year, mileage), sorting, grid and list views, saved cars
and GSAP Flip filtering.

Next rounds: vehicle detail pages (with Vehicle JSON-LD and View Transitions),
finance pre-approval, trade-in with photo upload, about and contact pages, and admin branding.

## Private client preview

Set `PREVIEW_CODES` and the same build becomes a private, watermarked preview with a personal link
per viewer, an expiry date and a visit log. See [PREVIEW.md](PREVIEW.md).

## Run it locally

```bash
npm install
cp .env.example .env        # then set PAYLOAD_SECRET
npm run seed                # real line-up, 22 sample stock cars, sample reviews, an admin login
npm run dev                 # http://localhost:3000, admin at /admin
```

The seed creates the admin login `admin@changanpta.co.za` with password `ChangeMe123!`.
Change it on first sign-in. You can set your own with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
`npm run seed -- --reset` replaces the seeded content. It never touches logins or leads.

| Script | |
|---|---|
| `npm run dev` | Development server. The schema is pushed straight to the database. |
| `npm run build` / `npm start` | Production build and server. |
| `npm run typecheck` / `npm run lint` / `npm test` | TypeScript, Biome, Vitest. |
| `npm run db:migrate:create name` | Create a migration after changing a collection (commit it). |
| `npm run generate:types` | Regenerate `src/payload-types.ts`. |

## Environment variables

See [`.env.example`](.env.example). Required:

| Variable | |
|---|---|
| `DATABASE_URI` | `file:./changan.db` (SQLite). |
| `PAYLOAD_SECRET` | A long random string. Never change it after go-live. |
| `NEXT_PUBLIC_SERVER_URL` | The public URL, **baked in at build time**. On GitHub, set the repository variable `SITE_URL`. |

Optional: `SMTP_*` and `LEADS_TO` (lead emails through a cPanel mailbox),
`NEXT_PUBLIC_GA4_ID` and `NEXT_PUBLIC_META_PIXEL_ID` (only after consent), and `R2_*` (Cloudflare
R2 for uploaded photos; switch to it before real stock photography piles up, because shared
hosting runs out of inodes).

## Managing the site (admin at `/admin`)

- **Stock**: add a car (model, variant, year, km, price, colour, photos). Set the status to *Sold*
  to take it off the site. Tick *Feature on home page* to put it in the home page grid.
- **Range (models)**: the five new models. Each has its tagline, from price, headline specs,
  the cut-out photo, the world photos (landscape and portrait) and colours. These drive the hero
  and the range section.
- **Specials, Reviews, Team**: content blocks.
- **Leads**: every website enquiry. Update the status as you follow up.
- **Dealership details**: address, phone, WhatsApp, trading hours and finance calculator defaults.

## Deploying to cPanel

This works the same way as Rynet. **The server never builds**, because the shared CloudLinux
account does not have enough memory for it.

1. Every push to `main` runs **Build deploy branch** (`.github/workflows/deploy.yml`). It
   builds with Node 22 and publishes the source plus the built `.next` to the `deploy` branch.
2. On the host, either click **Update from Remote** and then **Deploy HEAD Commit** in cPanel's
   Git Version Control (`.cpanel.yml` runs `scripts/cpanel-deploy.sh`), or add the same script
   to cron, or set the `HOST_SSH_*` secrets so Actions installs over SSH.
3. `scripts/host-deploy.sh` checks the build, backs up `changan.db`, swaps the build in by
   renaming, restarts Passenger (`tmp/restart.txt`), health-checks the site and rolls back if it
   does not answer. Migrations are applied automatically when the app starts.

The first-time setup is in [DEPLOY-CPANEL.md](DEPLOY-CPANEL.md).

## Project layout

```
src/
  app/(site)/        public site: layout, home page, styles entry
  app/(payload)/     Payload admin and REST/GraphQL API
  app/actions/       server actions (lead capture)
  collections/       Vehicles, Models, Specials, Reviews, Staff, Leads, Media, Users
  globals/           Dealer (contact details, hours, finance defaults)
  components/home/   hero, range, stock, inside, finance, legacy, reviews, visit
  components/layout/ header, footer, motion provider (Lenis/GSAP/cursor), POPIA consent
  styles/            tokens.css (design tokens, Tailwind v4 @theme) and site.css
  seed/              seed script and brand imagery
  migrations/        committed database migrations
scripts/             cPanel deploy, install, backup and runtime-link helpers
server.cjs           Passenger entry point
concepts/            the approved design mock-ups
```
