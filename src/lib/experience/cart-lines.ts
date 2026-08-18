import type { ResolvedSceneItem } from "@/lib/experience/types";

export function toCartLines(items: ResolvedSceneItem[]) {
  return items
    .filter((i) => i.isPurchasable && i.variantId && i.productId)
    .map((i) => ({
      productId: i.productId,
      productSlug: i.productSlug,
      variantId: i.variantId,
      variantSku: i.variantSku,
      quantity: i.quantity,
    }));
}
