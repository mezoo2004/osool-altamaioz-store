# Implementation Status

Last updated: Official branding Phase 2 (Sep 2026)

## Manager storefront Phase 1 (DONE — Sep 2026)

Rebuilt lost manager-approved core storefront on `main` after old-PC revision was not in GitHub.

- [x] **DONE** — Premium ecommerce hero + reusable `PromoCard` / demo campaign (no fake discounts)
- [x] **DONE** — Simplified primary nav; **Products** one-click → `/products`
- [x] **DONE** — All products PLP `/ar|en/products` with live catalog + dynamic category chips
- [x] **DONE** — Offers PLP `/ar|en/offers` (`isOnOffer` filter + premium empty state)
- [x] **DONE** — Customer-facing Lighting Experience removed from nav/home/footer; route redirects unless AI/designer handoff query params
## Manager storefront Phase 2 — official branding (DONE — Sep 2026)

- [x] **DONE** — Official logo assets under `public/brand/logo/` (extracted from identity PDF; no partner/card artwork)
- [x] **DONE** — Reusable `OsoolLogo` (dark/light, full/markOnly) in header, mobile menu, footer, auth, checkout/orders, AI assistant, favicon
- [x] **DONE** — EN storefront uses official mark only (no English wordmark in source)
## Manager storefront Phase 3 — premium PDP (DONE — Sep 2026)

- [x] **DONE** — Premium PDP gallery (main/thumbs, swipe, zoom, placeholder fallback)
- [x] **DONE** — Purchase panel: verified price, SKU/model, key specs, variants, cart/wishlist, mobile sticky bar
- [x] **DONE** — Accordion sections: description, specifications, accessories (when data exists), suitable uses, shipping/support
- [x] **DONE** — AI product context, Visual Search similar products, Shop The Scene handoff when supported
## Manager storefront Phase 4 — customer reviews (DONE — Sep 2026)

- [x] **DONE** — Homepage «آراء عملائنا / Customer Reviews» section (demo seed labeled; no fake stats)
- [x] **DONE** — `/ar|en/reviews` with form, moderation queue (PENDING file), star rating, optional image upload (dev filesystem)
- [x] **DONE** — Projects removed from homepage footer primary customer link (route `/projects` retained)
- [ ] **BLOCKED** — Production review persistence + CDN image storage (`docs/REVIEW_MODEL_PROPOSAL.md`)

Last updated: Homepage final visual redesign (Aug 2026)

## Homepage final visual redesign (DONE — Aug 2026)

Premium cinematic homepage pass — homepage only; no commerce logic changes.

- [x] **DONE** — Homepage-scoped `HomeHeader` / `HomeFooter` (slim utility bar, horizontal nav, deep black footer)
- [x] **DONE** — Split-screen hero with architectural photography (`HomeImage` + replaceable asset map)
- [x] **DONE** — Shop By Space editorial grid (9 spaces, featured Majlis, lighting-focused local dev imagery, no numeric labels)
- [x] **DONE** — Primary + secondary category rows with Lucide outline icons
- [x] **DONE** — Featured products (`منتجات مميزة`) via existing `ProductCard` presentation
- [x] **DONE** — Shop The Scene split layout with interactive hotspots
- [x] **DONE** — Lighting Experience (3 steps + CCT selector + orange CTA)
- [x] **DONE** — Dev imagery via Unsplash URLs in `src/lib/home/home-images.ts` + `public/images/home/` structure
- [ ] **NEEDS REVIEW** — Owner visual approval before PDP/PLP redesign
- [ ] **DEFERRED UNTIL PHOTOGRAPHY** — Replace remote dev assets with official company imagery

## FINAL UI/UX POLISH — COMPLETE (Parts 1 & 2)

Visual refinement applied across core storefront (Part 1) and secondary surfaces (Part 2). See `docs/UI_POLISH_CHECKLIST.md` for item-level tracking.

### Part 1 (DONE)
- Header, homepage, PLP, PDP, cart, checkout, mobile nav, footer

### Part 2 (DONE)
- About, Contact, FAQ, Projects, Policies
- Account (overview, profile, addresses, orders, detail, tracking)
- Auth (login, register, forgot password)
- Wishlist, Shop By Space, Shop The Scene, Lighting Experience
- Order confirmation, 404/error/loading states

### Remaining review
- [ ] **NEEDS REVIEW** — Manual responsive QA at 390 / 768 / 1024 / 1440
- [ ] **NEEDS REVIEW** — Figma pixel-level alignment
- [ ] **DEFERRED UNTIL IMAGES** — Photography & hero assets
- [ ] **DEFERRED UNTIL PRICES** — Official price presentation

