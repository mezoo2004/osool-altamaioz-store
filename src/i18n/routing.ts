import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeNames: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
};

export const brand = {
  ar: "اصول التميز",
  en: "Osool Altamaioz",
} as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
