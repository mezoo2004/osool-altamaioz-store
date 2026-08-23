import { getTargetLuxForSpace, getWallReflectance, loadLuxTargets } from "@/lib/experience/lighting-designer-config";
import type {
  BrightnessPreference,
  InteriorStyle,
  LightingLayerKind,
  NaturalLightLevel,
  WallColorTone,
  MoodId,
} from "@/lib/experience/types";

export type DimensionValidation = {
  valid: boolean;
  errors: { field: string; code: string }[];
};

export type LumenCalculationInput = {
  spaceSlug: string;
  length: number;
  width: number;
  height: number;
  wallColor: WallColorTone;
  ceilingColor?: WallColorTone;
  mood: MoodId;
  interiorStyle?: InteriorStyle;
  naturalLight?: NaturalLightLevel;
  brightnessPreference?: BrightnessPreference;
};

export type AdjustmentBreakdown = {
  wallFactor: number;
  ceilingFactor: number;
  interiorFactor: number;
  naturalLightFactor: number;
  brightnessFactor: number;
  combinedFactor: number;
};

export type LumenCalculationResult = {
  area: number;
  volume: number;
  targetLux: number;
  targetLuxNoteAr: string;
  targetLuxNoteEn: string;
  adjustment: AdjustmentBreakdown;
  requiredLumens: number;
  formulaDescriptionAr: string;
  formulaDescriptionEn: string;
};

const DIMENSION_LIMITS = {
  length: { min: 0.5, max: 100 },
  width: { min: 0.5, max: 100 },
  height: { min: 2, max: 12 },
  maxArea: 800,
};

export function validateRoomDimensions(
  length: number,
  width: number,
  height: number,
): DimensionValidation {
  const errors: { field: string; code: string }[] = [];
  const check = (field: string, value: number, limits: { min: number; max: number }) => {
    if (!Number.isFinite(value) || value <= 0) errors.push({ field, code: "invalid" });
    else if (value < limits.min || value > limits.max) errors.push({ field, code: "out_of_range" });
  };
  check("length", length, DIMENSION_LIMITS.length);
  check("width", width, DIMENSION_LIMITS.width);
  check("height", height, DIMENSION_LIMITS.height);
  const area = length * width;
  if (Number.isFinite(area) && area > DIMENSION_LIMITS.maxArea) {
    errors.push({ field: "area", code: "too_large" });
  }
  return { valid: errors.length === 0, errors };
}

export function computeAdjustmentBreakdown(input: LumenCalculationInput): AdjustmentBreakdown {
  const config = loadLuxTargets();
  const wallReflectance = getWallReflectance(input.wallColor);
  const ceilingReflectance = getWallReflectance(input.ceilingColor ?? input.wallColor);

  // Darker surfaces need more lumens — inverse relationship to reflectance (documented).
  const wallFactor = 0.72 / Math.max(wallReflectance, 0.28);
  const ceilingFactor = 0.72 / Math.max(ceilingReflectance, 0.28);
  const blendedSurfaceFactor = wallFactor * 0.7 + ceilingFactor * 0.3;

  const { referenceM, factorPerMeterAbove, factorPerMeterBelow } = config.ceilingHeight;
  const heightDelta = input.height - referenceM;
  const ceilingFactorHeight =
    heightDelta > 0
      ? 1 + heightDelta * factorPerMeterAbove
      : 1 + heightDelta * factorPerMeterBelow;

  const interiorFactor = config.interiorStyle[input.interiorStyle ?? "balanced"] ?? 1;
  const naturalLightFactor = config.naturalLight[input.naturalLight ?? "medium"] ?? 1;
  const brightnessFactor = config.brightnessPreference[input.brightnessPreference ?? "standard"] ?? 1;

  const combinedFactor =
    blendedSurfaceFactor * ceilingFactorHeight * interiorFactor * naturalLightFactor * brightnessFactor;

  return {
    wallFactor: blendedSurfaceFactor,
    ceilingFactor: ceilingFactorHeight,
    interiorFactor,
    naturalLightFactor,
    brightnessFactor,
    combinedFactor: Math.round(combinedFactor * 1000) / 1000,
  };
}

