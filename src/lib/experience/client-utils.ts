import type { Product, ProductVariant } from "@/lib/catalog/types";
import { resolveVariantPriceState } from "@/lib/commerce/pricing";

export function variantIssueCodes(
  product: Product | null,
  variant: ProductVariant | null,
): string[] {
  const issues: string[] = [];
  if (!product) {
    issues.push("product_not_found");
    return issues;
  }
  if (!variant) {
    issues.push("variant_not_found");
    return issues;
  }
  const price = resolveVariantPriceState(variant);
  if (price.priceState === "PRICE_UNAVAILABLE") issues.push("price_unavailable");
  if (variant.stockStatus === "OUT_OF_STOCK") issues.push("out_of_stock");
  return issues;
}
