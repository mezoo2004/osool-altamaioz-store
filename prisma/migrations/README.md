# Prisma migrations — MySQL baseline (Hostinger)

## Current state

- **Engine:** MySQL (Hostinger — `u847758257_osoolstore`)
- **Migration history:** No PostgreSQL migration SQL exists in this repo (safe — nothing PostgreSQL-specific to apply)
- **Database status:** Dedicated empty database — ready for first schema push

## Baseline strategy (NOT executed yet)

Once `DATABASE_URL` is configured in `.env.local` and `npm run db:check` succeeds:

### Option A — Initial schema (recommended for empty Hostinger DB)

```bash
npm run db:generate
npm run db:push
npm run db:verify
```

`db:push` applies `prisma/schema.prisma` directly. Safe for an **empty** dedicated database.

### Option B — Versioned migrations (optional, for teams wanting migration files)

```bash
npm run db:generate
npx prisma migrate dev --name mysql_baseline
# future production deploys:
npm run db:migrate
```

Creates `prisma/migrations/` from the current MySQL schema. Use only after local verification.

## Rules

- **Never** apply old PostgreSQL migration SQL to MySQL
- **Never** run `db:push` / `migrate` until `db:check` passes
- Catalog import remains a **separate explicit step** after schema exists:
  `npm run catalog:apply -- --sync-db`

## Catalog scope reminder

The current imported sample (~703 grouped products / ~835 variants) is **not** the final catalog. Future batches import incrementally without schema rebuild.
