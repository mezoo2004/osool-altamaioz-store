import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogBreadcrumb, CatalogPageClient } from "@/components/catalog/catalog-page-client";
import { parseCatalogQuery } from "@/lib/catalog/query";
import { getProductRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/metadata";

type OffersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: OffersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  return buildPageMetadata({
    locale,
    path: "/offers",
    titleAr: `${t("offers")} | اصول التميز`,
    titleEn: `${t("offers")} | Osool Altamaioz`,
    descriptionAr: "عروض مختارة من اصول التميز — منتجات مميّزة في المتجر.",
    descriptionEn: "Selected offers from Osool Altamaioz — live catalog promotions.",
  });
}

export default async function OffersPage({ params, searchParams }: OffersPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  const query = parseCatalogQuery(sp, { sort: "featured", offers: true });
  query.offers = true;

  const result = await getProductRepository().list(query);

  return (
    <CatalogPageClient
      locale={locale}
      basePath="/offers"
      title={tNav("offers")}
      breadcrumb={
        <CatalogBreadcrumb
          items={[
            { label: tCommon("brand"), href: "/" },
            { label: tNav("offers") },
          ]}
        />
      }
      result={result}
      query={query}
      emptyStateVariant="offers"
      hideOffersFilter
    />
  );
}
