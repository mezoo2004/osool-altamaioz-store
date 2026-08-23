import type { VisualAttributes, VisualProductType } from "./types";

export function inferAttributesFromFallback(options: {
  query?: string;
  partial?: Partial<VisualAttributes>;
}): { attributes: VisualAttributes; needsClarification: boolean; clarificationField?: "type" | "color" | "style" } {
  const attributes: VisualAttributes = { ...(options.partial ?? {}), keywords: [...(options.partial?.keywords ?? [])] };
  const q = (options.query ?? "").toLowerCase();

  if (!attributes.productType || attributes.productType === "unknown") {
    const inferred = inferTypeFromText(q);
    if (inferred) attributes.productType = inferred;
  }

  if (!attributes.color) {
    for (const [color, terms] of Object.entries(COLOR_HINTS)) {
      if (terms.some((t) => q.includes(t))) attributes.color = color;
    }
  }

  if (!attributes.productType || attributes.productType === "unknown") {
    return { attributes, needsClarification: true, clarificationField: "type" };
  }

  return { attributes, needsClarification: false };
}

const COLOR_HINTS: Record<string, string[]> = {
  black: ["أسود", "اسود", "black"],
  white: ["أبيض", "ابيض", "white"],
  gold: ["ذهب", "ذهبي", "gold"],
  silver: ["فض", "silver", "chrome"],
};

function inferTypeFromText(text: string): VisualProductType | undefined {
  if (/نجف|chandelier/.test(text)) return "chandelier";
  if (/سبوت|spot|cob|downlight/.test(text)) return "spotlight";
  if (/معلق|pendant/.test(text)) return "pendant";
  if (/تراك|track/.test(text)) return "track";
  if (/بانل|panel/.test(text)) return "panel";
  if (/شريط|strip|led strip/.test(text)) return "strip";
  if (/بروف|profile/.test(text)) return "profile";
  if (/كشاف|flood/.test(text)) return "floodlight";
  return undefined;
}

export function typeChoiceValue(type: VisualProductType, locale: "ar" | "en"): string {
  const labels: Record<VisualProductType, { ar: string; en: string }> = {
    chandelier: { ar: "نجفة / ثريا", en: "Chandelier" },
    spotlight: { ar: "سبوت / COB", en: "Spotlight / COB" },
    pendant: { ar: "معلق", en: "Pendant" },
    track: { ar: "تراك", en: "Track" },
    panel: { ar: "بانل", en: "Panel" },
    strip: { ar: "شريط LED", en: "LED strip" },
    profile: { ar: "بروفايل", en: "Profile" },
    floodlight: { ar: "كشاف", en: "Floodlight" },
    switch: { ar: "مفتاح / فيش", en: "Switch / socket" },
    unknown: { ar: "غير متأكد", en: "Not sure" },
  };
  const label = labels[type][locale];
  return locale === "ar" ? `نوع المنتج: ${label}` : `Product type: ${label}`;
}

export function typeChoices(locale: "ar" | "en") {
  const types: VisualProductType[] = [
    "chandelier",
    "spotlight",
    "pendant",
    "track",
    "panel",
    "strip",
  ];
  return types.map((t) => ({
    label: typeChoiceValue(t, locale).replace(/^نوع المنتج: |^Product type: /, ""),
    value: typeChoiceValue(t, locale),
    type: t,
  }));
}
