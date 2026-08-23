import {
  SPACE_LABELS,
  type CctKey,
  type MoodKey,
  type SpaceKey,
} from "./assistant-knowledge";

const SPACE_PATTERNS: Array<{ key: SpaceKey; terms: string[] }> = [
  { key: "majlis", terms: ["مجلس", "majlis", "ديوان", "مجلسي"] },
  { key: "living", terms: ["صالة", "صاله", "living", "غرفة معيشة", "معيشة"] },
  { key: "bedroom", terms: ["غرفة نوم", "غرفه نوم", "نوم", "bedroom"] },
  { key: "kitchen", terms: ["مطبخ", "kitchen"] },
  { key: "office", terms: ["مكتب", "office", "مكتبي"] },
  { key: "restaurant", terms: ["مطعم", "restaurant"] },
  { key: "retail", terms: ["متجر", "retail", "محل", "بوتيك", "معرض"] },
  { key: "facade", terms: ["واجهة", "facade", "واجهه"] },
  { key: "garden", terms: ["حديقة", "garden", "حديقه", "فناء"] },
  { key: "outdoor", terms: ["خارجي", "outdoor", "خارج", " خارج "] },
];

export function detectSpace(text: string): SpaceKey | undefined {
  const n = text.toLowerCase();
  for (const { key, terms } of SPACE_PATTERNS) {
    if (terms.some((t) => n.includes(t.trim()))) return key;
  }
  return undefined;
}

export function detectCct(text: string): CctKey | undefined {
  if (/6500|بارد|أبيض\s*قو|cool white/i.test(text)) return "6500";
  if (/4000|طبيعي|neutral|natural/i.test(text)) return "4000";
  if (/3000|دافئ|دافى|ادفى|أدفى|warm/i.test(text)) return "3000";
  return undefined;
}

export function detectMood(text: string): MoodKey | undefined {
  if (/فاخر|أفخم|فخم|فخمة|luxury|premium|رسمي|formal/i.test(text)) return "luxury";
  if (/مودرن|modern|عصري|معاصر|contemporary/i.test(text)) return "modern";
  if (/مشرق|bright|واضح|ساطع|strong/i.test(text)) return "bright";
  if (/دافئ|دافى|ادفى|أدفى|warm|هادي|هادئ|هادية|relaxed|cozy/i.test(text)) return "warm";
  if (/عملي|practical|functional|وظيف/i.test(text)) return "practical";
  if (/مينيم|minimal|بسيط/i.test(text)) return "modern";
  if (/ديكور|accent|feature|تبرز/i.test(text)) return "luxury";
  return undefined;
}

export type FollowUpIntent =
  | "why"
  | "alternative"
  | "warmer"
  | "luxury"
  | "smaller"
  | "explain_cct"
  | "none";

export function detectFollowUpIntent(text: string): FollowUpIntent {
  const n = text.toLowerCase().trim();
  if (/ليه|لماذا|ليش|why|اخترت|اخترتي|هذا|هذي|هاذا|هذاك|ذلك/.test(n)) return "why";
  if (/بديل|خيار ثاني|الخيار الثاني|ورني الخيار|alternative|second option|عطني بديل/.test(n))
    return "alternative";
  if (/أدفى|ادفى|أقل بياض|ما أبيها صفر|ما ابيها صفر|warmer|less white|not yellow|هاد|هادي/.test(n))
    return "warmer";
  if (/أفخم|افخم|فاخر|luxury|more premium|فخم/.test(n)) return "luxury";
  if (/مساحة صغيرة|صغير|small space|compact/.test(n)) return "smaller";
  if (/وش تقصد|ما معنى|ما المقصود|explain.*\d{4}|meaning of|وش الفرق/.test(n)) return "explain_cct";
  return "none";
}

export function isRecommendationRequest(text: string): boolean {
  return /اقترح|انصح|رشح|ساعد|أبي|ابي|أبغى|ابغى|أحتاج|احتاج|عندي|عندنا|نصحني|تنصحني|recommend|suggest|help me|need lighting|وش تنصح|عطني|أبي شي|ابي شي|يناسب|مناسب|i have|i've got|my/i.test(
    text,
  );
}

export function isAmbiguousSpaceRequest(text: string): boolean {
  return isRecommendationRequest(text) && !detectSpace(text);
}

export function spaceLabel(space: string, locale: "ar" | "en") {
  const key = space as SpaceKey;
  return SPACE_LABELS[key]?.[locale] ?? space;
}
