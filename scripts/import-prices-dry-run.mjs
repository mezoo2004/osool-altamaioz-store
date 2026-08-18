#!/usr/bin/env node
/**
 * FUTURE: Official selling price import (dry-run only — not executed in this phase).
 *
 * Usage (when business confirms price column):
 *   npm run prices:dry-run -- --file references/prices/approved-prices.xlsx
 */
console.log(`
PRICE IMPORT — DRY RUN PLACEHOLDER

Official selling prices are deferred until business confirmation.

When ready, this script will:
  1. Read approved price file (SKU/model column + selling price column)
  2. Match against normalizedSku / sku in catalog
  3. Output data/reports/price-import-dry-run.json
  4. Never map cost/supplier/wholesale columns

No prices were modified.
`);