## Phase 8–9 — Content, SEO & production readiness (DONE)

### Content pages (AR/EN)
- [x] About (`/about`)
- [x] Contact (`/contact`) — form shell; channels BUSINESS_CONFIRMATION_REQUIRED
- [x] FAQ (`/faq`) — accordion + FAQPage JSON-LD
- [x] Projects (`/projects`) — portfolio architecture + empty state
- [x] Policy shells: shipping, returns, warranty, privacy, terms — all BUSINESS_CONFIRMATION_REQUIRED

### SEO
- [x] `sitemap.xml` — static routes + products/categories/spaces/scenes
- [x] `robots.txt` — allow/disallow rules + sitemap reference
- [x] Canonical URLs + hreflang AR/EN via `buildPageMetadata`
- [x] OpenGraph + Twitter cards
- [x] Organization + WebSite JSON-LD (global)
- [x] Product + Breadcrumb JSON-LD (PDP, categories)
- [x] FAQPage JSON-LD
- [x] `NEXT_PUBLIC_SITE_URL` site config (domain BUSINESS_CONFIRMATION_REQUIRED)

### Error & loading states
- [x] Localized `not-found.tsx`, `error.tsx`, `global-error.tsx`
- [x] Skip-to-content link + `:focus-visible` keyboard audit
- [x] Product image placeholder component + lazy loading
- [x] Reduced-motion CSS support

### Analytics abstraction
- [x] Extended `trackEvent` types (page_view, view_item, commerce placeholders)
- [x] `AnalyticsScripts` — GA4/GTM via env only (no credentials hardcoded)
- [x] `PageViewTracker` on route changes
- [x] PDP `view_item` + content page events

## MySQL activation (DONE — Aug 2026)

- [x] **DONE** — MYSQL DATABASE CONNECTION (`u847758257_osoolstore` on Hostinger)
- [x] **DONE** — DATABASE SCHEMA (`npm run db:push` — empty dedicated DB, no destructive reset)
- [x] **DONE** — INITIAL SAMPLE CATALOG SYNC (~700 unique products / 835 variants in MySQL)
- [x] **DONE** — Idempotent re-sync verified (second run: upsert/update only, no duplicate growth)
- [x] **DONE** — Storefront reads via `PrismaProductRepository` when `DATABASE_URL` is set
- [x] **DONE** — Development E2E (`npm run dev:e2e`) — auth, address, wishlist, dev checkout, order persistence
- [ ] **DEFERRED** — OFFICIAL PRICES (`priceConfirmed: false`, `PRICE_UNAVAILABLE` on storefront)
- [ ] **DEFERRED** — PRODUCT IMAGES (placeholders acceptable)
- [x] **DONE** — FINAL UI/UX POLISH Parts 1 & 2 (core + secondary surfaces)
- [ ] **TODO** — PAYMENTS (Tabby, Tamara, Mada, Visa/Mastercard, Apple Pay)
- [ ] **TODO** — SHIPPING (real carriers)

## P0 Launch Blockers

- [x] **DONE** — Repository/framework inspection
- [x] **DONE** — Product spreadsheet analysis and normalized import plan
- [x] **DONE** — Architecture documentation
- [x] **DONE** — Arabic/English localization and RTL/LTR
- [x] **DONE** — Design tokens / global UI foundation
- [x] **DONE** — Global header/navigation/mobile/footer
- [x] **DONE** — Homepage desktop/mobile AR/EN
- [x] **DONE** — Catalog/category/PLP/search/filtering
- [x] **DONE** — PDP and variants
- [x] **DONE** — Cart and wishlist (full pages, persistence, server validation)
- [x] **DONE** — Auth/account (login, register, forgot-password UI, session JWT)
- [x] **DONE** — Checkout/order creation/order success/tracking (dev checkout mode)
- [x] **DONE** — Shop By Space
- [x] **DONE** — Shop The Scene
- [x] **DONE** — Lighting Experience
- [x] **DONE** — Scalable catalog import engine (batch, idempotent, conflict reports)
- [x] **DONE** — Production Prisma repositories + central factory
- [x] **DONE** — Content/policy pages (shells — owner text pending)
- [x] **DONE** — SEO (sitemap, robots, canonical, hreflang, structured data, OpenGraph)
- [x] **DONE** — Error pages + accessibility/performance baseline
- [ ] **TODO** — Payments integration readiness (Phase 10)
- [ ] **TODO** — Shipping integration readiness (Phase 10)
- [ ] **TODO** — Production GA4/Meta wiring (env IDs only — scripts ready)
- [ ] **TODO** — Production deploy + launch checklist

