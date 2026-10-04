import { unstable_cache } from "next/cache";
import type { CatalogFacets, CatalogQuery, FacetOption } from "@/lib/catalog/types";
import { CACHE_TAGS } from "@/lib/cache/revalidation";
import { buildProductListWhere } from "@/lib/data/prisma-catalog-list";
import { prisma } from "@/lib/prisma";

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

function mapsToCatalogFacets(input: {
  cct: Map<string, number>;
  wattage: Map<string, number>;
  finish: Map<string, number>;
  series: Map<string, number>;
  installation: Map<string, number>;
  availability: Map<string, number>;
}): CatalogFacets {
  return {
    cct: buildFacet(input.cct, (v) => ({
      ar: v === "3000k" ? "3000K — دافئ" : v === "4000k" ? "4000K — طبيعي" : v === "6500k" ? "6500K — أبيض" : v,
      en: v === "3000k" ? "3000K — Warm" : v === "4000k" ? "4000K — Neutral" : v === "6500k" ? "6500K — White" : v,
    })),
    wattage: buildFacet(input.wattage, (v) => ({ ar: v.toUpperCase(), en: v.toUpperCase() })),
    finish: buildFacet(input.finish, (v) => ({
      ar: v === "black" ? "أسود" : v === "default" ? "افتراضي" : v,
      en: v === "black" ? "Black" : v === "default" ? "Default" : v,
    })),
    series: buildFacet(input.series, (v) => ({ ar: v.toUpperCase(), en: v.toUpperCase() })),
    installation: buildFacet(input.installation, (v) => ({
      ar: v === "outdoor" ? "خارجي" : v === "recessed" ? "غائرة" : v,
      en: v === "outdoor" ? "Outdoor" : v === "recessed" ? "Recessed" : v,
    })),
    availability: buildFacet(input.availability, (v) => ({
      ar: v === "IN_STOCK" ? "متوفر" : v === "OUT_OF_STOCK" ? "غير متوفر" : v,
      en: v === "IN_STOCK" ? "In stock" : v === "OUT_OF_STOCK" ? "Out of stock" : v,
    })),
  };
}

const emptyFacets = (): CatalogFacets => mapsToCatalogFacets({
  cct: new Map(),
  wattage: new Map(),
  finish: new Map(),
  series: new Map(),
  installation: new Map(),
  availability: new Map(),
});

export async function getFilteredProductIds(
  query: CatalogQuery,
): Promise<string[]> {
  const where = buildProductListWhere(query);
  const rows = await prisma.product.findMany({ where, select: { id: true } });
  let ids = rows.map((r) => r.id);

  if (query.minPrice == null && query.maxPrice == null) return ids;

  const variants = await prisma.productVariant.findMany({
    where: { productId: { in: ids } },
    select: { productId: true, price: true, priceConfirmed: true },
  });

  const minByProduct = new Map<string, number>();
  for (const v of variants) {
    if (!v.priceConfirmed || v.price == null) continue;
    const amount = v.price.toNumber();
    const current = minByProduct.get(v.productId);
    if (current == null || amount < current) minByProduct.set(v.productId, amount);
  }

  ids = ids.filter((id) => {
    const low = minByProduct.get(id);
    if (low == null) return false;
    if (query.minPrice != null && low < query.minPrice) return false;
    if (query.maxPrice != null && low > query.maxPrice) return false;
    return true;
  });

  return ids;
}

/** Aggregate facet counts via groupBy — no full Product hydration. */
export async function buildCatalogFacetsForProductIds(productIds: string[]): Promise<CatalogFacets> {
  if (productIds.length === 0) return emptyFacets();

  const variantWhere = { productId: { in: productIds } };
  const productWhere = { id: { in: productIds } };

  const [cctRows, wattageRows, finishRows, availRows, seriesRows, installRows] = await Promise.all([
    prisma.productVariant.groupBy({
      by: ["cct"],
      where: { ...variantWhere, cct: { not: null } },
      _count: { _all: true },
    }),
    prisma.productVariant.groupBy({
      by: ["wattage"],
      where: { ...variantWhere, wattage: { not: null } },
      _count: { _all: true },
    }),
    prisma.productVariant.groupBy({
      by: ["finish"],
      where: variantWhere,
      _count: { _all: true },
    }),
    prisma.productVariant.groupBy({
      by: ["stockStatus"],
      where: variantWhere,
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["series"],
      where: { ...productWhere, series: { not: null } },
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["installationType"],
      where: { ...productWhere, installationType: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const cct = new Map<string, number>();
  for (const row of cctRows) {
    if (!row.cct) continue;
    cct.set(row.cct.toLowerCase(), row._count._all);
  }

  const wattage = new Map<string, number>();
  for (const row of wattageRows) {
    if (!row.wattage) continue;
    wattage.set(row.wattage.toLowerCase(), row._count._all);
  }

  const finish = new Map<string, number>();
  for (const row of finishRows) {
    const key = (row.finish ?? "default").toLowerCase();
    finish.set(key, (finish.get(key) ?? 0) + row._count._all);
  }

  const availability = new Map<string, number>();
  for (const row of availRows) {
    availability.set(row.stockStatus, (availability.get(row.stockStatus) ?? 0) + row._count._all);
  }

  const series = new Map<string, number>();
  for (const row of seriesRows) {
    if (!row.series) continue;
    series.set(row.series.toLowerCase(), row._count._all);
  }

  const installation = new Map<string, number>();
  for (const row of installRows) {
    if (!row.installationType) continue;
    installation.set(row.installationType, row._count._all);
  }

  return mapsToCatalogFacets({ cct, wattage, finish, series, installation, availability });
}

function facetCacheKey(query: CatalogQuery): string {
  return JSON.stringify({
    category: query.category ?? "",
    offers: query.offers ?? false,
    q: query.q ?? "",
    cct: query.cct ?? [],
    wattage: query.wattage ?? [],
    finish: query.finish ?? [],
    series: query.series ?? [],
    installation: query.installation ?? [],
    availability: query.availability ?? [],
    minPrice: query.minPrice ?? null,
    maxPrice: query.maxPrice ?? null,
  });
}

export async function getCachedCatalogFacets(
  query: CatalogQuery,
  productIds: string[],
): Promise<CatalogFacets> {
  const key = `${facetCacheKey(query)}:${productIds.length}`;
  return unstable_cache(
    () => buildCatalogFacetsForProductIds(productIds),
    [`catalog-facets-v2-${key}`],
    { revalidate: 120, tags: [CACHE_TAGS.products] },
  )();
}
