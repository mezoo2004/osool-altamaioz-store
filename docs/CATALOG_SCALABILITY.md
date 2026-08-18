# Catalog Scalability — Osool Altamaioz

## Critical context

The current imported catalog (~835 raw variants → ~703 grouped products in **batch-001**) is an **initial development / sample dataset only**.

It is **NOT** the full Osool Altamaioz product inventory. Many more products will be provided in future Excel batches.

Never document current counts as the final catalog size.

Use terminology:

- **initial imported sample catalog**
- **current imported sample dataset**
- **batch-001 sample**

---

## Design principles

| Principle | Implementation |
|-----------|----------------|
| Incremental growth | Add `batch-002`, `batch-003`, … without rebuilding storefront |
| Idempotent imports | Re-running a batch updates existing SKUs; stable IDs preserved |
| SKU is identity | Normalized SKU is the primary variant key — never product name alone |
| No ambiguous merge | Conflicts → `conflict-report.json`, never auto-merge |
| Dynamic categories | Category tree grows from imports + DB; nav is curated subset |
| Prices deferred | `priceConfirmed: false`, `PRICE_UNAVAILABLE` until business import phase |
| Images deferred | `imageUrl` optional; dedicated image mapping phase later |
| Internal traceability | `importMeta` on variants (source file, batch, row) — not customer-facing |

---

## Import pipeline

```
references/products/*.xlsx          (read-only sources)
        ↓
scripts/analyze-products.mjs        → data/import/*.json
        ↓
scripts/build-catalog.mjs           → data/catalog/products.json (merge)
        ↓
ImportProductRepository / Prisma    → storefront (no UI rebuild required)
```

### Run a batch

```bash
npm run import:batch                  # default batch-001
npm run import:batch -- --batch batch-002
IMPORT_BATCH=batch-002 npm run import:analyze
npm run catalog:build
```

### Outputs

| File | Purpose |
|------|---------|
| `data/import/batches/{batch}/manifest.json` | Batch traceability |
| `data/catalog/products.json` | Grouped catalog (dev file store) |
| `data/catalog/grouping-report.json` | Import stats (sample scope labeled) |
| `data/catalog/conflict-report.json` | SKU / grouping conflicts |
| `data/catalog/discovered-categories.json` | Dynamic category slugs found in data |

---

## Product identity & deduplication

**Primary key:** normalized SKU (`normalizeSku()` in `scripts/lib/catalog-import.mjs`)

**Product grouping key:** stable `groupKey` derived from category + code base + series + type — NOT display name.

**Stable IDs:**

- Product: `stableProductId(groupKey)`
- Variant: `stableVariantId(sku)`

**Conflict policy:**

If the same SKU appears under a different `groupKey`, the import:

1. Skips the incoming row
2. Records conflict in `conflict-report.json`
3. Does **not** auto-merge

Human review resolves conflicts before re-import.

---

## Categories

- **Database:** `Category` model with parent/child tree (`prisma/schema.prisma`)
- **Many-to-many:** `ProductCategory` for products in multiple categories
- **Dev catalog JSON:** `categorySlugs[]` on each product — discovered at import time
- **Storefront nav:** `src/lib/navigation-data.ts` is a **curated navigation subset**, not the complete taxonomy

Future batches may introduce new category slugs. Importer writes them to `discovered-categories.json`. Admin/seed step promotes them to `Category` records.

Do **not** hardcode the full catalog tree around the six current Excel files.

---

## Prices (deferred)

- Official **selling prices** will be imported in a later business-confirmed phase
- Importer must **not** map cost/supplier/wholesale Excel columns to customer prices
- Storefront shows `PRICE_UNAVAILABLE` unless `priceConfirmed: true`
- `scripts/analyze-products.mjs` sets `rawPrice: null` on normalized output

Future: `scripts/import-prices.mjs` (planned) — updates `confirmedPrice` by SKU only.

---

## Images (deferred)

- `ProductVariant.imageUrl` and `ProductImage` are optional
- Placeholders used in UI until **Product Image Mapping & Import Phase**
- Do not block catalog work on missing photography

Future: `scripts/import-images.mjs` (planned) — maps assets to SKU/slug.

---

## Storefront scalability

| Concern | Strategy |
|---------|----------|
| PDP routes | ISR (`revalidate: 3600`, `dynamicParams: true`) — scales beyond sample size |
| Search/filters | Server-side `ProductRepository.list()` — not limited to sample count |
| Build time | Preview subset at build; remaining PDPs on-demand |
| MySQL | Swap `ImportProductRepository` → Prisma when `DATABASE_URL` ready — same contracts |

Adding products requires:

1. Import batch
2. (Optional) category seed update
3. No storefront architecture changes

---

## Prisma schema readiness

- `ImportBatch` — batch audit trail
- `Product.groupKey`, `Product.importMeta`, `Product.sourceBatchId`
- `ProductVariant.normalizedSku`, source fields, `importMeta`
- `ProductCategory` — dynamic multi-category assignments

---

## What NOT to do

- Do not assume 703 products is the final catalog
- Do not hardcode complete taxonomy from sample files
- Do not expose supplier/cost prices
- Do not require full rebuild for new batches
- Do not merge ambiguous duplicate products automatically
- Do not block development on official prices or product images
