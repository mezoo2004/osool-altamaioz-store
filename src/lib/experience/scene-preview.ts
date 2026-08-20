import { designTokens } from "@/lib/design-tokens";
import type { CctChoice } from "@/lib/experience/types";

export type HotspotLightingRole = "ceiling" | "pendant" | "accent" | "strip" | "wall" | "task";

export type ScenePreviewState = {
  cct: CctChoice;
  wattage: number;
  role: HotspotLightingRole;
  isActive: boolean;
};

function parseWattage(wattage: string | null | undefined): number {
  if (!wattage) return 7;
  const match = wattage.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 7;
}

function inferRole(label: string, categorySlug?: string): HotspotLightingRole {
  const text = `${label} ${categorySlug ?? ""}`.toLowerCase();
  if (text.includes("strip") || text.includes("profile") || text.includes("غير مباش") || text.includes("cove")) {
    return "strip";
  }
  if (text.includes("chandelier") || text.includes("pendant") || text.includes("ثري") || text.includes("معلق")) {
    return "pendant";
  }
  if (text.includes("wall") || text.includes("حائط")) return "wall";
  if (text.includes("track") || text.includes("spot") || text.includes("cob") || text.includes("سبوت")) {
    return "ceiling";
  }
  if (text.includes("flood") || text.includes("task") || text.includes("kitchen")) return "task";
  return "accent";
}

export function normalizeCct(cct: string | null | undefined): CctChoice {
  if (!cct) return "3000K";
  if (cct.includes("6500")) return "6500K";
  if (cct.includes("4000")) return "4000K";
  return "3000K";
}

export function buildHotspotPreviewState(options: {
  cct: string | null | undefined;
  wattage: string | null | undefined;
  label: string;
  categorySlug?: string;
  isActive: boolean;
}): ScenePreviewState {
  return {
    cct: normalizeCct(options.cct),
    wattage: parseWattage(options.wattage),
    role: inferRole(options.label, options.categorySlug),
    isActive: options.isActive,
  };
}

export function cctToHex(cct: CctChoice): string {
  return designTokens.cct[cct]?.hex ?? "#FFF4E0";
}

/** Estimated spread radius (% of scene width) from wattage and role. */
export function hotspotSpreadPercent(state: ScenePreviewState): number {
  const base = state.role === "strip" ? 28 : state.role === "pendant" ? 22 : state.role === "wall" ? 16 : 14;
  const wattageBoost = Math.min(state.wattage / 12, 1.4);
  return base * wattageBoost * (state.isActive ? 1.15 : 0.85);
}

export function hotspotOpacity(state: ScenePreviewState): number {
  const base = state.role === "strip" ? 0.42 : state.role === "pendant" ? 0.55 : 0.48;
  return state.isActive ? Math.min(base + 0.12, 0.72) : base * 0.55;
}

export function ambientRoomTint(cct: CctChoice, intensity = 1): string {
  const hex = cctToHex(cct);
  const alpha = 0.12 + intensity * 0.08;
  return `color-mix(in srgb, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
}
