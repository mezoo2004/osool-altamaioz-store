/**
 * Shared catalog import utilities — SKU identity, stable IDs, merge helpers.
 * Used by build-catalog.mjs and future Prisma upsert importers.
 */

export function normalizeSku(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\\/g, "/");
}

export function stableVariantId(sku) {
  const norm = normalizeSku(sku);
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function stableProductId(groupKey) {
  return String(groupKey)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Builds a registry map: normalizedSku -> { productId, productSlug, variantId, groupKey }
 */
export function buildSkuRegistry(products) {
  const registry = new Map();
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const key = normalizeSku(variant.sku);
      if (!key) continue;
      registry.set(key, {
        productId: product.id,
        productSlug: product.slug,
        variantId: variant.id,
        groupKey: product.groupKey ?? null,
        productNameAr: product.nameAr,
      });
    }
  }
  return registry;
}

/**
 * Merge incoming variant into existing product by SKU (idempotent update).
 * Returns { action: 'created' | 'updated' | 'unchanged' }
 */
export function upsertVariantInProduct(product, incomingVariant, importMeta) {
  const norm = normalizeSku(incomingVariant.sku);
  const idx = product.variants.findIndex((v) => normalizeSku(v.sku) === norm);
  const payload = {
    ...incomingVariant,
    id: stableVariantId(incomingVariant.sku),
    importMeta,
  };

  if (idx >= 0) {
    const prev = product.variants[idx];
    const changed = JSON.stringify({ ...prev, importMeta: undefined }) !== JSON.stringify({ ...payload, importMeta: undefined });
    product.variants[idx] = { ...prev, ...payload };
    return changed ? "updated" : "unchanged";
  }

  product.variants.push(payload);
  return "created";
}

/**
 * Conflict when SKU already assigned to a different product in this import run.
 */
export function detectSkuConflict(registry, sku, productId) {
  const norm = normalizeSku(sku);
  const existing = registry.get(norm);
  if (!existing) return null;
  if (existing.productId === productId) return null;

  return {
    type: "sku_product_mismatch",
    sku: norm,
    existing: {
      productId: existing.productId,
      productSlug: existing.productSlug,
      groupKey: existing.groupKey,
      productNameAr: existing.productNameAr,
    },
    incoming: {
      productId,
    },
  };
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function uniqueSlug(base, used) {
  let slug = slugify(base);
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i++;
  const finalSlug = `${slug}-${i}`;
  used.add(finalSlug);
  return finalSlug;
}
