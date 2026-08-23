import fs from "node:fs";
import path from "node:path";
import { buildDesignerSceneHandoffUrl } from "@/lib/experience/lighting-designer-handoff";
import { lightingRecommendationService } from "@/lib/experience/lighting-recommendation-service";
import type { LightingExperienceInput, LightingRecommendationResult } from "@/lib/experience/types";
import type { SpaceKey } from "./assistant-knowledge";
import { spaceLabel } from "./assistant-state-detectors";
import {
  cctToDesigner,
  defaultMoodForSpace,
  defaultWallColor,
  moodToDesigner,
  type SessionState,
  spaceKeyToSlug,
} from "./assistant-state";
import type { AssistantLocale } from "./assistant-types";

type SpaceRecord = {
  slug: string;
  sceneIds: string[];
};

let spacesCache: SpaceRecord[] | null = null;

function loadSpaces(): SpaceRecord[] {
  if (spacesCache) return spacesCache;
  const file = path.join(process.cwd(), "data", "experiences", "spaces.json");
  spacesCache = JSON.parse(fs.readFileSync(file, "utf8")) as SpaceRecord[];
  return spacesCache;
}

export function stateToDesignerInput(state: SessionState): LightingExperienceInput | null {
  if (!state.spaceSlug || !state.roomLength || !state.roomWidth || !state.ceilingHeight) {
    return null;
  }

  const mood = state.mood ?? defaultMoodForSpace(state.spaceSlug);
  const cct = state.preferredCct ?? cctToDesigner("3000");

  return {
    spaceSlug: state.spaceSlug,
    length: state.roomLength,
    width: state.roomWidth,
    height: state.ceilingHeight,
    mood,
    cct,
    wallColor: state.wallColor ?? defaultWallColor(),
    ceilingColor: state.ceilingColor,
    interiorStyle: state.interiorStyle ?? "balanced",
    naturalLight: state.naturalLight ?? "medium",
    brightnessPreference: state.brightnessPreference ?? "standard",
  };
}

export async function runLightingDesigner(
  state: SessionState,
): Promise<LightingRecommendationResult | null> {
  const input = stateToDesignerInput(state);
  if (!input) return null;
  try {
    return await lightingRecommendationService.recommend(input);
  } catch {
    return null;
  }
}

export function buildExperienceHandoffUrl(state: SessionState): string {
  const params = new URLSearchParams();
  if (state.spaceSlug) params.set("space", state.spaceSlug);
  if (state.roomLength) params.set("length", String(state.roomLength));
  if (state.roomWidth) params.set("width", String(state.roomWidth));
  if (state.ceilingHeight) params.set("height", String(state.ceilingHeight));
  if (state.wallColor) params.set("wallColor", state.wallColor);
  if (state.mood) params.set("mood", state.mood);
  if (state.preferredCct) params.set("cct", state.preferredCct);
  params.set("step", "5");
  return `/lighting-experience?${params.toString()}`;
}

export function buildSceneHandoffFromResult(
  result: LightingRecommendationResult,
  spaceSlug: string,
): string {
  const space = loadSpaces().find((s) => s.slug === spaceSlug);
  return buildDesignerSceneHandoffUrl({
    result,
    sceneIds: space?.sceneIds ?? [],
    spaceSlug,
  });
}

const LAYER_AR: Record<string, string> = {
  general: "عامة",
  task: "مهام",
  accent: "accent",
  decorative: "ديكور",
  ambient: "ambient غير مباشرة",
};

const LAYER_EN: Record<string, string> = {
  general: "general",
  task: "task",
  accent: "accent",
  decorative: "decorative",
  ambient: "indirect ambient",
};

