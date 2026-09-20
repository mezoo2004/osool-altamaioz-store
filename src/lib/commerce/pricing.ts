import type { ProductVariant } from "@/lib/catalog/types";
import type { PriceState } from "@/lib/commerce/types";

export function resolveVariantPriceState(variant: ProductVariant): {
  priceState: PriceState;
  unitPrice: number | null;
  isPurchasable: boolean;
} {
  if (variant.priceConfirmed && variant.confirmedPrice != null) {
    return { priceState: "CONFIRMED", unitPrice: variant.confirmedPrice, isPurchasable: true };
  }

  const devCheckout = process.env.DEVELOPMENT_CHECKOUT_MODE === "true";
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_PRICES === "true";

  if (devCheckout && showDemo && variant.demoPrice != null) {
    return { priceState: "DEMO", unitPrice: variant.demoPrice, isPurchasable: true };
  }

  // Controlled development checkout only — production remains blocked without confirmed prices.
  if (devCheckout) {
    return { priceState: "PRICE_UNAVAILABLE", unitPrice: 0, isPurchasable: true };
  }

  return { priceState: "PRICE_UNAVAILABLE", unitPrice: null, isPurchasable: false };
}

export const VAT_RATE = Number(process.env.VAT_RATE ?? "0.15");

export function calculateTotals(input: {
  lines: { lineTotal: number }[];
  discountTotal?: number;
  shippingTotal?: number;
}) {
  const subtotal = input.lines.reduce((s, l) => s + l.lineTotal, 0);
  const discountTotal = input.discountTotal ?? 0;
  const shippingTotal = input.shippingTotal ?? 0;
  const taxable = Math.max(0, subtotal - discountTotal + shippingTotal);
  const vatTotal = Math.round(taxable * VAT_RATE * 100) / 100;
  const grandTotal = Math.round((taxable + vatTotal) * 100) / 100;
  return { subtotal, discountTotal, shippingTotal, vatTotal, grandTotal };
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `OS-${year}-${seq}`;
}

export function generateGuestLookupToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}
