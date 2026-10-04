import type { Product } from "@/lib/catalog/types";

/** Primary thumbnail for cards, cart, and search. */
export function getProductThumbnailUrl(product: Product): string | null {
  if (product.galleryImages?.[0]) return product.galleryImages[0];
  return product.variants[0]?.imageUrl ?? null;
}

/** PDP / gallery — main catalog image only (no breakdown expansion). */
export function getProductGalleryUrls(product: Product): string[] {
  const base = product.galleryImages?.length
    ? product.galleryImages.filter(Boolean)
    : product.variants.map((v) => v.imageUrl).filter((u): u is string => Boolean(u));
  return [...new Set(base)];
}
