# Normalized Import Output

This directory receives **generated** JSON from `scripts/analyze-products.mjs`.

Raw Excel files in `references/products/` are never modified.

## Scope

The current import reflects **batch-001 — initial development sample only**.
It is NOT the full Osool Altamaioz catalog.

See `docs/CATALOG_SCALABILITY.md` for incremental batch architecture.

## Batch layout

```
data/import/
  *.json                    ← normalized per source workbook
  _summary.json             ← last analyze run summary
  batches/
    batch-001/manifest.json
    batch-002/manifest.json ← future batches
```

## Schema

Each normalized file follows the schema in `docs/PRODUCT_DATA.md`.

- `importBatch` — batch identifier (e.g. `batch-001`)
- `importedAt` — ISO timestamp
- Variants include `sourceRowRef` for traceability (internal only)

## Prices

All variants use `priceStatus: "REQUIRES_BUSINESS_CONFIRMATION"`.
Raw Excel price columns are **not** copied to normalized output.
Official selling prices will be imported in a later phase.

## Commands

```bash
npm run import:analyze      # analyze Excel → JSON
npm run catalog:build       # group JSON → products.json
npm run import:batch        # analyze + build (recommended)
```
