import fs from "node:fs";
import path from "node:path";

/** Public URL paths (served from `public/videos/home/` when present). */
export const HERO_VIDEO_WEBM = "/videos/home/hero.webm";
export const HERO_VIDEO_MP4 = "/videos/home/hero.mp4";

/**
 * Resolves hero background video without HTTP probes.
 * Prefers WebM, then MP4; returns null when neither file exists on disk.
 */
export function resolveHeroVideoPublicSrc(): string | null {
  const base = path.join(process.cwd(), "public", "videos", "home");
  if (fs.existsSync(path.join(base, "hero.webm"))) return HERO_VIDEO_WEBM;
  if (fs.existsSync(path.join(base, "hero.mp4"))) return HERO_VIDEO_MP4;
  return null;
}
