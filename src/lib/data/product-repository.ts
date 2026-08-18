import type {
  CatalogQuery,
  CatalogResult,
  Product,
  ProductDetail,
  SearchSuggestion,
} from "@/lib/catalog/types";

export interface ProductRepository {
  list(query: CatalogQuery): Promise<CatalogResult>;
  getBySlug(slug: string): Promise<ProductDetail | null>;
  getSuggestions(q: string, limit?: number): Promise<SearchSuggestion[]>;
  getRelated(slug: string, limit?: number): Promise<Product[]>;
  getAllSlugs(): Promise<string[]>;
}

export type { CatalogQuery, CatalogResult, Product, ProductDetail, SearchSuggestion };
