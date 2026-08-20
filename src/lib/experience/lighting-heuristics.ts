import type { CctChoice, MoodId, WallColorTone } from "@/lib/experience/types";

export type LightingLayer = "general" | "task" | "accent" | "decorative";

export type LayerPlan = {
  layer: LightingLayer;
  categorySlug: string;
  quantity: number;
  reasonAr: string;
  reasonEn: string;
};

const TARGET_LUX: Record<string, number> = {
  majlis: 180,
  "living-room": 200,
  bedroom: 150,
  kitchen: 320,
  office: 350,
  restaurant: 220,
  "retail-store": 450,
  facade: 60,
  garden: 40,
};

const WALL_REFLECTANCE: Record<WallColorTone, number> = {
  very_light: 0.78,
  beige: 0.65,
  light_gray: 0.55,
  dark_gray: 0.32,
  warm_tones: 0.58,
  unsure: 0.55,
};

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

/** Approximate useful lumens per downlight for advisory qty (not photometric certification). */
const LUMENS_PER_DOWNLIGHT = 650;

export function getWallReflectance(wallColor: WallColorTone): number {
  return WALL_REFLECTANCE[wallColor];
}

export function getTargetLux(spaceSlug: string): number {
  return TARGET_LUX[spaceSlug] ?? 200;
}

export function adjustedLuxTarget(spaceSlug: string, wallColor: WallColorTone): number {
  const base = getTargetLux(spaceSlug);
  const reflectance = getWallReflectance(wallColor);
  const factor = 0.72 / Math.max(reflectance, 0.28);
  return Math.round(base * factor);
}

export function estimateGeneralDownlightCount(area: number, spaceSlug: string, wallColor: WallColorTone): number {
  const lux = adjustedLuxTarget(spaceSlug, wallColor);
  const requiredLumens = lux * area * 0.85;
  const count = Math.ceil(requiredLumens / LUMENS_PER_DOWNLIGHT);
  const mins: Record<string, number> = {
    bedroom: 4,
    "living-room": 4,
    majlis: 6,
    kitchen: 4,
    office: 4,
    restaurant: 6,
    "retail-store": 8,
    facade: 2,
    garden: 2,
  };
  const maxs: Record<string, number> = {
    bedroom: Math.max(8, Math.ceil(area / 5)),
    "living-room": Math.max(10, Math.ceil(area / 4.5)),
    majlis: Math.max(12, Math.ceil(area / 4)),
    kitchen: Math.max(8, Math.ceil(area / 3.5)),
    office: Math.max(8, Math.ceil(area / 4)),
    restaurant: Math.max(10, Math.ceil(area / 4)),
    "retail-store": Math.max(12, Math.ceil(area / 3)),
    facade: 6,
    garden: 6,
  };
  return Math.min(Math.max(count, mins[spaceSlug] ?? 4), maxs[spaceSlug] ?? Math.ceil(area / 3));
}

export function buildLayerPlan(options: {
  spaceSlug: string;
  area: number;
  mood: MoodId;
  wallColor: WallColorTone;
}): LayerPlan[] {
  const { spaceSlug, area, mood, wallColor } = options;
  const layers: LayerPlan[] = [];

  const generalCount = estimateGeneralDownlightCount(area, spaceSlug, wallColor);
  layers.push({
    layer: "general",
    categorySlug: spaceSlug === "kitchen" || spaceSlug === "office" ? "cob-spotlights" : "cob-spotlights",
    quantity: generalCount,
    reasonAr: `إضاءة عامة تغطي ${area.toFixed(0)} م² — تقدير ${generalCount} نقطة إضاءة سقفية.`,
    reasonEn: `General ceiling coverage for ${area.toFixed(0)} m² — approx. ${generalCount} downlights.`,
  });

  if (spaceSlug === "kitchen" || mood === "functional") {
    layers.push({
      layer: "task",
      categorySlug: "profiles",
      quantity: area > 12 ? 3 : 2,
      reasonAr: "إضاءة مهام للأسطح والعمل — بروفايل أو خط إضاءة موجه.",
      reasonEn: "Task lighting for work surfaces — profile or directed linear light.",
    });
  }

  if (["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)) {
    const stripQty = area > 25 ? 2 : 1;
    layers.push({
      layer: "accent",
      categorySlug: "led-strips",
      quantity: stripQty,
      reasonAr: "طبقة accent غير مباشرة لعمق بصري ولتخفيف الظلال.",
      reasonEn: "Indirect accent layer for depth and softer shadows.",
    });
  }

  if (
    ["warm", "luxury", "relaxed", "hotel"].includes(mood) &&
    ["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)
  ) {
    layers.push({
      layer: "decorative",
      categorySlug: spaceSlug === "bedroom" ? "pendants" : "chandeliers",
      quantity: area > 30 ? 2 : 1,
      reasonAr: "عنصر ديكوري مركزي يعزز الأجواء — نجفة أو معلقة.",
      reasonEn: "A decorative focal fixture — chandelier or pendant for ambience.",
    });
  }

  if (spaceSlug === "facade" || spaceSlug === "garden") {
    return [
      {
        layer: "general",
        categorySlug: "floodlights",
        quantity: Math.max(2, Math.ceil(area / 15)),
        reasonAr: "إضاءة خارجية للواجهة/المسار — كشافات معمارية.",
        reasonEn: "Exterior architectural flood lighting for paths and features.",
      },
      {
        layer: "accent",
        categorySlug: "landscape",
        quantity: Math.max(2, Math.ceil(area / 20)),
        reasonAr: "إضاءة accent للحدائق والعناصر الطبيعية.",
        reasonEn: "Accent landscape lighting for planting and features.",
      },
    ];
  }

  return layers;
}

export function buildApproachSummary(options: {
  spaceSlug: string;
  area: number;
  mood: MoodId;
  cct: CctChoice;
  wallColor: WallColorTone;
  locale: "ar" | "en";
}): string {
  const { spaceSlug, area, mood, cct, wallColor, locale } = options;
  const lux = adjustedLuxTarget(spaceSlug, wallColor);
  const wallNote = locale === "ar" ? WALL_IMPACT_AR[wallColor] : WALL_IMPACT_EN[wallColor];

  if (locale === "ar") {
    return `نهج إضاءة ${mood} لمساحة ${area.toFixed(1)} م² — هدف إرشادي ~${lux} lux مع ${cct}. ${wallNote}`;
  }
  return `${mood} lighting approach for ${area.toFixed(1)} m² — advisory ~${lux} lux target at ${cct}. ${wallNote}`;
}
