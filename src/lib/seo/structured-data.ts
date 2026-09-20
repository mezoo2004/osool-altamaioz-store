import { getSiteUrl } from "@/lib/site-config";
import { brand } from "@/i18n/routing";
import type { ProductDetail } from "@/lib/catalog/types";

export function buildOrganizationJsonLd(locale: "ar" | "en") {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand[locale],
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/brand/logo/osool-mark-dark.png`,
    // BUSINESS_CONFIRMATION_REQUIRED: official contact email, phone, address
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Locale path e.g. /ar/products/foo or absolute URL */
  url?: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url
        ? {
            item: item.url.startsWith("http")
              ? item.url
              : `${siteUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
          }
        : {}),
    })),
  };
}

export function buildProductJsonLd(
  locale: "ar" | "en",
  product: ProductDetail,
  path: string,
) {
  const siteUrl = getSiteUrl();
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const variant = product.variants[0];
  const image = variant?.imageUrl ?? `${siteUrl}/images/og-default.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: name,
    sku: variant?.sku,
    image,
    url: `${siteUrl}/${locale}${path.startsWith("/") ? path : `/${path}`}`,
    brand: {
      "@type": "Brand",
      name: brand[locale],
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/${locale}/products/${product.slug}`,
      priceCurrency: "SAR",
      availability:
        product.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      // Official selling price deferred — no price in structured data until confirmed
    },
  };
}

export function buildFaqPageJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildWebSiteJsonLd(locale: "ar" | "en") {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand[locale],
    url: `${siteUrl}/${locale}`,
    inLanguage: locale === "ar" ? "ar-SA" : "en-SA",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
