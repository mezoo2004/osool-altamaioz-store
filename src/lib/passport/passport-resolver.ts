import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import type { Order, OrderItemSnapshot } from "@/lib/commerce/types";
import { getOrderRepository } from "@/lib/data/order-repository";
import { extractLumensFromSpecs } from "@/lib/experience/lighting-product-matcher";
import { pickVariant, resolveProductBySlug } from "@/lib/experience/product-resolver";
import { prisma } from "@/lib/prisma";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { findPassportComplementary, findPassportReplacements } from "./passport-matching";
import type {
  PassportData,
  PassportSpecRow,
  PassportTokenPayload,
  ProductPassportTokenPayload,
  PurchasePassportTokenPayload,
} from "./types";

const SCENE_CATEGORIES = new Set([
  "cob-spotlights",
  "chandeliers",
  "pendants",
  "decorative",
  "indoor",
  "panel-lights",
  "track",
]);

type DbExtras = {
  warrantyTextAr: string | null;
  warrantyTextEn: string | null;
  beamAngle: string | null;
};

async function fetchDbExtras(
  slug: string,
  variantId: string | null,
): Promise<DbExtras> {
  if (!requiresDatabaseStorage()) {
    return { warrantyTextAr: null, warrantyTextEn: null, beamAngle: null };
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      warrantyTextAr: true,
      warrantyTextEn: true,
      variants: variantId
        ? { where: { id: variantId }, select: { beamAngle: true }, take: 1 }
        : { select: { beamAngle: true }, take: 1 },
    },
  });

  if (!product) {
    return { warrantyTextAr: null, warrantyTextEn: null, beamAngle: null };
  }

  return {
    warrantyTextAr: product.warrantyTextAr,
    warrantyTextEn: product.warrantyTextEn,
    beamAngle: product.variants[0]?.beamAngle ?? null,
  };
}

function buildVariantLabel(variant: ProductVariant | null, locale: "ar" | "en"): string | null {
  if (!variant) return null;
  const parts = [variant.finish, variant.cct, variant.wattage, variant.size].filter(Boolean);
  if (!parts.length) return locale === "ar" ? variant.nameAr : variant.nameEn;
  return parts.join(" · ");
}

function buildSpecs(
  product: ProductDetail,
  variant: ProductVariant | null,
  extras: DbExtras,
  locale: "ar" | "en",
): PassportSpecRow[] {
  const rows: PassportSpecRow[] = [];
  const add = (keyEn: string, keyAr: string, value: string | null | undefined) => {
    if (!value?.trim()) return;
    rows.push({ keyEn, keyAr, valueEn: value, valueAr: value });
  };

  add("SKU", "الكود", variant?.sku ?? null);
  add("Model", "الموديل", variant?.modelNumber ?? null);
  add("Finish", "التشطيب", variant?.finish);
  add("Power", "القدرة", variant?.wattage);
  add("CCT", "درجة اللون", variant?.cct);
  add("Beam angle", "زاوية الإضاءة", extras.beamAngle);

  const lumens = extractLumensFromSpecs(product);
  if (lumens) {
    const val = `${lumens.toLocaleString(locale === "ar" ? "ar-SA" : "en-SA")} lm`;
    add("Lumens", "اللومن", val);
  }

  add("Installation", "نوع التركيب", product.installationType);
  add("Series", "السلسلة", product.series);

  for (const spec of product.specs ?? []) {
    const exists = rows.some((r) => r.keyEn === spec.keyEn);
    if (!exists && spec.valueEn?.trim()) {
      rows.push({
        keyEn: spec.keyEn,
        keyAr: spec.keyAr,
        valueEn: spec.valueEn,
        valueAr: spec.valueAr,
      });
    }
  }

  return rows;
}

function resolveSceneUrl(product: ProductDetail, variant: ProductVariant | null): string | null {
  const supports =
    SCENE_CATEGORIES.has(product.primaryCategory) ||
    product.categorySlugs.some((c) => SCENE_CATEGORIES.has(c));
  if (!supports) return null;
  const params = new URLSearchParams({ product: product.slug, from: "passport" });
  if (variant?.cct) params.set("cct", variant.cct);
  return `/scenes/majlis-classic?${params.toString()}`;
}

