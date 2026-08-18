# Architecture — Osool Altamaioz

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  /ar/* (RTL)  │  /en/* (LTR)  │  middleware (next-intl)     │
├─────────────────────────────────────────────────────────────┤
│  UI Components (layout, home, catalog, commerce, experience) │
├─────────────────────────────────────────────────────────────┤
│  Server Actions / Route Handlers (authoritative commerce)    │
├─────────────────────────────────────────────────────────────┤
│  Prisma  →  MySQL (Hostinger production)                     │
├─────────────────────────────────────────────────────────────┤
│  Integrations: payments, shipping, analytics (abstracted)    │
└─────────────────────────────────────────────────────────────┘
```

## Directory layout

```
src/
  app/[locale]/          # Localized routes
  components/
    layout/              # Header, footer, nav
    home/                # Homepage sections
    ui/                  # Primitives (Button, etc.)
  i18n/                  # next-intl config + messages
  lib/                   # utils, tokens, prisma, navigation data
prisma/schema.prisma     # Commerce + content schema
docs/                    # Project documentation
scripts/                 # Import/analysis (no raw Excel mutation)
data/import/             # Generated normalized import JSON (gitignored patterns via .generated)
```

## Localization

- Default locale: `ar` at `/ar`
- English at `/en`
- `dir` and `lang` set per locale in `[locale]/layout.tsx`
- Language switch preserves pathname via next-intl navigation
- Shared message dictionaries: `src/i18n/messages/{ar,en}.json`

## Commerce authority

All of the following must be computed/validated server-side:

- Product/variant prices and availability
- Cart line totals, VAT, discounts, shipping
- Checkout order creation and payment verification
- Webhook signature validation

Client displays are projections only.

## Product data pipeline

1. Raw Excel in `references/products/` (never modified)
2. Batch analyze: `scripts/analyze-products.mjs` → `data/import/*.json`
3. Batch build: `scripts/build-catalog.mjs` → `data/catalog/products.json` (idempotent SKU merge)
4. Dry-run: `npm run catalog:dry-run` — simulate without writes
5. Apply: `npm run catalog:apply` — intentional catalog update
6. Sync: `npm run catalog:sync-db` — JSON → MySQL when `DATABASE_URL` is set

**Current scope:** initial imported sample (~703 grouped products / ~835 variants). NOT final catalog size.
See `docs/CATALOG_SCALABILITY.md` and `docs/ADDING_PRODUCTS.md`.

## Repository factory

Central selection in `src/lib/data/repository-factory.ts`:

- `DATABASE_URL` unset → JSON catalog + file-backed users/orders + client wishlist
- `DATABASE_URL` set → Prisma repositories (same interfaces); connection failures fail clearly (503)

**Live (Aug 2026):** Hostinger MySQL active for initial sample catalog. Runtime product reads use `PrismaProductRepository`. JSON fallback remains when `DATABASE_URL` is unset.

Activation sequence: see **QUICK DATABASE ACTIVATION** in `docs/DATABASE_SETUP.md`.

UI never branches on database configuration.

## Search architecture

Shared query engine: `src/lib/catalog/catalog-query-engine.ts`

Search provider: `src/lib/catalog/search-provider.ts` — swap to Meilisearch/Algolia/Typesense without changing PLP/PDP components.

Phase 7: in-memory/MySQL-backed search with Arabic, English, SKU, model, series, category terms.

## Analytics abstraction

`src/lib/analytics/` — event interface (`trackEvent`) with dataLayer/gtag hooks and dev console fallback. Phase 6 wires experience events; production GA4 adapter in Phase 9.

## Signature experiences (Phase 6)

Data-driven content in `data/experiences/` (not hardcoded in UI):

| Asset | File | Repository |
|-------|------|------------|
| Spaces (9) | `spaces.json` | `FileSpaceRepository` |
| Scenes (5) | `scenes.json` | `FileSceneRepository` |
| Recommendation rules | `recommendation-rules.json` | `LightingRecommendationService` |

**Hotspot coordinates:** Percentage-based (`x`, `y` 0–100) relative to scene image container — responsive on desktop/tablet/mobile.

**Scene bundle validation:** Server API `/api/experience/validate-scene` resolves products via `ProductRepository`, checks stock/price, returns available vs unavailable — never silently adds incomplete bundles.

**Lighting Recommendation Service:** Rule-based engine in `src/lib/experience/lighting-recommendation-service.ts`. Inputs: space, dimensions, mood, CCT. Outputs: categories + catalog product slugs with quantities. **Not** a certified lux calculation — advisory disclaimer shown in UI.

**Product mappings:** Space/scene/recommendation product slugs live in JSON data layer only; UI uses `ProductRepository` / `ProductCard`.

## Product page rendering (catalog scale)

**Decision (Phase 5 audit):** Full static pre-rendering of all PDPs does not scale as the catalog grows beyond the initial sample dataset.

**Current approach:**

| Route type | Strategy |
|------------|----------|
| Categories, search, marketing | Static / SSG (small route count) |
| Product PDP `/[locale]/products/[slug]` | **ISR** — `revalidate: 3600`, `dynamicParams: true`, build pre-renders ~40×2 preview pages; remaining PDPs on-demand with cached regeneration |
| API (cart validate, checkout, auth) | Dynamic server routes |

**SEO preserved:** Localized canonical URLs unchanged (`/ar/products/...`, `/en/products/...`). Pages are server-rendered HTML (SSG/ISR), crawlable, with metadata.

**When catalog grows:** Increase on-demand share (lower build preview count) or move product reads to MySQL with same ISR contract. No URL changes required.


- No card data storage
- Env secrets outside git
- Rate limiting on auth/checkout/webhook routes (Phase 7+)
- CSRF-safe server actions for mutations
