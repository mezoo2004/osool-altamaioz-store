"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { CatalogCategoryChip } from "@/lib/catalog/catalog-categories";
import type { CatalogQuery } from "@/lib/catalog/types";
import { catalogQueryToString } from "@/lib/catalog/query";
import { cn } from "@/lib/utils";

type CatalogCategoryChipsProps = {
  locale: string;
  basePath: string;
  query: CatalogQuery;
  categories: CatalogCategoryChip[];
};

export function CatalogCategoryChips({ locale, basePath, query, categories }: CatalogCategoryChipsProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const isAr = locale === "ar";

  const setCategory = (slug?: string) => {
    const next: CatalogQuery = { ...query, page: 1 };
    if (slug) next.category = slug;
    else delete next.category;
    router.push(`${basePath}${catalogQueryToString(next)}`);
  };

  if (categories.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label={t("categoryChips")}>
      <Chip active={!query.category} onClick={() => setCategory(undefined)}>
        {t("allCategories")}
      </Chip>
      {categories.map((cat) => (
        <Chip key={cat.slug} active={query.category === cat.slug} onClick={() => setCategory(cat.slug)}>
          {isAr ? cat.nameAr : cat.nameEn}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
        active
          ? "border-brand-orange bg-brand-orange text-white"
          : "border-border bg-white text-text-secondary hover:border-brand-black-soft/20 hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
