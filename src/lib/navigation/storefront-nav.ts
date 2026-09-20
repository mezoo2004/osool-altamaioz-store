/** Manager-approved primary storefront navigation (Phase 1). */
export const storefrontMainNav = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "spaces", href: "/spaces" },
  { key: "offers", href: "/offers" },
  { key: "scenes", href: "/scenes" },
  { key: "about", href: "/about" },
  { key: "faq", href: "/faq" },
] as const;

export type StorefrontNavKey = (typeof storefrontMainNav)[number]["key"];
