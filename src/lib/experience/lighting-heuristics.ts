import type { CctChoice, LightingLayerKind, MoodId, WallColorTone } from "@/lib/experience/types";
import type { LayerRecommendation } from "@/lib/experience/types";
import {
  buildLayoutSuggestion,
  calculateLumenRequirement,
  estimateFixtureCount,
  type LumenCalculationInput,
} from "@/lib/experience/lighting-lumen-engine";
import { getWallReflectance } from "@/lib/experience/lighting-designer-config";

export type { LightingLayerKind as LightingLayer };

const WALL_IMPACT_AR: Record<WallColorTone, string> = {
  very_light: "جدران فاتحة تعكس الإضاءة بكفاءة — يسمح ذلك بكميات معتدلة.",
  beige: "الدرجات البيج/الأوف وايت تعطي انعكاساً جيداً مع أجواء دافئة.",
  light_gray: "الرمادي الفاتح يوازن بين الانعكاس والهدوء البصري.",
  dark_gray: "الجدران الداكنة تمتص جزءاً من الإضاءة — نوصي بزيادة طبقة عامة أو accent.",
  warm_tones: "الألوان الدافئة تُبرز الإضاءة الدافئة وتقلل الإحساس بالبرودة.",
  unsure: "افترضنا انعكاساً متوسطاً — يمكن تعديل التوصية بعد تحديد لون الجدران.",
};

const WALL_IMPACT_EN: Record<WallColorTone, string> = {
  very_light: "Very light walls reflect light efficiently — moderate fixture counts work well.",
  beige: "Beige/off-white walls reflect well while keeping a warm feel.",
  light_gray: "Light gray balances reflection with visual calm.",
  dark_gray: "Dark walls absorb light — we recommend stronger general or accent layers.",
  warm_tones: "Warm wall tones pair naturally with warm CCT and layered accent light.",
  unsure: "We assumed average reflectance — refine once wall colour is confirmed.",
};

export { getWallReflectance };

export function getWallImpact(wallColor: WallColorTone, locale: "ar" | "en"): string {
  return locale === "ar" ? WALL_IMPACT_AR[wallColor] : WALL_IMPACT_EN[wallColor];
}