## FINAL UI/UX POLISH — COMPLETE

Design refinements tracked in `docs/UI_POLISH_CHECKLIST.md`. Parts 1 & 2 complete. Manual responsive QA and Figma alignment remain for owner review.

## Phase 7d — MySQL activation + initial sample sync (DONE)

- Hostinger MySQL connection verified via `npm run db:check` (IPv4 resolution for `srv519.hstgr.io`)
- Schema applied with `npm run db:push` to dedicated empty database
- Initial sample catalog synced: `npm run catalog:apply -- --sync-db`
- Counts: 18 categories, 700 unique products (702 grouped rows with 2 duplicate stable IDs in source), 835 variants, 1 ImportBatch
- All variants: `priceConfirmed: false`; storefront shows price unavailable
- JSON catalog fallback retained for local dev when `DATABASE_URL` unset
- Dev test data: `dev-e2e+mysql@osool-altamaioz.test` customer + labeled DEVELOPMENT orders (safe to keep)

## Phase 7c — MySQL migration prep (DONE)

- Prisma provider converted from PostgreSQL → **MySQL**
- Schema audited: Decimal money fields, Text for long content, VarChar(191) unique indexes
- `db:check` / `db:verify` use MySQL-compatible Prisma queries (no PostgreSQL raw SQL)
- Baseline strategy documented in `prisma/migrations/README.md`
- Hostinger connection details in `docs/DATABASE_SETUP.md` (no passwords)
- **Executed:** `db:push`, initial catalog sync against live Hostinger MySQL (Aug 2026)

## Phase 7b — Database activation tooling (DONE)

### Connection & verification commands
- `npm run db:check` — safe connection probe (no credentials printed)
- `npm run db:verify` — aggregate counts + integrity checks
- `npm run db:push` / `npm run db:migrate` — schema deployment
- `docs/DATABASE_SETUP.md` — **QUICK DATABASE ACTIVATION** section

### Production storage rules
- When `DATABASE_URL` is set: Prisma for products, users, addresses, orders, authenticated wishlist
- **No silent file fallback** when database is configured but unavailable (503 on auth/checkout APIs)
- Guest wishlist: browser persistence → merges to MySQL on login

### Catalog sync enhancements
- Pre-sync validation, chunked idempotent upserts, categories + ProductCategory links, ImportBatch audit
- Safe to rerun for future product batches

## Phase 7 — Scalable Catalog & Production Data Engine (DONE)

### Import batch architecture
- `ImportBatch`, `CategorySourceMapping` Prisma models
- Batch manifests under `data/import/batches/`
- Idempotent SKU/groupKey identity — never name-only matching
- Conflict reports → `data/reports/import-conflicts.json`
- Unmapped categories → `UNMAPPED_CATEGORY` + report (never silent random assignment)

### Import commands
| Command | Purpose |
|---------|---------|
| `npm run catalog:dry-run` | Simulate import, no catalog writes |
| `npm run catalog:apply` | Intentional apply to `data/catalog/` |
| `npm run catalog:sync-db` | JSON → MySQL when configured |
| `npm run data:validate` | SKU/slug/ref validation |
| `npm run prices:dry-run` | Future price import placeholder |
| `npm run images:dry-run` | Future image import placeholder |

### Production repositories
- `getRepositoriesSync()` / `getProductRepository()` via central factory
- `PrismaProductRepository`, `PrismaUserRepository`, `PrismaAddressRepository`, `PrismaOrderRepository`
- File/JSON fallback when `DATABASE_URL` unset
- Order creation uses `$transaction` (no partial orders)

### Search & filters
- Shared `catalog-query-engine.ts` — data-driven facets, server-side pagination
- `SearchProvider` abstraction — in-memory/MySQL now; Meilisearch/Algolia later

### Deferred (by design)
- Official selling prices → `PRICE_UNAVAILABLE`
- Product photography / image mapping
- Real payment gateways (Tabby, Tamara, Mada, etc.)
- Real shipping carrier integrations

### Documentation
- `docs/DATABASE_SETUP.md`
- `docs/ADDING_PRODUCTS.md`
- Updated architecture, schema, product data docs

## Catalog scope reminder

