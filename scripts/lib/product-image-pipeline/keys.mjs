import { normalizeSku } from "../catalog-import.mjs";

export function slugToDir(slug) {
  return String(slug)
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildMatchKeys(product, variant) {
  const sku = variant?.sku ?? "";
  const norm = normalizeSku(sku);
  const keys = new Set();
  if (sku) keys.add(sku.toLowerCase());
  if (norm) keys.add(norm.toLowerCase());
  if (variant?.modelNumber) keys.add(String(variant.modelNumber).toLowerCase());
  if (product.slug) keys.add(product.slug.toLowerCase());
  const base = sku.split(/[-/]/)[0];
  if (base && base.length >= 3) keys.add(base.toLowerCase());
  return [...keys];
}

export function scoreFilenameMatch(filename, matchKeys) {
  const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
  const normBase = normalizeSku(base).toLowerCase();
  for (const key of matchKeys) {
    if (!key) continue;
    if (base === key || normBase === key) return { score: 100, reason: "exact_filename" };
    if (base.includes(key) && key.length >= 6) return { score: 85, reason: "partial_filename" };
  }
  return { score: 0, reason: "no_match" };
}
