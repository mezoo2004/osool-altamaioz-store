import { getProductRepository } from "@/lib/data";
import type { CartLine, CartLineInput, ValidatedCart } from "@/lib/commerce/types";
import { calculateTotals, resolveVariantPriceState } from "@/lib/commerce/pricing";

export async function validateCart(lines: CartLineInput[]): Promise<ValidatedCart> {
  const repo = getProductRepository();
  const isDevelopmentMode = process.env.DEVELOPMENT_CHECKOUT_MODE === "true";
  const validatedLines: CartLine[] = [];
  let hasPriceUnavailable = false;
  let hasStockIssues = false;

  for (const input of lines) {
    const product = await repo.getBySlug(input.productSlug);
    const issues: string[] = [];

    if (!product || product.id !== input.productId) {
      issues.push("product_not_found");
      validatedLines.push(buildInvalidLine(input, "—", "—", issues));
      hasStockIssues = true;
      continue;
    }

    const variant = product.variants.find(
      (v) => v.id === input.variantId || v.sku === input.variantSku,
    );

    if (!variant) {
      issues.push("variant_not_found");
      validatedLines.push(buildInvalidLine(input, product.nameAr, product.nameEn, issues));
      hasStockIssues = true;
      continue;
    }

    const price = resolveVariantPriceState(variant);
    if (price.priceState === "PRICE_UNAVAILABLE") {
      hasPriceUnavailable = true;
      if (!isDevelopmentMode) issues.push("price_unavailable");
    }

    if (variant.stockStatus === "OUT_OF_STOCK") {
      hasStockIssues = true;
      issues.push("out_of_stock");
    }

    if (input.quantity > variant.stockQty && variant.stockStatus !== "OUT_OF_STOCK") {
      hasStockIssues = true;
      issues.push("insufficient_stock");
    }

    const unitPrice = price.unitPrice ?? 0;
    const lineTotal =
      price.isPurchasable && price.unitPrice != null
        ? Math.round(unitPrice * input.quantity * 100) / 100
        : 0;

    validatedLines.push({
      ...input,
      nameAr: variant.nameAr,
      nameEn: variant.nameEn,
      cct: variant.cct,
      wattage: variant.wattage,
      finish: variant.finish,
      size: variant.size ?? null,
      imageUrl: variant.imageUrl,
      series: product.series,
      modelNumber: variant.modelNumber,
      priceState: price.priceState,
      unitPrice: price.unitPrice,
      lineTotal: price.isPurchasable ? lineTotal : null,
      stockStatus: variant.stockStatus,
      stockQty: variant.stockQty,
      isPurchasable: price.isPurchasable && variant.stockStatus !== "OUT_OF_STOCK",
      issues,
    });
  }

  const purchasableLines = validatedLines.filter(
    (l) => l.isPurchasable && l.lineTotal != null && l.issues.length === 0,
  );

  const totals = calculateTotals({
    lines: purchasableLines.map((l) => ({ lineTotal: l.lineTotal ?? 0 })),
  });

  const canCheckout =
    purchasableLines.length > 0 &&
    purchasableLines.length === validatedLines.length &&
    !hasStockIssues &&
    (!hasPriceUnavailable || isDevelopmentMode);

  return {
    lines: validatedLines,
    ...totals,
    currency: "SAR",
    hasPriceUnavailable,
    hasStockIssues,
    canCheckout,
    isDevelopmentMode,
  };
}

function buildInvalidLine(
  input: CartLineInput,
  nameAr = "—",
  nameEn = "—",
  issues: string[] = ["invalid"],
): CartLine {
  return {
    ...input,
    nameAr,
    nameEn,
    cct: null,
    wattage: null,
    finish: null,
    size: null,
    imageUrl: null,
    series: null,
    modelNumber: null,
    priceState: "PRICE_UNAVAILABLE",
    unitPrice: null,
    lineTotal: null,
    stockStatus: "OUT_OF_STOCK",
    stockQty: 0,
    isPurchasable: false,
    issues,
  };
}
