import type {
  CatalogQuery,
  CatalogResult,
  Product,
  ProductDetail,
  SearchSuggestion,
} from "@/lib/catalog/types";
import type { ProductRepository } from "@/lib/data/product-repository";
import { queryProductCatalog } from "@/lib/catalog/catalog-query-engine";
import { getSearchProvider } from "@/lib/catalog/search-provider";
import { buildSpecsFromProduct, mapDbProductToCatalog } from "@/lib/data/prisma-product-mapper";
import { prisma } from "@/lib/prisma";

const productInclude = {
  variants: { orderBy: { sku: "asc" as const } },
  categoryLinks: { include: { category: true } },
};

export class PrismaProductRepository implements ProductRepository {
  private cache: Product[] | null = null;
  private cacheAt = 0;
  private readonly cacheTtlMs = 60_000;

  private async loadProducts(): Promise<Product[]> {
    const now = Date.now();
    if (this.cache && now - this.cacheAt < this.cacheTtlMs) return this.cache;

    const rows = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
    });

    this.cache = rows.map(mapDbProductToCatalog);
    this.cacheAt = now;
    return this.cache;
  }

  async list(query: CatalogQuery): Promise<CatalogResult> {
    const all = await this.loadProducts();
    return queryProductCatalog(all, query);
  }

  async getBySlug(slug: string): Promise<ProductDetail | null> {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!row) return null;

    const product = mapDbProductToCatalog(row);
    const all = await this.loadProducts();
    const related = all
      .filter(
        (p) =>
          p.slug !== slug &&
          (p.primaryCategory === product.primaryCategory || p.series === product.series),
      )
      .slice(0, 4);

    return {
      ...product,
      specs: buildSpecsFromProduct(product),
      relatedSlugs: related.map((p) => p.slug),
      completeTheLookSlugs: related.slice(0, 2).map((p) => p.slug),
    };
  }

  async getSuggestions(q: string, limit = 8): Promise<SearchSuggestion[]> {
    const products = await this.loadProducts();
    return getSearchProvider().suggest(q, products, limit);
  }

  async getRelated(slug: string, limit = 4): Promise<Product[]> {
    const product = (await this.loadProducts()).find((p) => p.slug === slug);
    if (!product) return [];
    return (await this.loadProducts())
      .filter(
        (p) =>
          p.slug !== slug &&
          (p.primaryCategory === product.primaryCategory || p.series === product.series),
      )
      .slice(0, limit);
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
