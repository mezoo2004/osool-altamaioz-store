import { isDatabaseConfigured } from "@/lib/data/database-config";
import { getProductRepository } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export type CatalogCategoryChip = {
  slug: string;
  nameAr: string;
  nameEn: string;
  count: number;
};

export async function getCatalogCategoryChips(): Promise<CatalogCategoryChip[]> {
  if (isDatabaseConfigured()) {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
      select: {
        slug: true,
        nameAr: true,
        nameEn: true,
        _count: { select: { productLinks: true, products: true } },
      },
    });

    return rows
      .map((row) => ({
        slug: row.slug,
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        count: row._count.productLinks + row._count.products,
      }))
      .filter((row) => row.count > 0);
  }

  const all = await getProductRepository().list({ page: 1, pageSize: 5000, sort: "featured" });
  const counts = new Map<string, CatalogCategoryChip>();

  for (const product of all.items) {
    const slug = product.primaryCategory;
    if (!slug) continue;
    const existing = counts.get(slug);
    if (existing) {
      existing.count += 1;
      continue;
    }
    counts.set(slug, {
      slug,
      nameAr: product.categoryTitle ?? slug,
      nameEn: product.categoryTitle ?? slug,
      count: 1,
    });
  }

  return [...counts.values()].sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}

/** Count products currently on offer (real catalog flag). */
export async function countOfferProducts(): Promise<number> {
  const result = await getProductRepository().list({ offers: true, page: 1, pageSize: 1, sort: "featured" });
  return result.total;
}
