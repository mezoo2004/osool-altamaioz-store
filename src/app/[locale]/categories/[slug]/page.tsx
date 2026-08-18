import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CatalogBreadcrumb, CatalogPageClient } from "@/components/catalog/catalog-page-client";
import { JsonLd } from "@/components/seo/json-ld";
import { parseCatalogQuery } from "@/lib/catalog/query";
import { getProductRepository } from "@/lib/data";
import { mainNavigation } from "@/lib/navigation-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { localePath } from "@/lib/site-config";

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function findCategory(slug: string) {
  for (const item of mainNavigation) {
    if (item.slug === slug) return { key: item.key, slug: item.slug };
    if (item.children?.some((c) => c.slug === slug)) {
      const child = item.children.find((c) => c.slug === slug)!;
      return { key: child.key, slug: child.slug, parentKey: item.key, parentSlug: item.slug };
    }
  }
  return null;
}

export async function generateStaticParams() {
  const slugs = mainNavigation.flatMap((item) => [
    item.slug,
    ...(item.children?.map((c) => c.slug) ?? []),
  ]);
  return ["ar", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tSub = await getTranslations({ locale, namespace: "navSub" });
  const title =
    "parentKey" in category && category.parentKey ? tSub(category.key) : tNav(category.key);

  return buildPageMetadata({
    locale,
    path: `/categories/${slug}`,
    titleAr: `${title} | اصول التميز`,
    titleEn: `${title} | Osool Altamaioz`,
    descriptionAr: `تصفح ${title} — اصول التميز`,
    descriptionEn: `Browse ${title} — Osool Altamaioz`,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const category = findCategory(slug);
  if (!category) notFound();

  const tNav = await getTranslations("nav");
  const tSub = await getTranslations("navSub");
  const tCommon = await getTranslations("common");

  const title =
    "parentKey" in category && category.parentKey ? tSub(category.key) : tNav(category.key);

  const query = parseCatalogQuery(sp, { category: slug, sort: "featured" });
  const result = await getProductRepository().list(query);
  const basePath = `/categories/${slug}`;

  const breadcrumbItems = [
    { label: tCommon("brand"), href: "/" },
    ...(category.parentKey
      ? [{ label: tNav(category.parentKey), href: `/categories/${category.parentSlug}` }]
      : []),
    { label: title },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({
      name: item.label,
      url: "href" in item && item.href ? localePath(locale, item.href) : undefined,
    })),
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <CatalogPageClient
      locale={locale}
      basePath={basePath}
      title={title}
      breadcrumb={<CatalogBreadcrumb items={breadcrumbItems} />}
      result={result}
      query={query}
    />
    </>
  );
}
