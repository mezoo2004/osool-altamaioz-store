import type { Order } from "@/lib/commerce/types";
import { getSiteOrigin } from "@/lib/auth/oauth-config";

export function buildOrderTrackingUrl(order: Order, locale: "ar" | "en"): string {
  const origin = getSiteOrigin();
  const email = encodeURIComponent(order.customerSnapshot?.email ?? order.guestEmail ?? "");
  const params = new URLSearchParams({ order: order.orderNumber, email });
  if (order.guestLookupToken) params.set("token", order.guestLookupToken);
  return `${origin}/${locale}/track-order?${params.toString()}`;
}

export function buildOrderInvoiceUrl(order: Order, locale: "ar" | "en"): string {
  const origin = getSiteOrigin();
  const email = encodeURIComponent(order.customerSnapshot?.email ?? order.guestEmail ?? "");
  const params = new URLSearchParams({ email });
  if (order.guestLookupToken) params.set("token", order.guestLookupToken);
  return `${origin}/${locale}/orders/${encodeURIComponent(order.orderNumber)}/invoice?${params.toString()}`;
}
