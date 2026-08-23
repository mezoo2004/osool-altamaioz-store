import type { LightingRecommendationResult } from "@/lib/experience/types";

export const DESIGNER_STORAGE_KEY = "osool-lighting-designer-v2";

export function saveLightingRecommendation(result: LightingRecommendationResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DESIGNER_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* ignore quota */
  }
}

export function loadLightingRecommendation(): LightingRecommendationResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DESIGNER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LightingRecommendationResult;
  } catch {
    return null;
  }
}

export function clearLightingRecommendation(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DESIGNER_STORAGE_KEY);
}
