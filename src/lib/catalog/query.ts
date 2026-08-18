import type { CatalogFilters, CatalogQuery, SortOption } from "@/lib/catalog/types";

const ARRAY_KEYS = [
  "cct",
  "wattage",
  "finish",
  "series",
  "installation",
  "availability",
] as const;

function parseArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value.join(",") : value;
  const items = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCatalogQuery(
  searchParams: Record<string, string | string[] | undefined>,
  defaults: Partial<CatalogQuery> = {},
): CatalogQuery {
  const query: CatalogQuery = { ...defaults };

  for (const key of ARRAY_KEYS) {
    const val = parseArray(searchParams[key]);
    if (val) query[key] = val;
  }

  if (searchParams.offers === "1" || searchParams.offers === "true") query.offers = true;
  query.minPrice = parseNumber(String(searchParams.minPrice ?? ""));
  query.maxPrice = parseNumber(String(searchParams.maxPrice ?? ""));
  query.q = typeof searchParams.q === "string" ? searchParams.q : defaults.q;
  query.sort = (searchParams.sort as SortOption) || defaults.sort || "featured";
  query.page = parseNumber(String(searchParams.page ?? "")) ?? 1;
  query.pageSize = parseNumber(String(searchParams.pageSize ?? "")) ?? 24;

  return query;
}

export function buildCatalogSearchParams(
  filters: CatalogFilters & { sort?: SortOption; page?: number },
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of ARRAY_KEYS) {
    const val = filters[key];
    if (val?.length) params.set(key, val.join(","));
  }

  if (filters.offers) params.set("offers", "1");
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.q) params.set("q", filters.q);
  if (filters.sort && filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  return params;
}

export function catalogQueryToString(
  filters: CatalogFilters & { sort?: SortOption; page?: number },
): string {
  const params = buildCatalogSearchParams(filters);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export type { CatalogFilters, CatalogQuery, SortOption };
