/**
 * Builds grouped product catalog from data/import/*.json
 *
 * Scalable / idempotent:
 * - Stable product + variant IDs from groupKey / normalized SKU
 * - SKU registry with conflict detection (never auto-merge ambiguous matches)
 * - Preserves existing slugs when groupKey unchanged
 * - Batch traceability via importMeta (internal; not customer-facing)
 *
 * Outputs:
 *   data/catalog/products.json
 *   data/catalog/grouping-report.json
 *   data/catalog/conflict-report.json
 *   data/catalog/discovered-categories.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectSkuConflict,
  normalizeSku,
  stableProductId,
  stableVariantId,
  uniqueSlug,
  upsertVariantInProduct,
} from "./catalog-import.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const importDir = path.join(root, "data", "import");
const outDir = path.join(root, "data", "catalog");
const reportsDir = path.join(root, "data", "reports");

const CCT_LABELS = {
  "3000K": { ar: "دافئ", en: "Warm" },
  "4000K": { ar: "طبيعي", en: "Neutral" },
  "6500K": { ar: "أبيض", en: "White" },
};

/** Keyword hints — extensible; new batches may introduce categories via source titles. */
const CATEGORY_KEYWORDS = {
  "cob-spotlights": ["cob", "سبوت"],
  "panel-lights": ["panel", "بانل"],
  gu10: ["gu10"],
  "anti-glare": ["anti", "glare", "anti-glare"],
  cylinder: ["cylinder", "سلندر"],
  track: ["track", "تراك"],
  profiles: ["profile", "بروف"],
  floodlights: ["k1", "كشاف", "flood"],
  "ground-lights": ["ground", "ارضي", "أرضي"],
  "wall-outdoor": ["wall", "حائط"],
  landscape: ["landscape", "حدائ"],
  chandeliers: ["chandelier", "نجف", "نجفة"],
  pendants: ["pendant", "معلق"],
  "led-strips": ["حبل", "2835", "strip"],
  switches: ["مفتاح", "switch"],
  sockets: ["socket", "فيش", "افياش"],
  bulbs: ["لمبة", "bulb", "lamp"],
  fans: ["مرو", "fan"],
  indoor: ["indoor", "داخل"],
  outdoor: ["outdoor", "خارج"],
  decorative: ["decorative", "ديكور"],
};

function loadCategoryMappings() {
  const mapPath = path.join(importDir, "category-mappings.json");
  if (!fs.existsSync(mapPath)) return new Map();
  const data = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  return new Map(
    (data.mappings ?? []).map((m) => [String(m.sourceKey).toLowerCase().trim(), m.categorySlug]),
  );
}

function mapSourceCategory(categoryTitle, mappings) {
  if (!categoryTitle) return null;
  const key = String(categoryTitle).toLowerCase().trim();
  return mappings.get(key) ?? null;
}

function normalizeCct(cct) {
  if (!cct) return null;
  const m = String(cct).match(/(3000|4000|6500)/);
  return m ? `${m[1]}K` : String(cct).toUpperCase();
}

function inferCategorySlugs(variant, block, sourceFile, mappings, unmapped) {
  const title = block?.categoryTitle;
  const explicit = mapSourceCategory(title, mappings);
  if (explicit) return [explicit];

  const haystack = [
    title,
    block?.seriesLine,
    variant.rawNameAr,
    variant.rawCode,
    sourceFile,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const slugs = [];
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => haystack.includes(k.toLowerCase()))) slugs.push(slug);
  }
  if (slugs.length === 0) {
    if (title) unmapped.add(title);
    slugs.push("UNMAPPED_CATEGORY");
  }
  return [...new Set(slugs)];
}

function extractProductType(variant, block) {
  const parts = variant.parts ?? [];
  const fromParts = parts.find((p) =>
    ["COB", "GU10", "PANEL", "TRACK", "CYLINDER"].includes(String(p).toUpperCase()),
  );
  if (fromParts) return String(fromParts).toUpperCase();
  const title = String(block?.categoryTitle ?? "").toLowerCase();
  if (title.includes("cob")) return "COB";
  if (title.includes("حبل")) return "LED_STRIP";
  if (title.includes("كشاف")) return "FLOOD";
  if (title.includes("مفتاح") || title.includes("switch")) return "SWITCH";
  return "LIGHT";
}

