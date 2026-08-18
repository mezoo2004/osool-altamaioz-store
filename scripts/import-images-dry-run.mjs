#!/usr/bin/env node
/**
 * FUTURE: Product image mapping import (dry-run only — not executed in this phase).
 *
 * When ready:
 *   1. Drop assets in references/product-images/
 *   2. Provide mapping file (SKU/model → filename)
 *   3. Run dry-run then apply
 */
console.log(`
IMAGE IMPORT — DRY RUN PLACEHOLDER

Product photography is deferred to a dedicated mapping phase.

When ready, this script will:
  1. Scan references/product-images/
  2. Match by SKU / model / explicit mapping file
  3. Output data/reports/image-import-dry-run.json
  4. Set ProductVariant.imageUrl / ProductImage records

No images were modified.
`);
