/**
 * Homepage development imagery — premium architectural / Gulf interior style.
 * All remote URLs verified (HTTP 200). Each entry includes a fallback.
 */
const UNSPLASH = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=88`;

export const HOME_IMAGE_FALLBACK = UNSPLASH("1618221195710-dd6b41faaea6");

export type HomeImageEntry = {
  src: string;
  fallback: string;
  local: string;
  objectPosition?: string;
};

function entry(id: string, local: string, objectPosition = "center center", fallbackId?: string): HomeImageEntry {
  return {
    src: UNSPLASH(id),
    fallback: UNSPLASH(fallbackId ?? "1618221195710-dd6b41faaea6"),
    local,
    objectPosition,
  };
}

export const homeImages = {
  hero: {
    src: UNSPLASH("1618221195710-dd6b41faaea6", 2400),
    fallback: UNSPLASH("1600210492486-724fe5c67fb0", 2400),
    local: "/images/home/hero/hero-poster.webp",
    objectPosition: "center 42%",
  },
  scene: {
    src: UNSPLASH("1600210492486-724fe5c67fb0", 2400),
    fallback: UNSPLASH("1618221195710-dd6b41faaea6", 2400),
    local: "/images/home/scene/majlis-scene.webp",
    objectPosition: "center 38%",
  },
  spaces: {
    majlis: entry("1600210492486-724fe5c67fb0", "/images/home/spaces/majlis.webp", "center 42%"),
    living: entry("1618221195710-dd6b41faaea6", "/images/home/spaces/living-room.webp", "center 45%"),
    bedroom: entry("1615529328331-f8917597711f", "/images/home/spaces/bedroom.webp", "center 55%"),
    kitchen: entry("1556912173-46c336c7fd55", "/images/home/spaces/kitchen.webp", "center 40%"),
    office: entry("1497366216548-37526070297c", "/images/home/spaces/office.webp", "center 35%", "1497215842964-222b430dc094"),
    restaurant: entry("1517248135467-4c7edcad34c4", "/images/home/spaces/restaurant.webp", "center 48%"),
    retail: entry("1616486338812-3dadae4b4ace", "/images/home/spaces/retail.webp", "center 50%"),
    facade: entry("1545324418-cc1a3fa10c00", "/images/home/spaces/facade.webp", "center 60%", "1486406146926-c627a92ad1ab"),
    garden: entry("1600585154526-990dced4db0d", "/images/home/spaces/garden.webp", "center 65%", "1600047509807-ba8f99d2cdde"),
  },
} as const;

export type HomeSpaceKey = keyof typeof homeImages.spaces;

export function getHomeImageSrc(entry: HomeImageEntry, preferLocal = false): string {
  if (preferLocal && entry.local) return entry.local;
  return entry.src;
}
