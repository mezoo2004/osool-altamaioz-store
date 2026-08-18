import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { AnalyticsScripts } from "@/components/seo/analytics-scripts";
import { PageViewTracker } from "@/components/seo/page-view-tracker";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const localeKey = locale as "ar" | "en";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${inter.variable} ${notoArabic.variable}`}>
        <JsonLd data={[buildOrganizationJsonLd(localeKey), buildWebSiteJsonLd(localeKey)]} />
        <AnalyticsScripts />
        <NextIntlClientProvider messages={messages}>
          <PageViewTracker />
          <StorefrontShell locale={localeKey}>{children}</StorefrontShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
