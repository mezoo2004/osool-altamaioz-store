import {
  CCT_EXPLANATIONS,
  SPACE_RECOMMENDATIONS,
  type SpaceKey,
} from "./assistant-knowledge";
import {
  buildSessionState,
  detectCct,
  detectFollowUpIntent,
  detectMood,
  detectSpace,
  isAmbiguousSpaceRequest,
  isRecommendationRequest,
  spaceLabel,
} from "./assistant-state";
import type {
  AssistantChoice,
  AssistantLocale,
  AssistantRequest,
  AssistantResponse,
} from "./assistant-types";

function reply(locale: AssistantLocale, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

function spaceChoices(locale: AssistantLocale): AssistantChoice[] {
  const spaces: SpaceKey[] = ["majlis", "living", "bedroom", "kitchen", "office", "outdoor"];
  return spaces.map((s) => ({
    label: spaceLabel(s, locale),
    value: locale === "ar" ? `اقترح لي إضاءة ل${spaceLabel(s, "ar")}` : `Suggest lighting for ${spaceLabel(s, "en")}`,
  }));
}

function moodChoices(locale: AssistantLocale): AssistantChoice[] {
  if (locale === "ar") {
    return [
      { label: "دافئ وهادي", value: "أبي جو دافئ وهادي" },
      { label: "فاخر", value: "أبيها أفخم" },
      { label: "مودرن", value: "أبي إضاءة مودرن" },
      { label: "عملي ومشرق", value: "أبيها عملية ومشرقة" },
    ];
  }
  return [
    { label: "Warm & calm", value: "I want warm calm lighting" },
    { label: "Luxurious", value: "I want it more luxurious" },
    { label: "Modern", value: "I want modern lighting" },
    { label: "Bright & practical", value: "I want bright practical lighting" },
  ];
}

function cctChoices(locale: AssistantLocale): AssistantChoice[] {
  if (locale === "ar") {
    return [
      { label: "3000K دافئ", value: "أبي 3000K دافئ" },
      { label: "4000K طبيعي", value: "أبي 4000K طبيعي" },
      { label: "6500K أبيض", value: "أبي 6500K أبيض" },
      { label: "مو متأكد", value: "مو متأكد من درجة اللون" },
    ];
  }
  return [
    { label: "3000K warm", value: "I want 3000K warm" },
    { label: "4000K neutral", value: "I want 4000K neutral" },
    { label: "6500K cool", value: "I want 6500K cool white" },
    { label: "Not sure", value: "I'm not sure about color temperature" },
  ];
}

function recommendForSpace(space: SpaceKey, locale: AssistantLocale): AssistantResponse {
  const rec = SPACE_RECOMMENDATIONS[space];
  return {
    mode: "demo",
    reply: locale === "ar" ? rec.ar : rec.en,
    state: {
      currentSpace: space,
      currentCct: rec.cct,
      currentMood: rec.mood,
      lastRecommendation: `${rec.cct}K`,
      lastRecommendedCategories: rec.categories,
    },
  };
}

function handleFollowUp(
  intent: ReturnType<typeof detectFollowUpIntent>,
  state: ReturnType<typeof buildSessionState>,
  message: string,
  locale: AssistantLocale,
): AssistantResponse | null {
  const space = state.currentSpace ?? detectSpace(message);
  const rec = space ? SPACE_RECOMMENDATIONS[space] : undefined;

  if (intent === "why" && rec) {
    return {
      mode: "demo",
      reply: locale === "ar" ? rec.arWhy : rec.enWhy,
      state: { currentSpace: space, currentCct: rec.cct },
    };
  }

  if (intent === "alternative" && rec) {
    const alt = rec.alternative;
    return {
      mode: "demo",
      reply: locale === "ar" ? alt.ar : alt.en,
      state: { currentSpace: space, currentCct: alt.cct, alternativeIndex: state.alternativeIndex + 1 },
    };
  }

  if (intent === "warmer" && space) {
    const warmerRec = { ...SPACE_RECOMMENDATIONS[space], cct: "3000" as const };
    return {
      mode: "demo",
      reply: reply(
        locale,
        `تمام — لـ${spaceLabel(space, "ar")} أنصح بـ3000K لأجواء أدفى وأهدأ. سبوتات مخفية وإضاءة جدارية تعطي دفء بدون إضاءة صفراء مزعجة.\n\nاستكشف: ${warmerRec.route}`,
        `Got it — for ${spaceLabel(space, "en")}, I recommend 3000K for a warmer, calmer mood. Concealed spots and wall washing add warmth without harsh yellow tones.\n\nExplore: ${warmerRec.route}`,
      ),
      state: { currentSpace: space, currentCct: "3000", currentMood: "warm" },
    };
  }

  if (intent === "luxury" && space) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `للمظهر الأفخم في ${spaceLabel(space, "ar")}: 3000K مع قطعة تزيينية مركزية (نجفة أو معلقة) وطبقة إضاءة غير مباشرة في السقف.\n\nجرّب «تسوّق المشهد» لرؤية تنسيق كامل.`,
        `For a more luxurious ${spaceLabel(space, "en")}: 3000K with a focal decorative piece and indirect ceiling glow.\n\nTry Shop The Scene for a full room composition.`,
      ),
      state: { currentSpace: space, currentMood: "luxury", currentCct: "3000" },
    };
  }

  if (intent === "smaller" && space) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `للمساحات الصغيرة في ${spaceLabel(space, "ar")}: سبوتات مخفية بزاوية واسعة + إضاءة جدارية — توسّع المكان بصرياً دون إضاءة قوية مركزية.\n\nتجنب نجف كبيرة؛ اختر إضاءة خطية أو سبوتات صغيرة.`,
        `For smaller ${spaceLabel(space, "en")}: wide-angle concealed spots + wall washing — visually expands without a heavy central fixture.\n\nAvoid large chandeliers; prefer linear or small spots.`,
      ),
      state: { currentSpace: space },
    };
  }

  if (intent === "explain_cct") {
    const cct = detectCct(message) ?? state.currentCct ?? "4000";
    const exp = CCT_EXPLANATIONS[cct];
    return {
      mode: "demo",
      reply: locale === "ar" ? exp.ar : exp.en,
      state: { currentCct: cct },
    };
  }

  return null;
}

