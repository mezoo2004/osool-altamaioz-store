#!/usr/bin/env node
/**
 * Official selling prices from attached Excel workbooks (Downloads by default).
 * Usage:
 *   node scripts/import-official-prices.mjs           # dry-run
 *   node scripts/import-official-prices.mjs --apply   # write catalog + reports
 *   node scripts/import-official-prices.mjs --apply --sync-db
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildSkuRegistry, normalizeSku } from "./lib/catalog-import.mjs";
import { computeCompareAtPrice } from "./lib/compare-at-price.mjs";
import { parseAllOfficialPriceFiles, resolveOfficialPriceFiles } from "./lib/official-price-xlsx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data", "catalog", "products.json");
const reportsDir = path.join(root, "data", "reports");

const apply = process.argv.includes("--apply");
const syncDb = process.argv.includes("--sync-db");

function finishFromSku(sku) {
  const m = String(sku).match(/-([A-Z]{2,3})$/i);
  return m ? m[1].toUpperCase() : null;
}

function buildCatalogIndex(products) {
  const byNorm = new Map();
  const byExactSku = new Map();
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const norm = normalizeSku(variant.sku);
      byExactSku.set(variant.sku, { product, variant });
      if (!byNorm.has(norm)) byNorm.set(norm, []);
      byNorm.get(norm).push({ product, variant });
    }
  }
  return { byNorm, byExactSku };
}

function matchExcelRow(row, index) {
  const code = row.sku;
  const norm = row.normalizedSku;
  const exact = index.byExactSku.get(code);
  if (exact) return { kind: "exact_sku", target: exact };

  const normHits = index.byNorm.get(norm) ?? [];
  if (normHits.length === 1) return { kind: "normalized_sku", target: normHits[0] };

  if (row.finishHint) {
    const suffixed = index.byExactSku.get(`${code}-${row.finishHint}`);
    if (suffixed) return { kind: "finish_suffix", target: suffixed };
    const suffixedNorm = index.byExactSku.get(`${norm}-${row.finishHint}`);
    if (suffixedNorm) return { kind: "finish_suffix", target: suffixedNorm };
  }

  const prefix = norm;
  const prefixHits = [];
  for (const [skuNorm, entries] of index.byNorm.entries()) {
    if (skuNorm === prefix || skuNorm.startsWith(`${prefix}/`) || skuNorm.startsWith(`${prefix}-`)) {
      prefixHits.push(...entries);
    }
  }
  if (prefixHits.length === 1) return { kind: "prefix_sku", target: prefixHits[0] };

  if (prefixHits.length > 1 && row.finishHint) {
    const filtered = prefixHits.filter(({ variant }) => {
      const fin = finishFromSku(variant.sku);
      return fin === row.finishHint;
    });
    if (filtered.length === 1) return { kind: "prefix_finish", target: filtered[0] };
  }

  if (prefixHits.length > 1) {
    return { kind: "ambiguous", candidates: prefixHits.map((c) => c.variant.sku) };
  }

  return { kind: "unresolved" };
}

const NEW_PRODUCT_CATEGORY = {
  "internal-lighting": "downlights",
  "switches-sockets": "switches-sockets",
  "fans-bulbs-chandeliers": "ceiling-fans",
  floodlights: "floodlights",
  "decorative-rope-led": "led-strips",
  general: "uncategorized",
};

function slugFromSku(sku) {
  return (
    String(sku)
      .toLowerCase()
      .replace(/\*/g, "x")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || `sku-${randomUUID().slice(0, 8)}`
  );
}

function buildNewCatalogProduct(row) {
  const primaryCategory = NEW_PRODUCT_CATEGORY[row.sourceCategory] ?? "uncategorized";
  const selling = row.sellingPrice;
  const compareAt = computeCompareAtPrice(selling, row.sku);
  const variantId = slugFromSku(row.sku);
  const now = new Date().toISOString();
  return {
    id: `official-${variantId}`,
    slug: `official-${variantId}`,
    groupKey: `${primaryCategory}::${row.normalizedSku}`,
    nameAr: row.nameAr,
    nameEn: row.nameAr,
    series: row.seriesLine ?? null,
    productType: primaryCategory === "led-strips" ? "LED_STRIP" : "PRODUCT",
    categorySlugs: [primaryCategory],
    primaryCategory,
    sourceFile: row.sourceFile,
    categoryTitle: row.sourceCategory,
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    isOnOffer: compareAt > selling,
    installationType: null,
    variants: [
      {
        id: variantId,
        sku: row.sku,
        modelNumber: row.sku.split("/")[0] ?? row.sku,
        wattage: null,
        cct: null,
        cctLabel: null,
        finish: row.finishHint ?? null,
        demoPrice: null,
        confirmedPrice: selling,
        compareAtPrice: compareAt,
        salePrice: null,
        priceConfirmed: true,
        priceStatus: "CONFIRMED",
        stockStatus: "OUT_OF_STOCK",
        stockQty: 0,
        warrantyHint: null,
        imageUrl: null,
        nameAr: row.nameAr,
        nameEn: row.nameAr,
        importMeta: {
          sourceFile: row.sourceFile,
          sourceBatch: "official-price-xlsx",
          sourceRowRef: row.sourceRowRef,
          importedAt: now,
          normalizedSku: row.normalizedSku,
        },
      },
    ],
    importBatch: "official-price-xlsx",
    updatedAt: now,
    stockStatus: "OUT_OF_STOCK",
    variantCount: 1,
    demoPriceFrom: selling,
    demoPriceTo: selling,
    createdAt: now,
  };
}

