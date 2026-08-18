# Product Data — Osool Altamaioz

## Catalog scope

The current imported data (**batch-001**) is an **initial development / sample dataset** (~835 raw variants, ~703 grouped products from six Excel workbooks).

This is **NOT** the full Osool Altamaioz catalog. Future batches will add substantially more products.

**MySQL sync (Aug 2026):** Initial sample imported to Hostinger via `npm run catalog:sync-db`. Database holds 700 unique parent products and 835 variants (2 duplicate stable product IDs in source collapse on upsert). All `priceConfirmed: false`.

See `docs/CATALOG_SCALABILITY.md` for incremental import architecture.

## Source files (read-only — batch-001 sample)

| File | Category direction | Approx rows |
|------|-------------------|-------------|
| `تسعيرة انارة داخلية.xlsx` | Indoor — COB spots, panels, etc. | ~690+ |
| `تسعيرة كشافات.xlsx` | Outdoor floodlights | ~135 |
| `تسعيرة كشافات متنوع.xlsx` | Mixed ground/other floodlights | ~90 |
| `تسعيرة حبل زينة.xlsx` | LED strips / decorative rope | ~186 |
| `تسعيرة مراوح -لمبات - نجف.xlsx` | Fans, bulbs, chandeliers | ~131 |
| `تسعيرة افياش ومفاتيح بيانو.xlsx` | Piano switches/sockets | ~80 |

## Workbook patterns

### Pattern A — Arabic catalog sheets (`Sheet2 (2)`)

Repeated blocks:

```
[Company header: شركة اصول التميز للتجارة]
[Category title: e.g. سبوت لايت COB]
[Series line: S1 / K1 / MT & TM]
[Headers: الكود | الصنف | السعر]
[Product rows...]
```

Example raw code: `S1/7W/4000K/3Y/COB`  
Example raw name: `سبوت لايت ليد 7واط اضاءة اوف وايت ضمان 3سنوات S1/COB`

Structured extraction from code segments:

| Segment | Maps to |
|---------|---------|
| `S1`, `K1`, `MT`, `TM` | `series` (confirm brand vs supplier) |
| `7W`, `10W` | `wattage` |
| `3000K`, `4000K`, `6500K` | `cct` |
| `BK` | `finish: black` |
| `3Y` | warranty hint (confirm officially) |
| `COB` | product type / subcategory |

### Pattern B — Piano switches sheet (`Sheet1`)

English columns with **multiple price fields**:

- `Unit Price`, `Amount (USD)`, `نهاية السعر`, `تكلفة MT بلس`, `تكلفة التميز`, `اسعار الرائد`, `سعر الجملة`

**CRITICAL:** None of these are confirmed as the official online customer price. Import must set `priceConfirmed: false` and store raw references in import metadata only (not exposed on storefront).

## Normalized import model

Generated JSON shape (see `data/import/README.md`):

```json
{
  "sourceFile": "تسعيرة انارة داخلية.xlsx",
  "categorySlug": "cob-spotlights",
  "series": "S1",
  "variants": [
    {
      "rawCode": "S1/7W/4000K/3Y/COB",
      "rawNameAr": "...",
      "sku": "S1/7W/4000K/3Y/COB",
      "wattage": "7W",
      "cct": "4000K",
      "finish": null,
      "warrantyHint": "3Y",
      "rawPrice": 4,
      "priceStatus": "REQUIRES_BUSINESS_CONFIRMATION"
    }
  ]
}
```

## Variant grouping strategy

Group variants into one **Product** when they share:

- Same series + product family + wattage frame (e.g. all S1 COB 7W differing only by CCT/finish)

Each purchasable CCT/finish combination = **ProductVariant**.

## Storefront naming

Raw `الصنف` text is not used as final marketing title. Normalize to:

- Arabic: structured title from type + wattage + CCT label (دافئ/طبيعي/أبيض) + series
- English: parallel translation

Until copywriting pass, use parsed structured title with `[Draft]` internal flag.

## CCT labels

| Code | Arabic | English |
|------|--------|---------|
| 3000K | دافئ | Warm |
| 4000K | طبيعي | Neutral |
| 6500K | أبيض | White |

## Import script

`scripts/analyze-products.mjs` — reads Excel, writes normalized JSON to `data/import/` without modifying sources.

Run: `node scripts/analyze-products.mjs`

## Business blockers

- Official online price column
- K1/S1/MT/TM classification
- Stock quantities
- Product images mapping
- Warranty official text

See `docs/BUSINESS_BLOCKERS.md`.

## Experience content (Phase 6)

Curated JSON in `data/experiences/` — editable without UI changes:

- **`spaces.json`** — 9 spaces (Majlis, Living Room, Bedroom, Kitchen, Office, Restaurant, Retail, Facade, Garden) with AR/EN copy, tips, category slugs, product slug mappings, scene links
- **`scenes.json`** — 5 interactive scenes with percentage hotspots and bundle item lists
- **`recommendation-rules.json`** — mood/space/area rules for Lighting Experience

Product slug mappings are **development curation** until official merchandising metadata exists. Slugs must reference real catalog entries from `data/catalog/products.json`.

**Known limitations:**

- Scene/space hero images use gradient placeholders until photography assets are supplied
- Recommendations do not verify IP ratings unless present in variant data
- No account-based saved lighting projects (V2)
