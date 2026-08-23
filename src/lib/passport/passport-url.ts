import { absoluteUrl } from "@/lib/site-config";

export function buildPassportPath(locale: "ar" | "en", token: string): string {
  return `/${locale}/passport/${encodeURIComponent(token)}`;
}

export function buildPassportAbsoluteUrl(locale: "ar" | "en", token: string): string {
  return absoluteUrl(`/passport/${encodeURIComponent(token)}`, locale);
}
