import { CCT_EXPLANATIONS } from "./assistant-knowledge";
import {
  applyAlternativeToState,
  applyBrighterAdjustment,
  applySofterAdjustment,
  applyWarmerAdjustment,
  buildExperienceHandoffUrl,
  buildSceneHandoffFromResult,
  formatAlternativeExplanation,
  formatDesignerSummary,
  formatWhyExplanation,
  pivotSpace,
  runLightingDesigner,
} from "./assistant-designer-bridge";
import { detectIntent, detectVisualFollowUp } from "./assistant-intents";
import {
  handleVisualFollowUp,
  handleVisualSearchTurn,
  parseTypeFromChoice,
} from "./assistant-visual-search";
import { handlePassportProductTurn, hasPassportContext } from "./assistant-passport";
import { buildProductCardsFromResult } from "./assistant-products";
import { parseCeilingHeight } from "./assistant-parsers";
import {
  cctToDesigner,
  defaultMoodForSpace,
  detectSpace,
  hasEnoughForDesigner,
  mergeSessionState,
  nextMissingField,
  spaceLabel,
  spaceKeyToSlug,
  type SessionState,
} from "./assistant-state";
import type {
  AssistantAction,
  AssistantChoice,
  AssistantLocale,
  AssistantRequest,
  AssistantResponse,
} from "./assistant-types";

function reply(locale: AssistantLocale, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

function spaceChoices(locale: AssistantLocale): AssistantChoice[] {
  const spaces = ["majlis", "living", "bedroom", "kitchen", "office", "outdoor"] as const;
  return spaces.map((s) => ({
    label: spaceLabel(s, locale),
    value:
      locale === "ar"
        ? `أبي إضاءة ل${spaceLabel(s, "ar")}`
        : `I need lighting for ${spaceLabel(s, "en")}`,
  }));
}

function moodChoices(locale: AssistantLocale): AssistantChoice[] {
  if (locale === "ar") {
    return [
      { label: "دافئ وهادي", value: "أبي جو دافئ وهادي" },
      { label: "فاخر", value: "أبيها فخمة" },
      { label: "مودرن", value: "أبي إضاءة مودرن" },
      { label: "عملي ومشرق", value: "أبيها عملية ومشرقة" },
    ];
  }
  return [
    { label: "Warm & calm", value: "I want warm calm lighting" },
    { label: "Luxurious", value: "I want it luxurious" },
    { label: "Modern", value: "I want modern lighting" },
    { label: "Bright & practical", value: "I want bright practical lighting" },
  ];
}

function wallChoices(locale: AssistantLocale): AssistantChoice[] {
  if (locale === "ar") {
    return [
      { label: "أبيض", value: "الجدران أبيض" },
      { label: "بيج فاتح", value: "الجدران بيج" },
      { label: "رمادي", value: "الجدران رمادي فاتح" },
      { label: "داكن", value: "الجدران داكنة" },
    ];
  }
  return [
    { label: "White", value: "White walls" },
    { label: "Beige", value: "Beige walls" },
    { label: "Light gray", value: "Light gray walls" },
    { label: "Dark", value: "Dark walls" },
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

function clarificationChoices(locale: AssistantLocale): AssistantChoice[] {
  if (locale === "ar") {
    return [
      { label: "المنتج", value: "أقصد المنتج اللي رشحته" },
      { label: "درجة اللون", value: "أقصد درجة اللون" },
      { label: "توزيع الإضاءة", value: "أقصد توزيع الإضاءة" },
    ];
  }
  return [
    { label: "The product", value: "I mean the recommended product" },
    { label: "Colour temperature", value: "I mean the colour temperature" },
    { label: "Layout", value: "I mean the lighting layout" },
  ];
}

function designerActions(state: SessionState): AssistantAction[] {
  const actions: AssistantAction[] = [];
  if (state.lastSceneHandoffUrl) {
    actions.push({
      type: "scene",
      labelAr: "جرّب التوصية داخل المشهد",
      labelEn: "Try This Recommendation In The Scene",
      href: state.lastSceneHandoffUrl,
    });
  }
  if (state.lastExperienceHandoffUrl) {
    actions.push({
      type: "experience",
      labelAr: "كمّل تصميم إضاءتك",
      labelEn: "Continue your lighting design",
      href: state.lastExperienceHandoffUrl,
    });
  }
  if (state.spaceSlug) {
    actions.push({
      type: "space",
      labelAr: `استكشف ${spaceLabel(state.currentSpace ?? state.spaceSlug, "ar")}`,
      labelEn: `Explore ${spaceLabel(state.currentSpace ?? state.spaceSlug, "en")}`,
      href: `/spaces/${state.spaceSlug}`,
    });
  }
  return actions;
}

async function respondWithDesigner(
  state: SessionState,
  locale: AssistantLocale,
): Promise<AssistantResponse> {
  if (!state.mood) state.mood = defaultMoodForSpace(state.spaceSlug);
  if (!state.preferredCct) {
    state.preferredCct =
      state.spaceSlug === "kitchen" || state.spaceSlug === "office"
        ? cctToDesigner("4000")
        : cctToDesigner("3000");
  }

  const result = await runLightingDesigner(state);
  if (!result) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "عذراً، ما قدرت أحسب التوصية الآن. جرّب «تجربة الإضاءة» للتفاصيل الكاملة.",
        "Sorry, I couldn't compute the recommendation now. Try the Lighting Experience for full details.",
      ),
      actions: [
        {
          type: "experience",
          labelAr: "تجربة الإضاءة",
          labelEn: "Lighting Experience",
          href: "/lighting-experience",
        },
      ],
      state,
    };
  }

  const sceneUrl = buildSceneHandoffFromResult(result, state.spaceSlug!);
  const experienceUrl = buildExperienceHandoffUrl(state);
  const products = await buildProductCardsFromResult(result, locale, sceneUrl);

  const updatedState: SessionState = {
    ...state,
    lastDesignerResult: result,
    lastProductRecommendations: products,
    lastRecommendation: formatDesignerSummary(result, locale, state.currentSpace),
    lastSceneHandoffUrl: sceneUrl,
    lastExperienceHandoffUrl: experienceUrl,
    lastRecommendedCategories: result.categories.map((c) => c.slug),
    awaitingField: undefined,
    currentIntent: "LIGHTING_RECOMMENDATION",
  };

  return {
    mode: "demo",
    reply: formatDesignerSummary(result, locale, state.currentSpace),
    products,
    actions: designerActions(updatedState),
    choices:
      locale === "ar"
        ? [
            { label: "ليه اخترت هذا؟", value: "ليه اخترت هذا؟" },
            { label: "وش البديل؟", value: "وش البديل؟" },
            { label: "أدفى شوي", value: "طيب أبيه أدفى شوي" },
          ]
        : [
            { label: "Why this?", value: "Why did you choose this?" },
            { label: "Alternative?", value: "What's the alternative?" },
            { label: "Softer", value: "I want it softer" },
          ],
    state: updatedState,
  };
}

