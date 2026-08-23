import type { LightingRecommendationResult } from "@/lib/experience/types";
import { resolveSceneSlugFromSpace } from "@/lib/experience/space-images";

/** Build Shop The Scene URL with structured designer handoff params. */
export function buildDesignerSceneHandoffUrl(options: {
  result: LightingRecommendationResult;
  sceneIds: string[];
  spaceSlug: string;
}): string {
  const { result, sceneIds, spaceSlug } = options;
  const sceneSlug = resolveSceneSlugFromSpace(spaceSlug, sceneIds);
  const params = new URLSearchParams();
  params.set("space", spaceSlug);
  params.set("cct", result.cct);
  params.set("from", "designer");

  const primary = result.items[0];
  if (primary) {
    params.set("product", primary.productSlug);
  }

  if (result.items.length > 1) {
    params.set(
      "bundle",
      result.items
        .slice(0, 6)
        .map((i) => `${i.productSlug}:${i.quantity}`)
        .join(","),
    );
  }

  return `/scenes/${sceneSlug}?${params.toString()}`;
}

/** Serializable payload for future PDF / AI consultant / paid report. */
export function serializeRecommendationForExport(result: LightingRecommendationResult) {
  return {
    schemaVersion: result.schemaVersion,
    generatedAt: new Date().toISOString(),
    brand: { ar: "اصول التميز", en: "Osool Altamaioz" },
    room: {
      spaceSlug: result.spaceSlug,
      dimensions: result.dimensions,
      area: result.area,
      volume: result.calculation.volume,
      wallColor: result.wallColor,
      ceilingColor: result.ceilingColor,
      mood: result.mood,
      cct: result.cct,
    },
    calculation: result.calculation,
    layers: result.layers,
    layout: result.layout,
    products: result.items,
    confidence: result.confidence,
    explanations: { ar: result.explanationsAr, en: result.explanationsEn },
    disclaimer: {
      ar: "التوصيات والحسابات المعروضة إرشادية وتعتمد على بيانات المنتجات والمعلومات المدخلة. للمشاريع التي تتطلب حسابات هندسية دقيقة يُنصح بمراجعة مختص إضاءة.",
      en: "Recommendations and calculations shown are advisory and based on product data and your inputs. For projects requiring precise engineering calculations, consult a lighting specialist.",
    },
  };
}
