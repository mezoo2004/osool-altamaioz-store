import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogBreadcrumb, CatalogPageClient } from "@/components/catalog/catalog-page-client";
import { ProductGridSkeleton } from "@/components/catalog/product-card";
import { parseCatalogQuery } from "@/lib/catalog/query";
import { getProductRepository } from "@/lib/data";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function SearchResults({
  locale,
  sp,
}: {
  locale: string;
  sp: Record<string, string | string[] | undefined>;
}) {
  const query = parseCatalogQuery(sp, { sort: "featured" });
  const result = await getProductRepository().list(query);
  const tCommon = await getTranslations("common");

  return (
    <CatalogPageClient
      locale={locale}
      basePath="/search"
      title={tCommon("searchShort")}
      breadcrumb={
        <CatalogBreadcrumb
          items={[
            { label: tCommon("brand"), href: "/" },
            { label: tCommon("searchShort") },
          ]}
        />
      }
      result={result}
      query={query}
    />
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="container-page py-8 md:py-12">
          <ProductGridSkeleton />
        </div>
      }
    >
      <SearchResults locale={locale} sp={sp} />
    </Suspense>
  );
}
