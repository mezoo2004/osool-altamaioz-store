/**
 * Homepage development imagery — replace paths with official photography in
 * public/images/home/ when assets are ready.
 */
export const homeImages = {
  hero: {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85",
    local: "/images/home/hero/hero-main.webp",
  },
  scene: {
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=85",
    local: "/images/home/scene/majlis-scene.webp",
  },
  spaces: {
    majlis: {
      src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/majlis.webp",
    },
    living: {
      src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/living-room.webp",
    },
    bedroom: {
      src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/bedroom.webp",
    },
    kitchen: {
      src: "https://images.unsplash.com/photo-1600489000022-c947f6287008?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/kitchen.webp",
    },
    office: {
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/office.webp",
    },
    restaurant: {
      src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/restaurant.webp",
    },
    retail: {
      src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/retail.webp",
    },
    facade: {
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/facade.webp",
    },
    garden: {
      src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
      local: "/images/home/spaces/garden.webp",
    },
  },
} as const;

export type HomeSpaceKey = keyof typeof homeImages.spaces;

export function getHomeImageSrc(entry: { src: string; local: string }, preferLocal = false): string {
  if (preferLocal && entry.local) return entry.local;
  return entry.src;
}