export function formatDesignerSummary(
  result: LightingRecommendationResult,
  locale: AssistantLocale,
  spaceKey?: string,
): string {
  const spaceName = spaceKey ? spaceLabel(spaceKey, locale) : result.spaceSlug;
  const layers = result.layers
    .map((l) => {
      const name = locale === "ar" ? LAYER_AR[l.layer] ?? l.layer : LAYER_EN[l.layer] ?? l.layer;
      return locale === "ar" ? `${name} ×${l.quantity}` : `${name} ×${l.quantity}`;
    })
    .join(locale === "ar" ? "، " : ", ");

  const lines: string[] = [];

  if (locale === "ar") {
    lines.push(
      `تمام — هذا اقتراحي لـ${spaceName} (${result.area.toFixed(0)} م² تقريباً):`,
      ``,
      `• درجة اللون: ${result.cct}`,
      `• طبقات الإضاءة: ${layers}`,
      `• هدف إرشادي: ~${result.calculation.targetLux} lux (~${result.calculation.requiredLumens.toLocaleString("ar-SA")} lumen تقديري)`,
    );
    if (result.explanationsAr[0]) lines.push(``, result.explanationsAr[0]);
    if (result.confidence !== "HIGH") {
      lines.push(``, `ملاحظة: بعض بيانات اللumen في الكتalog تقديرية — راجع مواصفات المنتج قبل الشراء.`);
    }
  } else {
    lines.push(
      `Here's my advisory setup for ${spaceName} (~${result.area.toFixed(0)} m²):`,
      ``,
      `• Colour temperature: ${result.cct}`,
      `• Lighting layers: ${layers}`,
      `• Advisory target: ~${result.calculation.targetLux} lux (~${result.calculation.requiredLumens.toLocaleString()} lm estimate)`,
    );
    if (result.explanationsEn[0]) lines.push(``, result.explanationsEn[0]);
    if (result.confidence !== "HIGH") {
      lines.push(``, `Note: some lumen values are estimated from catalog data — verify specs before purchase.`);
    }
  }

  return lines.join("\n");
}

export function formatWhyExplanation(
  result: LightingRecommendationResult,
  locale: AssistantLocale,
): string {
  const explanations = locale === "ar" ? result.explanationsAr : result.explanationsEn;
  const intro =
    locale === "ar"
      ? "أكيد — هذا سبب التوصية:"
      : "Sure — here's why I recommended this:";
  return [intro, "", ...explanations.slice(0, 4)].join("\n");
}

export function formatAlternativeExplanation(
  locale: AssistantLocale,
  fromCct: string,
  toCct: string,
  tradeoffAr: string,
  tradeoffEn: string,
): string {
  if (locale === "ar") {
    return `بديل مناسب: الانتقال من ${fromCct} إلى ${toCct}.\n\n${tradeoffAr}`;
  }
  return `A suitable alternative: moving from ${fromCct} to ${toCct}.\n\n${tradeoffEn}`;
}

export function applyAlternativeToState(
  state: SessionState,
  result: LightingRecommendationResult,
): SessionState {
  const idx = state.alternativeIndex ?? 0;
  const next = { ...state, alternativeIndex: idx + 1 };

  if (idx % 2 === 0) {
    next.preferredCct = result.cct === "3000K" ? "4000K" : "3000K";
  } else if (idx % 2 === 1) {
    next.brightnessPreference = state.brightnessPreference === "soft" ? "standard" : "soft";
    next.preferredCct = "3000K";
  }

  return next;
}

export function applyWarmerAdjustment(state: SessionState): SessionState {
  return {
    ...state,
    preferredCct: "3000K",
    brightnessPreference: "soft",
    mood: moodToDesigner("warm"),
  };
}

export function applySofterAdjustment(state: SessionState): SessionState {
  return {
    ...state,
    brightnessPreference: "soft",
  };
}

export function applyBrighterAdjustment(state: SessionState): SessionState {
  return {
    ...state,
    brightnessPreference: "bright",
    preferredCct: state.preferredCct === "3000K" ? "4000K" : state.preferredCct,
  };
}

export function pivotSpace(state: SessionState, newSpace: SpaceKey): SessionState {
  return {
    ...state,
    currentSpace: newSpace,
    spaceSlug: spaceKeyToSlug(newSpace),
    roomLength: undefined,
    roomWidth: undefined,
    ceilingHeight: undefined,
    lastDesignerResult: undefined,
    lastProductRecommendations: undefined,
    awaitingField: "dimensions",
    mood: state.mood,
    preferredCct: state.preferredCct,
    wallColor: state.wallColor,
    brightnessPreference: state.brightnessPreference,
    naturalLight: state.naturalLight,
  };
}