async function buildPassportFromProduct(options: {
  product: ProductDetail;
  variant: ProductVariant | null;
  locale: "ar" | "en";
  purchase: PassportData["purchase"];
}): Promise<PassportData> {
  const { product, variant, locale, purchase } = options;
  const extras = await fetchDbExtras(product.slug, variant?.id ?? null);
  const replacements = await findPassportReplacements({ product, variant, locale });
  const complementary = await findPassportComplementary({ product, variant, locale });
  const sceneUrl = resolveSceneUrl(product, variant);

  return {
    kind: purchase ? "purchase" : "product",
    slug: product.slug,
    variantId: variant?.id ?? null,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    imageUrl: variant?.imageUrl ?? product.variants[0]?.imageUrl ?? null,
    sku: variant?.sku ?? null,
    modelNumber: variant?.modelNumber ?? null,
    variantLabelAr: buildVariantLabel(variant, "ar"),
    variantLabelEn: buildVariantLabel(variant, "en"),
    specs: buildSpecs(product, variant, extras, locale),
    installationType: product.installationType,
    warrantyTextAr: extras.warrantyTextAr,
    warrantyTextEn: extras.warrantyTextEn,
    installationInstructionsAr: null,
    installationInstructionsEn: null,
    purchase,
    replacements,
    complementary,
    sceneUrl,
    supportsScene: Boolean(sceneUrl),
    variant,
    primaryCategory: product.primaryCategory,
  };
}

function findOrderItem(order: Order, orderItemId: string): OrderItemSnapshot | null {
  return order.items.find((i) => i.id === orderItemId) ?? null;
}

async function resolvePurchaseItem(
  payload: PurchasePassportTokenPayload,
  locale: "ar" | "en",
): Promise<PassportData | null> {
  const order = await getOrderRepository().findByOrderNumber(payload.on);
  if (!order) return null;

  const item = findOrderItem(order, payload.oi);
  if (!item) return null;

  const slug = item.productSlug;
  if (!slug) return null;

  const product = await resolveProductBySlug(slug);
  const variant = product
    ? pickVariant(product, { variantId: item.variantId, cct: item.cct ?? undefined })
    : null;

  const purchase = {
    orderNumber: order.orderNumber,
    purchaseDate: order.createdAt,
    quantity: item.quantity,
  };

  if (product) {
    return buildPassportFromProduct({ product, variant, locale, purchase });
  }

  const extras = await fetchDbExtras(slug, item.variantId || null);
  const snapshotSpecs: PassportSpecRow[] = [];
  const addSnap = (keyEn: string, keyAr: string, value: string | null | undefined) => {
    if (!value?.trim()) return;
    snapshotSpecs.push({ keyEn, keyAr, valueEn: value, valueAr: value });
  };
  addSnap("SKU", "الكود", item.sku);
  addSnap("Model", "الموديل", item.modelNumber);
  addSnap("Finish", "التشطيب", item.finish);
  addSnap("Power", "القدرة", item.wattage);
  addSnap("CCT", "درجة اللون", item.cct);
  addSnap("Beam angle", "زاوية الإضاءة", extras.beamAngle);
  addSnap("Series", "السلسلة", item.series);

  return {
    kind: "purchase",
    slug,
    variantId: item.variantId || null,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    imageUrl: item.imageUrl,
    sku: item.sku,
    modelNumber: item.modelNumber,
    variantLabelAr: [item.finish, item.cct, item.wattage].filter(Boolean).join(" · ") || null,
    variantLabelEn: [item.finish, item.cct, item.wattage].filter(Boolean).join(" · ") || null,
    specs: snapshotSpecs,
    installationType: null,
    warrantyTextAr: extras.warrantyTextAr,
    warrantyTextEn: extras.warrantyTextEn,
    installationInstructionsAr: null,
    installationInstructionsEn: null,
    purchase,
    replacements: [],
    complementary: [],
    sceneUrl: null,
    supportsScene: false,
    variant: null,
    primaryCategory: null,
  };
}

async function resolveProductPassport(
  payload: ProductPassportTokenPayload,
  locale: "ar" | "en",
): Promise<PassportData | null> {
  const product = await resolveProductBySlug(payload.slug);
  if (!product) return null;

  const variant = pickVariant(product, {
    variantId: payload.variantId,
  });

  return buildPassportFromProduct({ product, variant, locale, purchase: null });
}

export async function resolvePassport(
  payload: PassportTokenPayload,
  locale: "ar" | "en",
): Promise<PassportData | null> {
  if (payload.typ === "purchase") {
    return resolvePurchaseItem(payload, locale);
  }
  return resolveProductPassport(payload, locale);
}

export async function createProductPassportToken(slug: string, variantId?: string): Promise<string> {
  const { signProductPassportToken } = await import("./passport-token");
  return signProductPassportToken({ slug, variantId });
}

export async function createPurchasePassportToken(
  orderNumber: string,
  orderItemId: string,
): Promise<string> {
  const { signPurchasePassportToken } = await import("./passport-token");
  return signPurchasePassportToken({ on: orderNumber, oi: orderItemId });
}
