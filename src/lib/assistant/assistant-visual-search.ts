import type { VisualAttributes, VisualMatchProduct, VisualSearchResult } from "@/lib/visual-search/types";
import type {
  AssistantAction,
  AssistantChoice,
  AssistantLocale,
  AssistantProductCard,
  AssistantResponse,
} from "./assistant-types";
import { buildProductCardsFromSlugs } from "./assistant-products";
import { hasEnoughForDesigner, type SessionState } from "./assistant-state";
import { runLightingDesigner, buildSceneHandoffFromResult } from "./assistant-designer-bridge";
import { refineMatchesByColor, getProductByIndex } from "@/lib/visual-search/catalog-visual-matcher";
import { typeChoices } from "@/lib/visual-search/fallback-visual-search";
import { runVisualSearch } from "@/lib/visual-search/visual-search-service";

function reply(locale: AssistantLocale, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

export function visualMatchesToCards(
  products: VisualMatchProduct[],
  locale: AssistantLocale,
): AssistantProductCard[] {
  return products.slice(0, 4).map((p) => ({
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    imageUrl: p.imageUrl,
    sku: p.sku,
    keySpec: locale === "ar" ? p.reasonAr : p.reasonEn,
    productUrl: `/products/${p.slug}`,
    sceneUrl: `/scenes/majlis-classic?product=${p.slug}`,
    priceText: null,
    priceAvailable: false,
  }));
}

export function visualQuickActions(
  product: VisualMatchProduct | undefined,
  _locale: AssistantLocale,
): AssistantAction[] {
  if (!product) return [];
  const actions: AssistantAction[] = [
    {
      type: "scene",
      labelAr: "عرض المنتج",
      labelEn: "View product",
      href: `/products/${product.slug}`,
    },
    {
      type: "scene",
      labelAr: "جرّبه في المشهد",
      labelEn: "Try in scene",
      href: `/scenes/majlis-classic?product=${product.slug}`,
    },
  ];
  return actions;
}

export function visualTypeChoices(locale: AssistantLocale): AssistantChoice[] {
  return typeChoices(locale).map((c) => ({ label: c.label, value: c.value }));
}

export async function handleVisualSearchTurn(options: {
  locale: AssistantLocale;
  message: string;
  state: SessionState;
  visualResult?: VisualSearchResult;
}): Promise<AssistantResponse> {
  const { locale, message, state } = options;
  let result = options.visualResult ?? state.lastVisualSearchResult;

  if (!result && (state.awaitingVisualClarification || message)) {
    const partial = state.lastVisualAttributes ?? {};
    result = await runVisualSearch({
      locale,
      query: message,
      attributes: partial,
    });
  }

  if (result?.needsClarification) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "وش أقرب نوع للمنتج اللي بالصورة؟",
        "What product type is closest to what's in the image?",
      ),
      choices: visualTypeChoices(locale),
      state: {
        ...state,
        lastVisualSearchResult: result,
        lastVisualAttributes: result.attributes,
        awaitingVisualClarification: "type",
        visualSearchIntent: true,
      },
    };
  }

  if (!result || result.products.length === 0) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        "ما لقيت تطابق واضح — جرّب تحدد نوع المنتج أو اللون.",
        "No clear match — try specifying product type or colour.",
      ),
      choices: visualTypeChoices(locale),
      state: { ...state, awaitingVisualClarification: "type", visualSearchIntent: true },
    };
  }

  const products = result.products;
  const cards = visualMatchesToCards(products, locale);
  const primary = products[0];
  const typeLabel = result.attributes.productType ?? "lighting";

  let roomNote = "";
  if (hasEnoughForDesigner(state)) {
    const designer = await runLightingDesigner(state);
    if (designer) {
      roomNote = reply(
        locale,
        `\n\nبخصوص مساحتك: التوصية الإرشادية ~${designer.calculation.requiredLumens.toLocaleString()} lumen — المنتجات أعلاه قريبة بصرياً ومناسبة للفئة.`,
        `\n\nFor your room: advisory ~${designer.calculation.requiredLumens.toLocaleString()} lm — products above are visually similar and category-appropriate.`,
      );
    }
  }

  return {
    mode: "demo",
    reply: reply(
      locale,
      `لقيت ${products.length} خيارات قريبة من ${typeLabel}:\n\n• ${primary.nameAr}${result.attributes.color ? ` — لون: ${result.attributes.color}` : ""}${roomNote}`,
      `Found ${products.length} options close to ${typeLabel}:\n\n• ${primary.nameEn}${result.attributes.color ? ` — colour: ${result.attributes.color}` : ""}${roomNote}`,
    ),
    products: cards,
    actions: visualQuickActions(primary, locale),
    choices:
      locale === "ar"
        ? [
            { label: "خيار مشابه", value: "وش البديل؟" },
            { label: "ورني الخيار الثاني", value: "ورني الخيار الثاني" },
            { label: "أسود", value: "أبيه أسود" },
          ]
        : [
            { label: "Similar option", value: "What's the alternative?" },
            { label: "Second option", value: "Show me the second option" },
            { label: "Black", value: "I want it black" },
          ],
    state: {
      ...state,
      lastVisualSearchResult: result,
      lastVisualAttributes: result.attributes,
      lastMatchedProductSlugs: products.map((p) => p.slug),
      lastProductRecommendations: cards,
      selectedVisualProductIndex: 0,
      visualSearchIntent: true,
      awaitingVisualClarification: undefined,
    },
  };
}

