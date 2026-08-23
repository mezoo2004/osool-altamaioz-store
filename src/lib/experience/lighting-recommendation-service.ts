import fs from "node:fs";
import path from "node:path";
import {
  buildApproachSummary,
  buildExplanations,
  buildLayerPlanV2,
  buildLayoutSuggestion,
  calculateLumenRequirement,
  getWallImpact,
} from "@/lib/experience/lighting-heuristics";
import { validateRoomDimensions, estimateFixtureCount } from "@/lib/experience/lighting-lumen-engine";
import { matchProductForLayer, overallConfidence } from "@/lib/experience/lighting-product-matcher";
import type {
  ConfidenceLevel,
  LightingExperienceInput,
  LightingRecommendationResult,
  RecommendationCategory,
  RecommendationItem,
} from "@/lib/experience/types";
import { pickVariant } from "@/lib/experience/product-resolver";

type RulesFile = {
  spaceRules: Record<
    string,
    {
      defaultCategories: string[];
      moodOverrides?: Record<string, { categories: string[]; productSlugs: string[] }>;
    }
  >;
  categoryLabels: Record<string, { ar: string; en: string }>;
};

const RULES_PATH = path.join(process.cwd(), "data", "experiences", "recommendation-rules.json");

let rulesCache: RulesFile | null = null;

function loadRules(): RulesFile {
  if (rulesCache) return rulesCache;
  rulesCache = JSON.parse(fs.readFileSync(RULES_PATH, "utf8")) as RulesFile;
  return rulesCache;
}

const LAYER_PRODUCT_PICK: Record<string, string[]> = {
  general: ["s1-10w-cob-std-cob-spotlights-2", "s1-7w-cob-std-cob-spotlights", "s1-10w-cob-std-cob-spotlights-2"],
  task: ["p-w-led_strip-std-profiles-2", "p-w-led_strip-std-profiles", "s1-7w-panel-std-cob-spotlights"],
  accent: ["2835-9w-led_strip-std-led-strips-3", "s1-10w-light-std-track", "yz6201-w-track-std-track"],
  decorative: ["p-w-light-std-chandeliers-2", "p-w-light-std-chandeliers-4", "p-w-light-std-chandeliers-2"],
  ambient: ["2835-9w-led_strip-std-led-strips-3", "2835-9w-led_strip-std-led-strips", "p-w-led_strip-std-profiles"],
};

function pickProductCandidates(layer: string, moodSlugs: string[]): string[] {
  const fromMood = moodSlugs.filter(Boolean);
  const fromLayer = LAYER_PRODUCT_PICK[layer] ?? [];
  return [...new Set([...fromMood, ...fromLayer])];
}

