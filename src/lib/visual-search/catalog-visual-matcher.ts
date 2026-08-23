import type { Product } from "@/lib/catalog/types";
import { getProductRepository } from "@/lib/data";
import type { VisualAttributes, VisualMatchProduct, VisualProductType } from "./types";

const TYPE_TO_CATEGORIES: Record<VisualProductType, string[]> = {
  chandelier: ["chandeliers", "decorative"],
  pendant: ["pendants", "decorative", "chandeliers"],
  spotlight: ["cob-spotlights", "indoor"],
  track: ["track", "indoor"],
  panel: ["panel-lights", "cob-spotlights"],
  strip: ["led-strips", "profiles"],
  profile: ["profiles", "led-strips"],
  floodlight: ["floodlights", "outdoor"],
  switch: ["switches-sockets"],
  unknown: ["indoor", "decorative", "cob-spotlights"],
};

const COLOR_TERMS: Record<string, string[]> = {
  black: ["black", "أسود", "اسود", "black-"],
  white: ["white", "أبيض", "ابيض", "w-", "-w-"],
  gold: ["gold", "ذهب", "ذهبي", "brass"],
  silver: ["silver", "فض", "chrome", "كروم"],
  bronze: ["bronze", "برون"],
};

export function mergeAttributesFromQuery(
  attributes: VisualAttributes,
  query?: string,
): VisualAttributes {
  if (!query?.trim()) return attributes;
  const n = query.toLowerCase();
  const merged = { ...attributes, keywords: [...(attributes.keywords ?? [])] };

  for (const [color, terms] of Object.entries(COLOR_TERMS)) {
    if (terms.some((t) => n.includes(t))) merged.color = color;
  }

  if (/نجف|chandelier/.test(n)) merged.productType = "chandelier";
  if (/سبوت|spot|downlight|cob/.test(n)) merged.productType = "spotlight";
  if (/معلق|pendant/.test(n)) merged.productType = "pendant";
  if (/تراك|track/.test(n)) merged.productType = "track";
  if (/أسود|اسود|black/.test(n)) merged.color = "black";
  if (/ذهب|gold/.test(n)) merged.color = "gold";
  if (/أصغر|اصغر|smaller|compact|small/.test(n)) merged.style = "compact";

  merged.keywords!.push(...query.split(/\s+/).filter(Boolean).slice(0, 6));
  return merged;
}

export async function matchCatalogProducts(options: {
  attributes: VisualAttributes;
  locale: "ar" | "en";
  limit?: number;
}): Promise<VisualMatchProduct[]> {
  const { attributes, locale, limit = 6 } = options;
  const repo = getProductRepository();
  const categories = TYPE_TO_CATEGORIES[attributes.productType ?? "unknown"];
  const candidates = new Map<string, Product>();

  for (const cat of categories) {
    const result = await repo.list({ category: cat, sort: "featured", page: 1, pageSize: 24 });
    for (const p of result.items) {
      if (p.stockStatus !== "OUT_OF_STOCK") candidates.set(p.slug, p);
    }
  }

  if (candidates.size < limit) {
    const fallback = await repo.list({ sort: "featured", page: 1, pageSize: 30 });
    for (const p of fallback.items) {
      if (p.stockStatus !== "OUT_OF_STOCK") candidates.set(p.slug, p);
    }
  }

  const scored = [...candidates.values()]
    .map((p) => scoreProduct(p, attributes, locale))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

function scoreProduct(
  product: Product,
  attributes: VisualAttributes,
  _locale: "ar" | "en",
): VisualMatchProduct {
  let score = 10;
  const hay = [
    product.nameAr,
    product.nameEn,
    product.primaryCategory,
    ...product.categorySlugs,
    product.productType,
    product.series ?? "",
    ...product.variants.map((v) => [v.sku, v.finish, v.nameAr, v.nameEn, v.cct].filter(Boolean).join(" ")),
  ]
    .join(" ")
    .toLowerCase();

  const type = attributes.productType ?? "unknown";
  const typeCats = TYPE_TO_CATEGORIES[type];
  if (typeCats.some((c) => product.categorySlugs.includes(c) || product.primaryCategory === c)) {
    score += 40;
  }

  if (attributes.color) {
    const terms = COLOR_TERMS[attributes.color] ?? [attributes.color];
    if (terms.some((t) => hay.includes(t.toLowerCase()))) score += 25;
  }

  for (const kw of attributes.keywords ?? []) {
    if (hay.includes(kw.toLowerCase())) score += 8;
  }

  if (attributes.style === "compact" && /mini|small|7w|5w|صغ/i.test(hay)) score += 15;

  const variant = product.variants.find((v) => v.stockStatus !== "OUT_OF_STOCK") ?? product.variants[0];
  const reasonAr = buildReason(product, attributes, "ar");
  const reasonEn = buildReason(product, attributes, "en");

  return {
    slug: product.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    categorySlug: product.primaryCategory,
    score,
    reasonAr,
    reasonEn,
    imageUrl: variant?.imageUrl ?? null,
    sku: variant?.sku ?? null,
  };
}

function buildReason(product: Product, attributes: VisualAttributes, locale: "ar" | "en"): string {
  if (locale === "ar") {
    if (attributes.productType && attributes.productType !== "unknown") {
      return `تطابق فئوي مع ${product.primaryCategory}`;
    }
    return "منتج مقترح من الكتalog";
  }
  if (attributes.productType && attributes.productType !== "unknown") {
    return `Category match: ${product.primaryCategory}`;
  }
  return "Suggested from catalog";
}

export function refineMatchesByColor(
  products: VisualMatchProduct[],
  color: string,
  _locale: "ar" | "en",
): VisualMatchProduct[] {
  const terms = COLOR_TERMS[color] ?? [color];
  return products
    .map((p) => {
      const hay = `${p.nameAr} ${p.nameEn} ${p.sku ?? ""}`.toLowerCase();
      const hit = terms.some((t) => hay.includes(t.toLowerCase()));
      return { ...p, score: p.score + (hit ? 30 : -5) };
    })
    .sort((a, b) => b.score - a.score);
}

export function getProductByIndex(
  products: VisualMatchProduct[],
  index: number,
): VisualMatchProduct | undefined {
  return products[index];
}