export function buildLayerPlanV2(
  input: LumenCalculationInput,
  lumenResult: ReturnType<typeof calculateLumenRequirement>,
  lumensPerGeneralFixture: number,
): LayerRecommendation[] {
  const { spaceSlug, mood } = input;
  const area = input.length * input.width;
  const layers: LayerRecommendation[] = [];

  const generalCount = estimateFixtureCount({
    spaceSlug,
    area,
    layer: "general",
    requiredLumens: lumenResult.requiredLumens * 0.65,
    lumensPerFixture: lumensPerGeneralFixture,
  });

  layers.push({
    layer: "general",
    categorySlug:
      spaceSlug === "kitchen" || spaceSlug === "office" ? "cob-spotlights" : "cob-spotlights",
    quantity: generalCount,
    reasonAr: `إضاءة عامة: ~${generalCount} نقطة لتغطية ${area.toFixed(0)} م² (هدف ~${lumenResult.targetLux} lux).`,
    reasonEn: `General layer: ~${generalCount} downlights for ${area.toFixed(0)} m² (~${lumenResult.targetLux} lux target).`,
  });

  if (spaceSlug === "kitchen" || mood === "functional") {
    layers.push({
      layer: "task",
      categorySlug: "profiles",
      quantity: area > 12 ? 3 : 2,
      reasonAr: "إضاءة مهام للأسطح — بروفايل أو خط LED تحت الخزائن.",
      reasonEn: "Task lighting for work surfaces — profile or under-cabinet linear.",
    });
  }

  if (["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)) {
    layers.push({
      layer: "ambient",
      categorySlug: "led-strips",
      quantity: area > 25 ? 2 : 1,
      reasonAr: "طبقة ambient غير مباشرة (cove/LED) لعمق بصري.",
      reasonEn: "Indirect ambient (cove/LED strip) for visual depth.",
    });
  }

  if (["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)) {
    layers.push({
      layer: "accent",
      categorySlug: "track",
      quantity: area > 30 ? 2 : 1,
      reasonAr: "إضاءة accent للجدران أو عناصر ديكور.",
      reasonEn: "Accent/track for walls or feature elements.",
    });
  }

  if (
    ["warm", "luxury", "relaxed", "hotel"].includes(mood) &&
    ["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)
  ) {
    layers.push({
      layer: "decorative",
      categorySlug: spaceSlug === "bedroom" ? "pendants" : "chandeliers",
      quantity: area > 35 ? 2 : 1,
      reasonAr: "عنصر ديكوري مركزي — نجفة أو معلقة فوق منطقة الجلوس.",
      reasonEn: "Central decorative fixture — chandelier or pendant over seating.",
    });
  }

  if (spaceSlug === "facade" || spaceSlug === "garden") {
    return [
      {
        layer: "general",
        categorySlug: "floodlights",
        quantity: Math.max(2, Math.ceil(area / 15)),
        reasonAr: "كشافات خارجية للواجهة/المسار.",
        reasonEn: "Exterior flood for facade/path.",
      },
      {
        layer: "accent",
        categorySlug: "landscape",
        quantity: Math.max(2, Math.ceil(area / 20)),
        reasonAr: "إضاءة landscape accent.",
        reasonEn: "Landscape accent lighting.",
      },
    ];
  }

  return layers;
}

export function buildExplanations(options: {
  input: LumenCalculationInput;
  lumenResult: ReturnType<typeof calculateLumenRequirement>;
  layout: ReturnType<typeof buildLayoutSuggestion>;
  cct: CctChoice;
  locale: "ar" | "en";
}): string[] {
  const { input, lumenResult, layout, cct, locale } = options;
  const lines: string[] = [];

  if (locale === "ar") {
    if (["3000K"].includes(cct) && ["warm", "luxury", "relaxed", "hotel"].includes(input.mood)) {
      lines.push("اخترنا 3000K لأنك حددت جواً دافئاً ومناسباً للضيافة والراحة.");
    } else if (cct === "4000K") {
      lines.push("4000K مناسبة للمساحات الوظيفية والعمل اليومي.");
    }
    if (input.wallColor === "dark_gray" || input.interiorStyle === "dark") {
      lines.push(`زادت التوصية لأن الجدران/الأثاث داكن وارتفاع السقف ${input.height}م.`);
    }
    if (input.height > 3.2) {
      lines.push(`ارتفاع السقف ${input.height}م يتطلب توزيعاً أوسع وقدرة إضاءة أعلى.`);
    }
    lines.push(`تم توزيع السبوتات على ~${layout.rows} صف × ${layout.columns} عمود لتقليل الظلال.`);
    lines.push(lumenResult.formulaDescriptionAr);
  } else {
    if (["3000K"].includes(cct) && ["warm", "luxury", "relaxed", "hotel"].includes(input.mood)) {
      lines.push("We recommend 3000K for your warm, hospitality-oriented mood.");
    } else if (cct === "4000K") {
      lines.push("4000K suits functional, task-oriented spaces.");
    }
    if (input.wallColor === "dark_gray" || input.interiorStyle === "dark") {
      lines.push(`We increased output for dark walls/finishes and ${input.height}m ceiling height.`);
    }
    if (input.height > 3.2) {
      lines.push(`${input.height}m ceiling height calls for wider spacing and higher output.`);
    }
    lines.push(`Downlights arranged ~${layout.rows} rows × ${layout.columns} cols to reduce shadow pockets.`);
    lines.push(lumenResult.formulaDescriptionEn);
  }

  return lines;
}

export function buildApproachSummary(options: {
  spaceSlug: string;
  area: number;
  mood: MoodId;
  cct: CctChoice;
  wallColor: WallColorTone;
  locale: "ar" | "en";
  targetLux: number;
}): string {
  const wallNote = getWallImpact(options.wallColor, options.locale);
  if (options.locale === "ar") {
    return `نهج إضاءة ${options.mood} لمساحة ${options.area.toFixed(1)} م² — هدف إرشادي ~${options.targetLux} lux مع ${options.cct}. ${wallNote}`;
  }
  return `${options.mood} lighting for ${options.area.toFixed(1)} m² — advisory ~${options.targetLux} lux at ${options.cct}. ${wallNote}`;
}

export { buildLayoutSuggestion, calculateLumenRequirement };
