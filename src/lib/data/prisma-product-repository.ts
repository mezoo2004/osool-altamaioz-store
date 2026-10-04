import { unstable_cache } from "next/cache";
import type {
  CatalogQuery,
  CatalogResult,
  Product,
  ProductDetail,
  SearchSuggestion,
} from "@/lib/catalog/types";
import type { ProductRepository } from "@/lib/data/product-repository";
import { getSearchProvider } from "@/lib/catalog/search-provider";
import { CACHE_TAGS } from "@/lib/cache/revalidation";
import { getCachedCatalogFacets, getFilteredProductIds } from "@/lib/data/prisma-catalog-facets";
import {
  buildProductListWhere,
  buildProductOrderBy,
  getListPagination,
} from "@/lib/data/prisma-catalog-list";
import { catalogListProductArgs } from "@/lib/data/prisma-catalog-list-select";
import {
  mapDbListProductToCatalog,
  mapDbProductToCatalog,
  mapDbRowToProductDetail,
} from "@/lib/data/prisma-product-mapper";
import { prisma } from "@/lib/prisma";

const productInclude = {
  variants: { orderBy: { sku: "asc" as const } },
  categoryLinks: { include: { category: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  specs: { orderBy: { sortOrder: "asc" as const } },
};

export class PrismaProductRepository implements ProductRepository {
  async list(query: CatalogQuery): Promise<CatalogResult> {
    const where = buildProductListWhere(query);
    const { page, pageSize, skip, take } = getListPagination(query);
    const needsPriceFilter = query.minPrice != null || query.maxPrice != null;

    const [productIds, totalFromCount] = await Promise.all([
      getFilteredProductIds(query),
      needsPriceFilter ? Promise.resolve(0) : prisma.product.count({ where }),
    ]);
    const total = needsPriceFilter ? productIds.length : totalFromCount;

    const [facets, pageRows] = await Promise.all([
      getCachedCatalogFacets(query, productIds),
      needsPriceFilter
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            ...catalogListProductArgs,
            orderBy: buildProductOrderBy(query.sort),
            skip,
            take,
          })
        : prisma.product.findMany({
            where,
            ...catalogListProductArgs,
            orderBy: buildProductOrderBy(query.sort),
            skip,
            take,
          }),
    ]);
    const items = pageRows.map(mapDbListProductToCatalog);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      facets,
    };
  }

  async getBySlug(slug: string): Promise<ProductDetail | null> {
    return getProductDetailCached(slug)();
  }

  async getSuggestions(q: string, limit = 8): Promise<SearchSuggestion[]> {
    if (!q.trim()) return [];
    const rows = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { nameAr: { contains: q.trim() } },
          { nameEn: { contains: q.trim() } },
          { slug: { contains: q.trim() } },
          { variants: { some: { sku: { contains: q.trim() } } } },
        ],
      },
      ...catalogListProductArgs,
      take: Math.min(limit * 3, 24),
      orderBy: { updatedAt: "desc" },
    });
    return getSearchProvider().suggest(q, rows.map(mapDbListProductToCatalog), limit);
  }

  async getRelated(slug: string, limit = 4): Promise<Product[]> {
    const base = await prisma.product.findUnique({
      where: { slug },
      select: {
        series: true,
        categoryLinks: { select: { category: { select: { slug: true } }, isPrimary: true } },
      },
    });
    if (!base) return [];

    const primary =
      base.categoryLinks.find((l) => l.isPrimary)?.category.slug ??
      base.categoryLinks[0]?.category.slug;

    const rows = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: slug },
        OR: [
          ...(base.series ? [{ series: base.series }] : []),
          ...(primary ? [{ categoryLinks: { some: { category: { slug: primary } } } }] : []),
        ],
      },
      ...catalogListProductArgs,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    });
    return rows.map(mapDbListProductToCatalog);
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true },
      orderBy: { slug: "asc" },
    });
    return rows.map((r) => r.slug);
  }
}

async function loadProductDetail(slug: string): Promise<ProductDetail | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!row) return null;

  const product = mapDbProductToCatalog(row);
  const primary = product.primaryCategory;

  const relatedRows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      slug: { not: slug },
      OR: [
        ...(product.series ? [{ series: product.series }] : []),
        { categoryLinks: { some: { category: { slug: primary } } } },
      ],
    },
    ...catalogListProductArgs,
    take: 4,
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
  });
  const related = relatedRows.map(mapDbListProductToCatalog);

  return mapDbRowToProductDetail(
    row,
    related.map((p) => p.slug),
    related.slice(0, 2).map((p) => p.slug),
  );
}

function getProductDetailCached(slug: string) {
  return unstable_cache(() => loadProductDetail(slug), [`product-detail-${slug}`], {
    revalidate: 120,
    tags: [CACHE_TAGS.products, CACHE_TAGS.product(slug)],
  });
}
