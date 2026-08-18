import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactPageContent } from "@/components/content/contact-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/contact",
    titleAr: "تواصل معنا | اصول التميز",
    titleEn: "Contact Us | Osool Altamaioz",
    descriptionAr: "تواصل مع فريق اصول التميز — استفسارات المنتجات والمشاريع.",
    descriptionEn: "Contact the Osool Altamaioz team — product and project inquiries.",
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactPageContent locale={locale} />;
}
