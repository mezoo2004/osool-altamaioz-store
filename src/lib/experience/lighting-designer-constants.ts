import type { WallColorTone } from "@/lib/experience/types";

/** Approximate wall reflectance — advisory, not photometric certification. */
export const WALL_REFLECTANCE: Record<WallColorTone, number> = {
  very_light: 0.78,
  beige: 0.65,
  light_gray: 0.55,
  dark_gray: 0.32,
  warm_tones: 0.58,
  unsure: 0.55,
};

export const WALL_SWATCH_HEX: Record<WallColorTone, string> = {
  very_light: "#F7F5F2",
  beige: "#E8DFD0",
  light_gray: "#C8C8C8",
  dark_gray: "#5A5550",
  warm_tones: "#D4C4B0",
  unsure: "#E0DFDD",
};

export function getWallReflectance(wallColor: WallColorTone): number {
  return WALL_REFLECTANCE[wallColor];
}
