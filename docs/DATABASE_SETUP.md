# Database Setup — Osool Altamaioz

Connect the store to **MySQL** on Hostinger for production. Without `DATABASE_URL`, the app uses JSON/file fallbacks for local development.

## Status (Aug 2026)

| Step | Status |
|------|--------|
| MYSQL DATABASE CONNECTION | **DONE** — `u847758257_osoolstore` |
| DATABASE SCHEMA | **DONE** — `npm run db:push` |
| INITIAL SAMPLE CATALOG SYNC | **DONE** — 700 products / 835 variants |
| Idempotent re-sync | **DONE** — safe to rerun |
| OFFICIAL PRICES | **DEFERRED** |
| PRODUCT IMAGES | **DEFERRED** |

## Production database

| Setting | Value |
|---------|-------|
| **Engine** | MySQL |
| **Hosting** | Hostinger |
| **Host** | `srv519.hstgr.io` |
| **Port** | `3306` |
| **Database** | `u847758257_osoolstore` |
| **User** | `u847758257_osooluser` |

Password is set **only** in local `.env.local` — never in git or chat.

## QUICK DATABASE ACTIVATION

After you add `DATABASE_URL` and `AUTH_SECRET` to `.env.local`:

```bash
npm run db:check
npm run db:generate
npm run db:push
npm run db:verify
npm run data:validate
npm run catalog:dry-run
npm run catalog:apply -- --sync-db
npm run db:verify
npm run dev
```

Then verify in the browser (Arabic + English):

1. PLP/PDP load products
2. Register → login
3. Save address
4. Wishlist (guest local → merges on login)
5. Development checkout → order
6. Account order history + guest tracking

> **Do not run `db:push` until `db:check` succeeds.** Imports never run on app startup.

## Environment variables

Copy `.env.example` → `.env.local`:

```env
DATABASE_URL="mysql://u847758257_osooluser:YOUR_PASSWORD@srv519.hstgr.io:3306/u847758257_osoolstore"
AUTH_SECRET="generate-a-long-random-string"
DEVELOPMENT_CHECKOUT_MODE=true   # Local only — enables development-test payment + zero-price dev checkout
```

`.env.local` is gitignored. **Never commit passwords.**

**Connection note:** Hostinger may reject IPv6 auth for `srv519.hstgr.io`. Scripts and runtime auto-resolve to IPv4 via `scripts/lib/database-env.mjs` — no credential logging.

`DIRECT_URL` is **not required** for Hostinger MySQL (single connection URL).

## Commands reference

| Command | Purpose |
|---------|---------|
| `npm run db:check` | Verify connection (no credentials printed) |
| `npm run db:generate` | Generate Prisma client for MySQL |
| `npm run db:push` | Apply schema to empty database (first-time) |
| `npm run db:migrate` | Deploy versioned migrations when they exist |
| `npm run db:verify` | Safe counts + integrity after import |
| `npm run catalog:sync-db` | JSON catalog → MySQL (idempotent) |
| `npm run dev:e2e` | Development E2E smoke test (requires `npm run dev`) |

See `prisma/migrations/README.md` for baseline strategy details.

## Development test data

E2E creates clearly labeled records only:

- Customer: `dev-e2e+mysql@osool-altamaioz.test`
- Guest orders: `dev-guest-e2e@osool-altamaioz.test`
- Order notes prefixed with `DEVELOPMENT`

Do **not** delete the imported sample catalog. Dev customer/orders may be kept for audit or removed manually from MySQL admin if desired — no generic delete scripts.

## Repository behaviour

| `DATABASE_URL` | Products | Users | Orders | Wishlist (auth) |
|----------------|----------|-------|--------|-----------------|
| unset | JSON catalog | JSON files | JSON files | Browser only |
| set | Prisma/MySQL | Prisma | Prisma | Prisma + guest merge |

When `DATABASE_URL` is set: **no silent file fallback**; DB failures return `503 database_unavailable`.

## MySQL schema notes

- Money fields use `Decimal(12, 2)` — never floating-point
- Long Arabic/English content uses `@db.Text`
- Unique indexes (slug, SKU, email) use `@db.VarChar(191)` for utf8mb4 safety
- JSON used only for snapshots/metadata — core commerce data stays relational
- Official selling prices remain deferred (`priceConfirmed: false`)

## Catalog scope

Current sample (~703 grouped products / ~835 variants) is **not** the final catalog. Future batches import incrementally via `docs/ADDING_PRODUCTS.md`.

## Troubleshooting

| Issue | Action |
|-------|--------|
| `DATABASE_URL is not configured` | Create `.env.local` from `.env.example` |
| Connection failed | Verify Hostinger remote MySQL enabled for your IP |
| Access denied | Check user, password, database name in `.env.local` |
| `db:verify` shows 0 products | Run `catalog:apply -- --sync-db` after `db:push` |
| Wrong provider error | Ensure `DATABASE_URL` starts with `mysql://` |

## Related docs

- [ADDING_PRODUCTS.md](./ADDING_PRODUCTS.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [prisma/migrations/README.md](../prisma/migrations/README.md)
