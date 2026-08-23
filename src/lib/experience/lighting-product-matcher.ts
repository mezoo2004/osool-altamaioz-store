import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import type { CctChoice, ConfidenceLevel, LightingLayerKind } from "@/lib/experience/types";
import { loadLuxTargets } from "@/lib/experience/lighting-designer-config";
import { pickVariant, resolveProductsForCategory } from "@/lib/experience/product-resolver";

export type LumensSource = "catalog" | "wattage_estimate" | "category_default";

export type ResolvedFixtureLumens = {
  lumens: number;
  source: LumensSource;
  confidence: ConfidenceLevel;
  noteAr?: string;
  noteEn?: string;
};

const CATEGORY_DEFAULT_LUMENS: Record<string, number> = {
  "cob-spotlights": 650,
  "panel-lights": 1200,
  profiles: 800,
  "led-strips": 400,
  chandeliers: 2500,
  pendants: 1200,
  track: 900,
  floodlights: 3000,
  landscape: 800,
};

/** Parse lumen value from product specs — never invent from thin air. */
export function extractLumensFromSpecs(product: ProductDetail): number | null {
  for (const spec of product.specs ?? []) {
    const key = `${spec.keyEn} ${spec.keyAr}`.toLowerCase();
    if (!key.includes("lumen") && !key.includes("lm") && !key.includes("لومن")) continue;
    const match = spec.valueEn.match(/([\d,]+)/);
    if (match) return Number.parseInt(match[1].replace(/,/g, ""), 10);
  }
  return null;
}

export function resolveFixtureLumens(
  product: ProductDetail,
  variant: ProductVariant,
  categorySlug: string,
): ResolvedFixtureLumens {
  const fromSpecs = extractLumensFromSpecs(product);
  if (fromSpecs && fromSpecs > 0) {
    return {
      lumens: fromSpecs,
      source: "catalog",
      confidence: "HIGH",
    };
  }

  const watts = parseWattage(variant.wattage);
  if (watts && watts > 0) {
    const lmPerWatt = loadLuxTargets().wattageLumenEstimate.lmPerWatt;
    return {
      lumens: Math.round(watts * lmPerWatt),
      source: "wattage_estimate",
      confidence: "LOW",
      noteAr: "تقدير من القدرة (W) — بيانات اللumen غير متوفرة في الكتalog.",
      noteEn: "Estimated from wattage — lumen data not in catalog.",
    };
  }

  const fallback = CATEGORY_DEFAULT_LUMENS[categorySlug] ?? 600;
  return {
    lumens: fallback,
    source: "category_default",
    confidence: "LOW",
    noteAr: `تقدير فئوي (~${fallback} lm) — راجع المواصفات قبل الشراء.`,
    noteEn: `Category default (~${fallback} lm) — verify specs before purchase.`,
  };
}

function parseWattage(wattage: string | null): number | null {
  if (!wattage) return null;
  const match = wattage.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : null;
}

export async function matchProductForLayer(options: {
  layer: LightingLayerKind;
  categorySlug: string;
  cct: CctChoice;
  candidateSlugs?: string[];
}): Promise<{ product: ProductDetail; variant: ProductVariant; lumens: ResolvedFixtureLumens } | null> {
  const { categorySlug, cct, candidateSlugs = [] } = options;

  for (const slug of candidateSlugs) {
    const { resolveProductBySlug } = await import("@/lib/experience/product-resolver");
    const product = await resolveProductBySlug(slug);
    if (!product || product.stockStatus === "OUT_OF_STOCK") continue;
    const variant = pickVariant(product, { cct });
    if (!variant || variant.stockStatus === "OUT_OF_STOCK") continue;
    return {
      product,
      variant,
      lumens: resolveFixtureLumens(product, variant, categorySlug),
    };
  }

  const fromCategory = await resolveProductsForCategory(categorySlug, 6);
  for (const product of fromCategory) {
    const detail = product as ProductDetail;
    const variant = pickVariant(product, { cct });
    if (!variant || variant.stockStatus === "OUT_OF_STOCK") continue;
    return {
      product: detail,
      variant,
      lumens: resolveFixtureLumens(detail, variant, categorySlug),
    };
  }

  return null;
}

export function overallConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (levels.some((l) => l === "LOW")) return "LOW";
  if (levels.some((l) => l === "MEDIUM")) return "MEDIUM";
  return "HIGH";
}
