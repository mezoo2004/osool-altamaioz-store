import { getPriceDisplay } from "@/lib/catalog/display";
import { resolveProductBySlug } from "@/lib/experience/product-resolver";
import { extractLumensFromSpecs } from "@/lib/experience/lighting-product-matcher";
import type { LightingRecommendationResult } from "@/lib/experience/types";
import type { AssistantLocale, AssistantProductCard } from "./assistant-types";

function keySpecFromProduct(
  product: Awaited<ReturnType<typeof resolveProductBySlug>>,
  locale: AssistantLocale,
): string | null {
  if (!product) return null;
  const variant = product.variants[0];
  const parts: string[] = [];
  if (variant?.cct) parts.push(variant.cct);
  if (variant?.wattage) parts.push(variant.wattage);
  const lumens = extractLumensFromSpecs(product);
  if (lumens) parts.push(`~${lumens} lm`);
  if (parts.length === 0) {
    return locale === "ar" ? "راجع صفحة المنتج للمواصفات" : "See product page for specs";
  }
  return parts.join(" · ");
}

export async function buildProductCardsFromResult(
  result: LightingRecommendationResult,
  locale: AssistantLocale,
  sceneUrl?: string,
): Promise<AssistantProductCard[]> {
  const cards: AssistantProductCard[] = [];

  for (const item of result.items.slice(0, 4)) {
    const product = await resolveProductBySlug(item.productSlug);
    if (!product) continue;

    const variant =
      product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
    const price = getPriceDisplay(product, variant, locale);
    const priceAvailable = price.isConfirmed || price.isDemo;

    cards.push({
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      imageUrl: variant?.imageUrl ?? product.variants[0]?.imageUrl ?? null,
      sku: variant?.sku ?? null,
      keySpec: keySpecFromProduct(product, locale),
      layer: item.layer,
      quantity: item.quantity,
      confidence: item.confidence,
      productUrl: `/products/${product.slug}`,
      sceneUrl,
      priceText: priceAvailable ? price.text : null,
      priceAvailable,
    });
  }

  return cards;
}

export async function buildProductCardsFromSlugs(
  slugs: string[],
  locale: AssistantLocale,
): Promise<AssistantProductCard[]> {
  const cards: AssistantProductCard[] = [];
  for (const slug of slugs.slice(0, 3)) {
    const product = await resolveProductBySlug(slug);
    if (!product) continue;
    const variant = product.variants[0];
    const price = getPriceDisplay(product, variant, locale);
    cards.push({
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      imageUrl: variant?.imageUrl ?? null,
      sku: variant?.sku ?? null,
      keySpec: keySpecFromProduct(product, locale),
      productUrl: `/products/${product.slug}`,
      priceText: price.isConfirmed || price.isDemo ? price.text : null,
      priceAvailable: price.isConfirmed || price.isDemo,
    });
  }
  return cards;
}
