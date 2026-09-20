import fs from "node:fs";
import path from "node:path";
import type {
  CatalogQuery,
  CatalogResult,
  Product,
  ProductDetail,
  ProductSpec,
  SearchSuggestion,
} from "@/lib/catalog/types";
import type { ProductRepository } from "@/lib/data/product-repository";
import { queryProductCatalog } from "@/lib/catalog/catalog-query-engine";
import { getSearchProvider } from "@/lib/catalog/search-provider";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog", "products.json");

let cache: Product[] | null = null;

function loadProducts(): Product[] {
  if (cache) return cache;
  if (!fs.existsSync(CATALOG_PATH)) {
    cache = [];
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8")) as Product[];
  return cache;
}

export function getDisplayPrice(product: Product, variantId?: string) {
  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : product.variants[0];
  if (!variant) return null;
  if (variant.priceConfirmed && variant.confirmedPrice != null) {
    return variant.confirmedPrice;
  }
  return null;
}

function buildSpecs(product: Product): ProductSpec[] {
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
  if (v.warrantyHint?.trim()) {
    add("Warranty", "الضمان", v.warrantyHint.trim());
  }
  add("Installation", "التركيب", product.installationType);
  return specs;
}

export class ImportProductRepository implements ProductRepository {
  async list(query: CatalogQuery): Promise<CatalogResult> {
    return queryProductCatalog(loadProducts(), query);
  }

  async getBySlug(slug: string): Promise<ProductDetail | null> {
    const product = loadProducts().find((p) => p.slug === slug);
    if (!product) return null;

    const related = loadProducts()
      .filter(
        (p) =>
          p.slug !== slug &&
          (p.primaryCategory === product.primaryCategory || p.series === product.series),
      )
      .slice(0, 4);

    const galleryImages = [
      ...new Set(product.variants.map((v) => v.imageUrl).filter((url): url is string => Boolean(url))),
    ];

    return {
      ...product,
      specs: buildSpecs(product),
      relatedSlugs: related.map((p) => p.slug),
      completeTheLookSlugs: related.slice(0, 2).map((p) => p.slug),
      descriptionAr: null,
      descriptionEn: null,
      warrantyTextAr: null,
      warrantyTextEn: null,
      galleryImages,
    };
  }

  async getSuggestions(q: string, limit = 8): Promise<SearchSuggestion[]> {
    return getSearchProvider().suggest(q, loadProducts(), limit);
  }

  async getRelated(slug: string, limit = 4): Promise<Product[]> {
    const product = loadProducts().find((p) => p.slug === slug);
    if (!product) return [];
    return loadProducts()
      .filter(
        (p) =>
          p.slug !== slug &&
          (p.primaryCategory === product.primaryCategory || p.series === product.series),
      )
      .slice(0, limit);
  }

  async getAllSlugs(): Promise<string[]> {
    return loadProducts().map((p) => p.slug);
  }
}
