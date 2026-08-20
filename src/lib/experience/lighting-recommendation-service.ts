import fs from "node:fs";
import path from "node:path";
import {
  buildApproachSummary,
  buildLayerPlan,
  getTargetLux,
  getWallReflectance,
} from "@/lib/experience/lighting-heuristics";
import type {
  LightingExperienceInput,
  LightingRecommendationResult,
  RecommendationCategory,
  RecommendationItem,
  WallColorTone,
} from "@/lib/experience/types";
import {
  pickVariant,
  resolveProductBySlug,
  resolveProductsBySlugs,
} from "@/lib/experience/product-resolver";

type RulesFile = {
  spaceRules: Record<
    string,
    {
      defaultCategories: string[];
      moodOverrides?: Record<
        string,
        { categories: string[]; productSlugs: string[] }
      >;
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
  accent: ["2835-9w-led_strip-std-led-strips-3", "2835-9w-led_strip-std-led-strips", "p-w-led_strip-std-profiles"],
  decorative: ["p-w-light-std-chandeliers-2", "p-w-light-std-chandeliers-4", "yz6201-w-track-std-track"],
};

const WALL_IMPACT_AR: Record<WallColorTone, string> = {
  very_light: "جدران فاتحة — انعكاس ممتاز يقلل الحاجة لزيادة عدد المصابيح.",
  beige: "جدران بيج — انعكاس جيد مع أجواء دافئة.",
  light_gray: "رمادي فاتح — توازن بين الإضاءة والهدوء.",
  dark_gray: "جدران داكنة — زدنا طبقة الإضاءة العامة لتعويض الامتصاص.",
  warm_tones: "ألوان دافئة — تتناغم مع الإضاءة الدافئة وتعزز الراحة.",
  unsure: "افترضنا انعكاساً متوسطاً حتى تحدد لون الجدران.",
};

const WALL_IMPACT_EN: Record<WallColorTone, string> = {
  very_light: "Light walls — excellent reflectance reduces fixture count needs.",
  beige: "Beige walls — good reflectance with warm ambience.",
  light_gray: "Light gray — balanced reflectance.",
  dark_gray: "Dark walls — we increased general lighting to compensate absorption.",
  warm_tones: "Warm wall tones — pair well with warm CCT layers.",
  unsure: "Average reflectance assumed until wall colour is confirmed.",
};

function pickProductForLayer(
  layer: string,
  categorySlug: string,
  moodSlugs: string[],
  rules: RulesFile,
  spaceSlug: string,
): string[] {
  const fromMood = moodSlugs.filter(Boolean);
  const fromLayer = LAYER_PRODUCT_PICK[layer] ?? [];
  const fromCategory = rules.spaceRules[spaceSlug]?.defaultCategories.includes(categorySlug)
    ? fromLayer
    : fromLayer;
  return [...new Set([...fromMood, ...fromCategory])];
}

export class LightingRecommendationService {
  async recommend(input: LightingExperienceInput): Promise<LightingRecommendationResult> {
    const rules = loadRules();
    const spaceRule = rules.spaceRules[input.spaceSlug];
    const area = input.length * input.width;
    const moodOverride = spaceRule?.moodOverrides?.[input.mood];
    const moodSlugs = moodOverride?.productSlugs ?? [];
    const categories = moodOverride?.categories ?? spaceRule?.defaultCategories ?? ["cob-spotlights"];

    const layerPlans = buildLayerPlan({
      spaceSlug: input.spaceSlug,
      area,
      mood: input.mood,
      wallColor: input.wallColor,
    });

    const slugCandidates = new Set<string>();
    for (const plan of layerPlans) {
      for (const slug of pickProductForLayer(plan.layer, plan.categorySlug, moodSlugs, rules, input.spaceSlug)) {
        slugCandidates.add(slug);
      }
    }
    for (const slug of moodSlugs) slugCandidates.add(slug);

    const resolvedProducts = await resolveProductsBySlugs([...slugCandidates]);

    const items: RecommendationItem[] = [];

    for (const plan of layerPlans) {
      const candidates = pickProductForLayer(plan.layer, plan.categorySlug, moodSlugs, rules, input.spaceSlug);
      let matched = candidates.find((slug) => resolvedProducts.some((p) => p.slug === slug));

      if (!matched) {
        const { getProductRepository } = await import("@/lib/data");
        const result = await getProductRepository().list({
          category: plan.categorySlug,
          sort: "featured",
          page: 1,
          pageSize: 1,
        });
        matched = result.items[0]?.slug;
      }

      if (!matched) continue;

      const product = resolvedProducts.find((p) => p.slug === matched) ??
        (await resolveProductBySlug(matched));
      if (!product) continue;

      const variant = pickVariant(product, { cct: input.cct });
      if (!variant) continue;

      items.push({
        productSlug: matched,
        variantId: variant.id,
        quantity: plan.quantity,
        reasonAr: plan.reasonAr,
        reasonEn: plan.reasonEn,
        categorySlug: plan.categorySlug,
        suggestedWattage: variant.wattage ?? undefined,
      });
    }

    if (items.length === 0) {
      for (const cat of categories.slice(0, 3)) {
        const { getProductRepository } = await import("@/lib/data");
        const result = await getProductRepository().list({
          category: cat,
          sort: "featured",
          page: 1,
          pageSize: 2,
        });
        for (const product of result.items) {
          const variant = pickVariant(product, { cct: input.cct });
          if (!variant) continue;
          const qty = Math.max(2, Math.ceil(area / 12));
          items.push({
            productSlug: product.slug,
            variantId: variant.id,
            quantity: qty,
            reasonAr: `طبقة ${cat} — تقدير ${qty} وحدة للمساحة.`,
            reasonEn: `${cat} layer — approx. ${qty} units for the area.`,
            categorySlug: cat,
            suggestedWattage: variant.wattage ?? undefined,
          });
        }
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

    const luxTarget = Math.round(getTargetLux(input.spaceSlug) / getWallReflectance(input.wallColor) * 0.72);

    return {
      spaceSlug: input.spaceSlug,
      area,
      mood: input.mood,
      cct: input.cct,
      wallColor: input.wallColor,
      explanationAr: buildApproachSummary({
        spaceSlug: input.spaceSlug,
        area,
        mood: input.mood,
        cct: input.cct,
        wallColor: input.wallColor,
        locale: "ar",
      }),
      explanationEn: buildApproachSummary({
        spaceSlug: input.spaceSlug,
        area,
        mood: input.mood,
        cct: input.cct,
        wallColor: input.wallColor,
        locale: "en",
      }),
      approach: {
        summaryAr: buildApproachSummary({
          spaceSlug: input.spaceSlug,
          area,
          mood: input.mood,
          cct: input.cct,
          wallColor: input.wallColor,
          locale: "ar",
        }),
        summaryEn: buildApproachSummary({
          spaceSlug: input.spaceSlug,
          area,
          mood: input.mood,
          cct: input.cct,
          wallColor: input.wallColor,
          locale: "en",
        }),
        estimatedLuxTarget: luxTarget,
        wallImpactAr: WALL_IMPACT_AR[input.wallColor],
        wallImpactEn: WALL_IMPACT_EN[input.wallColor],
      },
      categories: categoryResults,
      items,
    };
  }

  async enrichItems(items: RecommendationItem[]) {
    return Promise.all(
      items.map(async (item) => {
        const product = await resolveProductBySlug(item.productSlug);
        const variant = product
          ? pickVariant(product, { variantId: item.variantId })
          : null;
        return { item, product, variant };
      }),
    );
  }
}

export const lightingRecommendationService = new LightingRecommendationService();
