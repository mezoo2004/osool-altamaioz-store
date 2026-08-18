import type {
  CatalogFacets,
  CatalogQuery,
  FacetOption,
  Product,
  SortOption,
  StockStatus,
} from "@/lib/catalog/types";

export function getSortPrice(product: Product): number {
  if (product.demoPriceFrom != null) return product.demoPriceFrom;
  return Number.MAX_SAFE_INTEGER;
}

export function matchesCategory(product: Product, category?: string) {
  if (!category) return true;
  return product.categorySlugs.includes(category) || product.primaryCategory === category;
}

export function matchesQuery(product: Product, q?: string) {
  if (!q?.trim()) return true;
  const query = q.trim().toLowerCase();
  const haystack = [
    product.nameAr,
    product.nameEn,
    product.series,
    product.slug,
    product.productType,
    ...product.variants.flatMap((v) => [
      v.sku,
      v.modelNumber,
      v.wattage,
      v.cct,
      v.nameAr,
      v.nameEn,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function matchesFilters(product: Product, query: CatalogQuery) {
  const variants = product.variants;

  if (query.offers && !product.isOnOffer) return false;

  if (query.cct?.length) {
    if (!variants.some((v) => v.cct && query.cct!.includes(v.cct.toLowerCase()))) return false;
  }

  if (query.wattage?.length) {
    if (!variants.some((v) => v.wattage && query.wattage!.includes(v.wattage.toLowerCase())))
      return false;
  }

  if (query.finish?.length) {
    if (
      !variants.some((v) => {
        const f = (v.finish ?? "default").toLowerCase();
        return query.finish!.includes(f);
      })
    )
      return false;
  }

  if (query.series?.length) {
    if (!product.series || !query.series.includes(product.series.toLowerCase())) return false;
  }

  if (query.installation?.length) {
    if (!product.installationType || !query.installation.includes(product.installationType))
      return false;
  }

  if (query.availability?.length) {
    const statuses = new Set(variants.map((v) => v.stockStatus));
    if (!query.availability.some((a) => statuses.has(a.toUpperCase() as StockStatus))) return false;
  }

  const min = query.minPrice;
  const max = query.maxPrice;
  if (min != null || max != null) {
    const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_PRICES === "true";
    const prices = variants
      .map((v) => (v.priceConfirmed ? v.confirmedPrice : showDemo ? v.demoPrice : null))
      .filter((p): p is number => typeof p === "number");
    if (!prices.length) return false;
    const low = Math.min(...prices);
    if (min != null && low < min) return false;
    if (max != null && low > max) return false;
  }

  return matchesCategory(product, query.category) && matchesQuery(product, query.q);
}

export function sortProducts(products: Product[], sort: SortOption = "featured") {
  const sorted = [...products];
  switch (sort) {
    case "popular":
      return sorted.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    case "newest":
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "price-asc":
      return sorted.sort((a, b) => getSortPrice(a) - getSortPrice(b));
    case "price-desc":
      return sorted.sort((a, b) => getSortPrice(b) - getSortPrice(a));
    case "featured":
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          Number(b.isBestseller) - Number(a.isBestseller),
      );
  }
}

function buildFacet(
  values: Map<string, number>,
  labelFn: (v: string) => { ar: string; en: string },
): FacetOption[] {
  return [...values.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      value,
      labelAr: labelFn(value).ar,
      labelEn: labelFn(value).en,
      count,
    }));
}

/** Facets derived from the filtered product set — category-aware, data-driven. */
export function buildFacets(products: Product[]): CatalogFacets {
  const cct = new Map<string, number>();
  const wattage = new Map<string, number>();
  const finish = new Map<string, number>();
  const series = new Map<string, number>();
  const installation = new Map<string, number>();
  const availability = new Map<string, number>();

  for (const p of products) {
    if (p.series) series.set(p.series.toLowerCase(), (series.get(p.series.toLowerCase()) ?? 0) + 1);
    if (p.installationType)
      installation.set(p.installationType, (installation.get(p.installationType) ?? 0) + 1);
    for (const v of p.variants) {
      if (v.cct) cct.set(v.cct.toLowerCase(), (cct.get(v.cct.toLowerCase()) ?? 0) + 1);
      if (v.wattage) wattage.set(v.wattage.toLowerCase(), (wattage.get(v.wattage.toLowerCase()) ?? 0) + 1);
      const f = (v.finish ?? "default").toLowerCase();
      finish.set(f, (finish.get(f) ?? 0) + 1);
      availability.set(v.stockStatus, (availability.get(v.stockStatus) ?? 0) + 1);
    }
  }

  return {
    cct: buildFacet(cct, (v) => ({
      ar: v === "3000k" ? "3000K — دافئ" : v === "4000k" ? "4000K — طبيعي" : v === "6500k" ? "6500K — أبيض" : v,
      en: v === "3000k" ? "3000K — Warm" : v === "4000k" ? "4000K — Neutral" : v === "6500k" ? "6500K — White" : v,
    })),
    wattage: buildFacet(wattage, (v) => ({ ar: v.toUpperCase(), en: v.toUpperCase() })),
    finish: buildFacet(finish, (v) => ({
      ar: v === "black" ? "أسود" : v === "default" ? "افتراضي" : v,
      en: v === "black" ? "Black" : v === "default" ? "Default" : v,
    })),
    series: buildFacet(series, (v) => ({ ar: v.toUpperCase(), en: v.toUpperCase() })),
    installation: buildFacet(installation, (v) => ({
      ar: v === "outdoor" ? "خارجي" : v === "recessed" ? "غائرة" : v,
      en: v === "outdoor" ? "Outdoor" : v === "recessed" ? "Recessed" : v,
    })),
    availability: buildFacet(availability, (v) => ({
      ar: v === "IN_STOCK" ? "متوفر" : v === "OUT_OF_STOCK" ? "غير متوفر" : v,
      en: v === "IN_STOCK" ? "In stock" : v === "OUT_OF_STOCK" ? "Out of stock" : v,
    })),
  };
}

export function paginateProducts<T>(items: T[], page = 1, pageSize = 24) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page: safePage, pageSize, totalPages };
}

export function queryProductCatalog(all: Product[], query: CatalogQuery) {
  const filtered = sortProducts(
    all.filter((p) => matchesFilters(p, query)),
    query.sort,
  );
  const pageSize = query.pageSize ?? 24;
  const page = Math.max(1, query.page ?? 1);
  const { items, total, totalPages } = paginateProducts(filtered, page, pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    facets: buildFacets(filtered),
  };
}
