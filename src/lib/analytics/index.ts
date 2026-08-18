type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "page_view"
  | "content_page_view"
  | "contact_form_submit"
  | "view_item"
  | "view_item_list"
  | "search"
  | "add_to_cart"
  | "add_to_wishlist"
  | "begin_checkout"
  | "purchase"
  | "shop_by_space_view"
  | "space_select"
  | "shop_scene_view"
  | "scene_hotspot_select"
  | "shop_scene_add_item"
  | "shop_scene_add_bundle"
  | "lighting_experience_start"
  | "lighting_experience_space"
  | "lighting_experience_dimensions"
  | "lighting_experience_mood"
  | "lighting_experience_cct"
  | "lighting_experience_complete"
  | "lighting_experience_add_bundle";

/** Abstraction layer — adapters (GA4/GTM) enabled via env only; dev falls back to console. */
export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const data = { event, ...payload, timestamp: Date.now() };

  if (window.dataLayer) {
    window.dataLayer.push(data);
  }

  if (window.gtag) {
    if (event === "page_view") {
      window.gtag("event", "page_view", {
        page_path: payload.page_path,
        page_title: payload.page_title,
      });
    } else {
      window.gtag("event", event, payload);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, payload);
  }
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ||
      process.env.NEXT_PUBLIC_GTM_ID?.trim(),
  );
}
