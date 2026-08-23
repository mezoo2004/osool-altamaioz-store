import { buildProductCardsFromSlugs } from "./assistant-products";
import type { AssistantLocale, AssistantResponse, ConversationState } from "./assistant-types";
import { findPassportReplacements } from "@/lib/passport/passport-matching";
import { resolveProductBySlug } from "@/lib/experience/product-resolver";
import { pickVariant } from "@/lib/experience/product-resolver";

function reply(locale: AssistantLocale, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

export function hasPassportContext(state: Partial<ConversationState>): boolean {
  return Boolean(state.passportProductSlug);
}

export async function handlePassportProductTurn(options: {
  locale: AssistantLocale;
  message: string;
  state: Partial<ConversationState>;
}): Promise<AssistantResponse | null> {
  const { locale, message, state } = options;
  const slug = state.passportProductSlug;
  if (!slug) return null;

  const product = await resolveProductBySlug(slug);
  if (!product) return null;

  const variant = pickVariant(product, { variantId: state.passportVariantId ?? undefined });
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const n = message.toLowerCase();

  const cards = await buildProductCardsFromSlugs([slug], locale);
  const card = cards[0];

  if (/بديل|alternative|replacement|similar|يشبه|مشابه/.test(n)) {
    const replacements = await findPassportReplacements({ product, variant, locale, limit: 3 });
    if (!replacements.length) {
      return {
        mode: "demo",
        reply: reply(locale, "ما لقيت بدائل قريبة في التشكيلة حالياً.", "No close alternatives found in catalog right now."),
        state,
      };
    }
    const altCards = await buildProductCardsFromSlugs(
      replacements.map((r) => r.slug),
      locale,
    );
    return {
      mode: "demo",
      reply: reply(
        locale,
        `بدائل قريبة من ${name}:`,
        `Alternatives close to ${name}:`,
      ),
      products: altCards,
      state,
    };
  }

  if (/مجلس|مطبخ|غرفة|room|majlis|kitchen|يناسب|fits|suitable/.test(n)) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        `${name} — ${product.installationType ? `نوع التركيب: ${product.installationType}. ` : ""}${variant?.cct ? `درجة اللون: ${variant.cct}. ` : ""}صف لي المساحة (مثلاً مجلس 6×8) وأعطيك توصية أدق.`,
        `${name} — ${product.installationType ? `Installation: ${product.installationType}. ` : ""}${variant?.cct ? `CCT: ${variant.cct}. ` : ""}Describe your space (e.g. majlis 6×8 m) for a tighter recommendation.`,
      ),
      products: card ? [card] : undefined,
      choices:
        locale === "ar"
          ? [
              { label: "تجربة الإضاءة", value: "ودّيني لتجربة الإضاءة" },
              { label: "مجلس 6×8", value: "هل يناسب مجلس 6×8؟" },
            ]
          : [
              { label: "Lighting Experience", value: "Take me to Lighting Experience" },
              { label: "Majlis 6×8", value: "Does it fit a 6×8 majlis?" },
            ],
      state,
    };
  }

  if (/3000|4000|6500|cct|درجة|لون|colour|color/.test(n)) {
    return {
      mode: "demo",
      reply: reply(
        locale,
        variant?.cct
          ? `هذا المنتج (${name}) متوفر بدرجة ${variant.cct}. ${variant.cct.includes("3000") ? "مناسب للمجالس والغرف الدافئة." : variant.cct.includes("4000") ? "مناسب للمطابخ والمكاتب." : "ضوء بارد للمهام."}`
          : `درجة اللون غير محددة في بيانات هذا المنتج — راجع صفحة المنتج أو تواصل معنا.`,
        variant?.cct
          ? `This product (${name}) is ${variant.cct}. ${variant.cct.includes("3000") ? "Suited to warm living spaces." : variant.cct.includes("4000") ? "Suited to kitchens and offices." : "Cool light for tasks."}`
          : `CCT is not specified for this product — see the product page or contact us.`,
      ),
      products: card ? [card] : undefined,
      state,
    };
  }

  return {
    mode: "demo",
    reply: reply(
      locale,
      `أنا أتابع معك بخصوص ${name}${variant?.sku ? ` (${variant.sku})` : ""}. اسأل عن التركيب، البديل، درجة اللون، أو ملاءمة المساحة.`,
      `I'm focused on ${name}${variant?.sku ? ` (${variant.sku})` : ""}. Ask about installation, alternatives, colour temperature, or room fit.`,
    ),
    products: card ? [card] : undefined,
    choices:
      locale === "ar"
        ? [
            { label: "وش البديل؟", value: "وش البديل؟" },
            { label: "هل يناسب مجلس؟", value: "هل يناسب مجلس 6×8؟" },
          ]
        : [
            { label: "Alternative?", value: "What's the alternative?" },
            { label: "Fits majlis?", value: "Does it fit a 6×8 majlis?" },
          ],
    state,
  };
}
