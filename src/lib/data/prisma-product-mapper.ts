import type { Product, ProductSpec, ProductVariant, StockStatus } from "@/lib/catalog/types";
import type { Product as DbProduct, ProductVariant as DbVariant } from "@prisma/client";

type DbProductWithRelations = DbProduct & {
  variants: DbVariant[];
  categoryLinks?: { category: { slug: string }; isPrimary: boolean }[];
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

export function buildSpecsFromProduct(product: Product): ProductSpec[] {
  const v = product.variants[0];
  if (!v) return [];
  const specs: ProductSpec[] = [];
  const add = (keyEn: string, keyAr: string, val: string | null | undefined) => {
    if (!val) return;
    specs.push({ keyEn, keyAr, valueEn: val, valueAr: val });
  };
  add("Series", "السلسلة", product.series);
  add("Model / SKU", "الموديل / الكود", v.sku);
  add("Power", "القدرة", v.wattage);
  add("CCT", "درجة اللون", v.cct);
  add("Finish", "التشطيب", v.finish);
  add("Installation", "التركيب", product.installationType);
  return specs;
}