export function calculateLumenRequirement(input: LumenCalculationInput): LumenCalculationResult {
  const area = input.length * input.width;
  const volume = area * input.height;
  const target = getTargetLuxForSpace(input.spaceSlug, input.mood);
  const adjustment = computeAdjustmentBreakdown(input);

  // Transparent advisory formula (design guidance).
  const requiredLumens = Math.round(target.adjustedLux * area * adjustment.combinedFactor);

  return {
    area,
    volume,
    targetLux: target.adjustedLux,
    targetLuxNoteAr: target.notesAr,
    targetLuxNoteEn: target.notesEn,
    adjustment,
    requiredLumens,
    formulaDescriptionAr: `اللومن المطلوب ≈ ${target.adjustedLux} lux × ${area.toFixed(1)} م² × معامل ${adjustment.combinedFactor} = ~${requiredLumens.toLocaleString("ar-SA")} lm (إرشادي)`,
    formulaDescriptionEn: `Required lumens ≈ ${target.adjustedLux} lux × ${area.toFixed(1)} m² × factor ${adjustment.combinedFactor} = ~${requiredLumens.toLocaleString()} lm (advisory)`,
  };
}

export function estimateFixtureCount(options: {
  spaceSlug: string;
  area: number;
  layer: LightingLayerKind;
  requiredLumens: number;
  lumensPerFixture: number;
}): number {
  const { spaceSlug, area, layer, requiredLumens, lumensPerFixture } = options;
  if (lumensPerFixture <= 0) return 1;

  const raw = Math.ceil(requiredLumens / lumensPerFixture);
  const config = loadLuxTargets();
  const sanity = config.fixtureSanity[spaceSlug];

  if (layer !== "general" || !sanity) {
    return Math.max(1, Math.min(raw, Math.ceil(area / 2)));
  }

  const minCount = Math.max(
    sanity.generalMin,
    Math.ceil(area / sanity.generalMinPerAreaM2),
  );
  const maxCount = Math.max(minCount, Math.ceil(area / sanity.generalMaxPerAreaM2));

  return Math.min(Math.max(raw, minCount), maxCount);
}

export function buildLayoutSuggestion(options: {
  spaceSlug: string;
  area: number;
  generalCount: number;
  length: number;
  width: number;
}): {
  rows: number;
  columns: number;
  spacingM: number;
  wallOffsetM: number;
  notesAr: string;
  notesEn: string;
} {
  const { generalCount, length, width, spaceSlug } = options;
  const aspect = length >= width ? length / width : width / length;
  const columns = Math.max(2, Math.ceil(Math.sqrt(generalCount * aspect)));
  const rows = Math.max(1, Math.ceil(generalCount / columns));
  const spacingM = Math.round((Math.min(length, width) / (columns + 1)) * 10) / 10;
  const wallOffsetM = Math.max(0.4, Math.round(spacingM * 0.45 * 10) / 10);

  const decorativeNote =
    ["majlis", "living-room", "bedroom", "restaurant"].includes(spaceSlug)
      ? " — عنصر ديكوري مركزي فوق منطقة الجلوس."
      : "";

  return {
    rows,
    columns,
    spacingM,
    wallOffsetM,
    notesAr: `توزيع إرشادي: ~${rows} صف × ${columns} عمود، تباعد ~${spacingM}م، إزاحة من الجدار ~${wallOffsetM}م${decorativeNote}`,
    notesEn: `Advisory layout: ~${rows} rows × ${columns} cols, ~${spacingM}m spacing, ~${wallOffsetM}m wall offset${decorativeNote ? " — central decorative over seating." : ""}`,
  };
}