export function generateDemoAssistantReply(request: AssistantRequest): AssistantResponse {
  const locale = request.locale;
  const message = request.message.trim();
  const history = request.history ?? [];
  const state = buildSessionState(history, message);
  const followUp = detectFollowUpIntent(message);

  // Contextual follow-ups — must run before generic keyword matching
  if (followUp !== "none") {
    const followUpReply = handleFollowUp(followUp, state, message, locale);
    if (followUpReply) return followUpReply;

    if (followUp === "why" && !state.currentSpace) {
      return {
        mode: "demo",
        reply: reply(
          locale,
          "عن أي مساحة تسأل؟ حتى أشرح لك سبب التوصية بدقة.",
          "Which space are you asking about? I'll explain the recommendation precisely.",
        ),
        choices: spaceChoices(locale),
      };
    }
  }

  // Space pivot: "طيب للمطبخ؟"
  const newSpace = detectSpace(message);
  if (newSpace && (isRecommendationRequest(message) || /طيب|لل|for/i.test(message))) {
    return recommendForSpace(newSpace, locale);
  }

  // Mood refinement with existing space context
  const mood = detectMood(message);
  if (mood && state.currentSpace && !newSpace) {
    if (mood === "warm") {
      return handleFollowUp("warmer", state, message, locale)!;
    }
    if (mood === "luxury") {
      return handleFollowUp("luxury", state, message, locale)!;
    }
  }

  // Explicit recommendation request with known space
  if (isRecommendationRequest(message) && newSpace) {
    return recommendForSpace(newSpace, locale);
  }

  // Ambiguous — ask clarification
  if (isAmbiguousSpaceRequest(message) || (isRecommendationRequest(message) && !newSpace && !state.currentSpace)) {
    return {
      mode: "demo",
      reply: reply(locale, "أي مساحة تقصد؟", "Which space do you mean?"),
      choices: spaceChoices(locale),
    };
  }

  // "مو متأكد" CCT clarification path
  if (/مو متأكد|not sure|unsure/i.test(message) && state.currentSpace) {
    return {
      mode: "demo",
      reply: reply(locale, "وش الجو اللي تفضله؟", "What mood do you prefer?"),
      choices: moodChoices(locale),
    };
  }

  if (mood && state.currentSpace) {
    return {
      mode: "demo",
      reply: reply(locale, "درجة اللون؟", "Color temperature?"),
      choices: cctChoices(locale),
    };
  }

  // CCT general question (only when not a follow-up)
  if (/\b(3000|4000|6500)\b|cct|kelvin|درجة اللون/i.test(message) && followUp === "none") {
    const cct = detectCct(message) ?? "4000";
    const exp = CCT_EXPLANATIONS[cct];
    return {
      mode: "demo",
      reply: locale === "ar" ? exp.ar : exp.en,
      choices: cctChoices(locale),
    };
  }

  // Navigation / cart — brief, unchanged
  if (/سلة|cart|checkout|طلب|order/i.test(message)) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "لإتمام الشراء: أضف المنتجات من صفحة المنتج، ثم راجع السلة.\n\nتتبع الطلب من «تتبع الطلب» أو حسابك.",
        "Add products from the product page, then review your cart.\n\nTrack orders via Track Order or your account.",
      ),
    };
  }

  if (/تجربة|experience|lighting experience/i.test(message)) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "جرّب «تجربة اصول للإضاءة» — جولة إرشادية تساعدك تختار الإضاءة المناسبة لمساحتك.\n\n/lighting-experience",
        "Try the Osool Lighting Experience — a guided journey to match lighting to your space.\n\n/lighting-experience",
      ),
    };
  }

  if (/مرحب|hello|hi|السلام|اهلا|أهلا/i.test(message)) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "أهلاً بك في اصول التميز. اسألني عن الإضاءة حسب المساحة، درجات اللون، أو التوجيه داخل المتجر.",
        "Welcome to Osool Altamaioz. Ask about lighting by space, color temperature, or store navigation.",
      ),
      choices: spaceChoices(locale).slice(0, 4),
    };
  }

  // Default — guide with space choices if no context
  if (!state.currentSpace) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "كيف أقدر أساعدك؟ اختر مساحة أو اسأل عن درجة اللون.",
        "How can I help? Pick a space or ask about color temperature.",
      ),
      choices: spaceChoices(locale),
    };
  }

  return {
    mode: "demo",
    reply: reply(
      locale,
      `بخصوص ${spaceLabel(state.currentSpace, "ar")} — هل تبي توصية أدفى، بديل، أو شرح لدرجة اللون؟`,
      `Regarding ${spaceLabel(state.currentSpace, "en")} — would you like a warmer option, alternative, or CCT explanation?`,
    ),
    choices:
      locale === "ar"
        ? [
            { label: "ليه اخترت هذا؟", value: "ليه اخترت هذا؟" },
            { label: "وش البديل؟", value: "وش البديل؟" },
            { label: "أبيها أدفى", value: "طيب أبيه أدفى" },
          ]
        : [
            { label: "Why this?", value: "Why did you choose this?" },
            { label: "Alternative?", value: "What's the alternative?" },
            { label: "Warmer", value: "I want it warmer" },
          ],
  };
}
