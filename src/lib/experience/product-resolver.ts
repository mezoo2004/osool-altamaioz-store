import type { Product, ProductDetail, ProductVariant } from "@/lib/catalog/types";
import type { CctChoice } from "@/lib/experience/types";
import { getProductRepository } from "@/lib/data";
import { resolveVariantPriceState } from "@/lib/commerce/pricing";
import { variantIssueCodes } from "@/lib/experience/client-utils";

export { variantIssueCodes };

export async function resolveProductBySlug(slug: string): Promise<ProductDetail | null> {
  return getProductRepository().getBySlug(slug);
}

export async function resolveProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const repo = getProductRepository();
  const unique = [...new Set(slugs)];
  const products = await Promise.all(unique.map((s) => repo.getBySlug(s)));
  return products.filter((p): p is ProductDetail => Boolean(p));
}

export function pickVariant(
  product: Product,
  options?: { variantId?: string; cct?: CctChoice | string | null },
): ProductVariant | null {
  if (!product.variants.length) return null;

  if (options?.variantId) {
    const byId = product.variants.find((v) => v.id === options.variantId);
    if (byId) return byId;
  }

  if (options?.cct) {
    const cctNorm = options.cct.toUpperCase();
    const exact = product.variants.find((v) => v.cct?.toUpperCase() === cctNorm);
    if (exact) return exact;

    const prefs: Record<string, string[]> = {
      "3000K": ["3000", "WW", "WARM"],
      "4000K": ["4000", "NW", "NEUTRAL"],
      "6500K": ["6500", "WH", "COOL", "WHITE"],
    };
    const tokens = prefs[cctNorm] ?? [];
    const fuzzy = product.variants.find((v) => {
      const hay = [v.cct, v.sku, v.nameEn, v.nameAr].filter(Boolean).join(" ").toUpperCase();
      return tokens.some((t) => hay.includes(t));
    });
    if (fuzzy) return fuzzy;
  }

  const inStock = product.variants.find((v) => v.stockStatus !== "OUT_OF_STOCK");
  return inStock ?? product.variants[0];
}

export function isVariantPurchasable(product: Product, variant: ProductVariant): boolean {
  if (variant.stockStatus === "OUT_OF_STOCK") return false;
  const price = resolveVariantPriceState(variant);
  return price.isPurchasable;
}

export async function resolveProductsForCategory(
  categorySlug: string,
  limit = 4,
): Promise<Product[]> {
  const result = await getProductRepository().list({
    category: categorySlug,
    sort: "featured",
    page: 1,
    pageSize: limit,
  });
  return result.items.filter((p) => p.stockStatus !== "OUT_OF_STOCK").slice(0, limit);
}
