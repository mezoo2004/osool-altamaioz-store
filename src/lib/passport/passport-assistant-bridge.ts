import type { PassportData } from "@/lib/passport/types";

export type PassportAssistantContext = {
  slug: string;
  variantId: string | null;
  sku: string | null;
  nameAr: string;
  nameEn: string;
  cct: string | null;
  wattage: string | null;
  finish: string | null;
  installationType: string | null;
  orderNumber?: string;
};

export const PASSPORT_ASSISTANT_EVENT = "osool:assistant-open";

export function buildAssistantContextFromPassport(data: PassportData): PassportAssistantContext {
  return {
    slug: data.slug,
    variantId: data.variantId,
    sku: data.sku,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    cct: data.variant?.cct ?? null,
    wattage: data.variant?.wattage ?? null,
    finish: data.variant?.finish ?? null,
    installationType: data.installationType,
    orderNumber: data.purchase?.orderNumber,
  };
}

export function openAssistantWithPassport(context: PassportAssistantContext) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PASSPORT_ASSISTANT_EVENT, {
      detail: { passportContext: context },
    }),
  );
}
