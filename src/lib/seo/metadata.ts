import type { Metadata } from "next";
import { getSiteUrl, localePath } from "@/lib/site-config";

export type PageMetaInput = {
  locale: string;
  path: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ogImagePath?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  locale,
  path,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  ogImagePath = "/images/og-default.jpg",
  noIndex = false,
}: PageMetaInput): Metadata {
  const title = locale === "ar" ? titleAr : titleEn;
  const description = locale === "ar" ? descriptionAr : descriptionEn;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalPath = localePath(locale, normalizedPath);
  const siteUrl = getSiteUrl();
  const ogImage = ogImagePath.startsWith("http") ? ogImagePath : `${siteUrl}${ogImagePath}`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalPath,
      languages: {
        ar: localePath("ar", normalizedPath),
        en: localePath("en", normalizedPath),
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalPath}`,
      siteName: locale === "ar" ? "اصول التميز" : "Osool Altamaioz",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/** @deprecated Use buildPageMetadata — kept for existing experience routes. */
export function buildExperienceMetadata(input: PageMetaInput): Metadata {
  return buildPageMetadata(input);
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
  };
}
