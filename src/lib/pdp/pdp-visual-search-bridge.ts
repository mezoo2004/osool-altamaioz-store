import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import { buildVisualAttributesFromProduct } from "@/lib/pdp/pdp-presenters";

export type PdpSimilarSearchDetail = {
  slug: string;
  nameAr: string;
  nameEn: string;
  locale: "ar" | "en";
  attributes: ReturnType<typeof buildVisualAttributesFromProduct>;
  query: string;
};

export const PDP_SIMILAR_SEARCH_EVENT = "osool:pdp-similar-search";

export function openSimilarProductsSearch(
  product: ProductDetail,
  variant: ProductVariant | undefined,
  locale: "ar" | "en",
) {
  if (typeof window === "undefined") return;
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const detail: PdpSimilarSearchDetail = {
    slug: product.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    locale,
    attributes: buildVisualAttributesFromProduct(product, variant),
    query: name,
  };
  window.dispatchEvent(new CustomEvent(PDP_SIMILAR_SEARCH_EVENT, { detail }));
}
