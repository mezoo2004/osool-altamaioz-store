/** Deterministic marketing compare-at from confirmed selling price (8–15% uplift). */

const MULTIPLIERS = [1.08, 1.1, 1.12, 1.15];

function hashSku(sku) {
  let h = 0;
  const s = String(sku ?? "");
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function roundCompareAtSar(value) {
  if (value < 50) return Math.round(value * 4) / 4;
  if (value < 200) return Math.round(value * 2) / 2;
  return Math.round(value);
}

export function computeCompareAtPrice(sellingPrice, sku) {
  if (sellingPrice == null || !Number.isFinite(sellingPrice) || sellingPrice <= 0) return null;
  const idx = hashSku(sku) % MULTIPLIERS.length;
  const raw = sellingPrice * MULTIPLIERS[idx];
  const rounded = roundCompareAtSar(raw);
  if (rounded <= sellingPrice) return roundCompareAtSar(sellingPrice * 1.08);
  return rounded;
}
