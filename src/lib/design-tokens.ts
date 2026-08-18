export const designTokens = {
  colors: {
    orange: "#EA5A2D",
    black: "#000000",
    blackSoft: "#080808",
    gray: "#6D6F72",
    grayLight: "#E0DFDD",
    white: "#FFFFFF",
  },
  cct: {
    "3000K": { ar: "دافئ", en: "Warm", hex: "#FFD9A3" },
    "4000K": { ar: "طبيعي", en: "Neutral", hex: "#FFF4E0" },
    "6500K": { ar: "أبيض", en: "White", hex: "#F5F8FF" },
  },
  typography: {
    display: "text-3xl md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] tracking-tight",
    section: "text-xl md:text-2xl lg:text-[1.75rem] font-semibold leading-tight tracking-tight",
    subsection: "text-lg md:text-xl font-semibold leading-snug",
    body: "text-sm md:text-base leading-relaxed",
    meta: "text-xs leading-relaxed text-text-secondary",
    eyebrow: "text-[11px] font-medium uppercase tracking-[0.28em] text-brand-orange",
    price: "text-sm font-semibold tabular-nums",
  },
  spacing: {
    sectionY: "py-16 md:py-20 lg:py-24",
    sectionYSm: "py-12 md:py-16",
    cardGap: "gap-4 md:gap-5",
    gridGap: "gap-4 md:gap-5 lg:gap-6",
  },
  radius: {
    card: "rounded-xl",
    control: "rounded-lg",
    pill: "rounded-full",
  },
  breakpoints: {
    sm: 390,
    md: 768,
    lg: 1024,
    xl: 1440,
  },
} as const;

export type CctKey = keyof typeof designTokens.cct;
