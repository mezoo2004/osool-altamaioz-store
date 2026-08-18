import type { ChatRole } from "./assistant-types";
import {
  SPACE_LABELS,
  SPACE_RECOMMENDATIONS,
  type CctKey,
  type MoodKey,
  type SpaceKey,
} from "./assistant-knowledge";

export type SessionState = {
  currentSpace?: SpaceKey;
  currentIntent?: string;
  currentMood?: MoodKey;
  currentCct?: CctKey;
  lastRecommendation?: string;
  lastRecommendedCategories?: string[];
  lastAssistantAnswer?: string;
  alternativeIndex: number;
  awaitingClarification?: "space" | "mood" | "cct";
};

const SPACE_PATTERNS: Array<{ key: SpaceKey; terms: string[] }> = [
  { key: "majlis", terms: ["مجلس", "majlis", "ديوان"] },
  { key: "living", terms: ["صالة", "صاله", "living", "غرفة معيشة"] },
  { key: "bedroom", terms: ["غرفة نوم", "نوم", "bedroom"] },
  { key: "kitchen", terms: ["مطبخ", "kitchen"] },
  { key: "office", terms: ["مكتب", "office"] },
  { key: "restaurant", terms: ["مطعم", "restaurant"] },
  { key: "retail", terms: ["متجر", "retail", "محل", "بوتيك"] },
  { key: "facade", terms: ["واجهة", "facade", "واجهه"] },
  { key: "garden", terms: ["حديقة", "garden", "حديقه"] },
  { key: "outdoor", terms: ["خارجي", "outdoor", "خارج"] },
];

export function detectSpace(text: string): SpaceKey | undefined {
  const n = text.toLowerCase();
  for (const { key, terms } of SPACE_PATTERNS) {
    if (terms.some((t) => n.includes(t))) return key;
  }
  return undefined;
}

export function detectCct(text: string): CctKey | undefined {
  if (/6500|بارد|أبيض|cool white/i.test(text)) return "6500";
  if (/4000|طبيعي|neutral/i.test(text)) return "4000";
  if (/3000|دافئ|دافى|ادفى|أدفى|warm/i.test(text)) return "3000";
  return undefined;
}

export function detectMood(text: string): MoodKey | undefined {
  if (/فاخر|أفخم|فخم|luxury|premium/i.test(text)) return "luxury";
  if (/مودرن|modern|عصري|معاصر/i.test(text)) return "modern";
  if (/مشرق|bright|واضح|عملي/i.test(text)) return "bright";
  if (/دافئ|دافى|ادفى|أدفى|warm|هادي|هادئ/i.test(text)) return "warm";
  if (/عملي|practical/i.test(text)) return "practical";
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
  if (/بديل|خيار ثاني|الخيار الثاني|ورني الخيار|alternative|second option/.test(n)) return "alternative";
  if (/أدفى|ادفى|أقل بياض|ما أبيها صفراء|اصفر|أصفر|warmer|less white|not yellow/.test(n)) return "warmer";
  if (/أفخم|افخم|فاخر|luxury|more premium/.test(n)) return "luxury";
  if (/مساحة صغيرة|صغير|small space|compact/.test(n)) return "smaller";
  if (/وش تقصد|ما معنى|ما المقصود|explain.*\d{4}|meaning of/.test(n)) return "explain_cct";
  return "none";
}

export function isRecommendationRequest(text: string): boolean {
  return /اقترح|انصح|رشح|ساعد|أبي|ابي|أبغى|ابغى|أحتاج|احتاج|recommend|suggest|help me|need lighting/i.test(
    text,
  );
}

export function isAmbiguousSpaceRequest(text: string): boolean {
  return (
    isRecommendationRequest(text) &&
    !detectSpace(text) &&
    !/إضاءة|lighting/i.test(text)
  );
}

export function buildSessionState(
  history: Array<{ role: ChatRole; content: string }>,
  currentMessage: string,
): SessionState {
  const state: SessionState = { alternativeIndex: 0 };
  const last = history[history.length - 1];
  const all =
    last?.role === "user" && last.content === currentMessage
      ? history
      : [...history, { role: "user" as const, content: currentMessage }];

  for (const msg of all) {
    if (msg.role === "user") {
      const space = detectSpace(msg.content);
      if (space) state.currentSpace = space;
      const cct = detectCct(msg.content);
      if (cct) state.currentCct = cct;
      const mood = detectMood(msg.content);
      if (mood) state.currentMood = mood;
    } else {
      state.lastAssistantAnswer = msg.content;
      const space = detectSpace(msg.content);
      if (space) state.currentSpace = space;
      const cctMatch = msg.content.match(/\b(3000|4000|6500)K?\b/);
      if (cctMatch) state.currentCct = cctMatch[1] as CctKey;
      if (msg.content.includes("بديل") || msg.content.includes("alternative")) {
        state.alternativeIndex += 1;
      }
      const rec = state.currentSpace ? SPACE_RECOMMENDATIONS[state.currentSpace] : undefined;
      if (rec) {
        state.lastRecommendation = `${rec.cct}K for ${rec.space}`;
        state.lastRecommendedCategories = rec.categories;
      }
    }
  }

  return state;
}

export function spaceLabel(space: SpaceKey, locale: "ar" | "en") {
  return SPACE_LABELS[space][locale];
}
