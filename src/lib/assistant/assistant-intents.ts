import type { AssistantIntent } from "./assistant-types";
import { isAmbiguousReference, isCeilingChangeRequest } from "./assistant-parsers";
import { detectFollowUpIntent, detectSpace, isRecommendationRequest } from "./assistant-state";

export type VisualFollowUpIntent =
  | "color_refine"
  | "second_option"
  | "smaller"
  | "scene_handoff"
  | "room_fit"
  | "none";

export function detectVisualFollowUp(message: string, hasVisualContext: boolean): VisualFollowUpIntent {
  if (!hasVisualContext) return "none";
  const n = message.toLowerCase().trim();
  if (/جرب|جرّب|مشهد|scene|try.*scene/.test(n)) return "scene_handoff";
  if (/يناسب|مناسب|fits|suitable|مجلس|مطبخ|غرفة/.test(n) && /(\d|×|x|م²|m²)/.test(n)) return "room_fit";
  if (/يناسب|هل يناسب|does it fit/.test(n)) return "room_fit";
  if (/الخيار الثاني|خيار ثاني|second option|second one|ورني الخيار/.test(n)) return "second_option";
  if (/أصغر|اصغر|smaller|compact|صغير/.test(n)) return "smaller";
  if (/بديل|alternative/.test(n)) return "second_option";
  if (/أسود|اسود|black|ذهب|gold|أبيض|ابيض|white|نفس الأول|same.*but/.test(n)) return "color_refine";
  return "none";
}

export function detectIntent(message: string, hasDesignerResult: boolean, hasVisualContext = false): AssistantIntent {
  const n = message.toLowerCase().trim();

  const visualFollowUp = detectVisualFollowUp(message, hasVisualContext);
  if (visualFollowUp !== "none") return "VISUAL_PRODUCT_SEARCH";

  if (/صورة|صور|image|photo|picture|يشبه|شبه|like this|visual search|قريب من|similar to/i.test(n)) {
    return "VISUAL_PRODUCT_SEARCH";
  }

  if (isAmbiguousReference(message)) return "CLARIFICATION";

  const followUp = detectFollowUpIntent(message);
  if (followUp === "why" && hasDesignerResult) return "WHY_FOLLOWUP";
  if (followUp === "alternative" && hasDesignerResult) return "ALTERNATIVE";
  if (followUp === "warmer" || /أدفى|ادفى|أقل بياض|ما أبيها صفر|ما ابيها صفر|هاد|هادي|هادية|soft/i.test(n)) {
    return "ADJUST_WARMER";
  }
  if (/قوية|قوي|bright|ساطع|مشرق|ما أبيها خافت/i.test(n) && hasDesignerResult) {
    return "ADJUST_BRIGHTNESS";
  }
  if (isCeilingChangeRequest(message)) return "ADJUST_CEILING";

  if (/ليه|لماذا|ليش|why|اخترت|اخترتي/.test(n) && hasDesignerResult) return "WHY_FOLLOWUP";
  if (/بديل|خيار ثاني|الخيار الثاني|alternative|second option|ورني الخيار/.test(n)) {
    return hasDesignerResult ? "ALTERNATIVE" : "PRODUCT_DISCOVERY";
  }

  if (/فرق|difference|compare|مقارنة|vs|versus|وش أفضل|وش الافضل|أيهما|ايهما/.test(n)) {
    return "CCT_EXPLANATION";
  }
  if (/\b(3000|4000|6500)\b|cct|kelvin|درجة اللون|درجه اللون/.test(n)) {
    return "CCT_EXPLANATION";
  }

  if (/مشهد|scene|shop the scene|تسوق المشهد/.test(n)) return "SHOP_THE_SCENE";
  if (/تجربة|experience|lighting experience|designer|صمّم|صمم/.test(n)) return "LIGHTING_DESIGNER";
  if (/مساحة|spaces|shop by space|تسوق حسب/.test(n)) return "SHOP_BY_SPACE";

  if (/سلة|cart|checkout|طلب|order|شحن|shipping/.test(n)) return "CART_HELP";
  if (/وين|أين|where|فئة|category|قسم|navigate|تصفح/.test(n)) return "STORE_NAVIGATION";

  if (/طيب\s*(ل|for)|(?:ل|for)\s*(?:ال)?(?:مطبخ|مجلس|نوم|صالة|kitchen|majlis|bedroom)/i.test(n)) {
    return "SPACE_PIVOT";
  }

  if (isRecommendationRequest(message) || detectSpace(message)) {
    return "LIGHTING_RECOMMENDATION";
  }

  if (/مرحب|hello|hi|السلام|اهلا|أهلا|هلا/.test(n)) return "GREETING";

  if (/إضاءة|lighting|luminaire|سبوت|نجف|chandelier|spot/.test(n)) {
    return "GENERAL_LIGHTING_ADVICE";
  }

  return "UNKNOWN";
}
