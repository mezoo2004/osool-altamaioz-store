import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogBreadcrumb, CatalogPageClient } from "@/components/catalog/catalog-page-client";
import { getCatalogCategoryChips } from "@/lib/catalog/catalog-categories";
import { parseCatalogQuery } from "@/lib/catalog/query";
import { getProductRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });

  return buildPageMetadata({
    locale,
    path: "/products",
    titleAr: `${t("allProducts")} | اصول التميز`,
    titleEn: `${t("allProducts")} | Osool Altamaioz`,
    descriptionAr: "تصفح كل منتجات اصول التميز — إضاءة معمارية وديكورية.",
    descriptionEn: "Browse all Osool Altamaioz products — architectural and decorative lighting.",
  });
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const tCommon = await getTranslations("common");
  const tCatalog = await getTranslations("catalog");

  const query = parseCatalogQuery(sp, { sort: "featured" });
  const [result, categories] = await Promise.all([
    getProductRepository().list(query),
    getCatalogCategoryChips(),
  ]);

  return (
    <CatalogPageClient
      locale={locale}
      basePath="/products"
      title={tCatalog("allProducts")}
      breadcrumb={
        <CatalogBreadcrumb
          items={[
            { label: tCommon("brand"), href: "/" },
            { label: tCatalog("allProducts") },
          ]}
        />
      }
      result={result}
      query={query}
      categories={categories}
    />
  );
}
