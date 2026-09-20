import type {
  Product,
  ProductDetail,
  ProductSpec,
  ProductVariant,
  StockStatus,
} from "@/lib/catalog/types";
import type { Product as DbProduct, ProductVariant as DbVariant } from "@prisma/client";

type DbProductWithRelations = DbProduct & {
  variants: DbVariant[];
  categoryLinks?: { category: { slug: string }; isPrimary: boolean }[];
  images?: { url: string; sortOrder: number }[];
  specs?: { keyAr: string; keyEn: string; valueAr: string; valueEn: string; sortOrder: number }[];
};

function decimalToNumber(value: { toNumber(): number } | null | undefined): number | null {
  if (value == null) return null;
  return value.toNumber();
}

function mapVariant(v: DbVariant): ProductVariant {
  const attrs = (v.attributes ?? {}) as Record<string, unknown>;
  const cctLabel =
    attrs.cctLabel && typeof attrs.cctLabel === "object"
      ? (attrs.cctLabel as ProductVariant["cctLabel"])
      : null;

  return {
    id: v.id,
    sku: v.sku,
    modelNumber: v.modelNumber,
    wattage: v.wattage,
    cct: v.cct,
    cctLabel,
    finish: v.finish,
    size: v.size,
    beamAngle: v.beamAngle,
    ipRating: v.ipRating,
    voltage: v.voltage,
    length: v.length,
    demoPrice: null,
    confirmedPrice: decimalToNumber(v.price),
    salePrice: decimalToNumber(v.salePrice),
    priceConfirmed: v.priceConfirmed,
    priceStatus: v.priceConfirmed ? "CONFIRMED" : "PRICE_UNAVAILABLE",
    stockStatus: v.stockStatus as StockStatus,
    stockQty: v.stockQty,
    warrantyHint: null,
    imageUrl: v.imageUrl,
    nameAr: v.nameAr ?? "",
    nameEn: v.nameEn ?? "",
    importMeta: v.importMeta as ProductVariant["importMeta"],
  };
}

export function mapDbProductToCatalog(row: DbProductWithRelations): Product {
  const categorySlugs = row.categoryLinks?.map((l) => l.category.slug) ?? ["uncategorized"];
  const primary =
    row.categoryLinks?.find((l) => l.isPrimary)?.category.slug ??
    categorySlugs[0] ??
    "uncategorized";

  const variants = row.variants.map(mapVariant);
  const confirmedPrices = variants
    .filter((v) => v.priceConfirmed && v.confirmedPrice != null)
    .map((v) => v.confirmedPrice as number);

  return {
    id: row.id,
    slug: row.slug,
    groupKey: row.groupKey ?? undefined,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    series: row.series,
    productType: row.productType ?? "PRODUCT",
    categorySlugs: categorySlugs.length ? categorySlugs : [primary],
    primaryCategory: primary,
    sourceFile: "",
    categoryTitle: null,
    isFeatured: row.isFeatured,
    isNew: row.isNew,
    isBestseller: row.isBestseller,
    isOnOffer: row.isOnOffer,
    installationType: row.installationType,
    stockStatus: row.stockStatus as StockStatus,
    variantCount: variants.length,
    demoPriceFrom: confirmedPrices.length ? Math.min(...confirmedPrices) : null,
    demoPriceTo: confirmedPrices.length ? Math.max(...confirmedPrices) : null,
    createdAt: row.createdAt.toISOString(),
    variants,
  };
}

export function buildSpecsFromProduct(
  product: Product,
  variant?: ProductVariant | null,
  dbSpecs: ProductSpec[] = [],
): ProductSpec[] {
  const v = variant ?? product.variants[0];
  const specs: ProductSpec[] = [];
  const seen = new Set<string>();

  const add = (keyEn: string, keyAr: string, val: string | null | undefined) => {
    const trimmed = val?.trim();
    if (!trimmed) return;
    const key = keyEn.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    specs.push({ keyEn, keyAr, valueEn: trimmed, valueAr: trimmed });
  };

  for (const row of dbSpecs) {
    const key = row.keyEn.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    specs.push(row);
  }

  if (!v) return specs;

  add("Series", "السلسلة", product.series);
  add("Model / SKU", "الموديل / الكود", v.modelNumber ?? v.sku);
  add("SKU", "الكود", v.sku);
  add("Power", "القدرة", v.wattage);
  add("CCT", "درجة اللون", v.cct);
  add("Beam angle", "زاوية الإضاءة", v.beamAngle ?? null);
  add("Finish", "التشطيب", v.finish);
  add("Color", "اللون", v.finish);
  add("Size", "الحجم", v.size ?? null);
  add("IP rating", "تصنيف IP", v.ipRating ?? null);
  add("Voltage", "الجهد", v.voltage ?? null);
  add("Dimensions", "الأبعاد", v.length ?? null);
  add("Installation", "التركيب", product.installationType);

  return specs.filter((s) => s.valueEn.trim().length > 0);
}

export function mapDbRowToProductDetail(
  row: DbProductWithRelations,
  relatedSlugs: string[],
  completeTheLookSlugs: string[],
): ProductDetail {
  const product = mapDbProductToCatalog(row);
  const dbSpecs =
    row.specs?.map((s) => ({
      keyAr: s.keyAr,
      keyEn: s.keyEn,
      valueAr: s.valueAr,
      valueEn: s.valueEn,
    })) ?? [];

  const galleryFromDb = (row.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.url)
    .filter(Boolean);

  const galleryFromVariants = product.variants
    .map((v) => v.imageUrl)
    .filter((url): url is string => Boolean(url));

  const galleryImages = [...new Set([...galleryFromDb, ...galleryFromVariants])];

  return {
    ...product,
    descriptionAr: row.descriptionAr,
    descriptionEn: row.descriptionEn,
    warrantyTextAr: row.warrantyTextAr,
    warrantyTextEn: row.warrantyTextEn,
    specs: buildSpecsFromProduct(product, product.variants[0], dbSpecs),
    relatedSlugs,
    completeTheLookSlugs,
    galleryImages,
  };
}