The **current imported sample** contains approximately **703 grouped products** and **835 variants** (batch-001). The final Osool Altamaioz catalog will be **significantly larger**. Architecture supports incremental batches without rebuilding the storefront.

## Phase 6 — Signature Experiences (DONE)

See prior sections — spaces, scenes, lighting experience, analytics abstraction.

## Phase 5 — Commerce (DONE)

ISR PDPs, cart, wishlist, auth (bcrypt + JWT httpOnly), checkout with snapshots, dev payment mode.

## AI Lighting Consultant V2 (DONE — Aug 2026)

Stateful conversational assistant integrated with Lighting Designer V2.

- [x] Session memory (sessionStorage + server state merge)
- [x] Saudi/Gulf Arabic patterns + progressive missing-field questions
- [x] Intent detection (14+ intents incl. VISUAL_PRODUCT_SEARCH hook)
- [x] Lighting Designer V2 engine reuse (no duplicate calculations)
- [x] Real product cards from ProductRepository
- [x] Why / alternative / warmer / ceiling / space-pivot follow-ups
- [x] Shop The Scene + Lighting Experience handoff CTAs
- [x] Demo rule engine + optional OpenAI polish when `OPENAI_API_KEY` set
- [x] Visual product search from image upload (shared with main search bar)

## Visual Product Search — Entry Points (DONE — Aug 2026)

Shared `VisualSearchService` for main search bar + AI assistant.

- [x] `VisualSearchService`, `VisionProvider`, `CatalogVisualMatcher`, `FallbackVisualSearch`
- [x] `/api/search/visual` — multipart image upload, no persistent image storage
- [x] Shared `ImageSourcePicker` — camera / photo library / files (mobile bottom sheet + desktop popover)
- [x] Main `SearchBar` — image-plus button, inline preview, analyzing state, real catalog results
- [x] AI composer — image attachment, preview, visual context in session state
- [x] Visual follow-ups: colour refine, second option, smaller, room fit + Designer, scene handoff
- [x] No-API fallback — type/color/style clarification chips
- [x] AR/EN i18n (`visualSearch` namespace)

## Smart QR Product Passport (DONE — Aug 2026)

Premium post-purchase product passport via signed JWT tokens — no schema migration.

- [x] `/ar|en/passport/[token]` — public product + purchase-linked passports
- [x] Signed JWT tokens (`PASSPORT_SECRET` / `AUTH_SECRET`) — opaque, no PII in URL
- [x] Real catalog specs (CCT, wattage, finish, beam angle, lumens from specs, installation)
- [x] Safe purchase context (order number, date, quantity only)
- [x] Warranty/installation sections with honest fallbacks (no invented data)
- [x] QR generation (`qrcode`) + modal + print-ready card layout
- [x] Order detail — Product Passport + Show QR per line item
- [x] Smart actions: AI assistant, replacements, complementary, Shop The Scene
- [x] AI consultant preloads product context via custom event bridge
- [x] Analytics hooks: `passport_view`, `passport_qr_open`, `passport_ai_click`, etc.

## Lighting Designer V2 (DONE — Aug 2026)

Data-driven lighting recommendation engine at `/lighting-experience`.

- [x] Expanded inputs: dimensions, wall/ceiling swatches, mood, CCT, interior style, natural light, brightness preference
- [x] Configurable lux targets (`data/experiences/lux-targets.json`) + transparent lumen formula
- [x] Reflectance / ceiling height / interior / natural light adjustment factors
- [x] Real product matching via ProductRepository with HIGH/MEDIUM/LOW confidence
- [x] Fixture quantity sanity checks (e.g. bedroom 44 m² ≥ 8 general downlights)
- [x] Multi-layer lighting (general, task, accent, decorative, ambient) + layout guidance
- [x] Premium result page with explanations, confidence, official disclaimer
- [x] Serializable V2 schema + localStorage + Shop The Scene handoff URL params
- [ ] **DEFERRED** — Save to user account, PDF report checkout, AI consultant integration
- [ ] **DEFERRED** — Full scene bundle preload from designer `bundle` query param

## Build status

Run after changes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run data:validate`
- `npm run db:check`
- `npm run db:verify`
- `npm run dev:e2e` (with dev server running — MySQL E2E smoke test)

## Blocked / needs owner

- Official online selling-price column confirmation
- Product/scene photography assets
- Real payment/shipping provider credentials

## Next P0 task

**Phase 10 — Integrations & launch:** payment/shipping provider readiness (no live activation without credentials), final domain DNS deploy, owner policy text, official prices/images when approved.