function main() {
  const filePaths = resolveOfficialPriceFiles();
  const excelRows = parseAllOfficialPriceFiles(filePaths);
  const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const index = buildCatalogIndex(products);

  const skuPriceMap = new Map();
  const duplicateConflicts = [];
  for (const row of excelRows) {
    const mapKey = `${row.normalizedSku}::${row.finishHint ?? "NONE"}`;
    const prev = skuPriceMap.get(mapKey);
    if (prev && prev.sellingPrice !== row.sellingPrice) {
      duplicateConflicts.push({
        sku: row.sku,
        normalizedSku: row.normalizedSku,
        finishHint: row.finishHint,
        prices: [prev.sellingPrice, row.sellingPrice],
        sources: [prev.sourceRowRef, row.sourceRowRef],
      });
    } else {
      skuPriceMap.set(mapKey, row);
    }
  }

  const stats = {
    totalExcelRows: excelRows.length,
    uniqueSkus: new Set(excelRows.map((r) => r.normalizedSku)).size,
    matchedExisting: 0,
    variantUpdates: 0,
    newProducts: 0,
    duplicateSkuConflicts: duplicateConflicts.length,
    invalidPrices: excelRows.filter((r) => r.sellingPrice == null).length,
    unresolved: [],
    ambiguous: [],
  };

  const updatesByVariantSku = new Map();

  for (const row of excelRows) {
    const match = matchExcelRow(row, index);
    if (match.kind === "unresolved") {
      stats.unresolved.push({ sku: row.sku, nameAr: row.nameAr, source: row.sourceRowRef });
      continue;
    }
    if (match.kind === "ambiguous") {
      stats.ambiguous.push({ sku: row.sku, candidates: match.candidates, source: row.sourceRowRef });
      continue;
    }
    stats.matchedExisting++;
    updatesByVariantSku.set(match.target.variant.sku, { row, ...match });
  }

  const updates = [...updatesByVariantSku.values()];
  stats.newProducts = stats.unresolved.length;

  const safeToApply =
    stats.duplicateSkuConflicts === 0 &&
    stats.ambiguous.length === 0 &&
    stats.matchedExisting > 0;

  const report = {
    generatedAt: new Date().toISOString(),
    files: filePaths,
    safeToApply,
    stats,
    duplicateConflicts: duplicateConflicts.slice(0, 200),
    ambiguous: stats.ambiguous.slice(0, 200),
    unresolvedSample: stats.unresolved.slice(0, 50),
  };

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, "official-price-import-dry-run.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n══════════════════════════════════════");
  console.log("OFFICIAL PRICE IMPORT — DRY RUN");
  console.log("══════════════════════════════════════");
  console.log(`TOTAL EXCEL ROWS: ${stats.totalExcelRows}`);
  console.log(`UNIQUE SKUS: ${stats.uniqueSkus}`);
  console.log(`MATCHED EXISTING: ${stats.matchedExisting}`);
  console.log(`NEW PRODUCTS: ${stats.newProducts}`);
  console.log(`VARIANT UPDATES (pending): ${updates.length}`);
  console.log(`DUPLICATE SKU CONFLICTS: ${stats.duplicateSkuConflicts}`);
  console.log(`AMBIGUOUS MATCHES: ${stats.ambiguous.length}`);
  console.log(`INVALID PRICES: ${stats.invalidPrices}`);
  console.log(`UNRESOLVED: ${stats.unresolved.length}`);
  console.log(`SAFE TO APPLY: ${safeToApply ? "YES" : "NO"}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);

  if (!apply) {
    console.log("\nDry run only — pass --apply to write catalog prices.\n");
    process.exit(safeToApply ? 0 : 2);
  }

  if (!safeToApply) {
    console.error("\nApply blocked — resolve conflicts/ambiguous matches first.\n");
    process.exit(2);
  }

  for (const row of stats.unresolved) {
    const excelRow = excelRows.find((r) => r.sku === row.sku && r.sourceRowRef === row.source);
    if (!excelRow) continue;
    const created = buildNewCatalogProduct(excelRow);
    products.push(created);
    stats.newProducts++;
  }

  for (const u of updates) {
    const { variant } = u.target;
    const selling = u.row.sellingPrice;
    const compareAt = computeCompareAtPrice(selling, variant.sku);
    variant.confirmedPrice = selling;
    variant.priceConfirmed = true;
    variant.priceStatus = "CONFIRMED";
    variant.compareAtPrice = compareAt;
    variant.salePrice = null;
    stats.variantUpdates++;
  }

  for (const product of products) {
    const priced = product.variants.filter((v) => v.priceConfirmed && v.confirmedPrice != null);
    if (priced.length) {
      product.isOnOffer = priced.some((v) => v.compareAtPrice != null && v.compareAtPrice > v.confirmedPrice);
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2), "utf8");
  console.log("\nAPPLIED — data/catalog/products.json updated with confirmed prices.");

  if (syncDb) {
    const validate = spawnSync("node", [path.join(__dirname, "data-validate.mjs")], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if (validate.status !== 0) process.exit(validate.status ?? 1);
    const sync = spawnSync("node", [path.join(__dirname, "sync-catalog-to-db.mjs")], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if (sync.status !== 0) process.exit(sync.status ?? 1);
  }
}

main();
