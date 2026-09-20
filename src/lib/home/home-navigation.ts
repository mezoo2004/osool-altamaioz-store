/** Homepage navigation — aligned with manager storefront nav (Phase 1). */
export { storefrontMainNav as homeMainNav } from "@/lib/navigation/storefront-nav";

export const homePrimaryCategories = [
  { key: "products", href: "/products", icon: "indoor" as const, accent: true },
  { key: "outdoor", href: "/categories/outdoor", icon: "outdoor" as const },
  { key: "decorative", href: "/categories/decorative", icon: "decorative" as const },
  { key: "offers", href: "/offers", icon: "offers" as const, accent: true, highlight: true },
] as const;

export const homeSecondaryCategories = [
  { key: "cob", slug: "cob-spotlights", icon: "spot" as const, accent: true },
  { key: "profiles", slug: "profiles", icon: "profile" as const },
  { key: "smart", slug: "switches-sockets", icon: "smart" as const, accent: true },
  { key: "strips", slug: "led-strips", icon: "strip" as const },
  { key: "switches", slug: "switches", icon: "switch" as const, accent: true },
  { key: "fans", slug: "fans", icon: "fan" as const },
] as const;

export const homepageSpaces = [
  { key: "majlis", slug: "majlis", imageKey: "majlis" as const, gridClass: "home-space-majlis" },
  { key: "living", slug: "living-room", imageKey: "living" as const, gridClass: "home-space-living" },
  { key: "bedroom", slug: "bedroom", imageKey: "bedroom" as const, gridClass: "home-space-bedroom" },
  { key: "kitchen", slug: "kitchen", imageKey: "kitchen" as const, gridClass: "home-space-kitchen" },
  { key: "office", slug: "office", imageKey: "office" as const, gridClass: "home-space-office" },
  { key: "restaurant", slug: "restaurant", imageKey: "restaurant" as const, gridClass: "home-space-restaurant" },
  { key: "retail", slug: "retail-store", imageKey: "retail" as const, gridClass: "home-space-retail" },
  { key: "facade", slug: "facade", imageKey: "facade" as const, gridClass: "home-space-facade" },
  { key: "garden", slug: "garden", imageKey: "garden" as const, gridClass: "home-space-garden" },
] as const;
