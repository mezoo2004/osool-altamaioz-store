# Database Schema — Osool Altamaioz

Source of truth: `prisma/schema.prisma`

**Production engine:** MySQL (Hostinger)  
Designed for **catalog growth beyond the initial sample dataset**. See `docs/CATALOG_SCALABILITY.md`.

## MySQL compatibility

| Concern | Approach |
|---------|----------|
| Money | `Decimal @db.Decimal(12, 2)` on prices, order totals — never Float |
| Long text | `@db.Text` for descriptions, spec values, notes |
| Unique indexes | `@db.VarChar(191)` on slug, SKU, email, orderNumber (utf8mb4 index limit) |
| Names | `@db.VarChar(500)` where needed; not unique-indexed |
| JSON | Snapshots/metadata only (`importMeta`, `shippingAddress`, `attributesSnapshot`) |
| Enums | Prisma enums → MySQL ENUM (status fields) |
| Relations | InnoDB FK with `onDelete: Cascade` / `SetNull` as appropriate |

## Core entities

### Category

Hierarchical catalog navigation — **dynamic**, not limited to current sample files. Fields: `slug`, `nameAr`, `nameEn`, `parentId`, `sortOrder`.

Products may belong to multiple categories via `ProductCategory`.

### Product

Storefront product card / PDP parent. Key fields:

- Bilingual names and descriptions
- `brand`, `series` (from spreadsheet codes like S1, K1, MT, TM — **business confirmation required**)
- `basePrice`, `salePrice`, `priceConfirmed` — **do not show unconfirmed prices as official**
- Flags: featured, new, bestseller, offer
- SEO fields per locale

### ProductVariant

Purchasable SKU level. **SKU / normalizedSku is the authoritative identity key.**

Structured attributes:

- `wattage`, `cct`, `finish`, `size`, `voltage`, `length`, `beamAngle`, `ipRating`
- Per-variant price/stock (`price` nullable until business price import phase)
- `attributes` JSON for extensibility
- `sourceBatchId`, `sourceFile`, `sourceRowRef`, `importMeta` — internal traceability (not customer-facing)

### ImportBatch

Audit record per import batch (`batch-001`, `batch-002`, …): source files, counts, conflict count, status.

### ProductCategory

Many-to-many product ↔ category. Supports dynamic taxonomy as new batches introduce categories.

### CategorySourceMapping

Maps supplier/source category labels → store `categorySlug`. Unmapped entries flagged in import reports.

### ProductImage / ProductSpec

Gallery and specification tables linked to product.

### WishlistItem

Authenticated customer wishlist (`productSlug` per row). Guest wishlist remains in browser localStorage and merges via `/api/wishlist/merge` on login.

### Customer / Address

Account and Saudi-compatible address model with international-ready `country` field.

### Order / OrderItem

Orders snapshot item names, SKU, attributes and prices at purchase time (`*Snapshot` fields on OrderItem).

### Space / Scene

Shop By Space and Shop The Scene content. Scene `hotspots` stored as JSON array `{ x, y, productId|variantId }` until dedicated table is needed.

## Pricing rule

`priceConfirmed = false` until business confirms official online selling prices in a dedicated import phase.

Import pipeline must never map cost columns (`تكلفة`, `Unit Price USD`, `نسبة الربح`, etc.) to customer-facing prices.

Selling price fields remain nullable / `PRICE_UNAVAILABLE` on storefront until confirmed.

## Image rule

`imageUrl` optional. Product photography deferred to dedicated **Product Image Mapping & Import Phase**.

## Indexes

Product/variant indexes on category, series, CCT, wattage, status for PLP filters and search.

## Migrations

Run when `DATABASE_URL` is configured:

```bash
npm run db:generate
npm run db:push
```
