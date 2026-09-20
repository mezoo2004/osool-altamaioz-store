"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { CatalogFacets, CatalogQuery, SortOption } from "@/lib/catalog/types";
import { catalogQueryToString } from "@/lib/catalog/query";
import { cn } from "@/lib/utils";

type CatalogFiltersPanelProps = {
  locale: string;
  basePath: string;
  query: CatalogQuery;
  facets: CatalogFacets;
  className?: string;
  onApplied?: () => void;
  hideOffersFilter?: boolean;
};

export function CatalogFiltersPanel({
  locale,
  basePath,
  query,
  facets,
  className,
  onApplied,
  hideOffersFilter = false,
}: CatalogFiltersPanelProps) {
  const t = useTranslations("catalog");
  const router = useRouter();

  const update = (patch: Partial<CatalogQuery>) => {
    const next = { ...query, ...patch, page: 1 };
    router.push(`${basePath}${catalogQueryToString(next)}`);
    onApplied?.();
  };

  const toggleArray = (key: keyof CatalogQuery, value: string) => {
    const current = (query[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [key]: next.length ? next : undefined });
  };

  const clearAll = () => {
    router.push(basePath);
    onApplied?.();
  };

  return (
    <aside className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("filters")}</h2>
        <button type="button" onClick={clearAll} className="text-xs text-brand-orange hover:underline">
          {t("clearFilters")}
        </button>
      </div>

      {!hideOffersFilter ? (
        <FilterGroup title={t("filterOffers")}>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={Boolean(query.offers)}
              onChange={(e) => update({ offers: e.target.checked || undefined })}
              className="accent-brand-orange"
            />
            {t("filterOffers")}
          </label>
        </FilterGroup>
      ) : null}

      <CheckboxFacet
        title={t("filterCct")}
        options={facets.cct}
        selected={query.cct ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("cct", v)}
      />
      <CheckboxFacet
        title={t("filterWattage")}
        options={facets.wattage}
        selected={query.wattage ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("wattage", v)}
      />
      <CheckboxFacet
        title={t("filterFinish")}
        options={facets.finish.filter((f) => f.value !== "default")}
        selected={query.finish ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("finish", v)}
      />
      <CheckboxFacet
        title={t("filterSeries")}
        options={facets.series}
        selected={query.series ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("series", v)}
      />
      <CheckboxFacet
        title={t("filterInstallation")}
        options={facets.installation}
        selected={query.installation ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("installation", v)}
      />
      <CheckboxFacet
        title={t("filterAvailability")}
        options={facets.availability}
        selected={query.availability ?? []}
        locale={locale}
        onToggle={(v) => toggleArray("availability", v)}
      />

      <FilterGroup title={t("filterPrice")}>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t("minPrice")}
            defaultValue={query.minPrice ?? ""}
            onBlur={(e) =>
              update({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="input-field h-10"
          />
          <input
            type="number"
            placeholder={t("maxPrice")}
            defaultValue={query.maxPrice ?? ""}
            onBlur={(e) =>
              update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="input-field h-10"
          />
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3.5">
      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckboxFacet({
  title,
  options,
  selected,
  locale,
  onToggle,
}: {
  title: string;
  options: CatalogFacets["cct"];
  selected: string[];
  locale: string;
  onToggle: (value: string) => void;
}) {
  if (!options.length) return null;
  return (
    <FilterGroup title={title}>
      <ul className="max-h-44 space-y-1.5 overflow-y-auto">
        {options.map((opt) => (
          <li key={opt.value}>
            <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => onToggle(opt.value)}
                  className="accent-brand-orange"
                />
                {locale === "ar" ? opt.labelAr : opt.labelEn}
              </span>
              <span className="text-xs tabular-nums text-text-secondary">{opt.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </FilterGroup>
  );
}

type CatalogToolbarProps = {
  locale: string;
  basePath: string;
  query: CatalogQuery;
  total: number;
  onOpenFilters?: () => void;
};

export function CatalogToolbar({
  basePath,
  query,
  total,
  onOpenFilters,
}: Omit<CatalogToolbarProps, "locale">) {
  const t = useTranslations("catalog");
  const router = useRouter();

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: t("sortFeatured") },
    { value: "popular", label: t("sortPopular") },
    { value: "newest", label: t("sortNewest") },
    { value: "price-asc", label: t("sortPriceAsc") },
    { value: "price-desc", label: t("sortPriceDesc") },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-meta tabular-nums">
        {total} {t("products")}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex h-10 items-center rounded-lg border border-border px-3.5 text-sm lg:hidden"
        >
          {t("filters")}
        </button>
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-text-secondary">{t("sortBy")}</span>
          <select
            value={query.sort ?? "featured"}
            onChange={(e) =>
              router.push(
                `${basePath}${catalogQueryToString({ ...query, sort: e.target.value as SortOption, page: 1 })}`,
              )
            }
            className="input-field h-10 w-auto pe-8"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function CatalogPagination({
  basePath,
  query,
  page,
  totalPages,
}: {
  basePath: string;
  query: CatalogQuery;
  page: number;
  totalPages: number;
}) {
  const t = useTranslations("catalog");
  const router = useRouter();
  if (totalPages <= 1) return null;

  const go = (p: number) =>
    router.push(`${basePath}${catalogQueryToString({ ...query, page: p })}`);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm disabled:opacity-40"
      >
        {t("previous")}
      </button>
      <span className="px-3 text-sm tabular-nums text-text-secondary">
        {t("page")} {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
        className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm disabled:opacity-40"
      >
        {t("next")}
      </button>
    </nav>
  );
}

export function CatalogEmptyState({ variant = "default" }: { variant?: "default" | "offers" }) {
  const t = useTranslations("catalog");
  const isOffers = variant === "offers";
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
      <h2 className="heading-subsection">{isOffers ? t("offersEmptyTitle") : t("noResults")}</h2>
      <p className="mt-2 text-meta">{isOffers ? t("offersEmptyHint") : t("noResultsHint")}</p>
    </div>
  );
}
