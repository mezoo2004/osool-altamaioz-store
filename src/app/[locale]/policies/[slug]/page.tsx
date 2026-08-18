import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PolicyPageContent } from "@/components/content/policy-page-content";
import { getPolicy } from "@/lib/content/policies";
import { policySlugs } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return policySlugs.flatMap((slug) => [
    { locale: "ar", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};

  return buildPageMetadata({
    locale,
    path: `/policies/${slug}`,
    titleAr: policy.titleAr,
    titleEn: policy.titleEn,
    descriptionAr: policy.descriptionAr,
    descriptionEn: policy.descriptionEn,
  });
}

export default async function PolicyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const policy = getPolicy(slug);
  if (!policy) notFound();

  return <PolicyPageContent locale={locale} policy={policy} />;
}
