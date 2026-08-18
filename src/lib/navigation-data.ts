/**
 * Curated storefront navigation — NOT the complete dynamic category taxonomy.
 * Full category tree is database/import-driven and grows with future product batches.
 * See docs/CATALOG_SCALABILITY.md
 */
export type NavSubItem = {
  key: string;
  slug: string;
};

export type NavItem = {
  key: string;
  slug: string;
  href?: string;
  children?: NavSubItem[];
};

export const mainNavigation: NavItem[] = [
  {
    key: "indoor",
    slug: "indoor",
    children: [
      { key: "cob", slug: "cob-spotlights" },
      { key: "panel", slug: "panel-lights" },
      { key: "gu10", slug: "gu10" },
      { key: "antiGlare", slug: "anti-glare" },
      { key: "cylinder", slug: "cylinder" },
      { key: "track", slug: "track" },
      { key: "profiles", slug: "profiles" },
    ],
  },
  {
    key: "outdoor",
    slug: "outdoor",
    children: [
      { key: "flood", slug: "floodlights" },
      { key: "wall", slug: "wall-outdoor" },
      { key: "ground", slug: "ground-lights" },
      { key: "landscape", slug: "landscape" },
    ],
  },
  {
    key: "decorative",
    slug: "decorative",
    children: [
      { key: "chandeliers", slug: "chandeliers" },
      { key: "pendants", slug: "pendants" },
      { key: "strips", slug: "led-strips" },
    ],
  },
  {
    key: "switches",
    slug: "switches-sockets",
    children: [
      { key: "switches", slug: "switches" },
      { key: "sockets", slug: "sockets" },
    ],
  },
  { key: "bulbs", slug: "bulbs" },
  { key: "fans", slug: "fans" },
  { key: "offers", slug: "offers", href: "/offers" },
];

export const featuredSpaces = [
  { key: "majlis", slug: "majlis", image: "/images/spaces/majlis.jpg" },
  { key: "living", slug: "living-room", image: "/images/spaces/living.jpg" },
  { key: "bedroom", slug: "bedroom", image: "/images/spaces/bedroom.jpg" },
  { key: "kitchen", slug: "kitchen", image: "/images/spaces/kitchen.jpg" },
  { key: "office", slug: "office", image: "/images/spaces/office.jpg" },
  { key: "garden", slug: "garden", image: "/images/spaces/garden.jpg" },
] as const;

export const featuredCategories = [
  { key: "cob", slug: "cob-spotlights", icon: "spot" },
  { key: "flood", slug: "floodlights", icon: "flood" },
  { key: "chandeliers", slug: "chandeliers", icon: "chandelier" },
  { key: "strips", slug: "led-strips", icon: "strip" },
  { key: "switches", slug: "switches", icon: "switch" },
  { key: "fans", slug: "fans", icon: "fan" },
] as const;

export const footerLinks = {
  shop: [
    { key: "indoor", href: "/categories/indoor" },
    { key: "outdoor", href: "/categories/outdoor" },
    { key: "offers", href: "/offers" },
    { key: "spaces", href: "/spaces" },
    { key: "scenes", href: "/scenes" },
  ],
  support: [
    { key: "faq", href: "/faq" },
    { key: "shipping", href: "/policies/shipping" },
    { key: "returns", href: "/policies/returns" },
    { key: "warranty", href: "/policies/warranty" },
  ],
  company: [
    { key: "about", href: "/about" },
    { key: "projects", href: "/projects" },
    { key: "contact", href: "/contact" },
    { key: "privacy", href: "/policies/privacy" },
    { key: "terms", href: "/policies/terms" },
  ],
} as const;
