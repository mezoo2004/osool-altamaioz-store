/** Official Osool Altamaioz logo assets (extracted from references/brand identity PDF). */
export const osoolLogoAssets = {
  markDark: "/brand/logo/osool-mark-dark.png",
  markLight: "/brand/logo/osool-mark-light.png",
  logoArDark: "/brand/logo/osool-logo-ar-dark.png",
  logoArLight: "/brand/logo/osool-logo-ar-light.png",
} as const;

export type OsoolLogoTone = "dark" | "light";
export type OsoolLogoPresentation = "full" | "markOnly";

export function resolveOsoolLogoSrc(
  locale: "ar" | "en",
  tone: OsoolLogoTone,
  presentation: OsoolLogoPresentation,
): string {
  if (presentation === "markOnly" || locale === "en") {
    return tone === "light" ? osoolLogoAssets.markLight : osoolLogoAssets.markDark;
  }
  return tone === "light" ? osoolLogoAssets.logoArLight : osoolLogoAssets.logoArDark;
}
