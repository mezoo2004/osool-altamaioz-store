import type { SceneItemRecord, ResolvedSceneItem, SceneBundleValidation } from "@/lib/experience/types";
import {
  isVariantPurchasable,
  pickVariant,
  resolveProductBySlug,
  variantIssueCodes,
} from "@/lib/experience/product-resolver";

export async function validateSceneBundle(
  items: SceneItemRecord[],
): Promise<SceneBundleValidation> {
  const available: ResolvedSceneItem[] = [];
  const unavailable: ResolvedSceneItem[] = [];

  for (const item of items) {
    const product = await resolveProductBySlug(item.productSlug);
    const variant = product ? pickVariant(product, { variantId: item.variantId }) : null;
    const issues = variantIssueCodes(product, variant);
    const purchasable = product && variant ? isVariantPurchasable(product, variant) : false;

    const resolved: ResolvedSceneItem = {
      productSlug: item.productSlug,
      variantId: variant?.id ?? "",
      variantSku: variant?.sku ?? "",
      productId: product?.id ?? "",
      quantity: item.quantity,
      sortOrder: item.sortOrder,
      required: item.required ?? true,
      nameAr: variant?.nameAr ?? product?.nameAr ?? "—",
      nameEn: variant?.nameEn ?? product?.nameEn ?? "—",
      imageUrl: variant?.imageUrl ?? null,
      cct: variant?.cct ?? null,
      wattage: variant?.wattage ?? null,
      stockStatus: variant?.stockStatus ?? "OUT_OF_STOCK",
      isPurchasable: purchasable && issues.length === 0,
      issues,
    };

    if (resolved.isPurchasable) {
      available.push(resolved);
    } else {
      unavailable.push(resolved);
    }
  }

  const requiredUnavailable = unavailable.filter((u) => u.required);
  const allAvailable = requiredUnavailable.length === 0 && unavailable.length === 0;

  return { available, unavailable, allAvailable };
}
