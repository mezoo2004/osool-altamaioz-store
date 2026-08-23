import fs from "node:fs";
import path from "node:path";
import type { MoodId } from "@/lib/experience/types";
export {
  WALL_REFLECTANCE,
  WALL_SWATCH_HEX,
  getWallReflectance,
} from "@/lib/experience/lighting-designer-constants";

export type LuxTargetConfig = {
  ambientLux: number;
  taskLux?: number;
  rangeMin: number;
  rangeMax: number;
  notesAr: string;
  notesEn: string;
};

export type LuxTargetsFile = {
  meta: { purpose: string; unit: string; formula: string };
  spaces: Record<string, LuxTargetConfig>;
  usageModifiers: Record<string, number>;
  brightnessPreference: Record<string, number>;
  naturalLight: Record<string, number>;
  interiorStyle: Record<string, number>;
  ceilingHeight: { referenceM: number; factorPerMeterAbove: number; factorPerMeterBelow: number };
  fixtureSanity: Record<
    string,
    { generalMinPerAreaM2: number; generalMin: number; generalMaxPerAreaM2: number }
  >;
  wattageLumenEstimate: { note: string; lmPerWatt: number };
};

const LUX_PATH = path.join(process.cwd(), "data", "experiences", "lux-targets.json");

let cache: LuxTargetsFile | null = null;

export function loadLuxTargets(): LuxTargetsFile {
  if (cache) return cache;
  cache = JSON.parse(fs.readFileSync(LUX_PATH, "utf8")) as LuxTargetsFile;
  return cache;
}
export function getTargetLuxForSpace(spaceSlug: string, mood?: MoodId): LuxTargetConfig & { adjustedLux: number } {
  const config = loadLuxTargets();
  const base = config.spaces[spaceSlug] ?? config.spaces["living-room"];
  const moodMod = mood ? (config.usageModifiers[mood] ?? 1) : 1;
  const adjustedLux = Math.round(base.ambientLux * moodMod);
  return { ...base, adjustedLux: Math.min(base.rangeMax, Math.max(base.rangeMin, adjustedLux)) };
}