export async function handleVisualFollowUp(options: {
  locale: AssistantLocale;
  message: string;
  state: SessionState;
  intent: "color_refine" | "second_option" | "smaller" | "scene_handoff" | "room_fit";
}): Promise<AssistantResponse | null> {
  const { locale, message, state, intent } = options;
  const prev = state.lastVisualSearchResult;
  if (!prev?.products.length) return null;

  if (intent === "color_refine") {
    const colorMatch = message.match(/أسود|اسود|black|ذهب|gold|أبيض|ابيض|white/i);
    const color = colorMatch?.[0].toLowerCase().includes("black") || /أسود|اسود/.test(message)
      ? "black"
      : /gold|ذهب/.test(message)
        ? "gold"
        : "white";
    const refined = refineMatchesByColor(prev.products, color, locale);
    const result = { ...prev, products: refined, attributes: { ...prev.attributes, color } };
    return handleVisualSearchTurn({ locale, message, state: { ...state, lastVisualSearchResult: result }, visualResult: result });
  }

  if (intent === "second_option") {
    const idx = 1;
    const product = getProductByIndex(prev.products, idx);
    if (!product) return null;
    const cards = visualMatchesToCards([product], locale);
    return {
      mode: "demo",
      reply: reply(
        locale,
        `الخيار الثاني: ${product.nameAr}`,
        `Second option: ${product.nameEn}`,
      ),
      products: cards,
      actions: visualQuickActions(product, locale),
      state: { ...state, selectedVisualProductIndex: idx },
    };
  }

  if (intent === "smaller") {
    const result = await runVisualSearch({
      locale,
      query: message,
      attributes: { ...prev.attributes, style: "compact" },
    });
    return handleVisualSearchTurn({ locale, message, state, visualResult: result });
  }

  if (intent === "scene_handoff") {
    const idx = state.selectedVisualProductIndex ?? 0;
    const product = getProductByIndex(prev.products, idx) ?? prev.products[0];
    const slug = product.slug;
    const cards = await buildProductCardsFromSlugs([slug], locale);
    return {
      mode: "demo",
      reply: reply(locale, "جرّب المنتج داخل المشهد — اضغط الزر أدناه.", "Try the product in the scene — tap below."),
      products: cards,
      actions: [
        {
          type: "scene",
          labelAr: "جرّب التوصية داخل المشهد",
          labelEn: "Try This Recommendation In The Scene",
          href: `/scenes/majlis-classic?product=${slug}&from=visual-search`,
        },
      ],
      state: state,
    };
  }

  if (intent === "room_fit" && state.spaceSlug) {
    const designer = await runLightingDesigner(state);
    const product = prev.products[state.selectedVisualProductIndex ?? 0];
    if (designer && product) {
      const sceneUrl = buildSceneHandoffFromResult(designer, state.spaceSlug);
      return {
        mode: "demo",
        reply: reply(
          locale,
          `نعم — ${product.nameAr} قريب من أسلوبك، ومساحتك (~${designer.area.toFixed(0)} م²) تحتاج ~${designer.layers.find((l) => l.layer === "general")?.quantity ?? "عدة"} نقاط إضاءة عامة إرشادياً.`,
          `Yes — ${product.nameEn} fits your style; your ~${designer.area.toFixed(0)} m² space needs ~${designer.layers.find((l) => l.layer === "general")?.quantity ?? "several"} general fixtures advisedly.`,
        ),
        actions: [
          {
            type: "scene",
            labelAr: "جرّب التوصية داخل المشهد",
            labelEn: "Try in scene",
            href: sceneUrl,
          },
        ],
        state,
      };
    }
  }

  return null;
}

export function parseTypeFromChoice(message: string): Partial<VisualAttributes> | null {
  const map: Record<string, VisualAttributes["productType"]> = {
    نجف: "chandelier",
    chandelier: "chandelier",
    سبوت: "spotlight",
    cob: "spotlight",
    معلق: "pendant",
    pendant: "pendant",
    تراك: "track",
    track: "track",
    بانل: "panel",
    panel: "panel",
    شريط: "strip",
    strip: "strip",
  };
  const n = message.toLowerCase();
  for (const [key, type] of Object.entries(map)) {
    if (n.includes(key)) return { productType: type };
  }
  return null;
}
