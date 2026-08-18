import type { Product, SearchSuggestion } from "@/lib/catalog/types";

/**
 * Search abstraction — swap in-memory/MySQL → Meilisearch/Typesense/Algolia
 * without changing PLP/PDP/header components.
 */
export interface SearchProvider {
  suggest(q: string, products: Product[], limit?: number): SearchSuggestion[];
}

export class InMemorySearchProvider implements SearchProvider {
  suggest(q: string, products: Product[], limit = 8): SearchSuggestion[] {
    if (!q.trim()) return [];
    const query = q.trim().toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    for (const p of products) {
      if (suggestions.length >= limit) break;
      if (p.nameAr.toLowerCase().includes(query) || p.nameEn.toLowerCase().includes(query)) {
        suggestions.push({ type: "product", label: p.nameAr, href: `/products/${p.slug}` });
      }
    }

    for (const p of products) {
      if (suggestions.length >= limit) break;
      for (const v of p.variants) {
        if (v.sku.toLowerCase().includes(query)) {
          suggestions.push({
            type: "sku",
            label: v.sku,
            href: `/products/${p.slug}?sku=${encodeURIComponent(v.sku)}`,
          });
          break;
        }
      }
    }

    for (const p of products) {
      if (suggestions.length >= limit) break;
      if (p.series?.toLowerCase().includes(query)) {
        suggestions.push({
          type: "series",
          label: p.series,
          href: `/categories/indoor?series=${encodeURIComponent(p.series.toLowerCase())}`,
        });
      }
    }

    return suggestions.slice(0, limit);
  }
}

let provider: SearchProvider | null = null;

export function getSearchProvider(): SearchProvider {
  if (!provider) provider = new InMemorySearchProvider();
  return provider;
}
