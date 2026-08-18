import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PdpContent } from "@/components/pdp/pdp-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductRepository } from "@/lib/data";
import { getProductName } from "@/lib/catalog/display";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
} from "@/lib/seo/structured-data";
import { localePath } from "@/lib/site-config";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ sku?: string }>;
};

export const revalidate = 3600;
export const dynamicParams = true;

/** Pre-render a subset at build time; remaining PDPs generated on-demand (ISR). */
export async function generateStaticParams() {
  const slugs = await getProductRepository().getAllSlugs();
  const preview = slugs.slice(0, 40);
  return ["ar", "en"].flatMap((locale) => preview.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductRepository().getBySlug(slug);
  if (!product) return { title: "Not found" };

  const name = getProductName(product, locale);
  return buildPageMetadata({
    locale,
    path: `/products/${slug}`,
    titleAr: `${product.nameAr} | اصول التميز`,
    titleEn: `${product.nameEn} | Osool Altamaioz`,
    descriptionAr: product.nameAr,
    descriptionEn: product.nameEn || name,
  });
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { locale, slug } = await params;
  const { sku } = await searchParams;
  setRequestLocale(locale);

  const repo = getProductRepository();
  const product = await repo.getBySlug(slug);
  if (!product) notFound();

  const related = (await Promise.all(
    product.relatedSlugs.map((s) => repo.getBySlug(s)),
  )).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const completeTheLook = (await Promise.all(
    product.completeTheLookSlugs.map((s) => repo.getBySlug(s)),
  )).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";
  const productName = getProductName(product, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: brand, url: localePath(locale, "/") },
    ...(product.primaryCategory
      ? [
          {
            name: product.primaryCategory,
            url: localePath(locale, `/categories/${product.primaryCategory}`),
          },
        ]
      : []),
    { name: productName, url: localePath(locale, `/products/${slug}`) },
  ]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd,
          buildProductJsonLd(locale as "ar" | "en", product, `/products/${slug}`),
        ]}
      />
      <PdpContent
        product={product}
        related={related}
        completeTheLook={completeTheLook}
        locale={locale}
        initialSku={sku}
      />
    </>
  );
}
