"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CatalogEmptyState,
  CatalogFiltersPanel,
  CatalogPagination,
  CatalogToolbar,
} from "@/components/catalog/catalog-filters";
import { ProductGrid } from "@/components/catalog/product-card";
import type { CatalogQuery, CatalogResult } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type CatalogPageClientProps = {
  locale: string;
  basePath: string;
  title: string;
  breadcrumb?: React.ReactNode;
  result: CatalogResult;
  query: CatalogQuery;
};

export function CatalogPageClient({
  locale,
  basePath,
  title,
  breadcrumb,
  result,
  query,
}: CatalogPageClientProps) {
  const t = useTranslations("catalog");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    if (drawerOpen) {
      requestAnimationFrame(() => setDrawerVisible(true));
    } else {
      setDrawerVisible(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="container-page py-8 md:py-12">
      {breadcrumb}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="heading-section">{title}</h1>
        <p className="mt-2 text-meta">
          {t("showing")} {result.items.length} {t("of")} {result.total} {t("products")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16rem_1fr]">
        <CatalogFiltersPanel
          locale={locale}
          basePath={basePath}
          query={query}
          facets={result.facets}
          className="hidden lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:block lg:self-start"
        />

        <div>
          <CatalogToolbar
            basePath={basePath}
            query={query}
            total={result.total}
            onOpenFilters={() => setDrawerOpen(true)}
          />

          {result.items.length === 0 ? (
            <CatalogEmptyState />
          ) : (
            <ProductGrid products={result.items} locale={locale} highlightQuery={query.q} />
          )}

          <CatalogPagination
            basePath={basePath}
            query={query}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className={cn(
              "absolute inset-0 bg-black/40 transition-opacity duration-300",
              drawerVisible ? "opacity-100" : "opacity-0",
            )}
            aria-label="Close"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={cn(
              "absolute inset-y-0 start-0 flex w-full max-w-[20rem] flex-col overflow-y-auto bg-white p-4 shadow-soft transition-transform duration-300 ease-out sm:w-[min(100%,20rem)]",
              drawerVisible ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
            )}
          >
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-sm font-semibold">{t("filters")}</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} className="icon-btn text-lg leading-none">
                ×
              </button>
            </div>
            <CatalogFiltersPanel
              locale={locale}
              basePath={basePath}
              query={query}
              facets={result.facets}
              onApplied={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function CatalogBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-6 text-meta" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-secondary/60" aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand-black-soft">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
