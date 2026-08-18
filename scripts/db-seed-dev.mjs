#!/usr/bin/env node
/**
 * Optional development utilities — intentionally does NOT seed product catalog or fake orders.
 * Product catalog must come only from explicit import/sync commands.
 */
console.log(`
Development seed — not configured.

This project does not auto-seed fake customers, orders, or product catalog data.

To populate products:
  npm run catalog:apply
  npm run catalog:sync-db   (when DATABASE_URL is set)

See docs/DATABASE_SETUP.md
`);
