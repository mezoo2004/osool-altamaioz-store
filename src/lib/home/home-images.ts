/**
 * Homepage space imagery — premium architectural lighting campaign.
 * Replace with local files in public/images/home/spaces/ when official photography is ready.
 */
const UNSPLASH = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=88`;

/** Warm interior fallback — luxury living with visible ceiling lighting */
export const HOME_IMAGE_FALLBACK = UNSPLASH("1618221195710-dd6b41faaea6");

export type HomeImageEntry = {
  src: string;
  fallback: string;
  local: string;
  objectPosition?: string;
};

function spaceEntry(
  remoteId: string,
  local: string,
  objectPosition: string,
  fallbackId?: string,
): HomeImageEntry {
  return {
    src: local,
    fallback: UNSPLASH(fallbackId ?? remoteId),
    local,
    objectPosition,
  };
}

export const homeImages = {
  hero: {
    src: UNSPLASH("1618221195710-dd6b41faaea6", 2400),
    fallback: UNSPLASH("1600210492486-724fe5c67fb0", 2400),
    local: "/images/home/hero/hero-poster.webp",
    objectPosition: "center 40%",
  },
  scene: {
    src: UNSPLASH("1600210492486-724fe5c67fb0", 2400),
    fallback: UNSPLASH("1618221195710-dd6b41faaea6", 2400),
    local: "/images/home/scene/majlis-scene.webp",
    objectPosition: "center 35%",
  },
  spaces: {
    /** Majlis — luxury lounge, crystal chandelier + layered ceiling light */
    majlis: spaceEntry(
      "1691388206284-e142dcfff326",
      "/images/home/spaces/majlis.jpg",
      "center 24%",
      "1721614459697-b7371bacb884",
    ),
    /** Living — premium living room, arc floor lamp + warm natural light */
    living: spaceEntry(
      "1618221195710-dd6b41faaea6",
      "/images/home/spaces/living-room.jpg",
      "center 34%",
      "1600210492486-724fe5c67fb0",
    ),
    /** Bedroom — luxury bedroom, glowing bedside lamps */
    bedroom: spaceEntry(
      "1505693416388-ac5ce068fe85",
      "/images/home/spaces/bedroom.jpg",
      "center 28%",
      "1540518614846-7eded433c457",
    ),
    /** Kitchen — modern kitchen, pendant globes + cabinet lighting */
    kitchen: spaceEntry(
      "1771862956702-4e8b247e28b5",
      "/images/home/spaces/kitchen.jpg",
      "center 24%",
      "1682888813913-e13f18692019",
    ),
    /** Office — executive corridor, architectural pendant + downlights */
    office: spaceEntry(
      "1497366216548-37526070297c",
      "/images/home/spaces/office.jpg",
      "center 18%",
      "1497215842964-222b430dc094",
    ),
    /** Restaurant — upscale interior, warm pendant clusters */
    restaurant: spaceEntry(
      "1517248135467-4c7edcad34c4",
      "/images/home/spaces/restaurant.jpg",
      "center 30%",
      "1414235077428-338989a2e8c0",
    ),
    /** Retail — luxury showroom, dome pendants on merchandise */
    retail: spaceEntry(
      "1441986300917-64674bd600d8",
      "/images/home/spaces/retail.jpg",
      "center 22%",
      "1616486338812-3dadae4b4ace",
    ),
    /** Facade — modern building at dusk, exterior lighting focus */
    facade: spaceEntry(
      "1762336996727-dc52d564782e",
      "/images/home/spaces/facade.jpg",
      "center 45%",
      "1768827855242-c518ff4494b7",
    ),
    /** Garden — villa landscape at dusk, interior glow + lawn */
    garden: spaceEntry(
      "1600585154340-be6161a56a0c",
      "/images/home/spaces/garden.jpg",
      "center 48%",
      "1600047509807-ba8f99d2cdde",
    ),
  },
} as const;

export type HomeSpaceKey = keyof typeof homeImages.spaces;

export function getHomeImageSrc(entry: HomeImageEntry, preferLocal = false): string {
  if (preferLocal && entry.local) return entry.local;
  return entry.src;
}
