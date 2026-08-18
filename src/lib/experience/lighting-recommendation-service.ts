import fs from "node:fs";
import path from "node:path";
import type {
  CctChoice,
  LightingExperienceInput,
  LightingRecommendationResult,
  MoodId,
  RecommendationCategory,
  RecommendationItem,
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
      areaQuantities: Array<{ maxArea: number; items: Record<string, number> }>;
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

const MOOD_EXPLANATIONS: Record<
  MoodId,
  { ar: (cct: CctChoice, area: number) => string; en: (cct: CctChoice, area: number) => string }
> = {
  warm: {
    ar: (cct, area) =>
      `توصية لمساحة ${area.toFixed(1)} م² بأجواء دافئة ودرجة لون ${cct} — طبقات إضاءة عامة وديكورية.`,
    en: (cct, area) =>
      `Recommendation for ${area.toFixed(1)} m² with warm ambience at ${cct} — general and decorative layers.`,
  },
  luxury: {
    ar: (cct, area) =>
      `حل فاخر لمساحة ${area.toFixed(1)} م² مع ${cct} — عناصر بارزة وإضاءة تركيز.`,
    en: (cct, area) =>
      `Luxury solution for ${area.toFixed(1)} m² at ${cct} — statement fixtures and accent focus.`,
  },
  modern: {
    ar: (cct, area) =>
      `مودرن لمساحة ${area.toFixed(1)} م² — خطوط نظيفة وتراك/سبوتات مع ${cct}.`,
    en: (cct, area) =>
      `Modern approach for ${area.toFixed(1)} m² — clean lines with track/downlights at ${cct}.`,
  },
  relaxed: {
    ar: (cct, area) =>
      `إضاءة هادئة لمساحة ${area.toFixed(1)} م² — توزيع ناعم و${cct}.`,
    en: (cct, area) =>
      `Relaxed lighting for ${area.toFixed(1)} m² — soft distribution at ${cct}.`,
  },
  minimal: {
    ar: (cct, area) =>
      `مينيمال لمساحة ${area.toFixed(1)} م² — عدد محدود من المصادر مع ${cct}.`,
    en: (cct, area) =>
      `Minimal setup for ${area.toFixed(1)} m² — fewer fixtures at ${cct}.`,
  },
  hotel: {
    ar: (cct, area) =>
      `أجواء فندقية لمساحة ${area.toFixed(1)} م² — توازن بين الراحة والأناقة مع ${cct}.`,
    en: (cct, area) =>
      `Hotel-style ambience for ${area.toFixed(1)} m² — comfort and elegance at ${cct}.`,
  },
  dramatic: {
    ar: (cct, area) =>
      `إضاءة درامية لمساحة ${area.toFixed(1)} م² — تباين وتركيز مع ${cct}.`,
    en: (cct, area) =>
      `Dramatic lighting for ${area.toFixed(1)} m² — contrast and accent at ${cct}.`,
  },
  functional: {
    ar: (cct, area) =>
      `حل عملي لمساحة ${area.toFixed(1)} م² — إضاءة مهام وعامة متوازنة مع ${cct}.`,
    en: (cct, area) =>
      `Functional setup for ${area.toFixed(1)} m² — balanced task and general light at ${cct}.`,
  },
};

export class LightingRecommendationService {
  async recommend(input: LightingExperienceInput): Promise<LightingRecommendationResult> {
    const rules = loadRules();
    const spaceRule = rules.spaceRules[input.spaceSlug];
    const area = input.length * input.width;

    const moodOverride = spaceRule?.moodOverrides?.[input.mood];
    const categories = moodOverride?.categories ?? spaceRule?.defaultCategories ?? ["cob-spotlights"];
    const productSlugs = moodOverride?.productSlugs ?? [];

    const areaRule = spaceRule?.areaQuantities.find((r) => area <= r.maxArea);
    const quantityMap = areaRule?.items ?? {};

    const slugSet = new Set<string>([...productSlugs, ...Object.keys(quantityMap)]);
    const resolvedProducts = await resolveProductsBySlugs([...slugSet]);

    const items: RecommendationItem[] = [];
    for (const slug of slugSet) {
      const product = resolvedProducts.find((p) => p.slug === slug);
      if (!product) continue;

      const variant = pickVariant(product, { cct: input.cct });
      if (!variant) continue;

      const qty = quantityMap[slug] ?? 1;
      items.push({
        productSlug: slug,
        variantId: variant.id,
        quantity: qty,
        reasonAr: `مناسب لمساحة ${input.spaceSlug} بدرجة ${input.cct}`,
        reasonEn: `Suited for ${input.spaceSlug} at ${input.cct}`,
        categorySlug: product.primaryCategory,
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
          items.push({
            productSlug: product.slug,
            variantId: variant.id,
            quantity: 1,
            reasonAr: `اختيار من فئة ${cat}`,
            reasonEn: `Selection from ${cat} category`,
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
        reasonAr: `موصى بها لمساحتك ومود ${input.mood}`,
        reasonEn: `Recommended for your space and ${input.mood} mood`,
      };
    });

    const moodExpl = MOOD_EXPLANATIONS[input.mood];

    return {
      spaceSlug: input.spaceSlug,
      area,
      mood: input.mood,
      cct: input.cct,
      explanationAr: moodExpl.ar(input.cct, area),
      explanationEn: moodExpl.en(input.cct, area),
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
