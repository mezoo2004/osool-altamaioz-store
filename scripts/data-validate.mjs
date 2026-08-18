#!/usr/bin/env node
/**
 * Validates current sample catalog + experience references.
 * Missing prices/images are warnings — not fatal during this phase.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSku } from "./lib/catalog-import.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const errors = [];
const warnings = [];
const info = [];

function readJson(rel, fallback = null) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    errors.push({ code: "invalid_json", file: rel, message: String(e) });
    return fallback;
  }
}

function validateCatalog(products) {
  if (!Array.isArray(products)) {
    errors.push({ code: "catalog_missing", message: "products.json not found or invalid" });
    return;
  }

  info.push(`Sample catalog: ${products.length} grouped products`);

  const slugSet = new Set();
  const skuSet = new Set();

  for (const p of products) {
    if (!p.nameAr) errors.push({ code: "missing_name_ar", slug: p.slug });
    if (!p.nameEn) warnings.push({ code: "missing_name_en", slug: p.slug });

    if (slugSet.has(p.slug)) errors.push({ code: "duplicate_slug", slug: p.slug });
    slugSet.add(p.slug);

    if (!p.variants?.length) errors.push({ code: "product_without_variants", slug: p.slug });

    for (const v of p.variants ?? []) {
      const sku = normalizeSku(v.sku);
      if (!sku) errors.push({ code: "missing_sku", product: p.slug });
      else if (skuSet.has(sku)) errors.push({ code: "duplicate_sku", sku, product: p.slug });
      else skuSet.add(sku);

      if (!v.priceConfirmed) warnings.push({ code: "price_unavailable", sku: v.sku, level: "info" });
      if (!v.imageUrl) warnings.push({ code: "missing_image", sku: v.sku, level: "info" });

      if (p.categorySlugs?.includes("UNMAPPED_CATEGORY")) {
        warnings.push({ code: "unmapped_category", slug: p.slug });
      }
    }
  }
}

function validateExperienceRefs(products) {
  const slugs = new Set(products.map((p) => p.slug));
  const spaces = readJson("data/experiences/spaces.json", []);
  const scenes = readJson("data/experiences/scenes.json", []);

  for (const space of spaces) {
    for (const slug of space.recommendedProductSlugs ?? []) {
      if (!slugs.has(slug)) {
        warnings.push({ code: "broken_space_product_ref", space: space.slug, productSlug: slug });
      }
    }
  }

  for (const scene of scenes) {
    for (const item of scene.items ?? []) {
      if (!slugs.has(item.productSlug)) {
        warnings.push({ code: "broken_scene_product_ref", scene: scene.slug, productSlug: item.productSlug });
      }
    }
  }
}

const products = readJson("data/catalog/products.json", []);
validateCatalog(products);
if (products.length) validateExperienceRefs(products);

const priceWarnings = warnings.filter((w) => w.code === "price_unavailable").length;
const imageWarnings = warnings.filter((w) => w.code === "missing_image").length;

const report = {
  validatedAt: new Date().toISOString(),
  catalogScope: "initial-imported-sample",
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    informational: {
      priceUnavailable: priceWarnings,
      missingImages: imageWarnings,
    },
  },
  errors,
  warnings: warnings.filter((w) => w.level !== "info"),
  info,
};

const reportsDir = path.join(root, "data", "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, "validation-report.json"), JSON.stringify(report, null, 2));

console.log(JSON.stringify(report.summary, null, 2));
console.log(`Full report: data/reports/validation-report.json`);

if (errors.length > 0) {
  console.error(`\n❌ Validation failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log(`\n✅ Validation passed (${warnings.length} warnings — prices/images expected deferred)`);
