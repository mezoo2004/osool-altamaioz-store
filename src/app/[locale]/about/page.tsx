import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutPageContent } from "@/components/content/about-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/about",
    titleAr: "من نحن | اصول التميز",
    titleEn: "About Us | Osool Altamaioz",
    descriptionAr: "تعرف على اصول التميز — حلول إضاءة معمارية وزخرفية للمنازل والمشاريع في السعودية.",
    descriptionEn: "Learn about Osool Altamaioz — architectural and decorative lighting for homes and projects in Saudi Arabia.",
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutPageContent locale={locale} />;
}
