export type PromotionThemePreset =
  | "OSOOL_DEFAULT"
  | "NATIONAL_DAY"
  | "RAMADAN"
  | "DARK_LUXURY"
  | "CUSTOM";

export type PromotionThemeStyles = {
  popupBackground: string;
  textColor: string;
  subtitleColor: string;
  primaryCtaBg: string;
  primaryCtaText: string;
  secondaryCtaBg: string;
  secondaryCtaText: string;
  overlayColor: string;
  borderColor: string;
  closeButtonColor: string;
  closeButtonText: string;
  overlayStrength: number;
  backgroundImageUrl: string | null;
  backgroundPosition: string;
  accentLineColor: string;
};

export type PromotionThemeOverrides = Partial<PromotionThemeStyles>;

export const PROMOTION_THEME_PRESETS: Record<
  Exclude<PromotionThemePreset, "CUSTOM">,
  PromotionThemeStyles
> = {
  OSOOL_DEFAULT: {
    popupBackground: "#FFFFFF",
    textColor: "#111111",
    subtitleColor: "#666666",
    primaryCtaBg: "#EA5A2D",
    primaryCtaText: "#FFFFFF",
    secondaryCtaBg: "transparent",
    secondaryCtaText: "#111111",
    overlayColor: "rgba(0,0,0,0.55)",
    borderColor: "rgba(0,0,0,0.08)",
    closeButtonColor: "rgba(0,0,0,0.7)",
    closeButtonText: "#FFFFFF",
    overlayStrength: 55,
    backgroundImageUrl: null,
    backgroundPosition: "center",
    accentLineColor: "rgba(0,0,0,0.45)",
  },
  NATIONAL_DAY: {
    popupBackground: "#0F2E1F",
    textColor: "#F5F7F4",
    subtitleColor: "#C8D9C8",
    primaryCtaBg: "#006C35",
    primaryCtaText: "#FFFFFF",
    secondaryCtaBg: "rgba(255,255,255,0.12)",
    secondaryCtaText: "#FFFFFF",
    overlayColor: "rgba(0,40,20,0.65)",
    borderColor: "rgba(255,255,255,0.15)",
    closeButtonColor: "rgba(0,0,0,0.5)",
    closeButtonText: "#FFFFFF",
    overlayStrength: 65,
    backgroundImageUrl: null,
    backgroundPosition: "center",
    accentLineColor: "rgba(200,217,200,0.6)",
  },
  RAMADAN: {
    popupBackground: "#1A1410",
    textColor: "#F8F3EA",
    subtitleColor: "#D4C4A8",
    primaryCtaBg: "#C9A227",
    primaryCtaText: "#1A1410",
    secondaryCtaBg: "rgba(201,162,39,0.15)",
    secondaryCtaText: "#F8F3EA",
    overlayColor: "rgba(10,8,6,0.72)",
    borderColor: "rgba(201,162,39,0.35)",
    closeButtonColor: "rgba(0,0,0,0.55)",
    closeButtonText: "#FFFFFF",
    overlayStrength: 70,
    backgroundImageUrl: null,
    backgroundPosition: "center",
    accentLineColor: "rgba(201,162,39,0.75)",
  },
  DARK_LUXURY: {
    popupBackground: "#141414",
    textColor: "#F5F5F5",
    subtitleColor: "#A8A8A8",
    primaryCtaBg: "#FFFFFF",
    primaryCtaText: "#111111",
    secondaryCtaBg: "transparent",
    secondaryCtaText: "#F5F5F5",
    overlayColor: "rgba(0,0,0,0.75)",
    borderColor: "rgba(255,255,255,0.12)",
    closeButtonColor: "rgba(255,255,255,0.2)",
    closeButtonText: "#FFFFFF",
    overlayStrength: 75,
    backgroundImageUrl: null,
    backgroundPosition: "center",
    accentLineColor: "rgba(255,255,255,0.35)",
  },
};

export function resolvePromotionTheme(
  preset: PromotionThemePreset,
  overrides: PromotionThemeOverrides | null | undefined,
): PromotionThemeStyles {
  const base =
    preset === "CUSTOM"
      ? { ...PROMOTION_THEME_PRESETS.OSOOL_DEFAULT }
      : { ...PROMOTION_THEME_PRESETS[preset] };
  if (!overrides) return base;
  return { ...base, ...overrides };
}

export function presetLabel(preset: PromotionThemePreset, locale: "ar" | "en"): string {
  const labels: Record<PromotionThemePreset, { ar: string; en: string }> = {
    OSOOL_DEFAULT: { ar: "اصول الافتراضي", en: "Osool Default" },
    NATIONAL_DAY: { ar: "اليوم الوطني", en: "National Day" },
    RAMADAN: { ar: "رمضان", en: "Ramadan" },
    DARK_LUXURY: { ar: "فخامة داكنة", en: "Dark Luxury" },
    CUSTOM: { ar: "مخصص", en: "Custom" },
  };
  return labels[preset][locale];
}