function askMissingField(state: SessionState, locale: AssistantLocale): AssistantResponse {
  const missing = nextMissingField(state) ?? state.awaitingField;

  if (missing === "space" || !state.currentSpace) {
    return {
      mode: "demo",
      reply: reply(locale, "أي مساحة تقصد؟", "Which space do you mean?"),
      choices: spaceChoices(locale),
      state: { ...state, awaitingField: "space" },
    };
  }

  const spaceName = spaceLabel(state.currentSpace, locale);

  if (missing === "dimensions") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `أكيد. عشان أعطيك توصية أدق لـ${spaceName}، كم تقريباً مساحة الغرفة أو أبعادها؟ (مثال: 6×8)`,
        `Sure. For a more accurate ${spaceName} recommendation, what are the room dimensions? (e.g. 6×8)`,
      ),
      choices:
        locale === "ar"
          ? [
              { label: "6×8 م", value: "6×8" },
              { label: "5×5 م", value: "5×5" },
              { label: "4×5 م", value: "4×5" },
            ]
          : [
              { label: "6×8 m", value: "6×8" },
              { label: "5×5 m", value: "5×5" },
              { label: "4×5 m", value: "4×5" },
            ],
      state: { ...state, awaitingField: "dimensions" },
    };
  }

  if (missing === "ceilingHeight") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `تمام. كم ارتفاع السقف تقريباً؟`,
        `Got it. What's the ceiling height approximately?`,
      ),
      choices:
        locale === "ar"
          ? [
              { label: "2.8 م", value: "ارتفاع السقف 2.8" },
              { label: "3 م", value: "ارتفاع السقف 3" },
              { label: "3.5 م", value: "ارتفاع السقف 3.5" },
            ]
          : [
              { label: "2.8 m", value: "ceiling height 2.8" },
              { label: "3 m", value: "ceiling height 3" },
              { label: "3.5 m", value: "ceiling height 3.5" },
            ],
      state: { ...state, awaitingField: "ceilingHeight" },
    };
  }

  if (missing === "mood") {
    return {
      mode: "demo",
      reply: reply(locale, "وش الجو اللي تفضله؟", "What mood do you prefer?"),
      choices: moodChoices(locale),
      state: { ...state, awaitingField: "mood" },
    };
  }

  return {
    mode: "demo",
    reply: reply(
      locale,
      `لون الجدران أقرب لأي خيار؟ (اختياري — يساعد على دقة التوصية)`,
      `Which wall colour is closest? (Optional — improves accuracy)`,
    ),
    choices: wallChoices(locale),
    state: { ...state, awaitingField: "wallColor" },
  };
}

