import type { Product, ProductVariant } from "@/lib/catalog/types";

export function getProductName(product: Product, locale: string) {
  return locale === "ar" ? product.nameAr : product.nameEn;
}

export function getVariantName(variant: ProductVariant, locale: string) {
  return locale === "ar" ? variant.nameAr : variant.nameEn;
}

export function getPriceDisplay(
  product: Product,
  variant: ProductVariant | undefined,
  locale: string,
): { text: string; isConfirmed: boolean; isDemo: boolean; hasSale: boolean } {
  const v = variant ?? product.variants[0];
  if (!v) {
    return {
      text: locale === "ar" ? "السعر غير متاح" : "Price unavailable",
      isConfirmed: false,
      isDemo: false,
      hasSale: false,
    };
  }

  if (v.priceConfirmed && v.confirmedPrice != null) {
    const amount = v.salePrice ?? v.confirmedPrice;
    return {
      text: formatAmount(amount, locale),
      isConfirmed: true,
      isDemo: false,
      hasSale: v.salePrice != null && v.salePrice < v.confirmedPrice,
    };
  }

  if (process.env.NEXT_PUBLIC_SHOW_DEMO_PRICES === "true" && v.demoPrice != null) {
    return {
      text: formatAmount(v.demoPrice, locale),
      isConfirmed: false,
      isDemo: true,
      hasSale: false,
    };
  }

  if (product.demoPriceFrom != null && product.variantCount > 1) {
    return {
      text:
        locale === "ar"
          ? `من — (${product.variantCount} خيارات)`
          : `From — (${product.variantCount} options)`,
      isConfirmed: false,
      isDemo: false,
      hasSale: false,
    };
  }

  return {
    text: locale === "ar" ? "السعر غير متاح" : "Price unavailable",
    isConfirmed: false,
    isDemo: false,
    hasSale: false,
  };
}

function formatAmount(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function highlightMatch(text: string, query: string) {
  if (!query.trim()) return [{ text, match: false }];
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return [{ text, match: false }];
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text);
}

export function findVariantBySelections(
  product: Product,
  selections: { cct?: string | null; wattage?: string | null; finish?: string | null },
): ProductVariant | null {
  return (
    product.variants.find((v) => {
      if (selections.cct && v.cct?.toLowerCase() !== selections.cct.toLowerCase()) return false;
      if (selections.wattage && v.wattage?.toLowerCase() !== selections.wattage.toLowerCase())
        return false;
      if (selections.finish) {
        const vf = (v.finish ?? "default").toLowerCase();
        if (vf !== selections.finish.toLowerCase()) return false;
      }
      return true;
    }) ?? null
  );
}

export function getAvailableOptions(product: Product) {
  const cct = [...new Set(product.variants.map((v) => v.cct).filter(Boolean))] as string[];
  const wattage = [...new Set(product.variants.map((v) => v.wattage).filter(Boolean))] as string[];
  const finish = [
    ...new Set(product.variants.map((v) => (v.finish ?? "default").toLowerCase())),
  ];
  return { cct, wattage, finish };
}

export function isCombinationAvailable(
  product: Product,
  selections: { cct?: string | null; wattage?: string | null; finish?: string | null },
) {
  return Boolean(findVariantBySelections(product, selections));
}
