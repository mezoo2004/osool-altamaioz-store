import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  categories: "catalog-categories",
  products: "catalog-products",
  product: (slug: string) => `product-${slug}`,
  promotions: "store-promotions",
  offers: "catalog-offers",
} as const;

export function revalidateCatalogProduct(slug: string) {
  revalidateTag(CACHE_TAGS.products);
  revalidateTag(CACHE_TAGS.product(slug));
  revalidateTag(CACHE_TAGS.offers);
  revalidatePath("/ar/products");
  revalidatePath("/en/products");
  revalidatePath(`/ar/products/${slug}`);
  revalidatePath(`/en/products/${slug}`);
  revalidatePath("/ar/offers");
  revalidatePath("/en/offers");
}

export function revalidateCategories() {
  revalidateTag(CACHE_TAGS.categories);
  revalidatePath("/ar/products");
  revalidatePath("/en/products");
}

export function revalidatePromotions() {
  revalidateTag(CACHE_TAGS.promotions);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath("/ar/offers");
  revalidatePath("/en/offers");
}
