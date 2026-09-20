import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import {
  openAssistantWithPassport,
  type PassportAssistantContext,
} from "@/lib/passport/passport-assistant-bridge";

export function openAssistantWithProduct(
  product: ProductDetail,
  variant: ProductVariant | undefined,
  locale: "ar" | "en",
) {
  const ctx: PassportAssistantContext = {
    slug: product.slug,
    variantId: variant?.id ?? null,
    sku: variant?.sku ?? null,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    cct: variant?.cct ?? null,
    wattage: variant?.wattage ?? null,
    finish: variant?.finish ?? null,
    installationType: product.installationType,
  };
  openAssistantWithPassport(ctx);
  void locale;
}
