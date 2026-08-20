import { homeImages, type HomeImageEntry, type HomeSpaceKey } from "@/lib/home/home-images";

/** Maps experience space slugs to homepage space image keys. */
const SPACE_SLUG_TO_IMAGE_KEY: Record<string, HomeSpaceKey> = {
  majlis: "majlis",
  "living-room": "living",
  bedroom: "bedroom",
  kitchen: "kitchen",
  office: "office",
  restaurant: "restaurant",
  "retail-store": "retail",
  facade: "facade",
  garden: "garden",
};

export function getSpaceImageEntry(spaceSlug: string): HomeImageEntry {
  const key = SPACE_SLUG_TO_IMAGE_KEY[spaceSlug];
  if (key) return homeImages.spaces[key];
  return homeImages.spaces.living;
}

export function resolveSceneSlugFromSpace(spaceSlug: string, sceneIds: string[]): string {
  if (sceneIds.length > 0) {
    return sceneIds[0].replace(/^scene-/, "");
  }
  const fallbacks: Record<string, string> = {
    bedroom: "living-contemporary",
    office: "living-contemporary",
    restaurant: "living-contemporary",
    "retail-store": "living-contemporary",
    facade: "garden-evening",
  };
  return fallbacks[spaceSlug] ?? "majlis-classic";
}

export function buildScenePreviewUrl(options: {
  sceneSlug: string;
  spaceSlug?: string;
  productSlug?: string;
  cct?: string;
  hotspotId?: string;
}): string {
  const params = new URLSearchParams();
  if (options.spaceSlug) params.set("space", options.spaceSlug);
  if (options.productSlug) params.set("product", options.productSlug);
  if (options.cct) params.set("cct", options.cct);
  if (options.hotspotId) params.set("hotspot", options.hotspotId);
  const qs = params.toString();
  return `/scenes/${options.sceneSlug}${qs ? `?${qs}` : ""}`;
}
