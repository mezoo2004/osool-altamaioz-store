/** Homepage-only navigation — maps to existing storefront routes. */
export const homeMainNav = [
  { key: "home", href: "/" },
  { key: "indoor", href: "/categories/indoor" },
  { key: "outdoor", href: "/categories/outdoor" },
  { key: "smart", href: "/categories/switches-sockets" },
  { key: "brands", href: "/about" },
  { key: "spaces", href: "/spaces" },
  { key: "offers", href: "/offers" },
  { key: "consult", href: "/lighting-experience" },
  { key: "projects", href: "/projects" },
  { key: "experience", href: "/lighting-experience" },
] as const;

export const homePrimaryCategories = [
  { key: "indoor", href: "/categories/indoor", icon: "indoor" as const, accent: true },
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
  { key: "majlis", slug: "majlis", imageKey: "majlis" as const },
  { key: "living", slug: "living-room", imageKey: "living" as const },
  { key: "bedroom", slug: "bedroom", imageKey: "bedroom" as const },
  { key: "kitchen", slug: "kitchen", imageKey: "kitchen" as const },
  { key: "office", slug: "office", imageKey: "office" as const },
  { key: "restaurant", slug: "restaurant", imageKey: "restaurant" as const },
  { key: "retail", slug: "retail-store", imageKey: "retail" as const },
  { key: "facade", slug: "facade", imageKey: "facade" as const },
  { key: "garden", slug: "garden", imageKey: "garden" as const },
] as const;