export class LightingRecommendationService {
  async recommend(input: LightingExperienceInput): Promise<LightingRecommendationResult> {
    const rules = loadRules();
    const validation = validateRoomDimensions(input.length, input.width, input.height);
    if (!validation.valid) {
      throw new Error("invalid_dimensions");
    }

    const calcInput = {
      spaceSlug: input.spaceSlug,
      length: input.length,
      width: input.width,
      height: input.height,
      wallColor: input.wallColor,
      ceilingColor: input.ceilingColor,
      mood: input.mood,
      interiorStyle: input.interiorStyle,
      naturalLight: input.naturalLight,
      brightnessPreference: input.brightnessPreference,
    };

    const lumenResult = calculateLumenRequirement(calcInput);
    const area = lumenResult.area;

    const spaceRule = rules.spaceRules[input.spaceSlug];
    const moodOverride = spaceRule?.moodOverrides?.[input.mood];
    const moodSlugs = moodOverride?.productSlugs ?? [];
    const categories = moodOverride?.categories ?? spaceRule?.defaultCategories ?? ["cob-spotlights"];

    const generalMatch = await matchProductForLayer({
      layer: "general",
      categorySlug: "cob-spotlights",
      cct: input.cct,
      candidateSlugs: pickProductCandidates("general", moodSlugs),
    });

    const lumensPerGeneral = generalMatch?.lumens.lumens ?? 650;
    const layerPlans = buildLayerPlanV2(calcInput, lumenResult, lumensPerGeneral);

    const generalPlan = layerPlans.find((p) => p.layer === "general");
    const generalCount =
      generalPlan?.quantity ??
      estimateFixtureCount({
        spaceSlug: input.spaceSlug,
        area,
        layer: "general",
        requiredLumens: lumenResult.requiredLumens * 0.65,
        lumensPerFixture: lumensPerGeneral,
      });

    const layout = buildLayoutSuggestion({
      spaceSlug: input.spaceSlug,
      area,
      generalCount,
      length: input.length,
      width: input.width,
    });

    const items: RecommendationItem[] = [];
    const confidenceLevels: ConfidenceLevel[] = [];
    const confidenceNotesAr: string[] = [];
    const confidenceNotesEn: string[] = [];

    for (const plan of layerPlans) {
      const candidates = pickProductCandidates(plan.layer, moodSlugs);
      const matched = await matchProductForLayer({
        layer: plan.layer,
        categorySlug: plan.categorySlug,
        cct: input.cct,
        candidateSlugs: candidates,
      });

      if (!matched) continue;

      confidenceLevels.push(matched.lumens.confidence);
      if (matched.lumens.noteAr) confidenceNotesAr.push(matched.lumens.noteAr);
      if (matched.lumens.noteEn) confidenceNotesEn.push(matched.lumens.noteEn);

      let quantity = plan.quantity;
      if (plan.layer === "general") {
        quantity = estimateFixtureCount({
          spaceSlug: input.spaceSlug,
          area,
          layer: "general",
          requiredLumens: lumenResult.requiredLumens * 0.65,
          lumensPerFixture: matched.lumens.lumens,
        });
      }

      items.push({
        productSlug: matched.product.slug,
        variantId: matched.variant.id,
        quantity,
        reasonAr: plan.reasonAr,
        reasonEn: plan.reasonEn,
        categorySlug: plan.categorySlug,
        suggestedWattage: matched.variant.wattage ?? undefined,
        layer: plan.layer,
        confidence: matched.lumens.confidence,
        confidenceNoteAr: matched.lumens.noteAr,
        confidenceNoteEn: matched.lumens.noteEn,
        lumensPerFixture: matched.lumens.lumens,
      });
    }

    if (items.length === 0) {
      for (const cat of categories.slice(0, 3)) {
        const matched = await matchProductForLayer({
          layer: "general",
          categorySlug: cat,
          cct: input.cct,
        });
        if (!matched) continue;
        const qty = estimateFixtureCount({
          spaceSlug: input.spaceSlug,
          area,
          layer: "general",
          requiredLumens: lumenResult.requiredLumens * 0.65,
          lumensPerFixture: matched.lumens.lumens,
        });
        items.push({
          productSlug: matched.product.slug,
          variantId: matched.variant.id,
          quantity: qty,
          reasonAr: `طبقة ${cat} — تقدير ${qty} وحدة للمساحة.`,
          reasonEn: `${cat} layer — approx. ${qty} units for the area.`,
          categorySlug: cat,
          suggestedWattage: matched.variant.wattage ?? undefined,
          layer: "general",
          confidence: matched.lumens.confidence,
          lumensPerFixture: matched.lumens.lumens,
        });
        confidenceLevels.push(matched.lumens.confidence);
      }
    }

    const categoryResults: RecommendationCategory[] = categories.map((slug) => {
      const label = rules.categoryLabels[slug];
      return {
        slug,
        nameAr: label?.ar ?? slug,
        nameEn: label?.en ?? slug,
        reasonAr: `مناسبة لمساحة ${input.spaceSlug} ومود ${input.mood}`,
        reasonEn: `Suited for ${input.spaceSlug} with ${input.mood} mood`,
      };
    });

    const explanationsAr = buildExplanations({
      input: calcInput,
      lumenResult,
      layout,
      cct: input.cct,
      locale: "ar",
    });
    const explanationsEn = buildExplanations({
      input: calcInput,
      lumenResult,
      layout,
      cct: input.cct,
      locale: "en",
    });

    const confidence = overallConfidence(confidenceLevels.length ? confidenceLevels : ["LOW"]);

    return {
      schemaVersion: 2,
      spaceSlug: input.spaceSlug,
      area,
      mood: input.mood,
      cct: input.cct,
      wallColor: input.wallColor,
      ceilingColor: input.ceilingColor,
      interiorStyle: input.interiorStyle,
      naturalLight: input.naturalLight,
      brightnessPreference: input.brightnessPreference,
      explanationAr: buildApproachSummary({
        spaceSlug: input.spaceSlug,
        area,
        mood: input.mood,
        cct: input.cct,
        wallColor: input.wallColor,
        locale: "ar",
        targetLux: lumenResult.targetLux,
      }),
      explanationEn: buildApproachSummary({
        spaceSlug: input.spaceSlug,
        area,
        mood: input.mood,
        cct: input.cct,
        wallColor: input.wallColor,
        locale: "en",
        targetLux: lumenResult.targetLux,
      }),
      explanationsAr,
      explanationsEn,
      approach: {
        summaryAr: buildApproachSummary({
          spaceSlug: input.spaceSlug,
          area,
          mood: input.mood,
          cct: input.cct,
          wallColor: input.wallColor,
          locale: "ar",
          targetLux: lumenResult.targetLux,
        }),
        summaryEn: buildApproachSummary({
          spaceSlug: input.spaceSlug,
          area,
          mood: input.mood,
          cct: input.cct,
          wallColor: input.wallColor,
          locale: "en",
          targetLux: lumenResult.targetLux,
        }),
        estimatedLuxTarget: lumenResult.targetLux,
        wallImpactAr: getWallImpact(input.wallColor, "ar"),
        wallImpactEn: getWallImpact(input.wallColor, "en"),
      },
      calculation: {
        targetLux: lumenResult.targetLux,
        targetLuxNoteAr: lumenResult.targetLuxNoteAr,
        targetLuxNoteEn: lumenResult.targetLuxNoteEn,
        requiredLumens: lumenResult.requiredLumens,
        adjustmentFactor: lumenResult.adjustment.combinedFactor,
        formulaDescriptionAr: lumenResult.formulaDescriptionAr,
        formulaDescriptionEn: lumenResult.formulaDescriptionEn,
        volume: lumenResult.volume,
      },
      layers: layerPlans,
      layout,
      confidence,
      confidenceNotesAr: [...new Set(confidenceNotesAr)],
      confidenceNotesEn: [...new Set(confidenceNotesEn)],
      categories: categoryResults,
      items,
      dimensions: {
        length: input.length,
        width: input.width,
        height: input.height,
      },
    };
  }

  async enrichItems(items: RecommendationItem[]) {
    const { resolveProductBySlug } = await import("@/lib/experience/product-resolver");
    return Promise.all(
      items.map(async (item) => {
        const product = await resolveProductBySlug(item.productSlug);
        const variant = product ? pickVariant(product, { variantId: item.variantId }) : null;
        return { item, product, variant };
      }),
    );
  }
}

export const lightingRecommendationService = new LightingRecommendationService();
