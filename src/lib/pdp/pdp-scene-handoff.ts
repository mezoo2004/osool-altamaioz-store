import { buildScenePreviewUrl } from "@/lib/experience/space-images";
import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";

const CATEGORY_SPACE: Record<string, string> = {
  majlis: "majlis",
  "living-room": "living-room",
  bedroom: "bedroom",
  kitchen: "kitchen",
  office: "office",
  restaurant: "restaurant",
  retail: "retail-store",
  facade: "facade",
  garden: "garden",
  indoor: "living-room",
  outdoor: "garden",
};

const SPACE_SCENE: Record<string, string> = {
  majlis: "majlis-classic",
  "living-room": "living-contemporary",
  bedroom: "living-contemporary",
  kitchen: "living-contemporary",
  office: "living-contemporary",
  restaurant: "living-contemporary",
  "retail-store": "living-contemporary",
  facade: "garden-evening",
  garden: "garden-evening",
};

export function buildPdpSceneHref(
  product: ProductDetail,
  variant: ProductVariant | undefined,
): string {
  const spaceSlug =
    CATEGORY_SPACE[product.primaryCategory] ??
    product.categorySlugs.map((s) => CATEGORY_SPACE[s]).find(Boolean) ??
    "majlis";

  const sceneSlug = SPACE_SCENE[spaceSlug] ?? "majlis-classic";

  return buildScenePreviewUrl({
    sceneSlug,
    spaceSlug,
    productSlug: product.slug,
    cct: variant?.cct ?? undefined,
  });
}
