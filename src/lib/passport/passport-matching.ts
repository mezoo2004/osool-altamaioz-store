import type { Product, ProductDetail, ProductVariant } from "@/lib/catalog/types";
import { getProductRepository } from "@/lib/data";
import { pickVariant } from "@/lib/experience/product-resolver";
import type { PassportProductCard } from "./types";

function toCard(
  product: Product,
  locale: "ar" | "en",
  variant?: ProductVariant | null,
  excludeSlug?: string,
): PassportProductCard | null {
  if (product.slug === excludeSlug) return null;
  const v = variant ?? pickVariant(product, {});
  if (!v) return null;
  const keyParts = [v.cct, v.wattage, v.finish].filter(Boolean);
  return {
    slug: product.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    imageUrl: v.imageUrl ?? product.variants[0]?.imageUrl ?? null,
    sku: v.sku,
    productUrl: `/products/${product.slug}`,
    keySpec: keyParts.length ? keyParts.join(" · ") : null,
  };
}

function scoreReplacement(
  candidate: Product,
  source: ProductDetail,
  variant: ProductVariant | null,
): number {
  let score = 0;
  if (candidate.primaryCategory === source.primaryCategory) score += 40;
  if (source.series && candidate.series === source.series) score += 25;

  const cv = pickVariant(candidate, {});
  if (!cv || !variant) return score;

  if (variant.cct && cv.cct && variant.cct === cv.cct) score += 20;
  if (variant.wattage && cv.wattage && variant.wattage === cv.wattage) score += 15;
  if (variant.finish && cv.finish && variant.finish === cv.finish) score += 15;
  if (candidate.productType === source.productType) score += 10;

  return score;
}

export async function findPassportReplacements(options: {
  product: ProductDetail;
  variant: ProductVariant | null;
  locale: "ar" | "en";
  limit?: number;
}): Promise<PassportProductCard[]> {
  const { product, variant, locale, limit = 4 } = options;
  const repo = getProductRepository();
  const candidates = new Map<string, Product>();

  const categoryResult = await repo.list({
    category: product.primaryCategory,
    sort: "featured",
    page: 1,
    pageSize: 24,
  });
  for (const p of categoryResult.items) {
    if (p.slug !== product.slug && p.stockStatus !== "OUT_OF_STOCK") {
      candidates.set(p.slug, p);
    }
  }

  if (product.series) {
    const seriesResult = await repo.list({
      series: [product.series],
      sort: "featured",
      page: 1,
      pageSize: 12,
    });
    for (const p of seriesResult.items) {
      if (p.slug !== product.slug && p.stockStatus !== "OUT_OF_STOCK") {
        candidates.set(p.slug, p);
      }
    }
  }

  return [...candidates.values()]
    .map((p) => ({ p, score: scoreReplacement(p, product, variant) }))
    .filter((x) => x.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => toCard(p, locale, null, product.slug))
    .filter((c): c is PassportProductCard => Boolean(c));
}

export async function findPassportComplementary(options: {
  product: ProductDetail;
  variant: ProductVariant | null;
  locale: "ar" | "en";
  limit?: number;
}): Promise<PassportProductCard[]> {
  const { product, variant, locale, limit = 4 } = options;
  const repo = getProductRepository();
  const slugs = [...new Set([...product.completeTheLookSlugs, ...product.relatedSlugs])];
  const cards: PassportProductCard[] = [];

  for (const slug of slugs) {
    if (slug === product.slug) continue;
    const related = await repo.getBySlug(slug);
    if (!related || related.stockStatus === "OUT_OF_STOCK") continue;
    const card = toCard(related, locale, pickVariant(related, { variantId: variant?.id }));
    if (card) cards.push(card);
    if (cards.length >= limit) break;
  }

  if (cards.length < limit && product.series) {
    const seriesResult = await repo.list({
      series: [product.series],
      sort: "featured",
      page: 1,
      pageSize: 8,
    });
    for (const p of seriesResult.items) {
      if (p.slug === product.slug || cards.some((c) => c.slug === p.slug)) continue;
      const card = toCard(p, locale);
      if (card) cards.push(card);
      if (cards.length >= limit) break;
    }
  }

  return cards.slice(0, limit);
}
