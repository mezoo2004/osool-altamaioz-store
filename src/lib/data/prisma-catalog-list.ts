import type { Prisma } from "@prisma/client";
import type { CatalogQuery, SortOption } from "@/lib/catalog/types";

function variantSome(
  query: CatalogQuery,
): Prisma.ProductVariantListRelationFilter | undefined {
  const variantWhere: Prisma.ProductVariantWhereInput = {};
  if (query.cct?.length) {
    variantWhere.cct = { in: query.cct.map((v) => v.toUpperCase()) };
  }
  if (query.wattage?.length) {
    variantWhere.wattage = { in: query.wattage };
  }
  if (query.finish?.length) {
    variantWhere.finish = { in: query.finish };
  }
  if (query.availability?.length) {
    variantWhere.stockStatus = {
      in: query.availability.map((a) => a.toUpperCase()) as (
        | "IN_STOCK"
        | "LOW_STOCK"
        | "OUT_OF_STOCK"
        | "PREORDER"
      )[],
    };
  }
  if (Object.keys(variantWhere).length === 0) return undefined;
  return { some: variantWhere };
}

export function buildProductListWhere(query: CatalogQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE" }];

  if (query.offers) and.push({ isOnOffer: true });
  if (query.category) {
    and.push({
      OR: [
        { categoryLinks: { some: { category: { slug: query.category } } } },
        { category: { slug: query.category } },
      ],
    });
  }
  if (query.series?.length) {
    and.push({ series: { in: query.series.map((s) => s.toUpperCase()) } });
  }
  if (query.installation?.length) {
    and.push({ installationType: { in: query.installation } });
  }

  const variantFilter = variantSome(query);
  if (variantFilter) and.push({ variants: variantFilter });

  if (query.q?.trim()) {
    const q = query.q.trim();
    and.push({
      OR: [
        { nameAr: { contains: q } },
        { nameEn: { contains: q } },
        { slug: { contains: q } },
        { series: { contains: q } },
        { sku: { contains: q } },
        {
          variants: {
            some: {
              OR: [{ sku: { contains: q } }, { modelNumber: { contains: q } }],
            },
          },
        },
      ],
    });
  }

  return { AND: and };
}

export function buildProductOrderBy(sort: SortOption = "featured"): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "popular":
      return [{ isBestseller: "desc" }, { isFeatured: "desc" }];
    case "price-asc":
      return [{ basePrice: "asc" }, { updatedAt: "desc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { updatedAt: "desc" }];
    case "featured":
    default:
      return [{ isFeatured: "desc" }, { isBestseller: "desc" }, { updatedAt: "desc" }];
  }
}

export function getListPagination(query: CatalogQuery) {
  const pageSize = Math.min(Math.max(query.pageSize ?? 24, 1), 48);
  const page = Math.max(1, query.page ?? 1);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}