export async function generateAssistantReply(
  request: AssistantRequest,
): Promise<AssistantResponse> {
  const locale = request.locale;
  const message = request.message.trim();
  const history = request.history ?? [];
  let state = mergeSessionState(request.state, history, message);

  if (request.visualSearchResult) {
    return handleVisualSearchTurn({
      locale,
      message,
      state: {
        ...state,
        lastUploadedImagePreview: state.lastUploadedImagePreview,
      },
      visualResult: request.visualSearchResult,
    });
  }

  if (hasPassportContext(state)) {
    const passportReply = await handlePassportProductTurn({ locale, message, state });
    if (passportReply) return passportReply;
  }

  const hasVisualContext = Boolean(state.lastVisualSearchResult?.products.length);
  const intent = detectIntent(message, Boolean(state.lastDesignerResult), hasVisualContext);
  state.currentIntent = intent;

  // --- Visual product search ---
  if (intent === "VISUAL_PRODUCT_SEARCH") {
    const visualFollowUp = detectVisualFollowUp(message, hasVisualContext);
    if (visualFollowUp !== "none") {
      const followUpReply = await handleVisualFollowUp({
        locale,
        message,
        state,
        intent: visualFollowUp,
      });
      if (followUpReply) return followUpReply;
    }

    if (state.awaitingVisualClarification === "type") {
      const parsed = parseTypeFromChoice(message);
      if (parsed) {
        const { runVisualSearch } = await import("@/lib/visual-search/visual-search-service");
        const result = await runVisualSearch({
          locale,
          query: message,
          attributes: { ...state.lastVisualAttributes, ...parsed },
        });
        return handleVisualSearchTurn({ locale, message, state, visualResult: result });
      }
    }

    if (hasVisualContext) {
      return handleVisualSearchTurn({ locale, message, state });
    }

    return {
      mode: "demo",
      reply: reply(
        locale,
        "ارفع صورة من زر 📷 في الأسفل واكتب مثلاً: أبي شيء يشبه هذا",
        "Attach an image using the 📷 button below and e.g. say: I want something like this",
      ),
      state: { ...state, visualSearchIntent: true },
    };
  }

  // --- Clarification ---
  if (intent === "CLARIFICATION") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "تقصد المنتج اللي رشحته لك قبل شوي، أو درجة الإضاءة، أو توزيع الإضاءة؟",
        "Do you mean the recommended product, colour temperature, or lighting layout?",
      ),
      choices: clarificationChoices(locale),
      state: { ...state, awaitingClarification: undefined },
    };
  }

  // --- Why follow-up ---
  if (intent === "WHY_FOLLOWUP" && state.lastDesignerResult) {
    return {
      mode: "demo",
      reply: formatWhyExplanation(state.lastDesignerResult, locale),
      actions: designerActions(state),
      state,
    };
  }

  // --- Alternative ---
  if (intent === "ALTERNATIVE" && state.lastDesignerResult) {
    const altState = applyAlternativeToState(state, state.lastDesignerResult);
    const fromCct = state.lastDesignerResult.cct;
    const result = await runLightingDesigner(altState);
    if (result) {
      const sceneUrl = buildSceneHandoffFromResult(result, altState.spaceSlug!);
      const products = await buildProductCardsFromResult(result, locale, sceneUrl);
      const tradeoffAr =
        result.cct === "4000K"
          ? "إذا تبي شكل أنظف وأقل دفء، 4000K مناسبة — لكن الجو يصير عملي أكثر وأقل حميمية."
          : "3000K تعطي دفء وضيافة أكثر — لكن الوضوح للتفاصيل أقل من 4000K.";
      const tradeoffEn =
        result.cct === "4000K"
          ? "4000K gives a cleaner, less warm look — but feels more functional than intimate."
          : "3000K adds warmth and hospitality — but detail clarity is lower than 4000K.";
      return {
        mode: "demo",
        reply: `${formatAlternativeExplanation(locale, fromCct, result.cct, tradeoffAr, tradeoffEn)}\n\n${formatDesignerSummary(result, locale, altState.currentSpace)}`,
        products,
        actions: designerActions({
          ...altState,
          lastDesignerResult: result,
          lastSceneHandoffUrl: sceneUrl,
          lastExperienceHandoffUrl: buildExperienceHandoffUrl(altState),
        }),
        state: {
          ...altState,
          lastDesignerResult: result,
          lastProductRecommendations: products,
          lastSceneHandoffUrl: sceneUrl,
        },
      };
    }
  }

  // --- Warmer / softer ---
  if (
    (intent === "ADJUST_WARMER" || intent === "ADJUST_SOFTER") &&
    state.lastDesignerResult
  ) {
    const adjusted =
      intent === "ADJUST_WARMER" ? applyWarmerAdjustment(state) : applySofterAdjustment(state);
    return respondWithDesigner(adjusted, locale);
  }

  if (intent === "ADJUST_BRIGHTNESS" && state.lastDesignerResult) {
    return respondWithDesigner(applyBrighterAdjustment(state), locale);
  }

  // --- Ceiling change ---
  if (intent === "ADJUST_CEILING") {
    const newHeight = parseCeilingHeight(message);
    if (newHeight) {
      state.ceilingHeight = newHeight;
      if (hasEnoughForDesigner(state)) {
        return respondWithDesigner(state, locale);
      }
    }
    return {
      mode: "demo",
      reply: reply(locale, "كم ارتفاع السقف الجديد؟", "What's the new ceiling height?"),
      choices:
        locale === "ar"
          ? [
              { label: "3 م", value: "السقف 3" },
              { label: "3.5 م", value: "السقف 3.5" },
              { label: "4 م", value: "السقف 4" },
            ]
          : [
              { label: "3 m", value: "ceiling 3" },
              { label: "3.5 m", value: "ceiling 3.5" },
              { label: "4 m", value: "ceiling 4" },
            ],
      state: { ...state, awaitingField: "ceilingHeight" },
    };
  }

  // --- Space pivot ---
  const newSpace = detectSpace(message);
  if (intent === "SPACE_PIVOT" && newSpace) {
    state = pivotSpace(state, newSpace);
    if (hasEnoughForDesigner(state)) {
      return respondWithDesigner(state, locale);
    }
    return askMissingField(state, locale);
  }

  // --- CCT explanation ---
  if (intent === "CCT_EXPLANATION") {
    const cctKey =
      message.match(/\b(3000|4000|6500)\b/)?.[1] ??
      (state.preferredCct?.replace("K", "") ?? "4000");
    const exp = CCT_EXPLANATIONS[cctKey as "3000" | "4000" | "6500"] ?? CCT_EXPLANATIONS["4000"];
    const bedroomNote =
      state.currentSpace === "bedroom" || state.spaceSlug === "bedroom"
        ? reply(
            locale,
            "\n\nطيب لغرفة النوم: أنصح 3000K للراحة والنوم — 4000K فقط إذا تحتاج قراءة أوضح.",
            "\n\nFor bedrooms: I recommend 3000K for rest — 4000K only if you need clearer reading light.",
          )
        : state.currentSpace || state.spaceSlug
          ? reply(
              locale,
              `\n\nبخصوص ${spaceLabel(state.currentSpace ?? state.spaceSlug!, locale)}: ${state.spaceSlug === "kitchen" || state.spaceSlug === "office" ? "4000K غالباً أنسب للعمل." : "3000K غالباً أنسب للراحة والضيافة."}`,
              `\n\nFor ${spaceLabel(state.currentSpace ?? state.spaceSlug!, locale)}: ${state.spaceSlug === "kitchen" || state.spaceSlug === "office" ? "4000K is usually better for tasks." : "3000K is usually better for comfort."}`,
            )
          : "";
    return {
      mode: "demo",
      reply: (locale === "ar" ? exp.ar : exp.en) + bedroomNote,
      choices: cctChoices(locale),
      state,
    };
  }

  // --- Navigation intents ---
  if (intent === "CART_HELP") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "لإتمام الشراء: أضف المنتجات من صفحة المنتج، ثم راجع السلة.\n\nتتبع الطلب من «تتبع الطلب» أو حسابك.",
        "Add products from the product page, then review your cart.\n\nTrack orders via Track Order or your account.",
      ),
      state,
    };
  }

  if (intent === "SHOP_THE_SCENE") {
    const href = state.lastSceneHandoffUrl ?? "/scenes";
    return {
      mode: "demo",
      reply: reply(
        locale,
        state.lastSceneHandoffUrl
          ? "جرّب توصيتك داخل المشهد — اضغط الزر أدناه."
          : "استكشف «تسوق المشهد» لمعاينة الإضاءة في غرف حقيقية.",
        state.lastSceneHandoffUrl
          ? "Try your recommendation in the scene — tap below."
          : "Explore Shop The Scene to preview lighting in real rooms.",
      ),
      actions: [
        {
          type: "scene",
          labelAr: "جرّب التوصية داخل المشهد",
          labelEn: "Try This Recommendation In The Scene",
          href,
        },
      ],
      state,
    };
  }

  if (intent === "LIGHTING_DESIGNER" || intent === "LIGHTING_RECOMMENDATION" || intent === "ROOM_DESIGN") {
    if (hasEnoughForDesigner(state)) {
      return respondWithDesigner(state, locale);
    }
    if (state.currentSpace || newSpace) {
      if (newSpace) {
        state = { ...state, currentSpace: newSpace, spaceSlug: spaceKeyToSlug(newSpace) };
      }
      return askMissingField(state, locale);
    }
  }

  // "عندي مجلس 6×8..." — enough data without explicit recommendation verb
  if (hasEnoughForDesigner(state)) {
    return respondWithDesigner(state, locale);
  }

  if (intent === "SHOP_BY_SPACE") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "تقدر تستكشف الإضاءة حسب المساحة — مجلس، صالة، مطبخ، والمزيد.",
        "Explore lighting by space — majlis, living room, kitchen, and more.",
      ),
      actions: [
        {
          type: "space",
          labelAr: "تسوق حسب المساحة",
          labelEn: "Shop By Space",
          href: "/spaces",
        },
      ],
      choices: spaceChoices(locale),
      state,
    };
  }

  if (intent === "STORE_NAVIGATION") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "تصفح: إضاءة داخلية `/categories/indoor`، خارجية `/categories/outdoor`، أو «تسوق حسب المساحة» `/spaces`.",
        "Browse: indoor `/categories/indoor`, outdoor `/categories/outdoor`, or Shop By Space `/spaces`.",
      ),
      state,
    };
  }

  if (intent === "GREETING") {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "أهلاً بك في اصول التميز. أنا مساعدك الذكي للإضاءة — اسألني عن مساحتك، درجات اللون، أو التوصيات.",
        "Welcome to Osool Altamaioz. I'm your smart lighting assistant — ask about your space, colour temperature, or recommendations.",
      ),
      choices: spaceChoices(locale).slice(0, 4),
      state,
    };
  }

  // --- Progressive recommendation (bedroom case) ---
  if (newSpace && !hasEnoughForDesigner(state)) {
    state.currentSpace = newSpace;
    return askMissingField(state, locale);
  }

  if (state.awaitingField) {
    return askMissingField(state, locale);
  }

  // --- Default with context ---
  if (state.lastDesignerResult) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `بخصوص ${spaceLabel(state.currentSpace ?? state.spaceSlug ?? "living", locale)} — تبي توضيح، بديل، أو تعديل (أدفى/أقوى)؟`,
        `Regarding ${spaceLabel(state.currentSpace ?? state.spaceSlug ?? "living", locale)} — explanation, alternative, or adjustment (softer/brighter)?`,
      ),
      choices:
        locale === "ar"
          ? [
              { label: "ليه اخترت هذا؟", value: "ليه اخترت هذا؟" },
              { label: "وش البديل؟", value: "وش البديل؟" },
              { label: "طيب للمطبخ؟", value: "طيب للمطبخ؟" },
            ]
          : [
              { label: "Why this?", value: "Why did you choose this?" },
              { label: "Alternative?", value: "What's the alternative?" },
              { label: "For the kitchen?", value: "What about the kitchen?" },
            ],
      actions: designerActions(state),
      state,
    };
  }

  return {
    mode: "demo",
    reply: reply(
      locale,
      "كيف أقدر أساعدك؟ اختر مساحة أو صف لي أبعاد الغرفة.",
      "How can I help? Pick a space or describe your room dimensions.",
    ),
    choices: spaceChoices(locale),
    state,
  };
}

/** @deprecated use generateAssistantReply */
export async function generateDemoAssistantReply(
  request: AssistantRequest,
): Promise<AssistantResponse> {
  return generateAssistantReply(request);
}
