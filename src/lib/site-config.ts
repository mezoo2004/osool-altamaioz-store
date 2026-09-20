import { brand } from "@/i18n/routing";

/** Final production domain — BUSINESS_CONFIRMATION_REQUIRED (see docs/BUSINESS_BLOCKERS.md). */
const PLACEHOLDER_SITE_URL = "https://osoolaltamaioz.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = raw || PLACEHOLDER_SITE_URL;
  return url.replace(/\/$/, "");
}

export function getSiteName(locale: "ar" | "en"): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  if (fromEnv) return fromEnv;
  return brand[locale];
}

export function absoluteUrl(path: string, locale?: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale) {
    return `${base}/${locale}${normalized === "/" ? "" : normalized}`;
  }
  return `${base}${normalized}`;
}

export function localePath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

/** Static content routes included in sitemap and navigation. */
export const staticContentPaths = [
  "/about",
  "/contact",
  "/faq",
  "/projects",
  "/reviews",
  "/products",
  "/offers",
  "/spaces",
  "/scenes",
  "/search",
  "/policies/shipping",
  "/policies/returns",
  "/policies/warranty",
  "/policies/privacy",
  "/policies/terms",
] as const;

export const policySlugs = [
  "shipping",
  "returns",
  "warranty",
  "privacy",
  "terms",
] as const;

export type PolicySlug = (typeof policySlugs)[number];
