import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaqPageContent } from "@/components/content/faq-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/faq",
    titleAr: "الأسئلة الشائعة | اصول التميز",
    titleEn: "FAQ | Osool Altamaioz",
    descriptionAr: "إجابات على الأسئلة الشائعة حول التسوق والطلبات في متجر اصول التميز.",
    descriptionEn: "Answers to common questions about shopping and orders at Osool Altamaioz.",
  });
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqPageContent locale={locale} />;
}
