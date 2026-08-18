# Adding Future Product Batches

The **current imported sample** contains approximately **703 grouped products** and **835 variants**. This is **not** the final Osool Altamaioz catalog — many more products will arrive in additional Excel/JSON batches.

## Golden rules

1. **Never modify** original source files in `references/products/` — they are immutable.
2. **Never** add products by editing React pages manually.
3. **Never** delete the catalog to add a new batch — imports are incremental and idempotent.
4. **Never** use product display names as primary identity keys — use SKU, model, stable source keys.
5. **Never** auto-merge ambiguous duplicates — review conflict reports instead.

## Folder layout

```
references/products/          ← immutable source Excel/JSON (Batch 001, 002, …)
data/import/
  batches/batch-NNN/          ← batch manifest + metadata
  category-mappings.json      ← source category → store category slug
data/catalog/                 ← generated storefront catalog (JSON)
data/reports/                 ← validation, dry-run, conflicts, summaries
```

## Workflow for a new batch

### 1. Place source file

Add the new supplier/product file under `references/products/` (or register it in a new batch manifest).

Create/update batch manifest, e.g. `data/import/batches/batch-002/manifest.json`:

```json
{
  "id": "batch-002",
  "label": "Batch 002 — supplier lighting Q4",
  "sourceFiles": ["references/products/supplier-q4.xlsx"]
}
```

### 2. Update category mappings (if needed)

If the file introduces new source category labels, add entries to `data/import/category-mappings.json`:

```json
{
  "sourceKey": "supplier::Outdoor Wall",
  "categorySlug": "outdoor-wall",
  "status": "mapped"
}
```

Unmapped categories are flagged as `UNMAPPED_CATEGORY` in reports — **not** silently assigned.

### 3. Normalize / analyze (optional)

```bash
npm run import:analyze
```

### 4. Validate current state

```bash
npm run data:validate
```

### 5. Dry-run import

```bash
npm run catalog:dry-run
```

Review output:

| Report | Purpose |
|--------|---------|
| `data/reports/dry-run-summary.json` | Create/update/skip/conflict counts |
| `data/reports/import-conflicts.json` | Duplicate SKU, ambiguous identity |
| `data/reports/import-unmapped-categories.json` | Categories needing mapping |

Example summary:

```
SOURCE: Batch 007 — supplier-products.xlsx
ROWS: 1,284
PRODUCTS: Create 320 | Update 74 | Skip 21 | Conflict 3
VARIANTS: Create 881 | Update 102
WARNINGS: Missing Images 397 | Missing Prices 1,205 | Unmapped Categories 8
```

Missing images/prices are **expected** until those phases are completed.

### 6. Resolve conflicts

For each conflict in `import-conflicts.json`:

- **Exact duplicate SKU** — usually SKIP or UPDATE if intentional revision
- **Same product, new variant** — attach variant to existing parent (automatic when identity is reliable)
- **Ambiguous naming** — manual mapping; do **not** auto-merge

### 7. Apply import

```bash
npm run catalog:apply
```

This **intentionally** writes `data/catalog/products.json` and related outputs. It does **not** run on app startup.

With MySQL configured:

```bash
npm run catalog:apply -- --sync-db
```

### 8. Verify storefront

- Category pages show new products where mapped
- PDP variant selectors work for new dimensions
- PLP pagination/filters still perform (server-side query, not full client load)
- No internal batch metadata visible to customers

## Identity & deduplication

Priority order for matching:

1. Normalized **SKU**
2. **Model number**
3. Supplier/source identifier
4. Stable **groupKey** / normalized source key
5. Explicit manual mapping file (future)

Parent/variant grouping example:

- **One product card:** Spotlight S1
- **Variants:** 10W/3000K/White, 10W/4000K/White, 10W/6500K/Black, …

## Variant dimensions

Do not assume only CCT/Wattage/Finish. Future batches may add Voltage, Length, IP Rating, Beam Angle, etc. Structured `ProductVariant.attributes` JSON holds extended dimensions without per-field migrations.

## Prices (deferred)

Official selling prices arrive later. Until then:

- `priceConfirmed: false`
- Storefront shows `PRICE_UNAVAILABLE`
- Future pipeline: `npm run prices:dry-run` → review → apply (when business confirms column)

## Images (deferred)

Product photography and SKU/model mapping come in a dedicated phase. Placeholder images are acceptable during development.

Future pipeline: drop files in `references/product-images/` → `npm run images:dry-run` → apply.

## Commands reference

| Command | Description |
|---------|-------------|
| `npm run catalog:build` | Build catalog (also runs on prebuild) |
| `npm run catalog:dry-run` | Simulate import, no writes |
| `npm run catalog:apply` | Apply import to `data/catalog/` |
| `npm run catalog:sync-db` | JSON catalog → MySQL |
| `npm run data:validate` | Validate SKUs, slugs, refs |
| `npm run prices:dry-run` | Price import placeholder |
| `npm run images:dry-run` | Image import placeholder |
| `npm run import:batch` | Process registered batch manifest |

## What you should NOT need to do

- Edit PLP/PDP React components for each batch
- Rebuild the entire database from zero
- Hardcode new categories in navigation (consume category data/config)
- Guess official prices or supplier costs

## Related docs

- [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [CATALOG_SCALABILITY.md](./CATALOG_SCALABILITY.md)
- [PRODUCT_DATA.md](./PRODUCT_DATA.md)
