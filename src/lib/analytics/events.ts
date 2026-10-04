export type AnalyticsEventName =
  | "homepage_viewed"
  | "promotion_shown"
  | "promotion_closed"
  | "promotion_cta_clicked"
  | "product_viewed"
  | "search_performed"
  | "add_to_cart"
  | "checkout_started";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

/** Provider-agnostic hook — wire GA4/GTM via NEXT_PUBLIC_* in analytics-scripts. */
export function trackAnalyticsEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const detail = { name, ...payload, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("osool-analytics", { detail }));
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...payload });
}
