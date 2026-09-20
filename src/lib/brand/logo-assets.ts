/** Official Osool Altamaioz mark assets (from references/brand/logo-mark-sheet.png). */
export const osoolLogoAssets = {
  markLight: "/brand/logo/osool-mark-light.png",
  markDark: "/brand/logo/osool-mark-dark.png",
  markOnOrange: "/brand/logo/osool-mark-on-orange.png",
  markOnGray: "/brand/logo/osool-mark-on-gray.png",
} as const;

/** UI surface behind the logo — picks the correct mark variant. */
export type OsoolLogoSurface = "light" | "dark" | "orange" | "gray";

/** @deprecated Use `surface`. Kept for gradual migration. */
export type OsoolLogoTone = OsoolLogoSurface;

export type OsoolLogoPresentation = "markOnly";

export function resolveOsoolMarkSrc(surface: OsoolLogoSurface): string {
  switch (surface) {
    case "light":
      return osoolLogoAssets.markLight;
    case "dark":
      return osoolLogoAssets.markDark;
    case "orange":
      return osoolLogoAssets.markOnOrange;
    case "gray":
      return osoolLogoAssets.markOnGray;
    default:
      return osoolLogoAssets.markLight;
  }
}

/** @deprecated Use resolveOsoolMarkSrc(surface). */
export function resolveOsoolLogoSrc(_locale: "ar" | "en", tone: OsoolLogoSurface): string {
  return resolveOsoolMarkSrc(tone);
}
