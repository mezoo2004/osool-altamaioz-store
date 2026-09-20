export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export type CctLabel = {
  ar: string;
  en: string;
};

export type VariantImportMeta = {
  sourceFile?: string;
  sourceBatch?: string;
  sourceRowRef?: string;
  importedAt?: string;
  normalizedSku?: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  modelNumber: string | null;
  wattage: string | null;
  cct: string | null;
  cctLabel: CctLabel | null;
  finish: string | null;
  size?: string | null;
  beamAngle?: string | null;
  ipRating?: string | null;
  voltage?: string | null;
  length?: string | null;
  demoPrice: number | null;
  confirmedPrice: number | null;
  /** Display-only reference price (8–15% above selling); never used at checkout */
  compareAtPrice?: number | null;
  salePrice: number | null;
  priceConfirmed: boolean;
  priceStatus: string;
  stockStatus: StockStatus;
  stockQty: number;
  warrantyHint: string | null;
  imageUrl: string | null;
  nameAr: string;
  nameEn: string;
  /** Internal traceability — never exposed on storefront UI */
  importMeta?: VariantImportMeta;
};

export type Product = {
  id: string;
  slug: string;
  groupKey?: string;
  nameAr: string;
  nameEn: string;
  series: string | null;
  productType: string;
  categorySlugs: string[];
  primaryCategory: string;
  sourceFile: string;
  categoryTitle: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  isOnOffer: boolean;
  installationType: string | null;
  stockStatus: StockStatus;
  variantCount: number;
  demoPriceFrom: number | null;
  demoPriceTo: number | null;
  createdAt: string;
  variants: ProductVariant[];
};

export type SortOption =
  | "featured"
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc";

export type CatalogFilters = {
  cct?: string[];
  wattage?: string[];
  finish?: string[];
  series?: string[];
  installation?: string[];
  availability?: string[];
  offers?: boolean;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  q?: string;
};

export type CatalogQuery = CatalogFilters & {
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type FacetOption = {
  value: string;
  labelAr: string;
  labelEn: string;
  count: number;
};

export type CatalogFacets = {
  cct: FacetOption[];
  wattage: FacetOption[];
  finish: FacetOption[];
  series: FacetOption[];
  installation: FacetOption[];
  availability: FacetOption[];
};

export type CatalogResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: CatalogFacets;
};

export type SearchSuggestion = {
  type: "product" | "sku" | "series";
  label: string;
  href: string;
};

export type ProductSpec = {
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
};

export type ProductDetail = Product & {
  specs: ProductSpec[];
  relatedSlugs: string[];
  completeTheLookSlugs: string[];
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  warrantyTextAr?: string | null;
  warrantyTextEn?: string | null;
  galleryImages: string[];
};
