/** Deterministic marketing compare-at from confirmed selling price (8–15% uplift). */

const MULTIPLIERS = [1.08, 1.1, 1.12, 1.15] as const;

function hashSku(sku: string) {
  let h = 0;
  for (let i = 0; i < sku.length; i++) {
    h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function roundCompareAtSar(value: number) {
  if (value < 50) return Math.round(value * 4) / 4;
  if (value < 200) return Math.round(value * 2) / 2;
  return Math.round(value);
}

export function computeCompareAtPrice(sellingPrice: number, sku: string): number {
  const idx = hashSku(sku) % MULTIPLIERS.length;
  const raw = sellingPrice * MULTIPLIERS[idx];
  const rounded = roundCompareAtSar(raw);
  if (rounded <= sellingPrice) return roundCompareAtSar(sellingPrice * 1.08);
  return rounded;
}