function buildEnglishName(variant, productType) {
  const series = variant.series ? `${variant.series} ` : "";
  const wattage = variant.wattage ? `${variant.wattage} ` : "";
  const cct = variant.cct ? `${variant.cct} ` : "";
  const typeLabel =
    productType === "COB"
      ? "COB Spotlight"
      : productType === "FLOOD"
        ? "Floodlight"
        : productType === "LED_STRIP"
          ? "LED Strip"
          : productType === "SWITCH"
            ? "Switch"
            : "Lighting Product";
  return `${series}${typeLabel} ${wattage}${cct}`.trim();
}

function buildArabicBaseName(variant, productType) {
  const raw = variant.rawNameAr ?? "";
  return raw
    .replace(/اضاءة\s*(اصفر|ابيض|اوف\s*وايت|أبيض)/gi, "")
    .replace(/(3000|4000|6500)\s*k?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getGroupKey(variant, block, categorySlug) {
  const productType = extractProductType(variant, block);

  if (productType === "SWITCH" || variant.rawCode?.startsWith("C80")) {
    return `${categorySlug}::${normalizeSku(variant.rawCode ?? variant.sku)}`;
  }

  if (variant.rawCode?.includes("/")) {
    const codeBase = String(variant.rawCode)
      .replace(/\/(3000|4000|6500)K/gi, "")
      .replace(/\/BK/gi, "")
      .replace(/\/+/g, "/")
      .replace(/\/$/, "");
    return `${categorySlug}::${normalizeSku(codeBase)}`;
  }

  return [
    categorySlug,
    variant.series ?? "NA",
    variant.wattage ?? "NA",
    productType,
    variant.finish ?? "default",
    buildArabicBaseName(variant, productType).slice(0, 60),
  ].join("::");
}

function hashStock(sku) {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h + sku.charCodeAt(i) * (i + 1)) % 997;
  if (h % 7 === 0) return { status: "OUT_OF_STOCK", qty: 0 };
  if (h % 5 === 0) return { status: "LOW_STOCK", qty: 3 };
  return { status: "IN_STOCK", qty: 20 + (h % 80) };
}

function loadImportFiles() {
  if (!fs.existsSync(importDir)) return [];
  return fs
    .readdirSync(importDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_") && !f.includes("batches"))
    .map((f) => ({
      sourceFile: f,
      data: JSON.parse(fs.readFileSync(path.join(importDir, f), "utf8")),
    }));
}

function collectRawVariants(importBatch) {
  const rows = [];
  for (const { sourceFile, data } of loadImportFiles()) {
    const batchId = data.importBatch ?? importBatch;
    if (data.blocks) {
      for (const block of data.blocks) {
        for (let vi = 0; vi < (block.variants ?? []).length; vi++) {
          const variant = block.variants[vi];
          if (!variant.rawCode) continue;
          rows.push({
            variant,
            block,
            sourceFile,
            batchId,
            sourceRowRef: variant.sourceRowRef ?? `block:${block.headerRow}:variant:${vi}`,
          });
        }
      }
    }
    if (data.variants) {
      for (let vi = 0; vi < data.variants.length; vi++) {
        const variant = data.variants[vi];
        if (!variant.rawCode) continue;
        rows.push({
          variant: {
            rawCode: variant.rawCode,
            rawNameAr: variant.rawNameAr ?? variant.rawNameEn ?? variant.description,
            rawNameEn: variant.rawNameEn ?? variant.description,
            sku: variant.rawCode ?? variant["Item No."],
            series: variant.series ?? variant.Series,
            finish: variant.color ?? variant.Color ?? variant.finish,
            wattage: variant.wattage,
            cct: variant.cct,
            rawPrice: variant.rawPrice,
            priceStatus: variant.priceStatus ?? "REQUIRES_BUSINESS_CONFIRMATION",
            parts: variant.parts ?? [],
            sourceRowRef: variant.sourceRowRef,
          },
          block: { categoryTitle: "switches-sockets", seriesLine: variant.series },
          sourceFile,
          batchId,
          sourceRowRef: variant.sourceRowRef ?? `sheet:row:${vi + 2}`,
        });
      }
    }
  }
  return rows;
}

function loadPreviousCatalog() {
  const catalogPath = path.join(outDir, "products.json");
  if (!fs.existsSync(catalogPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  } catch {
    return [];
  }
}

/**
 * Build grouped catalog from normalized import JSON.
 * @param {{ importBatch?: string }} options
 */
export function buildCatalog(options = {}) {
  const importBatch = options.importBatch ?? process.env.IMPORT_BATCH ?? "batch-001";
  const importedAt = new Date().toISOString();
  const categoryMappings = loadCategoryMappings();
  const unmappedCategories = new Set();

  const rawRows = collectRawVariants(importBatch);
  const previousProducts = loadPreviousCatalog();
  const previousByGroupKey = new Map(
    previousProducts.filter((p) => p.groupKey).map((p) => [p.groupKey, p]),
  );
  const slugByGroupKey = new Map(
    previousProducts.filter((p) => p.groupKey).map((p) => [p.groupKey, p.slug]),
  );
  const groups = new Map();
  const usedSlugs = new Set(previousProducts.map((p) => p.slug));
  const conflicts = [];
  const stats = { variantsCreated: 0, variantsUpdated: 0, variantsUnchanged: 0, variantsSkipped: 0 };
  const skuRegistry = new Map();
  const previousVariantBySku = new Map();
  for (const prevProduct of previousProducts) {
    for (const prevVariant of prevProduct.variants ?? []) {
      previousVariantBySku.set(normalizeSku(prevVariant.sku), prevVariant);
    }
  }

  for (const row of rawRows) {
  const { variant, block, sourceFile, batchId, sourceRowRef } = row;
  const sku = String(variant.sku ?? variant.rawCode);
  const normSku = normalizeSku(sku);
  if (!normSku) continue;

  const categorySlugs = inferCategorySlugs(variant, block, sourceFile, categoryMappings, unmappedCategories);
  const primaryCategory = categorySlugs[0];
  const groupKey = getGroupKey(variant, block, primaryCategory);
  const productType = extractProductType(variant, block);
  const cct = normalizeCct(variant.cct);
  const stock = hashStock(sku);
  const nameAr = buildArabicBaseName(variant, productType) || variant.rawNameAr;

  const productId = stableProductId(groupKey);

  const conflict = detectSkuConflict(skuRegistry, sku, productId);
  if (conflict) {
    conflicts.push({ ...conflict, sourceFile, batchId, sourceRowRef, groupKey });
    stats.variantsSkipped++;
    continue;
  }

  if (!groups.has(groupKey)) {
    const nameEn = buildEnglishName(variant, productType);
    const slugBase = `${variant.series ?? "p"}-${variant.wattage ?? "w"}-${productType}-${variant.finish ?? "std"}-${primaryCategory}`;
    const preservedSlug = slugByGroupKey.get(groupKey);
    const slug = preservedSlug ?? uniqueSlug(slugBase, usedSlugs);
    if (preservedSlug) usedSlugs.add(preservedSlug);

    const prevGroup = previousByGroupKey.get(groupKey);
    groups.set(groupKey, {
      id: productId,
      slug,
      groupKey,
      nameAr,
      nameEn,
      series: variant.series ?? null,
      productType,
      categorySlugs,
      primaryCategory,
      sourceFile,
      categoryTitle: block?.categoryTitle ?? null,
      isFeatured: prevGroup?.isFeatured ?? false,
      isNew: prevGroup?.isNew ?? false,
      isBestseller: prevGroup?.isBestseller ?? false,
      isOnOffer: prevGroup?.isOnOffer ?? false,
      installationType: productType === "FLOOD" ? "outdoor" : "recessed",
      variants: [],
      importBatch: batchId,
      updatedAt: importedAt,
    });
  }

  const product = groups.get(groupKey);
  product.categorySlugs = [...new Set([...product.categorySlugs, ...categorySlugs])];
  product.updatedAt = importedAt;

  const importMeta = {
    sourceFile,
    sourceBatch: batchId,
    sourceRowRef,
    importedAt,
    normalizedSku: normSku,
  };

  const incomingVariant = {
    sku,
    modelNumber: sku.split("/")[0] ?? null,
    wattage: variant.wattage ?? null,
    cct,
    cctLabel: cct ? CCT_LABELS[cct] ?? null : null,
    finish: variant.finish ?? null,
    demoPrice: null,
    confirmedPrice: null,
    compareAtPrice: null,
    salePrice: null,
    priceConfirmed: false,
    priceStatus: "REQUIRES_BUSINESS_CONFIRMATION",
    stockStatus: stock.status,
    stockQty: stock.qty,
    warrantyHint: variant.warrantyHint ?? null,
    imageUrl: null,
    nameAr: variant.rawNameAr,
    nameEn: variant.rawNameEn ?? buildEnglishName(variant, productType),
  };

  const prevVariant = previousVariantBySku.get(normSku);
  if (prevVariant?.priceConfirmed && prevVariant.confirmedPrice != null) {
    incomingVariant.confirmedPrice = prevVariant.confirmedPrice;
    incomingVariant.compareAtPrice = prevVariant.compareAtPrice ?? null;
    incomingVariant.salePrice = prevVariant.salePrice ?? null;
    incomingVariant.priceConfirmed = true;
    incomingVariant.priceStatus = prevVariant.priceStatus ?? "CONFIRMED";
  }

  const action = upsertVariantInProduct(product, incomingVariant, importMeta);
  if (action === "created") stats.variantsCreated++;
  else if (action === "updated") stats.variantsUpdated++;
  else stats.variantsUnchanged++;

  skuRegistry.set(normSku, {
    productId,
    productSlug: product.slug,
    variantId: stableVariantId(sku),
    groupKey,
    productNameAr: product.nameAr,
  });
}

  let products = [...groups.values()].map((p) => {
    const inStock = p.variants.some((v) => v.stockStatus !== "OUT_OF_STOCK");
    const confirmedPrices = p.variants
      .filter((v) => v.priceConfirmed && v.confirmedPrice != null)
      .map((v) => v.confirmedPrice);
    const isOnOffer =
      p.isOnOffer ||
      p.variants.some(
        (v) =>
          v.compareAtPrice != null &&
          v.confirmedPrice != null &&
          v.compareAtPrice > v.confirmedPrice,
      );
    return {
      ...p,
      stockStatus: inStock ? "IN_STOCK" : "OUT_OF_STOCK",
      variantCount: p.variants.length,
      demoPriceFrom: confirmedPrices.length ? Math.min(...confirmedPrices) : null,
      demoPriceTo: confirmedPrices.length ? Math.max(...confirmedPrices) : null,
      isOnOffer,
      createdAt: p.createdAt ?? importedAt,
      updatedAt: p.updatedAt ?? importedAt,
    };
  });

  const builtIds = new Set(products.map((p) => p.id));
  const builtSkus = new Set(
    products.flatMap((p) => p.variants.map((v) => normalizeSku(v.sku))),
  );
  for (const prev of previousProducts) {
    if (builtIds.has(prev.id)) continue;
    const onlyInPrev = prev.variants.every((v) => !builtSkus.has(normalizeSku(v.sku)));
    if (onlyInPrev && prev.importBatch === "official-price-xlsx") {
      products.push(prev);
      builtIds.add(prev.id);
    }
  }

  const categoryCounts = {};
  for (const p of products) {
    for (const slug of p.categorySlugs ?? []) {
      categoryCounts[slug] = (categoryCounts[slug] ?? 0) + 1;
    }
  }

  const discoveredCategories = Object.entries(categoryCounts)
    .map(([slug, productCount]) => ({ slug, productCount }))
    .sort((a, b) => b.productCount - a.productCount);

  const report = {
    generatedAt: importedAt,
    importBatch,
    catalogScope: "initial-imported-sample",
    catalogScopeNote:
      "Current counts reflect the initial development sample only — NOT the full Osool Altamaioz catalog.",
    rawVariantCount: rawRows.length,
    groupedProductCount: products.length,
    multiVariantProducts: products.filter((p) => p.variantCount > 1).length,
    singleVariantProducts: products.filter((p) => p.variantCount === 1).length,
    importStats: stats,
    conflictCount: conflicts.length,
    unmappedCategoryCount: unmappedCategories.size,
    discoveredCategoryCount: discoveredCategories.length,
    sampleGroups: products.slice(0, 5).map((p) => ({
      slug: p.slug,
      nameAr: p.nameAr,
      variantCount: p.variantCount,
      skus: p.variants.map((v) => v.sku),
    })),
  };

  const conflictReport = {
    generatedAt: importedAt,
    importBatch,
    totalConflicts: conflicts.length,
    policy: "Conflicts are reported — ambiguous SKU matches are never auto-merged.",
    recommendedAction: "Review conflicts manually before apply. Do not auto-merge ambiguous records.",
    conflicts: conflicts.map((c) => ({
      ...c,
      recommendedManualAction: "Verify SKU ownership and groupKey mapping; update category-mappings or source file.",
    })),
  };

  const unmappedReport = {
    generatedAt: importedAt,
    importBatch,
    unmapped: [...unmappedCategories].map((title) => ({
      sourceCategoryTitle: title,
      status: "UNMAPPED_CATEGORY",
      recommendedManualAction: "Add mapping in data/import/category-mappings.json",
    })),
  };

  const warnings = {
    missingImages: products.reduce((n, p) => n + p.variants.filter((v) => !v.imageUrl).length, 0),
    missingSellingPrices: products.reduce(
      (n, p) => n + p.variants.filter((v) => !v.priceConfirmed).length,
      0,
    ),
    unmappedCategories: unmappedCategories.size,
  };

  return {
    products,
    report,
    conflictReport,
    discoveredCategories,
    unmappedReport,
    warnings,
    previousProducts,
  };
}

export function summarizeDryRun(result) {
  const { products, previousProducts, report, warnings, conflictReport, unmappedReport } = result;
  const prevGroups = new Set(previousProducts.map((p) => p.groupKey).filter(Boolean));
  const nextGroups = new Set(products.map((p) => p.groupKey).filter(Boolean));
  let productsCreate = 0;
  let productsUpdate = 0;
  for (const g of nextGroups) {
    if (prevGroups.has(g)) productsUpdate++;
    else productsCreate++;
  }

  return {
    mode: "DRY_RUN",
    source: report.importBatch,
    rows: report.rawVariantCount,
    products: {
      create: productsCreate,
      update: productsUpdate,
      skip: report.importStats.variantsSkipped,
      conflict: report.conflictCount,
    },
    variants: {
      create: report.importStats.variantsCreated,
      update: report.importStats.variantsUpdated,
      unchanged: report.importStats.variantsUnchanged,
    },
    warnings: {
      missingImages: warnings.missingImages,
      missingSellingPrices: warnings.missingSellingPrices,
      unmappedCategories: warnings.unmappedCategories,
    },
    conflictReport,
    unmappedReport,
  };
}

export function writeCatalogOutputs(result) {
  const { products, report, conflictReport, discoveredCategories, unmappedReport, warnings } = result;
  const importedAt = report.generatedAt;

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "products.json"), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(outDir, "grouping-report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, "conflict-report.json"), JSON.stringify(conflictReport, null, 2));
  fs.writeFileSync(
    path.join(outDir, "discovered-categories.json"),
    JSON.stringify({ generatedAt: importedAt, categories: discoveredCategories }, null, 2),
  );
  fs.writeFileSync(
    path.join(reportsDir, "import-conflicts.json"),
    JSON.stringify(conflictReport, null, 2),
  );
  fs.writeFileSync(
    path.join(reportsDir, "import-unmapped-categories.json"),
    JSON.stringify(unmappedReport, null, 2),
  );
  fs.writeFileSync(
    path.join(reportsDir, "import-summary.json"),
    JSON.stringify({ ...report, warnings }, null, 2),
  );

  return report;
}

export function printImportSummary(summary) {
  console.log("\n══════════════════════════════════════");
  console.log(`SOURCE: Batch ${summary.source ?? summary.importBatch ?? "—"}`);
  console.log("══════════════════════════════════════");
  if (summary.rows != null) console.log(`ROWS: ${summary.rows}`);
  if (summary.products) {
    console.log("\nPRODUCTS:");
    console.log(`  Create: ${summary.products.create ?? "—"}`);
    console.log(`  Update: ${summary.products.update ?? "—"}`);
    console.log(`  Skip:   ${summary.products.skip ?? "—"}`);
    console.log(`  Conflict: ${summary.products.conflict ?? "—"}`);
  }
  if (summary.variants) {
    console.log("\nVARIANTS:");
    console.log(`  Create: ${summary.variants.create ?? "—"}`);
    console.log(`  Update: ${summary.variants.update ?? "—"}`);
  }
  if (summary.warnings) {
    console.log("\nWARNINGS (informational — not failures):");
    console.log(`  Missing Images: ${summary.warnings.missingImages ?? "—"}`);
    console.log(`  Missing Selling Prices: ${summary.warnings.missingSellingPrices ?? "—"}`);
    console.log(`  Unmapped Categories: ${summary.warnings.unmappedCategories ?? "—"}`);
  }
  console.log("══════════════════════════════════════\n");
}
